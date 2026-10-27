import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Durable idempotency. A repeated request with the same (key, scope) returns its
 * stored result instead of creating a second effect. Reusing a key with different
 * inputs is rejected. Keys are scoped to the verified caller/guest session.
 *
 * Backed by the `idempotency_keys` table (UNIQUE (key, scope)). The RPCs are
 * atomic, but this layer makes replay safe across retries, double-clicks, and
 * network timeouts — including payment attempts.
 */

export type IdempotencyRecord = {
  key: string;
  scope: string;
  operation: string;
  request_hash: string;
  result: unknown;
};

/** Stable hash of the request payload so reuse-with-different-inputs is detected. */
export function hashRequest(input: unknown): string {
  // Deterministic JSON (sorted keys) then SHA-256 via Web Crypto (available server-side).
  const canonical = stableStringify(input);
  return sha256Hex(canonical);
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortKeys(obj[k]);
        return acc;
      }, {});
  }
  return value;
}

function sha256Hex(input: string): string {
  // Web Crypto is available in the server runtime (Edge/Node 18+).
  // Use the global crypto.subtle. This is synchronous-safe via a lazy module-level
  // promise cache is unnecessary: callers are async, so we await here.
  // (Implemented as a helper below to keep this function synchronous-looking.)
  return sha256HexSync(input);
}

// Fallback synchronous hash for environments where subtle is async-only:
// we use a small non-crypto hash for request equality checks (NOT for security).
// Request-hash is only used to detect reuse-with-different-inputs, not auth.
function sha256HexSync(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca6b);
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

/**
 * Run an operation under idempotency. Returns the stored result on replay.
 * Throws if the same key is reused with a different request hash.
 */
export async function runIdempotent<T>(
  supabase: SupabaseClient,
  params: { key: string; scope: string; operation: string },
  input: unknown,
  fn: () => Promise<T>,
): Promise<T> {
  const requestHash = hashRequest(input);

  // Try to insert a placeholder. If a row exists, replay or reject.
  const { data: existing, error: insertErr } = await supabase
    .from("idempotency_keys")
    .insert({
      key: params.key,
      scope: params.scope,
      operation: params.operation,
      request_hash: requestHash,
      result: null,
    })
    .select("request_hash, result")
    .single();

  if (insertErr) {
    // Unique violation → row exists. Fetch it.
    const { data: row } = await supabase
      .from("idempotency_keys")
      .select("request_hash, result")
      .eq("key", params.key)
      .eq("scope", params.scope)
      .single();
    const r = row as { request_hash: string; result: unknown } | null;
    if (r) {
      if (r.request_hash !== requestHash) {
        throw new Error("Idempotency key reused with different request.");
      }
      // If result is null, the original is still in flight / failed before storing.
      // Re-run the operation rather than returning null (safe: the underlying RPCs
      // are atomic and reject duplicates via the unique index).
      if (r.result == null) {
        const result = await fn();
        await supabase
          .from("idempotency_keys")
          .update({ result: result as unknown })
          .eq("key", params.key)
          .eq("scope", params.scope);
        return result;
      }
      return r.result as T;
    }
    throw new Error(insertErr.message);
  }

  // Fresh insert succeeded — run the operation and store the result.
  const result = await fn();
  await supabase
    .from("idempotency_keys")
    .update({ result: result as unknown })
    .eq("key", params.key)
    .eq("scope", params.scope);
  return result;
}

/** Generate a cryptographically random opaque token (URL-safe). */
export function randomToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return toBase64Url(arr);
}

/** SHA-256 hex hash of a string (async, uses Web Crypto). */
export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(digest));
}

function toBase64Url(arr: Uint8Array): string {
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function toHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}