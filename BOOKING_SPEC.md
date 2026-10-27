# The Bridges — Booking & Property Management System Spec

Six-stage build of a real lodging booking and property-management system on top of the existing
public The Bridges website. Built on the platform's managed backend (**Cloud**) for database,
auth, and storage, and TanStack Start server functions for backend logic.

## Business context

- The Bridges is in Waynesboro, Tennessee (Wayne County). Property timezone `America/Chicago`,
  currency `USD`.
- Owner reports **33 physical rooms**. `integration_settings.expected_room_count = 33` is tracked
  but we do NOT invent 33 published rooms. The dashboard distinguishes expected / configured /
  published / unavailable counts.
- Do not infer real room labels, capacities, prices, or descriptions from the count of 33.
- The Willows and other event inquiries remain separate from overnight instant booking.
- Admin: `ben@view360.marketing`. Initial password supplied privately via server Secret
  `BOOTSTRAP_ADMIN_PASSWORD`; email via `BOOTSTRAP_ADMIN_EMAIL`. Never printed or put in browser code.

## Architectural invariants

1. **One inventory authority per physical room.** `integration_settings.inventory_authority` starts
   `UNRESOLVED`. Development/admin CRUD may proceed; paid public instant booking stays OFF until
   authority + payments + launch checks pass.
2. **Every overnight allocation refers to physical unit IDs.** A unit cannot have overlapping
   active occupancy for any night. Enforced by `inventory_nights` partial unique index on
   `(unit_id, stay_date) WHERE is_active`. A single `isBooked` boolean is not an availability model.
3. **Guest / reservation / payment / staff data is private.** Public search returns only safe room
   and availability results.
4. **All inventory changes and price calculations are server-enforced.** Client-provided totals,
   roles, payment status, and booking ownership are untrusted.
5. **Durable database records required.** localStorage may keep harmless search preferences only;
   it is never the system of record.

## Data model

### Stage 1 (implemented)
- `properties` — resort/property grouping, timezone + contact.
- `room_types` — public category, description, capacity rules, amenities.
- `units` — physical unit ID, unit_code (unique), type, property, beds/capacity, pet policy,
  accessibility notes, publish/archive/close state, base rate + cleaning fee (cents).
- `unit_media` — ordered photos, alt/caption, primary flag, storage path.
- `user_roles` + `has_role` / `is_staff` / `is_manager` / `is_admin` (security definer) — staff
  roles bound to verified `auth.users(id)`.
- `guests`, `reservations`, `reservation_units`, `quotes`, `quote_lines` — foundations laid.
- `inventory_nights` — one active owner per (unit, night); owner_type ∈ reservation/hold/group/
  owner/maintenance/external.
- `audit_events` — append-only actor/action/before/after.
- `integration_settings` — singleton: inventory_authority, expected_room_count, instant_booking_enabled,
  bootstrap_completed_at.

### Stage 2 (implemented)
- `rate_plans` — base/weekend nightly cents, additional-person fees, weekend days, effective window,
  scoped to room_type or unit.
- `date_rate_overrides` — per-unit or per-plan nightly overrides with unique indexes.
- `restrictions` — min/max stay, closed-to-arrival/departure, is_closed, per unit or room_type.
- `fees` — per_stay/per_night/per_person/per_person_per_night, taxable flag.
- `taxes` — percentage, active flag.
- `promotions` — percent or fixed discount, redemption limits, effective window.
- `policy_versions` — cancellation/check-in/house rules snapshots.
- `groups` — wedding/retreat allotments with code, contact, release date, payment responsibility.
- `blocks` — maintenance/owner/group block metadata.
- `housekeeping_tasks` — operational readiness separate from overnight occupancy.
- `idempotency_keys` — durable retry dedup (key + scope unique).

### Reservation lifecycle states
`draft`, `requested`, `held`, `pending_payment`, `confirmed`, `checked_in`, `checked_out`,
`cancelled`, `expired`, `no_show`, `exception_needs_review`. Transitions enforced server-side;
reservation, payment, inventory, and housekeeping states are kept separate.

### SECURITY DEFINER RPCs (service-role only)
- `acquire_inventory` — atomic reservation + reservation_units + inventory_nights in one tx.
- `claim_block` — atomic block + inventory_nights.
- `release_block` — deactivate nights + remove block.
- `release_reservation` — deactivate a reservation's nights.
- `amend_reservation` — atomic swap of dates/units; rolls back on conflict (old booking preserved).
- `group_pickup` — transfer a group's night claim to a reservation (no double-count).

All RPCs revoked from PUBLIC/anon/authenticated; granted only to `service_role`. Server functions
verify the caller's staff/manager role via `requireSupabaseAuth` + `is_staff`/`is_manager` before
invoking through `supabaseAdmin`.

## Auth & authorization

- Email/password only (Cloud auth). `/admin/login` uses `supabase.auth.signInWithPassword`.
- Protected admin routes live under `src/routes/_authenticated/` with a client-side gate
  (`ssr: false`) that redirects unsigned-in users to `/admin/login`.
- Protected server functions use `requireSupabaseAuth`; `context.supabase` is RLS-scoped to the
  caller. Privileged bootstrap uses `supabaseAdmin` (service role) and is disabled after first
  success (`bootstrap_completed_at`); it never resets an existing user's password.
- Roles: `super_admin`, `manager`, `front_desk`, `housekeeping`, `read_only`. RLS enforces:
  staff read; managers write rooms/rates/properties; super_admin changes settings/users.
- `attachSupabaseAuth` stays in `src/start.ts` `functionMiddleware` (Cloud-owned).

## Roadmap

- **Stage 1** — Foundation: real DB, admin login/bootstrap, admin shell, property/room-type/unit
  CRUD, image upload/reorder, CSV import (template + dry-run + confirm), setup status. ✅
- **Stage 2** — Availability, authoritative pricing, atomic inventory locks, reservations engine,
  staff booking calendar, reservations list, groups. ✅ this stage
- **Stage 3** — Guest booking flow, Stripe test-mode payments, secure reservation access.
- **Stage 4** — Complete staff dashboard & daily operations.
- **Stage 5** — Channels, existing-bookings import, email/SMS, reliable jobs.
- **Stage 6** — Acceptance, recovery, launch readiness.

## Decisions record

- **Inventory authority:** `UNRESOLVED` (default). Public Airbnb links + a Hostaway-hosted booking
  link exist on the public site but do not establish channel ownership. Direct-only vs PMS vs
  request-to-book to be confirmed with the owner in Stage 5. Instant booking stays OFF until then.
- **Payment provider:** Stripe-hosted Checkout (planned Stage 3). Test/live split, webhook signing,
  idempotent attempts. Not configured yet.
- **Date semantics:** property-local date-only [checkin, checkout); nights counted by calendar
  dates, not elapsed-ms/24h, so DST and leap days are handled. Verified by SQL tests.