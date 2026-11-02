import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * GoHighLevel (CRM / Social Planner) integration — server-only.
 *
 * Credentials: GHL_PRIVATE_TOKEN, GHL_LOCATION_ID (server secrets).
 * The platform's managed auth provides GHL access where configured.
 * Read inside handlers; env is injected at call time.
 *
 * NOTE: The platform's form-tracking integration already wires The Bridges'
 * location (Crq24gOD3w7117fkPynT). The CRM location id is stored separately.
 */

export type GhlContact = {
  id: string;
  ghl_contact_id: string;
  ghl_location_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  contact_source: string | null;
  tags: string[];
  dnd_opted_out: boolean;
  last_synced_at: string | null;
  linked_guest_id: string | null;
};

export type GhlSyncResult = {
  status: "success" | "failed" | "partial";
  imported: number;
  updated: number;
  failed: number;
  error?: string;
};

function ghlConfig() {
  const token = process.env["GHL_PRIVATE_TOKEN"];
  const locationId = process.env["GHL_LOCATION_ID"];
  return { token, locationId };
}

/** Is the GHL integration configured? */
export function isGhlConfigured(): boolean {
  const { token, locationId } = ghlConfig();
  return Boolean(token && locationId);
}

async function ghlFetch(path: string, init?: RequestInit): Promise<Response> {
  const { token, locationId } = ghlConfig();
  if (!token || !locationId) throw new Error("GoHighLevel not configured.");
  const url = path.startsWith("http") ? path : `https://services.leadconnectorhq.com${path}`;
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Version", "2021-07-28");
  headers.set("Accept", "application/json");
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...init, headers });
}

/** Search GHL contacts with pagination (advanced search). */
export async function fetchGhlContacts(): Promise<GhlContact[]> {
  if (!isGhlConfigured()) {
    throw new Error(
      "GoHighLevel credentials not configured (GHL_PRIVATE_TOKEN / GHL_LOCATION_ID).",
    );
  }
  const { locationId } = ghlConfig();
  const all: GhlContact[] = [];
  let startAfter = 0;
  const limit = 100;
  // Paginate until no more records.
  for (let page = 0; page < 50; page++) {
    const res = await ghlFetch(
      `/contacts/?locationId=${locationId}&limit=${limit}&startAfter=${startAfter}`,
    );
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`GHL contacts failed (${res.status}): ${txt.slice(0, 200)}`);
    }
    const json = (await res.json()) as { contacts?: Record<string, unknown>[] };
    const rows = json.contacts ?? [];
    if (rows.length === 0) break;
    for (const r of rows) {
      const c = r as Record<string, unknown>;
      all.push({
        id: String(c["id"] ?? ""),
        ghl_contact_id: String(c["id"] ?? ""),
        ghl_location_id: String(locationId),
        first_name: (c["firstName"] as string) ?? null,
        last_name: (c["lastName"] as string) ?? null,
        email: (c["email"] as string) ?? null,
        phone: (c["phone"] as string) ?? null,
        address:
          [c["address1"], c["city"], c["state"], c["country"]].filter(Boolean).join(", ") || null,
        contact_source: (c["source"] as string) ?? null,
        tags: Array.isArray(c["tags"]) ? (c["tags"] as string[]) : [],
        dnd_opted_out: Boolean(c["dnd"]), // GHL provides dnd info when available
        last_synced_at: null,
        linked_guest_id: null,
      });
    }
    if (rows.length < limit) break;
    startAfter += limit;
  }
  return all;
}

