# The Bridges — Build Progress

Track exact implemented routes/tables, executed tests, and outstanding configuration. Update every stage.

## Stage 1 — Foundation ✅ (implemented; not launch-ready)

### Implemented
- **Cloud enabled**: database, email/password auth, storage bucket `unit-media` (public read,
  staff write via RLS on `storage.objects`).
- **Auth settings**: HIBP password check on; require current password on; sign-up open (admin
  accounts are role-gated, not signup-gated).
- **Secrets**: `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` stored server-side.
- **Migration** `20261027162606_add_booking_foundation_schema.sql`: tables `properties`,
  `room_types`, `units`, `unit_media`, `user_roles`, `guests`, `reservations`,
  `reservation_units`, `quotes`, `quote_lines`, `inventory_nights`, `audit_events`,
  `integration_settings`; helper fns `has_role`/`is_staff`/`is_manager`/`is_admin`; RLS + GRANTs
  on every public table; partial unique index `inventory_nights_active_unique` on
  `(unit_id, stay_date) WHERE is_active`; `integration_settings` singleton seeded with
  `expected_room_count=33`, `inventory_authority='UNRESOLVED'`, `instant_booking_enabled=false`.
- **Server functions** (`src/lib/booking/`):
  - `admin.functions.ts` → `bootstrapAdmin` (one-shot, disabled after success),
    `getCurrentStaff` (requireSupabaseAuth), `getDashboardStats` (requireSupabaseAuth).
  - `rooms.functions.ts` → `listProperties`, `listRoomTypes`, `listUnits`, `upsertUnit`,
    `updateUnit`, `archiveUnit`, `listUnitMedia`, `addUnitMedia`, `updateUnitMediaOrder`,
    `deleteUnitMedia`, `validateCsvImport`, `confirmCsvImport`, `getInventoryAuthority`.
- **Routes**:
  - `/admin/login` (public) — email/password sign-in; bootstrap trigger.
  - `/_authenticated` layout gate (`ssr:false`) → redirects to `/admin/login`.
  - `/_authenticated/admin` — Overview dashboard (real counts + setup status).
  - `/_authenticated/admin/rooms` — Rooms & Properties CRUD + CSV import (template, dry-run, confirm).
- **Auth state**: `onAuthStateChange` wired once in `__root.tsx`, filtered to identity transitions.

### Tests executed
- Build/typecheck via harness `build:dev` — passes.
- Manual: bootstrap creates super_admin role for `BOOTSTRAP_ADMIN_EMAIL`; repeated bootstrap is
  idempotent (no duplicate role, no password reset); sign-in then gate redirects to dashboard;
  unsigned-in direct navigation to `/admin` redirects to `/admin/login`; non-staff signed-in user
  sees empty/unauthorized state (RLS returns no rows); CSV dry-run reports row errors; CSV confirm
  inserts only valid rows; persistence after reload confirmed.

### Not yet / blocked
- **Inventory authority unresolved** → instant booking OFF (intended).
- **No payment provider configured** → no paid booking flow (Stage 3).
- **No channels/email/jobs** (Stages 4–5).
- Email confirmation is OFF by default; the bootstrap-created admin is `email_confirm: true` via
  the Auth Admin API so the owner can sign in immediately.

## Stage 2 — Availability, Pricing, Inventory Locks & Reservations ✅ (implemented; not launch-ready)

### Implemented
- **Migrations**:
  - `20261027163809_add_reservation_engine_and_pricing.sql` — extended `reservations` (hold_expires_at,
    cancelled_at, group_id, amendment_of, adults, children, checkin_date, checkout_date); extended
    `inventory_nights` (group_id); extended `quotes` (subtotal/fees/taxes/discount cents, nights,
    adults, children); extended `integration_settings` (advance_notice_days, booking_horizon_days,
    default_hold_minutes, default_checkin/checkout_time); new tables `rate_plans`, `date_rate_overrides`,
    `restrictions`, `fees`, `taxes`, `promotions`, `policy_versions`, `groups`, `blocks`,
    `housekeeping_tasks`, `idempotency_keys`; SECURITY DEFINER RPCs `acquire_inventory`, `claim_block`,
    `release_block`, `release_reservation`, `amend_reservation`, `group_pickup`; RLS + GRANTs on all.
  - `20261027163932_tighten_rpc_execute_grants.sql` — revoked RPC EXECUTE from anon/authenticated.
  - `20261027164011_revoke_default_public_execute_on_rpcs.sql` — revoked default PUBLIC EXECUTE on
    RPCs; kept role helpers executable by authenticated (RLS policies call them).
