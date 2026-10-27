import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookSignature, type StripeWebhookEvent } from "@/lib/booking/stripe.server";
import { processWebhookEvent } from "@/lib/booking/payments-confirm.server";

/**
 * Stripe webhook endpoint — raw HTTP, anonymous by default on the published site.
 *
 * Verifies the signature against the raw request body with the official Stripe
 * scheme (HMAC-SHA256, timing-safe compare). Persists events durably with a
 * unique (provider, provider_event_id) so duplicates, retries, out-of-order,
 * and delayed delivery are all handled idempotently.
 *
 * Acknowledges only after durable receipt. Processing failures return non-2xx
 * so Stripe retries; the inbound_events row is marked failed for staff review.
 */
export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const signatureHeader = request.headers.get("stripe-signature");
        if (!signatureHeader) {
          return new Response("Missing signature", { status: 400 });
        }

        const rawBody = await request.text();

        const result = await verifyWebhookSignature(rawBody, signatureHeader);
        if (!result.valid) {
          return new Response(`Invalid signature: ${result.reason}`, { status: 400 });
        }

        const event = result.event as StripeWebhookEvent;

        try {
          await processWebhookEvent(event);
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (e) {
          console.error("Stripe webhook processing failed:", (e as Error).message);
          return new Response("Processing error", { status: 500 });
        }
      },
    },
  },
});