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
- **Not re-verified** (runtime-diagnostic budget exhausted before the post-restart dev CSS could be
  re-fetched and substring-checked): the freshly-served dev CSS after restart. The complete
  production build + successful dev-server restart are strong evidence the preview is restored;
  automatic build/runtime validation will confirm.

## Stage 3 — pending
## Stage 4 — pending
## Stage 5 — pending
## Stage 6 — pending