- **Server modules** (`src/lib/booking/`):
  - `dates.ts` — property-local date-only math; [checkin, checkout) nights; DST/leap-safe; booking ref.
  - `pricing.server.ts` — authoritative quote engine (base/weekend/override/additional-person/fees/
    taxes/promotions; integer cents; deterministic precedence; immutable snapshots).
  - `availability.server.ts` — real availability search (published/non-archived/non-closed units,
    no active claims for any night, capacity, pet, accessibility, restrictions, min/max stay,
    advance notice; returns only safe data).
  - `reservations.server.ts` — `createReservation`, `createBlock`, `releaseBlock`,
    `cancelReservation`, `amendReservation`, `groupPickup`, `checkIn`, `checkOut`, `markNoShow`,
    `listReservations`, `getReservation`, `listBlocks`, `expireStaleHolds`, `createGroup`,
    `listGroups`, `releaseGroup`, `buildCalendar`; all verify staff/manager role before RPC.
  - `reservations.functions.ts` — thin `createServerFn` wrappers for all of the above +
    `searchAvailabilityFn` (public), `staffSearchAvailabilityFn`, `computeQuoteFn` (public).
- **Routes**:
  - `/_authenticated/admin/calendar` — 33-room grid (rooms as rows, dates as columns), week nav,
    room-kind filter, legend, click-to-create manual booking modal (quote + availability re-check +
    atomic create), status colors for reservation/hold/block/group.
  - `/_authenticated/admin/reservations` — reservations list with search + status filter, inline
    check-in/check-out/no-show/cancel actions.
- **AdminShell nav** — Calendar + Reservations now active and linked to real routes.

### Tests executed (SQL, against the live Cloud database)
- **Schema presence**: confirmed `inventory_nights.group_id`, `inventory_nights_active_unique`
  index, `rate_plans`, `restrictions`, `groups`, `blocks`, `idempotency_keys`, all 6 RPCs.
- **Atomic inventory invariant**: inserted a test unit, created an active claim for 2027-05-01,
  confirmed a second active claim for the same (unit, night) is rejected with `unique_violation`;
  deactivated the first, confirmed a new active claim then succeeds. ✅
- **acquire_inventory RPC**: created a 2-night reservation (May 1–3) via the RPC; confirmed exactly
  2 inventory_nights (May 1 + May 2) and 1 reservation_unit were created atomically; confirmed a
  conflicting claim for the same unit/May-1 is rejected; cleaned up. ✅
- **group_pickup ownership**: created a group block (2 nights), confirmed group nights exist, then
  confirmed `group_pickup` correctly rejects a non-group owner (block_id passed as group_id) —
  proving it validates group ownership rather than accepting any claim. ✅
- Build/typecheck via harness `build:dev` — passes after the route tree regenerated to include
  `/admin/calendar` and `/admin/reservations`.

### Not yet / blocked
- **Inventory authority unresolved** → instant booking OFF (intended). No public paid booking.
- **No payment provider configured** → no paid booking flow (Stage 3).
- **Idempotency keys** table exists but the wrapper functions do not yet persist/replay by key
  (the RPCs are atomic; durable idempotency replay is wired for Stage 3 with payment attempts).
- **No realtime/polling freshness indicator** on the calendar yet (manual refresh via query
  invalidation only); Stage 4 adds visible freshness state.
- **No public /stay booking UI** yet (Stage 3).

## Regression & repair — public-site styling after Stage 2

### Identified cause
After the Stage 2 file additions (admin calendar/reservations routes + booking server modules), the
**dev server's Tailwind v4 content scanner fell out of sync**: the dev-served `/src/styles.css`
HMR module was emitting an **incomplete** CSS scan — utilities the public components depend on
(`h-16`, `min-h-[85vh]`, and the arbitrary-hex backgrounds `bg-[#1b251e]`, `bg-[#2a382c]`,
`bg-[#faf8f5]`, etc.) were absent from the dev CSS while present in the production build. With those
utilities missing, the preview rendered the logo at natural size, default browser fonts, a blue
underlined phone link, and horizontal overflow — i.e. the reported regression.

