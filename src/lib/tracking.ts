/**
 * Form-tracking integration helper.
 *
 * Wires form submissions into the connected CRM tracking endpoint using the
 * trackingId/locationId/projectId provided by the form-tracking integration.
 * Fire-and-forget — never blocks form UX.
 *
 * Standard fields use standard CRM keys; non-standard fields go through
 * customFields using the registered custom-field id.
 */

type StandardTrackingFieldKey = string;
type RegisteredCustomFieldId = string;
type TrackingCustomField = { value?: unknown; label: string };
type TrackingFileField = { file?: File; label: string };
type TrackingImageDataField = { dataUrl?: string; label: string };

export const TRACKING = {
  endpoint: "https://backend.leadconnectorhq.com/external-tracking/events",
  trackingId: "tk_f5207799ac094e8aa5ff24029a8b469d",
  locationId: "Crq24gOD3w7117fkPynT",
  projectId: "1790196628861484830",
};

/** Inquiry Category custom field id (registered via register_custom_field). */
export const INQUIRY_CATEGORY_FIELD_ID: RegisteredCustomFieldId = "pG43dhaSMBJfVAmk2U8q";

export function postTrackingEvent(
  trackingPayload: Record<string, unknown> & {
    formData: Record<StandardTrackingFieldKey, unknown>;
    formLabels: Record<StandardTrackingFieldKey, string>;
  },
  options: {
    customFields?: Record<RegisteredCustomFieldId, TrackingCustomField>;
    fileFields?: Record<RegisteredCustomFieldId, TrackingFileField>;
    imageDataFields?: Record<RegisteredCustomFieldId, TrackingImageDataField>;
  } = {},
) {
  const { customFields = {}, fileFields = {}, imageDataFields = {} } = options;
  const eventPayload = {
    ...trackingPayload,
    formData: { ...trackingPayload.formData },
    formLabels: { ...trackingPayload.formLabels },
  };
  const body = new FormData();

  for (const [key, field] of Object.entries(customFields)) {
    if (field.value === undefined) continue;
    eventPayload.formData[key] = field.value;
    eventPayload.formLabels[key] = field.label;
  }

  for (const [key, field] of Object.entries(imageDataFields)) {
    const dataUrl = field.dataUrl;
    if (!dataUrl) continue;
    if (!dataUrl.startsWith("data:image/")) {
      throw new Error("Image data field must be a data:image/* base64 string");
    }
    eventPayload.formData[key] = dataUrl;
    eventPayload.formLabels[key] = field.label;
  }

  for (const [key, field] of Object.entries(fileFields)) {
    const file = field.file;
    if (!file) continue;
    if (file.size > 50 * 1024 * 1024) {
      throw new Error("File must be 50 MB or smaller");
    }
    eventPayload.formData[key] = {
      filename: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    };
    eventPayload.formLabels[key] = field.label;
    body.append(key, file, file.name);
  }

  for (const key of Object.keys(eventPayload.formData)) {
    eventPayload.formLabels[key] ||= key;
  }

  body.append("event", JSON.stringify(eventPayload));

  fetch(TRACKING.endpoint, {
    method: "POST",
    headers: { version: "2021-07-28" },
    body,
  }).catch(() => {});
}

export function getTrackingSessionId(): string {
  try {
    const sid = document.cookie.match(/(?:^|;\s*)__vibe_sid=([0-9a-f-]{36})(?:;|$)/)?.[1];
    if (sid) return sid;
  } catch {}
  return crypto.randomUUID();
}

/** Build a base tracking payload for a named form. */
export function buildTrackingPayload(formId: string, formName: string) {
  return {
    type: "external_form_submission" as const,
    timestamp: Date.now(),
    formId,
    formData: {} as Record<string, unknown>,
    formLabels: {} as Record<string, string>,
    url: typeof window !== "undefined" ? window.location.href : "",
    title: typeof document !== "undefined" ? document.title : "",
    path: typeof window !== "undefined" ? window.location.pathname : "",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    trackingId: TRACKING.trackingId,
    locationId: TRACKING.locationId,
    projectId: TRACKING.projectId,
    sessionId: getTrackingSessionId(),
    properties: {
      deviceType:
        typeof navigator !== "undefined" && /Mobile|Android|iPhone/i.test(navigator.userAgent)
          ? "mobile"
          : "desktop",
      source: "ai_studio",
      projectId: TRACKING.projectId,
      formName,
    },
  };
}
