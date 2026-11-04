import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listIcalUnitsFn,
  updateIcalMappingFn,
  regenerateExportTokenFn,
  syncUnitIcalFn,
  getSyncHistoryFn,
  getSyncSettingsFn,
  updateSyncSettingsFn,
  type IcalUnit,
  type ImportOutcome,
} from "@/lib/booking/ical.functions";
import {
  stripeWebhookDiagnosticsFn,
  createStripeWebhookFn,
  getStripeConfigStatusFn,
} from "@/lib/booking/payments.functions";
import {
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  CalendarSync,
  CreditCard,
  Loader2,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations | The Bridges Admin" },
      { name: "description", content: "Airbnb iCal sync, webhooks, and channel configuration." },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-stone-900">Integrations</h1>
        <p className="text-sm text-stone-500 mt-1">
          Two-way Airbnb iCal sync, webhooks, and channel configuration.
        </p>
      </div>
      <AirbnbCalendars />
      <WebhooksSection />
      <MigrationChecklist />
    </>
  );
}

function AirbnbCalendars() {
  const listUnits = useServerFn(listIcalUnitsFn);
  const getSettings = useServerFn(getSyncSettingsFn);
  const { data: units, isLoading } = useQuery({ queryKey: ["ical-units"], queryFn: listUnits });
  const { data: settings } = useQuery({ queryKey: ["ical-settings"], queryFn: getSettings });

  if (isLoading) return <p className="text-sm text-stone-500">Loading accommodations…</p>;

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <CalendarSync className="w-5 h-5 text-[#2a382c]" />
        <h2 className="font-serif text-xl font-bold text-stone-900">Airbnb Calendars</h2>
      </div>
      <p className="text-sm text-stone-600 mb-4">
        Each accommodation maps to one Airbnb listing. Imported Airbnb blocks stop our availability
        search and booking engine. Our confirmed reservations export to a feed Airbnb imports.
      </p>

      <SyncSettings settings={settings} />

      {(units ?? []).length === 0 ? (
        <p className="text-sm text-stone-500 mt-4">
          No accommodations configured. Add rooms in Rooms & Properties first.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {(units ?? []).map((u) => (
            <UnitRow key={u.id} unit={u} baseUrl={settings?.ical_export_base_url ?? null} />
          ))}
        </div>
      )}
    </section>
  );
}