**The source was not broken.** The production build CSS (`dist/client/assets/styles-*.css`, ~99 KB)
was confirmed to contain every arbitrary-hex utility used by `Header.tsx` / `Hero.tsx` /
`index.tsx` (`1b251e`, `faf8f5`, `2a382c`, `2f4032`, `243327`, `f4eee6`, `fbf9f6`, `f3eee8`,
`3e5340`, `1a231c`, `cadbbf`, `bfd8b8`, `ece7df`, `18221b`) plus `h-14`, `max-w-7xl`,
`backdrop-blur-md`, `font-serif`, `rounded-full`, `object-contain`, the full `stone` palette, and
all `--background/--foreground/--primary/--radius` tokens. `src/styles.css` retains the correct
`@import "tailwindcss" source(none)` + `@source "../src"` config.

### Repair performed
- Restarted the dev server (`kill` + wait-for-port) to force a fresh, complete Tailwind v4 content
  scan of `../src`. Dev server returned HTTP 200 on `/` after restart.
- No source files were edited for this repair — the components, styles, and `@source` config were
  already correct (proven by the complete production build). Editing correct source would have
  risked a real regression.
- Stage 1/2 migrations, auth, roles/RLS, inventory RPCs, availability/pricing/reservation engine,
  admin calendar/reservations, and the single-row announcement ticker are all preserved.

### Verification performed
- Confirmed served homepage HTML contains Header + Hero + AnnouncementBar markup and the
  `<link rel="stylesheet" href="/src/styles.css">` tag returning HTTP 200.
- Confirmed the production build CSS contains all arbitrary-hex utilities + key utility classes +
  theme tokens used by the public components.
- Confirmed `src/styles.css` `@source "../src"` config and that public component files exist under
  `src/components/` and `src/routes/`.
- Restarted dev server; `/` returned HTTP 200 after restart.
- **Re-verified after restart**: fetched the live dev-served `/src/styles.css` (129,535 bytes) from
  the running dev server and confirmed by raw-byte inspection that ALL previously-missing utilities
  are now present. The dev CSS escapes arbitrary values with double backslashes
  (`.bg-\\[\\#1b251e\\]`, `.min-h-\\[85vh\\]`, `.h-\\[380px\\]`, `.bg-\\[#1b251e\\]\\/85`).
  Confirmed present: `h-16`, `min-h-[85vh]`, `bg-[#1b251e]`, `bg-[#1b251e]/85`, `text-[#2f4032]`,
  `bg-[#faf8f5]`, `bg-[#2a382c]`, `h-[380px]`, `h-[460px]`, `bg-[#243327]`, `text-[#3e5340]`,
  `bg-[#f4eee6]`, `bg-[#fbf9f6]`, `h-14`, `max-w-7xl`, `backdrop-blur-md`, `font-serif`,
  `rounded-full`, `object-contain`, `text-stone-100` — plus the full set of hex utilities
  (`1b251e`, `2a382c`, `2f4032`, `3e5340`, `202c23`, `18211b`, `18221b`, `243327`, `faf8f5`, etc.).
- **Rendered HTML confirmed** (homepage `/`): `<link rel="stylesheet" href="/src/styles.css">`
  present; logo `The-Bridges-infographic-1024x1024.png` rendered; full announcement text on one row
  with inline `height:2.5rem; overflow:auto; display:flex` (single-row ticker); `tel:+19317225589`
  link present; hero `<video>` present; "The Willows" card present.
- **Secondary routes**: `/amenities` serves its own `<link>` to `/src/styles.css`; `/admin/calendar`
  and `/admin/login` return HTTP 200 (calendar is auth-gated behind the `_authenticated` route gate).
- **Conclusion**: the public-site styling regression is resolved. The dev Tailwind v4 content scan
  is complete and the served CSS contains every utility the public components depend on. No source
  files were edited for this repair (the source was already correct); the dev-server restart was
  sufficient. All Stage 1/2 database, auth, RLS, inventory RPCs, and booking engine are preserved.

## Stage 3 — Guest booking, Stripe test-mode payments, secure access (implemented; not launch-ready)

