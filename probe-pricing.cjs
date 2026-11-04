const { createClient } = require('@supabase/supabase-js');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('missing env'); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });
(async () => {
  const [{ data: units }, { data: rts }, { data: plans }, { data: promos }] = await Promise.all([
    sb.from('units').select('id,unit_code,name,room_type_id,kind,hostaway_listing_id,is_closed,is_archived,base_rate_cents,max_adults').order('unit_code'),
    sb.from('room_types').select('*'),
    sb.from('rate_plans').select('*').order('code'),
    sb.from('promotions').select('*').order('code'),
  ]);
  console.log('=== ROOM TYPES ===');
  console.log(JSON.stringify(rts, null, 2));
  console.log('\n=== RATE PLANS ===');
  console.log(JSON.stringify(plans, null, 2));
  console.log('\n=== PROMOTIONS ===');
  console.log(JSON.stringify(promos, null, 2));
  console.log('\n=== UNITS (canonical, non-archived) ===');
  for (const u of (units || [])) {
    if (u.is_archived) continue;
    console.log(`${u.unit_code} | ${u.name} | kind=${u.kind} | rt=${u.room_type_id ?? 'NULL'} | hw=${u.hostaway_listing_id ?? 'NULL'} | closed=${u.is_closed} | base=${u.base_rate_cents}`);
  }
})();