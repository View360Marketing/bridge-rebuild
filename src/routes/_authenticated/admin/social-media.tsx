import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listSocialAccountsFn,
  createSocialPostFn,
  listSocialPostsFn,
  getGhlConfigStatusFn,
} from "@/lib/booking/ghl.functions";
import { Share2, Calendar, Send, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/social-media")({
  head: () => ({
    meta: [
      { title: "Social Media | The Bridges Admin" },
      { name: "description", content: "Social Planner content and scheduling." },
    ],
  }),
  component: SocialMediaPage,
});

function SocialMediaPage() {
  const configFn = useServerFn(getGhlConfigStatusFn);
  const { data: config } = useQuery({ queryKey: ["ghl-config"], queryFn: configFn });
  const configured = config?.configured ?? false;

  return (
    <>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-stone-900">Social Media</h1>
        <p className="text-sm text-stone-500 mt-1">
          Plan, schedule, and publish posts through the connected Social Planner.
        </p>
      </div>
      {!configured && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            GoHighLevel isn't configured yet. Add <code>GHL_PRIVATE_TOKEN</code> and{" "}
            <code>GHL_LOCATION_ID</code> in server secrets to connect Social Planner. Until then,
            drafts can be saved locally but won't publish.
          </p>
        </div>
      )}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ConnectedAccounts configured={configured} />
          <PostsList />
        </div>
        <div>
          <CreatePost configured={configured} />
        </div>
      </div>
    </>
  );
}

function ConnectedAccounts({ configured }: { configured: boolean }) {
  const list = useServerFn(listSocialAccountsFn);
  const { data, isLoading } = useQuery({ queryKey: ["social-accounts"], queryFn: list });

  if (!configured) {
    return (
      <section className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="w-5 h-5 text-[#2a382c]" />
          <h2 className="font-serif text-xl font-bold text-stone-900">Connected Accounts</h2>
        </div>
        <p className="text-sm text-stone-500">
          No connected social accounts. Connect The Bridges' accounts in the Social Planner first.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6">
      <div className="flex items-center gap-2 mb-2">
        <Share2 className="w-5 h-5 text-[#2a382c]" />
        <h2 className="font-serif text-xl font-bold text-stone-900">Connected Accounts</h2>
      </div>
      {isLoading && <p className="text-sm text-stone-500">Loading…</p>}
      {data && !data.configured && (
        <p className="text-sm text-stone-500">No connected accounts found.</p>
      )}
      {data?.error && <p className="text-sm text-rose-600">{data.error}</p>}
      {data?.accounts && data.accounts.length === 0 && (
        <p className="text-sm text-stone-500">
          No connected social accounts. Add accounts in the Social Planner to publish here.
        </p>
      )}
      {data?.accounts && data.accounts.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          {data.accounts.map((a) => (
            <div key={a.id} className="border border-stone-200 rounded-lg p-3">
              <p className="font-medium text-sm text-stone-800">{a.name}</p>
              <p className="text-xs text-stone-500 capitalize">{a.platform}</p>
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CreatePost({ configured }: { configured: boolean }) {
  const create = useServerFn(createSocialPostFn);
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [scheduled, setScheduled] = useState("");
  const [busy, setBusy] = useState(false);

  const accountList = useServerFn(listSocialAccountsFn);
  const { data: acctData } = useQuery({ queryKey: ["social-accounts"], queryFn: accountList });
  const availableAccounts = acctData?.accounts ?? [];

  async function submit() {
    if (!body || accounts.length === 0) return;
    setBusy(true);
    try {
      await create({
        data: { body, account_ids: accounts, scheduled_at: scheduled || undefined },
      });
      toast.success(scheduled ? "Post scheduled" : configured ? "Post submitted" : "Draft saved locally");
      setBody("");
      setAccounts([]);
      setScheduled("");
      await qc.invalidateQueries({ queryKey: ["social-posts"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-[#2a382c]" />
        <h2 className="font-serif text-xl font-bold text-stone-900">Create Post</h2>
      </div>
      {configured && availableAccounts.length === 0 && (
        <p className="text-xs text-stone-500 mb-3">No connected accounts available to post to.</p>
      )}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your post…"
        rows={5}
        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm mb-3"
      />
      <div className="space-y-2 mb-3">
        {configured &&
          availableAccounts.map((a) => (
            <label key={a.id} className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={accounts.includes(a.id)}
                onChange={(e) =>
                  setAccounts((prev) =>
                    e.target.checked ? [...prev, a.id] : prev.filter((x) => x !== a.id),
                  )
                }
              />
              {a.name} <span className="text-stone-400 capitalize">({a.platform})</span>
            </label>
          ))}
      </div>
      <label className="block text-xs font-medium text-stone-600 mb-1">
        Schedule (optional — leave blank to publish now)
      </label>
      <input
        type="datetime-local"
        value={scheduled}
        onChange={(e) => setScheduled(e.target.value)}
        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm mb-4"
      />
      <button
        onClick={submit}
        disabled={busy || !body || accounts.length === 0}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
      >
        <Send className="w-4 h-4" />
        {busy ? "Submitting…" : scheduled ? "Schedule Post" : "Publish Now"}
      </button>
    </section>
  );
}

function PostsList() {
  const list = useServerFn(listSocialPostsFn);
  const { data, isLoading } = useQuery({ queryKey: ["social-posts"], queryFn: list });

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6">
      <h2 className="font-serif text-xl font-bold text-stone-900 mb-4">Posts</h2>
      {isLoading && <p className="text-sm text-stone-500">Loading…</p>}
      {(!data || data.length === 0) && !isLoading && (
        <p className="text-sm text-stone-500">No posts yet.</p>
      )}
      {data && data.length > 0 && (
        <div className="space-y-2">
          {data.map((p) => (
            <div key={p.id} className="border border-stone-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    p.status === "published"
                      ? "bg-emerald-50 text-emerald-700"
                      : p.status === "failed"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {p.status}
                </span>
                <span className="text-xs text-stone-400">{p.created_at.slice(0, 16)}</span>
              </div>
              <p className="text-sm text-stone-700 line-clamp-2">{p.body}</p>
              {p.error && <p className="text-xs text-rose-600 mt-1">{p.error}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}