### Implemented
- **Migration** `20261027191635_stage_3_adds_payment_attempts.sql` — `payment_attempts`,
  `payment_transactions`, `refunds`, `reservation_access_capabilities`, `outbox_jobs`,
  `inbound_events`; unique constraints on `(provider, provider_transaction_id)`,
  `(provider, provider_event_id)`, `(provider, provider_refund_id)`; RLS + GRANTs.
  `20261027191646_revoke_default_public_execute_on.sql` — tightened RPC execute grants.
- **Idempotency** (`idempotency.ts`) — persisted `runIdempotent` keyed by `(key, scope)` with
  request-hash equality check (rejects reuse-with-different-inputs; replays stored result).
  Wraps guest reservation creation and checkout-session creation. `randomToken`/`sha256` for
  access capabilities.
- **Stripe adapter** (`stripe.server.ts`) — direct REST (no SDK dependency), server-only env
  reads inside each call; `createCheckoutSession`, `retrieveCheckoutSession`,
  `retrievePaymentIntent`, `createRefund`; `verifyWebhookSignature` (HMAC-SHA256, timing-safe,
  5-min replay window). Test/live inferred from key prefix.
- **Payments** (`payments.server.ts`) — `createCheckout` (idempotent, trusted-origin return URLs,
  durable payment_attempt record, provider session/intent IDs + expiry), `getReservationStatus`
  (authoritative; reconciles pending attempt against Stripe before returning),
  `reconcileAttempt` (confirms only on paid + amount/currency match).
- **Payment confirmation** (`payments-confirm.server.ts`) — `confirmReservationPayment`
  (idempotent by provider_transaction_id; queues deduped outbox jobs), `processWebhookEvent`
  (durable inbound_events inbox; handles completed/async_succeeded/expired/payment_failed/refunded),
  `recordRefund` (idempotent by provider_refund_id; prevents over-refund), `staffRefund`
  (manager-gated; idempotent provider refund; blocks refund > collected).
- **Secure guest access** (`payments-access.server.ts`) — `createAccessCapability` (random 32-byte
  token, sha256 hash stored, 90-day expiry), `resolveAccessCapability` (verifies hash/expiry/revocation),
  `createGuestReservation` (atomic inventory hold via `acquire_inventory` RPC + capability issued;
  idempotent), `guestCancelReservation` (releases inventory via `release_reservation` RPC).
- **Server functions** (`payments.functions.ts`) — `createGuestReservationFn` (public),
  `createCheckoutFn` (public), `getReservationStatusFn` (public, token-gated),
  `resolveAccessFn` (public), `guestCancelReservationFn` (public, token-gated),
  `staffRefundFn` (manager), `getStripeConfigStatusFn` (public).
- **Webhook route** (`/api/webhooks/stripe`) — raw HTTP, signature-verified, durable inbox,
  non-2xx on processing failure so Stripe retries.
- **Public booking routes**:
  - `/stay` — search hero (dates/guests/rooms) + availability search + accommodation grid
    (`stay.index.tsx`); honest "instant booking not enabled" state when authority unresolved.
  - `/stay/$unitId` — unit detail, live availability + authoritative quote, reserve CTA.
  - `/booking/review` — guest details form, itemized quote, policy + separate marketing consent,
    atomic hold creation, Stripe Checkout redirect (or request-to-book fallback).
  - `/booking/status` — authoritative status with polling while payment processing; "payment
    processing" until server confirms; never trusts a success URL.
  - `/reservation/$id` — token-gated secure access; booking details, itemized charges, balance,
    cancellation request; never exposes staff notes or other guests.
- **Live booking kept OFF**: `inventory_authority=UNRESOLVED`, `instant_booking_enabled=false`.
  Stripe in test mode only (key prefix `sk_test_`).

### Tests executed
- Production `bun run build` — passes cleanly; `stay.index`, `booking.review`, `booking.status`,
  `reservation._id`, `stay.$unitId`, `payments.functions`, `payments-confirm.server` chunks all
  generated. ✅
- `/stay` route returns HTTP 200; route tree regenerated with `stay.index`. ✅
- Stage 2 atomic-inventory invariant (one winner on conflicting unit/night) remains in force via
  the same `acquire_inventory` RPC now used by the guest flow. ✅

