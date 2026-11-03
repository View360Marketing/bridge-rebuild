import React, { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listSocialAccountsFn,
  createSocialPostFn,
  listSocialPostsFn,
  uploadSocialMediaAssetFn,
  syncGhlSocialPostsFn,
  deleteSocialPostFn,
  getGhlConfigStatusFn,
} from "@/lib/booking/ghl.functions";
import {
  Share2,
  Calendar,
  Send,
  AlertTriangle,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/social-media")({
  head: () => ({
    meta: [
      { title: "Social Media | The Bridges Admin" },
      { name: "description", content: "Social Planner content and scheduling." },
    ],
  }),
  component: SocialMediaPage,
});

type PostStatus = "draft" | "scheduled" | "processing" | "published" | "failed";

const STATUS_FILTERS: {
  key: PostStatus | "all";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "all", label: "All", icon: FileText },
  { key: "draft", label: "Drafts", icon: FileText },
  { key: "scheduled", label: "Scheduled", icon: Clock },
  { key: "processing", label: "Processing", icon: Loader2 },
  { key: "published", label: "Published", icon: CheckCircle2 },
  { key: "failed", label: "Failed", icon: XCircle },
];

function SocialMediaPage() {
  const configFn = useServerFn(getGhlConfigStatusFn);
  const { data: config } = useQuery({ queryKey: ["ghl-config"], queryFn: configFn });
  const configured = config?.configured ?? false;

  const [filter, setFilter] = useState<PostStatus | "all">("all");

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
          <PostsList filter={filter} setFilter={setFilter} configured={configured} />
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

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-[#2a382c]" />
          <h2 className="font-serif text-xl font-bold text-stone-900">Connected Accounts</h2>
        </div>
        {configured && (
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Connected
          </span>
        )}
      </div>
      {!configured && (
        <p className="text-sm text-stone-500">
          No connected social accounts. Connect The Bridges' accounts in the Social Planner first.
        </p>
      )}
      {configured && isLoading && <p className="text-sm text-stone-500">Loading…</p>}
      {configured && data?.error && <p className="text-sm text-rose-600">{data.error}</p>}
      {configured && data?.accounts && data.accounts.length === 0 && (
        <p className="text-sm text-stone-500">
          No connected social accounts. Add accounts in the Social Planner to publish here.
        </p>
      )}
      {configured && data?.accounts && data.accounts.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          {data.accounts.map((a) => (
            <div
              key={a.id}
              className="border border-stone-200 rounded-lg p-3 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                <PlatformIcon platform={a.platform} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-stone-800 truncate">{a.name}</p>
                <p className="text-xs text-stone-500 capitalize">{a.platform}</p>
              </div>
              <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 capitalize shrink-0">
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p.includes("facebook")) return <span className="text-blue-600 text-lg font-bold">f</span>;
  if (p.includes("instagram")) return <span className="text-pink-600 text-lg font-bold">◎</span>;
  if (p.includes("twitter") || p.includes("x"))
    return <span className="text-stone-900 text-lg font-bold">𝕏</span>;
  if (p.includes("google") || p.includes("youtube"))
    return <span className="text-red-600 text-lg font-bold">▶</span>;
  return <Share2 className="w-4 h-4 text-stone-500" />;
}

function CreatePost({ configured }: { configured: boolean }) {
  const create = useServerFn(createSocialPostFn);
  const upload = useServerFn(uploadSocialMediaAssetFn);
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [scheduled, setScheduled] = useState("");
  const [mode, setMode] = useState<"draft" | "schedule" | "publish">("publish");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const accountList = useServerFn(listSocialAccountsFn);
  const { data: acctData } = useQuery({ queryKey: ["social-accounts"], queryFn: accountList });
  const availableAccounts = acctData?.accounts ?? [];

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const result = await upload({
          data: { fileName: file.name, base64, mimeType: file.type },
        });
        setMediaUrls((prev) => [...prev, result.url]);
        toast.success("Media uploaded");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function removeMedia(url: string) {
    setMediaUrls((prev) => prev.filter((u) => u !== url));
  }

  async function submit() {
    if (!body || accounts.length === 0) return;
    setBusy(true);
    try {
      const submitMode = mode === "schedule" && !scheduled ? "publish" : mode;
      await create({
        data: {
          body,
          account_ids: accounts,
          scheduled_at: scheduled || undefined,
          media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
          mode: submitMode,
        },
      });
      const msg =
        submitMode === "draft"
          ? "Draft saved"
          : submitMode === "schedule"
            ? "Post scheduled"
            : configured
              ? "Post published"
              : "Draft saved locally";
      toast.success(msg);
      setBody("");
      setAccounts([]);
      setScheduled("");
      setMediaUrls([]);
      setMode("publish");
      await qc.invalidateQueries({ queryKey: ["social-posts"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = body && accounts.length > 0 && (mode !== "schedule" || scheduled);

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6 lg:sticky lg:top-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-[#2a382c]" />
        <h2 className="font-serif text-xl font-bold text-stone-900">Create Post</h2>
      </div>

      {configured && availableAccounts.length === 0 && (
        <p className="text-xs text-stone-500 mb-3">No connected accounts available to post to.</p>
      )}

      {/* Mode selector */}
      <div className="flex gap-1 mb-3 bg-stone-100 rounded-lg p-1">
        {(["draft", "schedule", "publish"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md capitalize transition-colors ${
              mode === m
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {m === "publish" ? "Publish Now" : m}
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your post…"
        rows={5}
        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#2a382c]/20"
      />

      {/* Media upload */}
      <div className="mb-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFile}
          className="hidden"
        />
        <div className="flex flex-wrap gap-2">
          {mediaUrls.map((url) => (
            <div
              key={url}
              className="relative w-16 h-16 rounded-lg overflow-hidden border border-stone-200 group"
            >
              <img src={url} alt="media" className="w-full h-full object-cover" />
              <button
                onClick={() => removeMedia(url)}
                className="absolute top-0 right-0 bg-rose-500 text-white rounded-bl-lg w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XCircle className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-16 h-16 rounded-lg border-2 border-dashed border-stone-300 flex items-center justify-center hover:border-stone-400 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
            ) : (
              <ImageIcon className="w-4 h-4 text-stone-400" />
            )}
          </button>
        </div>
      </div>

      {/* Account selection */}
      <div className="space-y-2 mb-3">
        <p className="text-xs font-medium text-stone-600">Post to:</p>
        {configured &&
          availableAccounts.map((a) => (
            <label
              key={a.id}
              className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={accounts.includes(a.id)}
                onChange={(e) =>
                  setAccounts((prev) =>
                    e.target.checked ? [...prev, a.id] : prev.filter((x) => x !== a.id),
                  )
                }
                className="rounded border-stone-300"
              />
              <span className="font-medium">{a.name}</span>
              <span className="text-stone-400 capitalize text-xs">({a.platform})</span>
            </label>
          ))}
        {!configured && (
          <p className="text-xs text-stone-400">
            Connect accounts in Social Planner to enable posting.
          </p>
        )}
      </div>

      {/* Schedule input */}
      {mode === "schedule" && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Schedule for (America/Chicago)
          </label>
          <input
            type="datetime-local"
            value={scheduled}
            onChange={(e) => setScheduled(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      )}

      <button
        onClick={submit}
        disabled={busy || !canSubmit}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#2a382c] hover:bg-[#1b251e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
      >
        <Send className="w-4 h-4" />
        {busy
          ? "Submitting…"
          : mode === "draft"
            ? "Save Draft"
            : mode === "schedule"
              ? "Schedule Post"
              : "Publish Now"}
      </button>
    </section>
  );
}

function PostsList({
  filter,
  setFilter,
  configured,
}: {
  filter: PostStatus | "all";
  setFilter: (f: PostStatus | "all") => void;
  configured: boolean;
}) {
  const list = useServerFn(listSocialPostsFn);
  const syncFn = useServerFn(syncGhlSocialPostsFn);
  const delFn = useServerFn(deleteSocialPostFn);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["social-posts"], queryFn: list });
  const [syncing, setSyncing] = useState(false);

  async function sync() {
    setSyncing(true);
    try {
      const result = await syncFn();
      if (result.error) toast.error(result.error);
      else toast.success(`Synced ${result.synced} posts from Social Planner`);
      await qc.invalidateQueries({ queryKey: ["social-posts"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSyncing(false);
    }
  }

  async function del(id: string) {
    try {
      await delFn({ data: { id } });
      toast.success("Post deleted");
      await qc.invalidateQueries({ queryKey: ["social-posts"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const allPosts = (data ?? []) as Array<{
    id: string;
    ghl_post_id: string | null;
    status: string;
    body: string | null;
    media_urls: string[];
    account_ids: string[];
    scheduled_at: string | null;
    published_at: string | null;
    error: string | null;
    created_at: string;
  }>;

  const filtered = filter === "all" ? allPosts : allPosts.filter((p) => p.status === filter);

  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-serif text-xl font-bold text-stone-900">Posts</h2>
        {configured && (
          <button
            onClick={sync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-300 rounded-lg px-3 py-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync from Planner"}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => {
          const count =
            f.key === "all" ? allPosts.length : allPosts.filter((p) => p.status === f.key).length;
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "bg-[#2a382c] text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Icon className="w-3 h-3" />
              {f.label}
              {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {isLoading && <p className="text-sm text-stone-500">Loading…</p>}
      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-500">
            {filter === "all" ? "No posts yet. Create one to get started." : `No ${filter} posts.`}
          </p>
        </div>
      )}
      {filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="border border-stone-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={p.status} />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">
                    {p.scheduled_at
                      ? `Sched: ${new Date(p.scheduled_at).toLocaleString("en-US", { timeZone: "America/Chicago" })}`
                      : p.published_at
                        ? `Pub: ${new Date(p.published_at).toLocaleString("en-US", { timeZone: "America/Chicago" })}`
                        : p.created_at.slice(0, 16)}
                  </span>
                  <button
                    onClick={() => del(p.id)}
                    className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-stone-700 line-clamp-3 mb-2">{p.body}</p>
              {p.media_urls && p.media_urls.length > 0 && (
                <div className="flex gap-1.5 mb-2">
                  {p.media_urls.slice(0, 4).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="media"
                      className="w-12 h-12 rounded object-cover border border-stone-200"
                    />
                  ))}
                </div>
              )}
              {p.error && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {p.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700",
    scheduled: "bg-sky-50 text-sky-700",
    processing: "bg-amber-50 text-amber-700",
    draft: "bg-stone-100 text-stone-600",
    failed: "bg-rose-50 text-rose-700",
    local: "bg-stone-100 text-stone-500",
    draft_local_only: "bg-stone-100 text-stone-500",
    scheduled_local_only: "bg-stone-100 text-stone-500",
    processing_local_only: "bg-stone-100 text-stone-500",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full capitalize ${styles[status] ?? "bg-stone-100 text-stone-600"}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
