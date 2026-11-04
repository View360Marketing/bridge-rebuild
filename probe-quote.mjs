import { createClient } from "@supabase/supabase-js";
import { computeQuote, loadRatePlans, loadOverrides, loadFees, loadTaxes } from "./src/lib/booking/pricing.server.ts";

async function loadPromotion(sb, code) {
  if (!code) return null;
  const { data } = await sb.from("promotions").select("*").eq("code", code).eq("is_active", true).maybeSingle();
  return data ?? null;
}
async function loadActiveThirdNightFreePromotion(sb) {
  const { data } = await sb.from("promotions").select("*").eq("is_active", true).eq("mechanic", "third_night_free").order("created_at", { ascending: true }).limit(1).maybeSingle();
  return data ?? null;
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("missing env"); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

async function quoteFor(unitId, checkin, checkout, promoCode) {
  const { data: u } = await sb.from("units")
    .select("id,unit_code,public_name,base_rate_cents,max_adults,max_children,room_type_id,unit_kind")
    .eq("id", unitId).single();
  if (!u) throw new Error("unit not found " + unitId);

  const plans = await loadRatePlans(sb);
  const overrides = await loadOverrides(sb, checkin, checkout);
  const fees = await loadFees(sb);
  const taxes = await loadTaxes(sb);
  const promo = promoCode ? await loadPromotion(sb, promoCode) : await loadActiveThirdNightFreePromotion(sb);

  const res = computeQuote(
    {
      units: [{
        unit_id: u.id, unit_code: u.unit_code, base_rate_cents: u.base_rate_cents,
        max_adults: u.max_adults, max_children: u.max_children, room_type_id: u.room_type_id,
      }],
      checkin_date: checkin, checkout_date: checkout, adults: 2, children: 0,
      promotion_code: promoCode,
    },
    plans, overrides, fees, taxes, promo,
  );
  return { unit: u, res, promo };
}

function fmt(c) { return "$" + (c / 100).toFixed(2); }

function report(label, { unit, res, promo }, expectedSubtotal, expectedDiscount, expectedTotal) {
  console.log(`\n=== ${label} ===`);
  console.log(`Unit: ${unit.public_name} (${unit.unit_code}) kind=${unit.unit_kind} base=${fmt(unit.base_rate_cents)}`);
  console.log(`Promo: ${promo?.code ?? "none"} (${promo?.mechanic ?? "-"}) active=${promo?.is_active ?? "-"}`);
  for (const b of res.nightly_breakdown) {
    const dow = new Date(b.date + "T00:00:00Z").getUTCDay();
    const dn = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dow];
    console.log(`  ${b.date} ${dn}: ${fmt(b.amount_cents)} (${b.reason})`);
  }
  console.log(`Subtotal: ${fmt(res.subtotal_cents)} | Discount: ${fmt(res.discount_cents)} | Fees: ${fmt(res.fees_cents)} | Taxes: ${fmt(res.taxes_cents)} | Total: ${fmt(res.total_cents)}`);
  if (expectedSubtotal != null) {
    const sp = res.subtotal_cents === expectedSubtotal;
    const dp = res.discount_cents === expectedDiscount;
    const tp = res.total_cents === expectedTotal;
    console.log(`EXPECT subtotal=${fmt(expectedSubtotal)} ${sp?"PASS":"FAIL"} | discount=${fmt(expectedDiscount)} ${dp?"PASS":"FAIL"} | total=${fmt(expectedTotal)} ${tp?"PASS":"FAIL"}`);
  }
}

(async () => {
  // Pick one hotel room (318381 = Getaway at Crockett's Lookout)
  const { data: hotel } = await sb.from("units").select("id").eq("hostaway_listing_id", "318381").single();
  const { data: cabin } = await sb.from("units").select("id").eq("hostaway_listing_id", "318377").single();

  // 1. Nov 2-5 (Mon-Thu): 99*3 = 297, 3rd night free -99 = 198
  report("Hotel Nov 2-5 (WINTER26)", await quoteFor(hotel.id, "2026-11-02", "2026-11-05", "WINTER26"), 29700, 9900, 19800);
  // 2. Nov 6-9 (Fri-Sun): 134*3 = 402, 3rd night free -134 = 268
  report("Hotel Nov 6-9 (WINTER26)", await quoteFor(hotel.id, "2026-11-06", "2026-11-09", "WINTER26"), 40200, 13400, 26800);
  // 3. Mixed: Nov 5-9 (Thu,Fri,Sat,Sun) = 99+134+134+134 = 501, 3rd night (Sat 134) free = 367
  report("Hotel Nov 5-9 mixed (WINTER26)", await quoteFor(hotel.id, "2026-11-05", "2026-11-09", "WINTER26"), 50100, 13400, 36700);
  // 4. Seasonal boundary: Oct 30-Nov 2 (Fri,Sat,Sun,Mon) — Oct 30/31 outside season use base 99; Nov 1(Sun)=134? 
  //    Actually Nov 1 is Sunday. Season starts Nov 1. So Nov 1 = weekend 134. Oct 30(Fri),31(Sat) outside season -> base 99.
  //    nights: Oct30=99(base), Oct31=99(base), Nov1=134(weekend), -> 3 nights, 3rd night free = Nov1 134
  report("Hotel Oct 30-Nov 2 boundary (WINTER26)", await quoteFor(hotel.id, "2026-10-30", "2026-11-02", "WINTER26"), 33200, 13400, 19800);
  // 5. Outside season: Feb 2-5 2027 (Tue-Fri) -> base 99 each, no promo (promo effective_to 2027-01-31)
  report("Hotel Feb 2-5 2027 outside season (WINTER26)", await quoteFor(hotel.id, "2027-02-02", "2027-02-05", "WINTER26"), 29700, 0, 29700);
  // 6. Cabin must NOT get seasonal rate — uses its own base 12999
  report("Cabin Nov 2-5 (no seasonal)", await quoteFor(cabin.id, "2026-11-02", "2026-11-05", "WINTER26"), 38997, 0, 38997);
  // 7. No promo code, auto third-night-free active
  report("Hotel Nov 2-5 auto promo (no code)", await quoteFor(hotel.id, "2026-11-02", "2026-11-05", undefined), 29700, 9900, 19800);
})().catch(e => { console.error("ERR", e); process.exit(1); });