### Not yet / blocked
- **Stripe secrets not yet set**: `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` are not in the
  server secret store. `getStripeConfig()` returns `configured: false` and the booking UI shows
  the honest "online payment not yet enabled — we'll send a secure payment link" state. No live
  or test charge has been attempted. **Payment/webhook behavior is NOT verified end-to-end** —
  it requires the owner to add the Stripe test-mode secrets, then a real test-mode checkout +
  webhook round-trip must be run before claiming verification.
- **Idempotency concurrency test against two independent DB connections** for the guest hold
  path is implemented (same `acquire_inventory` unique-index guarantee from Stage 2) but not
  re-executed this stage; the Stage 2 SQL test proved one-winner behavior.
- **No email/SMS delivery** (Stage 5); outbox jobs are queued with `status: queued` and shown as
  configuration-pending, never claimed as sent.
- **No deposit/balance schedule** configured (no invented percentages); pay-in-full is the only
  active flow. Later-balance collection path is scaffolded but unconfigured.

## Stage 4 — pending
## Stage 5 — pending
## Stage 6 — pending
---

## Media Migration — WordPress Host Retirement (2026-10-27)

### Summary
All 9 unique WordPress-hosted images (used across 33 references in 13 source
files) were downloaded from thebridgestn.com and re-hosted on durable,
app-owned storage (vibe.filesafe.space), independent of the retiring
WordPress server. The homepage hero video was already hosted on an
independent CDN (assets.cdn.filesafe.space) and was unchanged.

### Backup ZIP / media-manifest.json
The supplied backup ZIP and media-manifest.json were not present in this
environment. Assets were downloaded directly from the live WordPress host
while still accessible. Originals are preserved in durable storage.

### Asset registry
Created src/lib/assets.ts — central registry mapping old WordPress URL ->
new durable URL, content type, slug, alt text, and usage locations. Exports
ASSET_REGISTRY, ASSET_URL_MAP, and resolveAssetUrl().

### Files copied (old URL -> new durable URL)
1. .../The-Bridges_Natural-Bridge_Wayne-County-66-scaled.jpg -> assets/30945ebf-...jpg
2. .../The-Bridges_Ice-Cave_Wayne-County-56-scaled.jpg -> assets/5d66d3b1-...jpg
3. .../The-Bridges_Natural-Bridge_Wayne-County-66-1024x683.jpg -> assets/fab01de6-...jpg
4. .../DSC2575-2-scaled.jpg -> assets/cab64087-...jpg
5. .../The-Bridges-infographic-1024x1024.png -> assets/1d550afa-...png
6. .../The-Bridges_The-Willows-Event-Space_Wayne-County-39-1024x683.jpg -> assets/a826cf17-...jpg
7. .../The-Bridges_Room-41_Wayne-County-69-1024x683.jpg -> assets/dc17e0c3-...jpg
8. .../facilities27-min.jpg -> assets/b8fc567d-...jpg
9. .../IMG_7798-768x1024.jpg -> assets/0d9abec6-...jpg
10. .../IMG_9626-1-768x1024.jpg -> assets/6eb4c2ea-...jpg

### References replaced
Source files updated (all img src, gallery url, logo src):
ContactSection, ExploreLandmarks, Footer, Header, Hero, AdminShell,
about-us, amenities, events, gallery, index, massage-wellness,
weddings-events. Verified: NO thebridgestn.com/wp-content/uploads image
URLs remain as live src references in any component/route. The only
remaining wp-content strings are the oldUrl provenance fields in
src/lib/assets.ts (intentional, for record-keeping).

### Database
unit_media table queried — currently empty (no stored media URLs in DB).
No DB media fields required updating.

### Preserved (not WordPress)
- Hero video: assets.cdn.filesafe.space (already independent) — unchanged.
- Airbnb booking links, contact form, form-tracking integration — unchanged.
- Seasonal offers, December events, massage call/text, single-row
  announcement — all preserved.

### Remaining external dependencies
None for media. The site still uses thebridgestn.com for normal
navigation/email (mailto:info@thebridgestn.com) — those are not retiring-host
media dependencies and were intentionally preserved per instructions.

### Shutdown readiness
All retiring-host media dependencies have been replaced with durable
app-owned URLs. The old WordPress host can be retired without breaking any
image, video, logo, or gallery on the new site.
