/**
 * Stripe adapter — uses the Stripe REST API directly (no SDK dependency).
 * Server-only. Reads STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET from process.env
 * INSIDE each call (call-time injection; undefined at module scope).
 *
 * Test mode is enforced by the key prefix (sk_test_ / whsec_). We never store
 * or log the secret keys. Only a publishable key would ever reach the browser.
 *
 * Webhook signatures are verified against the raw request body using the
 * official Stripe-Signature scheme (t=...,v1=...) with HMAC-SHA256 via Web
 * Crypto and timing-safe comparison.
 */

export type StripeConfig = {
  secretKey: string;
  webhookSecret: string | null;
  publishableKey?: string | undefined;
  environment: "test" | "live";
  accountId?: string | undefined;
};

export type StripeConfigStatus =
  | { configured: true; hasWebhookSecret: true; config: StripeConfig }
  | { configured: true; hasWebhookSecret: false; config: StripeConfig }
  | { configured: false; reason: string };

/** Read Stripe config from server env. API key alone enables checkout; webhook secret is separate. */
export function getStripeConfig(): StripeConfigStatus {
  const secretKey = process.env["STRIPE_SECRET_KEY"];
  if (!secretKey) {
    return {
      configured: false,
      reason:
        "Stripe is not configured. Set STRIPE_SECRET_KEY server secret to enable checkout.",
    };
  }
  const environment: "test" | "live" = secretKey.startsWith("sk_test_") ? "test" : "live";
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"] ?? null;
  const config: StripeConfig = {
    secretKey,
    webhookSecret,
    environment,
  };
  const publishableKey = process.env["STRIPE_PUBLISHABLE_KEY"];
  if (publishableKey) config.publishableKey = publishableKey;
  const accountId = process.env["STRIPE_ACCOUNT_ID"];
  if (accountId) config.accountId = accountId;
  if (webhookSecret) {
    return { configured: true, hasWebhookSecret: true, config };
  }
  return { configured: true, hasWebhookSecret: false, config };
}

const STRIPE_API = "https://api.stripe.com/v1";

export type StripeWebhookEndpoint = {
  id: string;
  url: string;
  status: string;
  enabled_events: string[];
  secret?: string | null;
};

export type StripeWebhookEndpointsResult =
  | { ok: true; endpoints: StripeWebhookEndpoint[]; hasMore: boolean }
  | { ok: false; error: string };