/** Upsert imported contacts into ghl_contacts + reconcile local guests by email/phone. */
export async function syncGhlContacts(
  _supabase: SupabaseClient,
  _actorId: string,
): Promise<GhlSyncResult> {
  if (!isGhlConfigured()) {
    return {
      status: "failed",
      imported: 0,
      updated: 0,
      failed: 0,
      error:
        "GoHighLevel not configured. Set GHL_PRIVATE_TOKEN and GHL_LOCATION_ID in server secrets.",
    };
  }

  const logId = crypto.randomUUID();
  await supabaseAdmin.from("ghl_sync_log").insert({
    id: logId,
    status: "running",
    started_at: new Date().toISOString(),
  });

  try {
    const contacts = await fetchGhlContacts();
    let imported = 0;
    let updated = 0;
    let failed = 0;
    const now = new Date().toISOString();

    for (const c of contacts) {
      try {
        // Reconcile with existing local guest by email or phone.
        let linkedGuestId: string | null = null;
        if (c.email) {
          const { data: existing } = await supabaseAdmin
            .from("guests")
            .select("id")
            .eq("email", c.email)
            .limit(1);
          if (existing && existing.length > 0) linkedGuestId = (existing[0] as { id: string }).id;
        }
        if (!linkedGuestId && c.phone) {
          const { data: existing } = await supabaseAdmin
            .from("guests")
            .select("id")
            .eq("phone", c.phone)
            .limit(1);
          if (existing && existing.length > 0) linkedGuestId = (existing[0] as { id: string }).id;
        }

        // Upsert ghl_contacts row by (location, contact id).
        const { error } = await supabaseAdmin.from("ghl_contacts").upsert(
          {
            ghl_contact_id: c.ghl_contact_id,
            ghl_location_id: c.ghl_location_id,
            first_name: c.first_name,
            last_name: c.last_name,
            email: c.email,
            phone: c.phone,
            address: c.address,
            contact_source: c.contact_source,
            tags: c.tags,
            dnd_opted_out: c.dnd_opted_out,
            last_synced_at: now,
            linked_guest_id: linkedGuestId,
          },
          { onConflict: "ghl_location_id,ghl_contact_id" },
        );
        if (error) {
          failed++;
        } else {
          updated++;
        }
      } catch {
        failed++;
      }
    }

    const status: GhlSyncResult["status"] =
      failed === 0 ? "success" : contacts.length > 0 ? "partial" : "failed";

    await supabaseAdmin
      .from("ghl_sync_log")
      .update({
        status,
        imported_count: imported,
        updated_count: updated,
        failed_count: failed,
        finished_at: now,
      })
      .eq("id", logId);

    return { status, imported, updated, failed };
  } catch (e) {
    const msg = (e as Error).message;
    await supabaseAdmin
      .from("ghl_sync_log")
      .update({ status: "failed", error: msg, finished_at: new Date().toISOString() })
      .eq("id", logId);
    return { status: "failed", imported: 0, updated: 0, failed: 0, error: msg };
  }
}

/** List GHL contacts with optional search. */
export async function listGhlContacts(
  _supabase: SupabaseClient,
  search?: string,
): Promise<GhlContact[]> {
  let q = supabaseAdmin.from("ghl_contacts").select("*").order("updated_at", { ascending: false });
  if (search) {
    q = q.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
    );
  }
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as GhlContact[];
}

/** Get last successful GHL sync. */
export async function getGhlSyncStatus(): Promise<{
  lastSync: string | null;
  lastStatus: string | null;
  lastError: string | null;
}> {
  const { data } = await supabaseAdmin
    .from("ghl_sync_log")
    .select("status, finished_at, error")
    .order("started_at", { ascending: false })
    .limit(1);
  const row = (data ?? [])[0] as
    { status: string; finished_at: string | null; error: string | null } | undefined;
  if (!row) return { lastSync: null, lastStatus: null, lastError: null };
  return {
    lastSync: row.finished_at,
    lastStatus: row.status,
    lastError: row.error,
  };
}

// ── Social Planner ──────────────────────────────────────────────────────────

export type GhlSocialAccount = {
  id: string;
  name: string;
  platform: string;
  status: string;
};

export type SocialPost = {
  id: string;
  ghl_post_id: string | null;
  status: string;
  body: string | null;
  media_urls: string[];
  account_ids: string[];
  scheduled_at: string | null;
  published_at: string | null;
  error: string | null;
  created_by: string | null;
  created_at: string;
};