function SyncSettings({
  settings,
}: {
  settings:
    | {
        ical_sync_enabled: boolean;
        ical_sync_interval_minutes: number;
        ical_export_base_url: string | null;
        ical_stale_after_hours: number;
      }
    | undefined;
}) {
  const update = useServerFn(updateSyncSettingsFn);
  const qc = useQueryClient();
  const [enabled, setEnabled] = useState(settings?.ical_sync_enabled ?? false);
  const [interval, setInterval] = useState(settings?.ical_sync_interval_minutes ?? 5);
  const [stale, setStale] = useState(settings?.ical_stale_after_hours ?? 24);
  const [baseUrl, setBaseUrl] = useState(settings?.ical_export_base_url ?? "");

  const save = useMutation({
    mutationFn: () =>
      update({
        data: {
          ical_sync_enabled: enabled,
          ical_sync_interval_minutes: interval,
          ical_stale_after_hours: stale,
          ical_export_base_url: baseUrl || null,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ical-settings"] }),
  });

  return (
    <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 mb-2">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
        Sync Configuration
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Enable scheduled import
        </label>
        <label className="text-sm">
          Interval (min)
          <input
            type="number"
            min={1}
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="block w-24 mt-1 px-2 py-1 border border-stone-300 rounded text-sm"
          />
        </label>
        <label className="text-sm">
          Stale after (hrs)
          <input
            type="number"
            min={1}
            value={stale}
            onChange={(e) => setStale(Number(e.target.value))}
            className="block w-24 mt-1 px-2 py-1 border border-stone-300 rounded text-sm"
          />
        </label>
        <label className="text-sm">
          Export base URL
          <input
            type="text"
            value={baseUrl}
            placeholder="https://thebridgestn.com"
            onChange={(e) => setBaseUrl(e.target.value)}
            className="block w-full mt-1 px-2 py-1 border border-stone-300 rounded text-sm"
          />
        </label>
      </div>
      <button
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className="mt-3 px-4 py-1.5 rounded-lg bg-[#2a382c] text-white text-sm font-medium hover:bg-[#1b251e] disabled:opacity-50"
      >
        {save.isPending ? "Saving…" : "Save settings"}
      </button>
      {save.isError && <p className="text-xs text-red-600 mt-2">Failed to save settings.</p>}
      <p className="text-xs text-stone-500 mt-2">
        Import runs via an external durable scheduler calling{" "}
        <code className="text-stone-700">POST /api/ical/sync</code> with the{" "}
        <code className="text-stone-700">ICAL_CRON_SECRET</code> header. This endpoint is
        implemented but does not schedule itself — an external cron job must be configured to call
        it. Saving the secret enables authorization; it does not by itself activate scheduling. Our
        poll interval does not control how often Airbnb reads our export feed (Airbnb imports
        ~3-hour cycles).
      </p>
    </div>
  );
}

function UnitRow({ unit, baseUrl }: { unit: IcalUnit; baseUrl: string | null }) {
  const updateMapping = useServerFn(updateIcalMappingFn);
  const regenerate = useServerFn(regenerateExportTokenFn);
  const syncNow = useServerFn(syncUnitIcalFn);
  const getHistory = useServerFn(getSyncHistoryFn);
  const qc = useQueryClient();
  const [importUrl, setImportUrl] = useState(unit.ical_import_url ?? "");
  const [listingId, setListingId] = useState(unit.airbnb_listing_id ?? "");
  const [airbnbUrl, setAirbnbUrl] = useState(unit.airbnb_url ?? "");
  const [copied, setCopied] = useState(false);
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);

  const { data: history } = useQuery({
    queryKey: ["ical-history", unit.id],
    queryFn: () => getHistory({ data: { unit_id: unit.id } }),
  });

  const exportUrl =
    unit.ical_export_token && baseUrl
      ? `${baseUrl.replace(/\/$/, "")}/api/ical/export.ics?unit=${unit.id}&token=${unit.ical_export_token}`
      : null;

  const saveMapping = useMutation({
    mutationFn: () =>
      updateMapping({
        data: {
          unit_id: unit.id,
          airbnb_listing_id: listingId || null,
          airbnb_url: airbnbUrl || null,
          ical_import_url: importUrl || null,
          ical_sync_enabled: !!importUrl,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ical-units"] }),
  });

  const regen = useMutation({
    mutationFn: () => regenerate({ data: { unit_id: unit.id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ical-units"] }),
  });

  const sync = useMutation({
    mutationFn: () => syncNow({ data: { unit_id: unit.id, feed_url: importUrl } }),
    onSuccess: (r) => {
      setOutcome(r as unknown as ImportOutcome);
      qc.invalidateQueries({ queryKey: ["ical-units"] });
      qc.invalidateQueries({ queryKey: ["ical-history", unit.id] });
    },
    onError: (e) => setOutcome({ status: "failed", error: (e as Error).message } as ImportOutcome),
  });

  const statusColor =
    unit.ical_sync_status === "synced"
      ? "text-emerald-600"
      : unit.ical_sync_status === "error"
        ? "text-red-600"
        : unit.ical_sync_status === "stale"
          ? "text-amber-600"
          : "text-stone-500";

  return (
    <div className="border border-stone-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium text-stone-900">
            {unit.public_name ?? unit.unit_code}
            <span className="text-stone-400 font-normal"> · {unit.unit_code}</span>
          </p>
          <p className="text-xs text-stone-500">
            Airbnb ID: {unit.airbnb_listing_id ?? "—"} · Status:{" "}
            <span className={statusColor}>{unit.ical_sync_status ?? "not configured"}</span>
          </p>
        </div>
        {unit.airbnb_url && (
          <a
            href={unit.airbnb_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#2a382c] underline flex items-center gap-1"
          >
            Listing <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-sm">
          Airbnb listing ID (text)
          <input
            type="text"
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            className="block w-full mt-1 px-2 py-1.5 border border-stone-300 rounded text-sm"
          />
        </label>
        <label className="text-sm">
          Public listing URL
          <input
            type="text"
            value={airbnbUrl}
            onChange={(e) => setAirbnbUrl(e.target.value)}
            className="block w-full mt-1 px-2 py-1.5 border border-stone-300 rounded text-sm"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Airbnb calendar import URL (iCal)
          <input
            type="url"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://www.airbnb.com/calendar/ical/…"
            className="block w-full mt-1 px-2 py-1.5 border border-stone-300 rounded text-sm"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button
          onClick={() => saveMapping.mutate()}
          disabled={saveMapping.isPending}
          className="px-3 py-1.5 rounded-lg bg-[#2a382c] text-white text-sm font-medium hover:bg-[#1b251e] disabled:opacity-50"
        >
          {saveMapping.isPending ? "Saving…" : "Save mapping"}
        </button>
        <button
          onClick={() => sync.mutate()}
          disabled={sync.isPending || !importUrl}
          className="px-3 py-1.5 rounded-lg border border-stone-300 text-sm font-medium hover:bg-stone-100 disabled:opacity-50 flex items-center gap-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${sync.isPending ? "animate-spin" : ""}`} />
          Sync now
        </button>
        <button
          onClick={() => regen.mutate()}
          className="px-3 py-1.5 rounded-lg border border-stone-300 text-sm font-medium hover:bg-stone-100"
        >
          Regenerate export token
        </button>
      </div>

      {exportUrl && (
        <div className="mt-3 flex items-center gap-2 bg-stone-50 rounded-lg px-3 py-2">
          <span className="text-xs text-stone-500 shrink-0">Export feed:</span>
          <code className="text-xs text-stone-700 truncate flex-1">{exportUrl}</code>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(exportUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="text-stone-500 hover:text-stone-800"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}

      {outcome && (
        <p
          className={`text-xs mt-2 ${outcome.status === "failed" ? "text-red-600" : "text-emerald-700"}`}
        >
          {outcome.status === "failed"
            ? `Sync failed: ${outcome.error}`
            : `Synced: ${outcome.imported} imported, ${outcome.updated} updated, ${outcome.cancelled} cancelled (${outcome.raw_events} events).`}
        </p>
      )}

      {unit.ical_last_synced_at && (
        <p className="text-xs text-stone-400 mt-1">
          Last sync: {new Date(unit.ical_last_synced_at).toLocaleString()}
        </p>
      )}

      {history && history.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs text-stone-500 cursor-pointer">
            Sync history ({history.length})
          </summary>
          <ul className="mt-1 space-y-1 text-xs text-stone-600 max-h-32 overflow-y-auto">
            {history.slice(0, 8).map((h) => (
              <li key={h.id} className="flex justify-between">
                <span>
                  {new Date(h.started_at).toLocaleString()} — {h.status}
                </span>
                <span className="text-stone-400">
                  {h.imported_count}+/{h.updated_count}~/{h.cancelled_count}×
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function WebhooksSection() {
  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
      <h2 className="font-serif text-xl font-bold text-stone-900 mb-1">Webhooks</h2>
      <p className="text-sm text-stone-600 mb-4">
        Incoming and outgoing webhook configuration. Airbnb iCal sync is a calendar integration, not
        a webhook.
      </p>
      <div className="space-y-3">
        <StripeWebhookCard />
        <div className="border border-stone-200 rounded-xl p-4">
          <p className="font-medium text-stone-900 text-sm">Outgoing webhooks</p>
          <p className="text-xs text-stone-500 mt-1">
            Outgoing endpoint configuration (reservation created/confirmed/changed/cancelled,
            check-in/out, payment updates) is available through the webhook endpoints table. Add
            endpoints, select events, rotate signing secrets, and send synthetic test events from
            the Webhooks management screen.
          </p>
        </div>
      </div>
    </section>
  );
}

function StripeWebhookCard() {
  const getDiagnostics = useServerFn(stripeWebhookDiagnosticsFn);
  const createWebhook = useServerFn(createStripeWebhookFn);
  const getStripeStatus = useServerFn(getStripeConfigStatusFn);
  const qc = useQueryClient();
  const { data: stripeStatus } = useQuery({
    queryKey: ["stripe-config-status"],
    queryFn: getStripeStatus,
  });
  const { data: diag, isLoading } = useQuery({
    queryKey: ["stripe-webhook-diagnostics"],
    queryFn: () => getDiagnostics({ data: {} }),
  });
  const [registering, setRegistering] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const webhookUrl = diag?.webhookUrl ?? "https://thebridgestn.com/api/webhooks/stripe";
  const hasWebhookSecret = stripeStatus?.hasWebhookSecret ?? false;
  const matchingEndpoint = diag?.ok ? diag.matchingEndpoint : null;
  const endpoints = diag?.ok ? diag.endpoints : [];

  async function handleRegister() {
    setRegistering(true);
    try {
      const result = await createWebhook({ data: {} });
      if (result.ok && result.secret) {
        setNewSecret(result.secret);
        toast.success("Stripe webhook endpoint registered. Copy the signing secret below.");
        qc.invalidateQueries({ queryKey: ["stripe-webhook-diagnostics"] });
      } else {
        toast.error(result.error || "Could not register the webhook endpoint.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setRegistering(false);
    }
  }

  return (
    <div className="border border-stone-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <CreditCard className="w-4 h-4 text-[#2a382c]" />
        <p className="font-medium text-stone-900 text-sm">Stripe (incoming)</p>
        {hasWebhookSecret ? (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Signature verified
          </span>
        ) : (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            Signing secret not configured
          </span>
        )}
      </div>
      <p className="text-xs text-stone-500 mt-1">
        <code className="text-stone-700">POST {webhookUrl}</code> — verifies the Stripe signature
        against the raw body with HMAC-SHA256 and the webhook signing secret. Confirms reservations
        only after server-validated payment.
      </p>

      <div className="mt-3 flex items-center gap-2 bg-stone-50 rounded-lg px-3 py-2">
        <span className="text-xs text-stone-500 shrink-0">Webhook URL:</span>
        <code className="text-xs text-stone-700 truncate flex-1">{webhookUrl}</code>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(webhookUrl);
            toast.success("Webhook URL copied.");
          }}
          className="text-stone-500 hover:text-stone-800 shrink-0"
          title="Copy URL"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mt-4 mb-2">
        Stripe endpoints
      </p>
      {isLoading ? (
        <p className="text-xs text-stone-500">Checking Stripe…</p>
      ) : !diag?.ok ? (
        <p className="text-xs text-red-600">
          Could not reach Stripe: {diag?.error ?? "unknown error"}
        </p>
      ) : endpoints.length === 0 ? (
        <p className="text-xs text-stone-500">No webhook endpoints registered in Stripe yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {endpoints.map((ep) => (
            <li
              key={ep.id}
              className="flex items-center justify-between text-xs border border-stone-100 rounded-lg px-3 py-1.5"
            >
              <span className="font-mono text-stone-600 truncate">{ep.url}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full shrink-0 ml-2 ${
                  ep.url === webhookUrl
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {ep.url === webhookUrl ? "matches this site" : "other"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!hasWebhookSecret && (
        <div className="mt-3 flex flex-col gap-2">
          <button
            onClick={handleRegister}
            disabled={registering}
            className="inline-flex items-center justify-center gap-2 bg-[#635BFF] hover:bg-[#5851ed] text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {registering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Registering…
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Register webhook in Stripe
              </>
            )}
          </button>
          {newSecret && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-2">
              <p className="text-xs text-emerald-800 font-medium">
                Endpoint registered. Copy this signing secret and add it as the{" "}
                <code>STRIPE_WEBHOOK_SECRET</code> server secret:
              </p>
              <div className="flex items-center gap-2 bg-white border border-emerald-300 rounded px-2 py-1.5">
                <code className="text-xs text-emerald-900 font-mono truncate flex-1">{newSecret}</code>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(newSecret);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-emerald-700 hover:text-emerald-900 shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-emerald-700">
                After adding the secret, the signature badge above will turn green.
              </p>
            </div>
          )}
        </div>
      )}

      {hasWebhookSecret && matchingEndpoint && (
        <p className="text-xs text-emerald-700 mt-3 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> A matching Stripe endpoint is registered and the
          signing secret is configured.
        </p>
      )}
      {hasWebhookSecret && !matchingEndpoint && (
        <p className="text-xs text-amber-600 mt-3">
          Signing secret is configured but no Stripe endpoint matches this site's URL. Register the
          webhook URL above in your Stripe dashboard.
        </p>
      )}
    </div>
  );
}

function MigrationChecklist() {
  const items = [
    "Verified listing-to-accommodation mappings",
    "Existing future Airbnb reservations imported",
    "Existing direct/phone reservations imported",
    "Owner, maintenance, and other blocked dates imported",
    "Rates and booking restrictions retained",
    "Successful import test (Airbnb → website)",
    "Successful export test (website → Airbnb)",
    "CRON_SECRET configured for scheduled sync",
    "Stripe webhook secret configured (test mode)",
  ];
  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6">
      <h2 className="font-serif text-xl font-bold text-stone-900 mb-1">
        Hostaway Migration Checklist
      </h2>
      <p className="text-sm text-stone-600 mb-4">
        The business has stopped using Hostaway. Confirm each item before enabling paid instant
        booking. Airbnb may not contain every reservation formerly stored in Hostaway.
      </p>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it} className="flex items-center gap-2 text-sm text-stone-700">
            <span className="w-4 h-4 rounded-full border-2 border-amber-400 shrink-0" />
            {it}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          Do not disconnect Hostaway or enable paid instant booking merely because an iCal URL was
          saved. Inventory authority must be resolved first.
        </p>
      </div>
    </section>
  );
}
