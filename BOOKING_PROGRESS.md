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
- Build/typecheck via harness `build:dev` — see end-of-turn build log.
- Manual: bootstrap creates super_admin role for `BOOTSTRAP_ADMIN_EMAIL`; repeated bootstrap is
  idempotent (no duplicate role, no password reset); sign-in then gate redirects to dashboard;
  unsigned-in direct navigation to `/admin` redirects to `/admin/login`; non-staff signed-in user
  sees empty/unauthorized state (RLS returns no rows); CSV dry-run reports row errors; CSV confirm
  inserts only valid rows; persistence after reload confirmed.

### Not yet / blocked
- **Inventory authority unresolved** → instant booking OFF (intended).
- **No payment provider configured** → no paid booking flow (Stage 3).
- **No reservation engine** (Stage 2), **no channels/email/jobs** (Stages 4–5).
- Email confirmation is OFF by default; the bootstrap-created admin is `email_confirm: true` via
  the Auth Admin API so the owner can sign in immediately.

## Stage 2 — pending
## Stage 3 — pending
## Stage 4 — pending
## Stage 5 — pending
## Stage 6 — pending