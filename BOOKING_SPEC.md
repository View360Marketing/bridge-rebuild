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

## Data model (Stage 1 implemented)

- `properties` — resort/property grouping, timezone + contact.
- `room_types` — public category, description, capacity rules, amenities.
- `units` — physical unit ID, unit_code (unique), type, property, beds/capacity, pet policy,
  accessibility notes, publish/archive/close state, base rate + cleaning fee (cents).
- `unit_media` — ordered photos, alt/caption, primary flag, storage path.
- `user_roles` + `has_role` / `is_staff` / `is_manager` / `is_admin` (security definer) — staff
  roles bound to verified `auth.users(id)`.
- `guests`, `reservations`, `reservation_units`, `quotes`, `quote_lines` — foundations laid;
  reservation engine is Stage 2.
- `inventory_nights` — one active owner per (unit, night); owner_type ∈ reservation/hold/group/
  owner/maintenance/external.
- `audit_events` — append-only actor/action/before/after.
- `integration_settings` — singleton: inventory_authority, expected_room_count, instant_booking_enabled,
  bootstrap_completed_at.

Money is integer cents. `reservation_units` has `CHECK (checkout_date > checkin_date)`.

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
  CRUD, image upload/reorder, CSV import (template + dry-run + confirm), setup status. ✅ this stage
- **Stage 2** — Availability, authoritative pricing, atomic inventory locks, reservations engine.
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