export async function getSocialAccounts(): Promise<GhlSocialAccount[]> {
  if (!isGhlConfigured()) {
    throw new Error("GoHighLevel not configured.");
  }
  const { locationId } = ghlConfig();
  const res = await ghlFetch(`/social-media/accounts?locationId=${locationId}`);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GHL social accounts failed (${res.status}): ${txt.slice(0, 200)}`);
  }
  const json = (await res.json()) as { accounts?: Record<string, unknown>[] };
  return (json.accounts ?? []).map((a) => ({
    id: String(a["id"] ?? ""),
    name: String(a["name"] ?? a["username"] ?? "Unknown"),
    platform: String(a["platform"] ?? a["type"] ?? "unknown"),
    status: String(a["status"] ?? a["connectionStatus"] ?? "connected"),
  }));
}

export type SocialPostInput = {
  body: string;
  account_ids: string[];
  media_urls?: string[];
  scheduled_at?: string; // ISO, or omit for "publish now"
  mode?: "draft" | "schedule" | "publish";
};

export async function createGhlSocialPost(
  actorId: string,
  input: SocialPostInput,
): Promise<{ ghl_post_id: string | null; localId: string; status: string }> {
  const mode = input.mode ?? (input.scheduled_at ? "schedule" : "publish");

  // Record locally first (durable, idempotency base).
  const localStatus = mode === "draft" ? "draft" : mode === "schedule" ? "scheduled" : "processing";
  const { data: local, error } = await supabaseAdmin
    .from("social_posts")
    .insert({
      status: localStatus,
      body: input.body,
      media_urls: input.media_urls ?? [],
      account_ids: input.account_ids,
      scheduled_at: input.scheduled_at ?? null,
      created_by: actorId,
    })
    .select("id")
    .single();
  if (error || !local) throw new Error(error?.message ?? "Failed to create social post record.");
  const localId = (local as { id: string }).id;

  // Drafts stay local-only; don't push to the provider until scheduled or published.
  if (mode === "draft" || !isGhlConfigured()) {
    return { ghl_post_id: null, localId, status: localStatus };
  }

  try {
    const { locationId } = ghlConfig();
    const body: Record<string, unknown> = {
      locationId,
      postBody: input.body,
      accountIds: input.account_ids,
    };
    if (input.media_urls && input.media_urls.length > 0) body["mediaLinks"] = input.media_urls;
    if (input.scheduled_at) body["scheduledAt"] = input.scheduled_at;

    const res = await ghlFetch(`/social-media/posts`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`GHL create post failed (${res.status}): ${txt.slice(0, 200)}`);
    }
    const json = (await res.json()) as { id?: string };
    const ghlPostId = json.id ? String(json.id) : null;

    await supabaseAdmin
      .from("social_posts")
      .update({
        ghl_post_id: ghlPostId,
        status: mode === "schedule" ? "scheduled" : "processing",
      })
      .eq("id", localId);

    return {
      ghl_post_id: ghlPostId,
      localId,
      status: mode === "schedule" ? "scheduled" : "processing",
    };
  } catch (e) {
    const msg = (e as Error).message;
    await supabaseAdmin
      .from("social_posts")
      .update({ status: "failed", error: msg })
      .eq("id", localId);
    throw new Error(msg);
  }
}

/** Upload a media asset to durable storage and return a public URL. */
export async function uploadSocialMediaAsset(
  fileName: string,
  base64Data: string,
  mimeType: string,
): Promise<{ url: string; path: string }> {
  const raw = base64Data.includes(",") ? base64Data.split(",")[1]! : base64Data;
  const buf = Buffer.from(raw, "base64");
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `posts/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from("social-media")
    .upload(path, buf, { contentType: mimeType, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const url = `${process.env["SUPABASE_URL"]}/storage/v1/object/public/social-media/${path}`;
  return { url, path };
}

/** Sync posts from the Social Planner into the local table (upsert by ghl_post_id). */
export async function syncGhlSocialPosts(): Promise<{ synced: number; error?: string }> {
  if (!isGhlConfigured()) return { synced: 0, error: "Social Planner not configured." };
  const { locationId } = ghlConfig();
  const now = new Date();
  const startRange = new Date(now.getTime() - 90 * 86400000).toISOString();
  const endRange = new Date(now.getTime() + 365 * 86400000).toISOString();
  const res = await ghlFetch(
    `/social-media/posts?locationId=${locationId}&startRange=${startRange}&endRange=${endRange}`,
  );
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return { synced: 0, error: `Social posts sync failed (${res.status}): ${txt.slice(0, 200)}` };
  }
  const json = (await res.json()) as { posts?: Record<string, unknown>[] };
  const posts = json.posts ?? [];
  let synced = 0;
  for (const p of posts) {
    const post = p as Record<string, unknown>;
    const ghlId = String(post["id"] ?? "");
    if (!ghlId) continue;
    const { error } = await supabaseAdmin.from("social_posts").upsert(
      {
        ghl_post_id: ghlId,
        body: String(post["postBody"] ?? post["body"] ?? ""),
        media_urls: Array.isArray(post["mediaLinks"])
          ? (post["mediaLinks"] as string[])
          : Array.isArray(post["mediaUrls"])
            ? (post["mediaUrls"] as string[])
            : [],
        account_ids: Array.isArray(post["accountIds"]) ? (post["accountIds"] as string[]) : [],
        scheduled_at: post["scheduledAt"] ? String(post["scheduledAt"]) : null,
        status: post["scheduledAt"] ? "scheduled" : "published",
        published_at: post["createdAt"] ? String(post["createdAt"]) : null,
      },
      { onConflict: "ghl_post_id" },
    );
    if (!error) synced++;
  }
  return { synced };
}

/** Delete a social post (local row + provider if it has a ghl_post_id). */
export async function deleteGhlSocialPost(localId: string): Promise<void> {
  const { data } = await supabaseAdmin
    .from("social_posts")
    .select("ghl_post_id")
    .eq("id", localId)
    .single();
  const row = data as { ghl_post_id: string | null } | null;
  if (row?.ghl_post_id && isGhlConfigured()) {
    try {
      await ghlFetch(`/social-media/posts/${row.ghl_post_id}`, { method: "DELETE" });
    } catch {
      // Best-effort delete; the local row is still removed.
    }
  }
  await supabaseAdmin.from("social_posts").delete().eq("id", localId);
}

export async function listSocialPosts(): Promise<SocialPost[]> {
  const { data, error } = await supabaseAdmin
    .from("social_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SocialPost[];
}

// ── View-as preview ─────────────────────────────────────────────────────────

export type PreviewSession = {
  id: string;
  actor_id: string;
  target_role: string | null;
  target_user_id: string | null;
  expires_at: string;
  created_at: string;
};

export async function startPreview(
  actorId: string,
  target: { role?: string; userId?: string },
): Promise<PreviewSession> {
  const { data } = await supabaseAdmin.rpc("is_admin", { _user_id: actorId });
  if (!data) throw new Error("Only admins can use View-as preview.");
  const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min
  const { data: row, error } = await supabaseAdmin
    .from("preview_sessions")
    .insert({
      actor_id: actorId,
      target_role: target.role ?? null,
      target_user_id: target.userId ?? null,
      expires_at: expires,
    })
    .select("*")
    .single();
  if (error || !row) throw new Error(error?.message ?? "Failed to start preview.");
  return row as unknown as PreviewSession;
}

export async function endPreview(actorId: string): Promise<void> {
  await supabaseAdmin.from("preview_sessions").delete().eq("actor_id", actorId);
}

export async function getActivePreview(actorId: string): Promise<PreviewSession | null> {
  const { data } = await supabaseAdmin
    .from("preview_sessions")
    .select("*")
    .eq("actor_id", actorId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);
  return (data?.[0] as unknown as PreviewSession) ?? null;
}

/** Effective role/permissions for a preview target (server-validated). */
export async function resolvePreviewPermissions(
  actorId: string,
): Promise<{ role: string; isPreview: boolean; targetUserId?: string }> {
  const session = await getActivePreview(actorId);
  if (!session) return { role: "", isPreview: false };
  if (session.target_user_id) {
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", session.target_user_id);
    const roleList = (roles ?? []).map((r) => (r as { role: string }).role);
    if (roleList.includes("super_admin"))
      return { role: "super_admin", isPreview: true, targetUserId: session.target_user_id };
    if (roleList.includes("admin"))
      return { role: "admin", isPreview: true, targetUserId: session.target_user_id };
    if (roleList.includes("manager"))
      return { role: "manager", isPreview: true, targetUserId: session.target_user_id };
    return { role: "manager", isPreview: true, targetUserId: session.target_user_id };
  }
  return { role: session.target_role ?? "manager", isPreview: true };
}
