import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listGhlContacts,
  syncGhlContacts,
  getGhlSyncStatus,
  isGhlConfigured,
  getSocialAccounts,
  createGhlSocialPost,
  listSocialPosts,
  uploadSocialMediaAsset,
  syncGhlSocialPosts,
  deleteGhlSocialPost,
  startPreview,
  endPreview,
  getActivePreview,
  resolvePreviewPermissions,
  type GhlContact,
  type GhlSocialAccount,
  type SocialPost,
  type PreviewSession,
} from "./ghl.server";
import { resolveEffectivePermissions } from "./permissions.server";

// ── Preview guard ─────────────────────────────────────────────────────────────

/** Block mutations while the caller has an active View-as preview session. */
async function assertNotPreview(supabase: SupabaseClient, userId: string): Promise<void> {
  const { isPreview } = await resolveEffectivePermissions(supabase, userId);
  if (isPreview) throw new Error("Preview mode is read-only. Exit preview to make changes.");
}

// ── GHL Contacts ──────────────────────────────────────────────────────────────

export const getGhlConfigStatusFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => ({ configured: isGhlConfigured() }));

export const listGhlContactsFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ search: z.string().optional() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => listGhlContacts(context.supabase, data.search));

export const syncGhlContactsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => syncGhlContacts(context.supabase, context.userId));

export const getGhlSyncStatusFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => getGhlSyncStatus());

// ── Social Planner ────────────────────────────────────────────────────────────

export const listSocialAccountsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    if (!isGhlConfigured()) return { configured: false, accounts: [] as GhlSocialAccount[] };
    try {
      const accounts = await getSocialAccounts();
      return { configured: true, accounts };
    } catch (e) {
      return { configured: true, accounts: [], error: (e as Error).message };
    }
  });

const socialPostSchema = z.object({
  body: z.string().min(1),
  account_ids: z.array(z.string()).min(1),
  media_urls: z.array(z.string()).optional(),
  scheduled_at: z.string().optional(),
  mode: z.enum(["draft", "schedule", "publish"]).optional(),
});

export const createSocialPostFn = createServerFn({ method: "POST" })
  .validator((d) => socialPostSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertNotPreview(context.supabase, context.userId);
    const postInput: {
      body: string;
      account_ids: string[];
      media_urls: string[];
      scheduled_at?: string;
      mode?: "draft" | "schedule" | "publish";
    } = {
      body: data.body,
      account_ids: data.account_ids,
      media_urls: data.media_urls ?? [],
    };
    if (data.scheduled_at) postInput.scheduled_at = data.scheduled_at;
    if (data.mode) postInput.mode = data.mode;
    return createGhlSocialPost(context.userId, postInput);
  });

export const listSocialPostsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => listSocialPosts());

export const uploadSocialMediaAssetFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        fileName: z.string(),
        base64: z.string(),
        mimeType: z.string(),
      })
      .parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertNotPreview(context.supabase, context.userId);
    return uploadSocialMediaAsset(data.fileName, data.base64, data.mimeType);
  });

export const syncGhlSocialPostsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertNotPreview(context.supabase, context.userId);
    return syncGhlSocialPosts();
  });

export const deleteSocialPostFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ id: z.string() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertNotPreview(context.supabase, context.userId);
    await deleteGhlSocialPost(data.id);
    return { ok: true };
  });

// ── View-as preview ───────────────────────────────────────────────────────────

const previewStartSchema = z.object({
  target_role: z.string().optional(),
  target_user_id: z.string().optional(),
});

export const startPreviewFn = createServerFn({ method: "POST" })
  .validator((d) => previewStartSchema.parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const target: { role?: string; userId?: string } = {};
    if (data.target_role) target.role = data.target_role;
    if (data.target_user_id) target.userId = data.target_user_id;
    return startPreview(context.userId, target);
  });

export const endPreviewFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await endPreview(context.userId);
    return { ok: true };
  });

export const getPreviewStatusFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PreviewSession | null> => getActivePreview(context.userId));

export const resolvePreviewPermissionsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => resolvePreviewPermissions(context.userId));

export type { GhlContact, GhlSocialAccount, SocialPost, PreviewSession };