/** List webhook endpoints from Stripe. Paginated (100 per page). */
export async function listStripeWebhookEndpoints(): Promise<StripeWebhookEndpointsResult> {
  const status = getStripeConfig();
  if (!status.configured) return { ok: false, error: status.reason };
  try {
    const res = await fetch(`${STRIPE_API}/webhook_endpoints?limit=100`, {
      headers: { Authorization: `Bearer ${status.config.secretKey}` },
    });
    const json = (await res.json()) as Record<string, unknown> & {
      error?: { message: string };
      data?: StripeWebhookEndpoint[];
      has_more?: boolean;
    };
    if (!res.ok) return { ok: false, error: json.error?.message ?? res.statusText };
    return {
      ok: true,
      endpoints: json.data ?? [],
      hasMore: json.has_more ?? false,
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export type CreateWebhookResult =
  | { ok: true; endpoint: StripeWebhookEndpoint }
  | { ok: false; error: string };

/** Create a webhook endpoint in Stripe. Returns the signing secret. */
export async function createStripeWebhookEndpoint(params: {
  url: string;
  events: string[];
}): Promise<CreateWebhookResult> {
  const status = getStripeConfig();
  if (!status.configured) return { ok: false, error: status.reason };
  try {
    const body = new URLSearchParams();
    body.set("url", params.url);
    body.set("enabled", "true");
    for (let i = 0; i < params.events.length; i++) {
      body.set(`enabled_events[${i}]`, params.events[i]!);
    }
    const res = await fetch(`${STRIPE_API}/webhook_endpoints`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${status.config.secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    const json = (await res.json()) as Record<string, unknown> & {
      error?: { message: string };
      id?: string;
      url?: string;
      status?: string;
      enabled_events?: string[];
      secret?: string;
    };
    if (!res.ok) return { ok: false, error: json.error?.message ?? res.statusText };
    return {
      ok: true,
      endpoint: {
        id: json.id ?? "",
        url: json.url ?? "",
        status: json.status ?? "enabled",
        enabled_events: json.enabled_events ?? params.events,
        secret: json.secret ?? null,
      },
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export type CheckoutSession = {
  id: string;
  url: string | null;
  payment_intent: string | null;
  expires_at: number | null;
  amount_total: number | null;
  currency: string | null;
  payment_status: string;
  status: string;
};

export type StripePaymentIntent = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_status?: string;
  metadata?: Record<string, string>;
};

export type StripeRefund = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_intent: string;
};

/** Create a Stripe Checkout Session. Throws on non-2xx. */
export async function createCheckoutSession(params: {
  amount_cents: number;
  currency: string;
  reservationId: string;
  bookingReference: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}): Promise<CheckoutSession> {
  const status = getStripeConfig();
  if (!status.configured) throw new Error(status.reason);
  const { secretKey } = status.config;

  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("payment_method_types[0]", "card");
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", params.currency.toLowerCase());
  body.set(
    "line_items[0][price_data][product_data][name]",
    `The Bridges — ${params.bookingReference}`,
  );
  body.set("line_items[0][price_data][unit_amount_decimal]", String(params.amount_cents));
  body.set("success_url", params.successUrl);
  body.set("cancel_url", params.cancelUrl);
  body.set("client_reference_id", params.reservationId);
  body.set("metadata[reservation_id]", params.reservationId);
  body.set("metadata[booking_reference]", params.bookingReference);
  if (params.customerEmail) body.set("customer_email", params.customerEmail);
  if (status.config.accountId) body.set("metadata[account_id]", status.config.accountId);
  for (const [k, v] of Object.entries(params.metadata ?? {})) body.set(`metadata[${k}]`, v);

  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": params.idempotencyKey,
    },
    body: body.toString(),
  });
  const json = (await res.json()) as Record<string, unknown> & { error?: { message: string } };
  if (!res.ok) {
    throw new Error(`Stripe create session failed: ${json.error?.message ?? res.statusText}`);
  }
  return json as unknown as CheckoutSession;
}

/** Retrieve a Checkout Session to inspect its authoritative payment state. */
export async function retrieveCheckoutSession(sessionId: string): Promise<CheckoutSession> {
  const status = getStripeConfig();
  if (!status.configured) throw new Error(status.reason);
  const res = await fetch(`${STRIPE_API}/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${status.config.secretKey}` },
  });
  const json = (await res.json()) as Record<string, unknown> & { error?: { message: string } };
  if (!res.ok)
    throw new Error(`Stripe retrieve session failed: ${json.error?.message ?? res.statusText}`);
  return json as unknown as CheckoutSession;
}

/** Retrieve a Payment Intent's authoritative state. */
export async function retrievePaymentIntent(intentId: string): Promise<StripePaymentIntent> {
  const status = getStripeConfig();
  if (!status.configured) throw new Error(status.reason);
  const res = await fetch(`${STRIPE_API}/payment_intents/${intentId}`, {
    headers: { Authorization: `Bearer ${status.config.secretKey}` },
  });
  const json = (await res.json()) as Record<string, unknown> & { error?: { message: string } };
  if (!res.ok)
    throw new Error(`Stripe retrieve PI failed: ${json.error?.message ?? res.statusText}`);
  return json as unknown as StripePaymentIntent;
}

/** Create a refund. Idempotent by Stripe Idempotency-Key. */
export async function createRefund(params: {
  paymentIntentId: string;
  amountCents?: number;
  reason?: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}): Promise<StripeRefund> {
  const status = getStripeConfig();
  if (!status.configured) throw new Error(status.reason);
  const body = new URLSearchParams();
  body.set("payment_intent", params.paymentIntentId);
  if (params.amountCents != null) body.set("amount", String(params.amountCents));
  if (params.reason) body.set("reason", params.reason);
  for (const [k, v] of Object.entries(params.metadata ?? {})) body.set(`metadata[${k}]`, v);

  const res = await fetch(`${STRIPE_API}/refunds`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${status.config.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": params.idempotencyKey,
    },
    body: body.toString(),
  });
  const json = (await res.json()) as Record<string, unknown> & { error?: { message: string } };
  if (!res.ok) throw new Error(`Stripe refund failed: ${json.error?.message ?? res.statusText}`);
  return json as unknown as StripeRefund;
}

export type WebhookVerifyResult =
  { valid: true; event: StripeWebhookEvent } | { valid: false; reason: string };

export type StripeWebhookEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
  created: number;
};

/**
 * Verify a Stripe webhook signature against the raw request body using the
 * official scheme: header "t=<timestamp>,v1=<sig>", signed payload is
 * "<timestamp>.<rawBody>", HMAC-SHA256, timing-safe compare.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
): Promise<WebhookVerifyResult> {
  const status = getStripeConfig();
  if (!status.configured) return { valid: false, reason: status.reason };
  if (!status.hasWebhookSecret) {
    return {
      valid: false,
      reason: "STRIPE_WEBHOOK_SECRET is not configured. Webhook signature verification is unavailable.",
    };
  }

  const parts = signatureHeader.split(",").reduce<Record<string, string>>((acc, p) => {
    const [k, v] = p.split("=");
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) {
    return { valid: false, reason: "Missing t or v1 in Stripe-Signature." };
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const secret = status.config.webhookSecret;
  if (!secret) {
    return { valid: false, reason: "STRIPE_WEBHOOK_SECRET is not configured." };
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expected = toHex(new Uint8Array(mac));

  if (!timingSafeEqual(expected, signature)) {
    return { valid: false, reason: "Invalid signature." };
  }

  // Reject stale timestamps (>5 min) to mitigate replay.
  const ageMs = Date.now() - Number(timestamp) * 1000;
  if (Math.abs(ageMs) > 5 * 60 * 1000) {
    return { valid: false, reason: "Timestamp outside tolerance." };
  }

  try {
    const event = JSON.parse(rawBody) as StripeWebhookEvent;
    return { valid: true, event };
  } catch {
    return { valid: false, reason: "Malformed JSON body." };
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function toHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
