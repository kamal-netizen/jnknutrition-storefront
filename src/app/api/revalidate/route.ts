import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";

// Shopify webhook receiver. Product/collection pages sit behind a 30-minute ISR
// window (see `export const revalidate` in the page files) purely as a backstop;
// real catalogue changes land here and invalidate the affected routes straight
// away, so shoppers never see a stale price or stock state for long.
//
// Setup (Shopify admin → Settings → Notifications → Webhooks):
//   URL     https://jnknutrition-storefront.vercel.app/api/revalidate
//   Topics  products/create, products/update, products/delete,
//           collections/update, inventory_levels/update
//   Then copy the webhook signing secret into SHOPIFY_WEBHOOK_SECRET.
//
// The URL must NOT be www.jnknutrition.com: Shopify refuses to send webhooks to
// any domain attached to the store ("Address cannot be any of the domains…"),
// which is an anti-loop guard and cannot be worked around. The .vercel.app alias
// serves the same production deployment and therefore the same ISR cache, so
// invalidating through it clears the pages served on the live domain.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Internal [lang] segments — the default locale renders under /en-ae. */
const LOCALE_SEGMENTS = ["en-ae", "ar"] as const;

/**
 * Listing surfaces, cheap to refresh because each is a handful of paths. These
 * are route patterns, so one call covers every locale and every handle.
 */
const LISTING_PATHS = [
  "/[lang]",
  "/[lang]/products",
  "/[lang]/collections",
  "/[lang]/brands",
] as const;

/** Pulls `handle` out of a webhook body without trusting it to be valid JSON. */
function readHandle(rawBody: string): string | null {
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object") return null;
    const value = (parsed as { handle?: unknown }).handle;
    // Guard the path segment: handles are Shopify slugs, and this value is
    // going into revalidatePath.
    return typeof value === "string" && /^[a-z0-9][a-z0-9-]{0,254}$/i.test(value)
      ? value
      : null;
  } catch {
    return null;
  }
}

/** Shopify signs the raw body with the shared secret, base64-encoded SHA-256. */
function isAuthentic(rawBody: string, signature: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = Buffer.from(
    createHmac("sha256", secret).update(rawBody, "utf8").digest("base64")
  );
  const received = Buffer.from(signature);

  // timingSafeEqual throws on a length mismatch, so guard it first.
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!isAuthentic(rawBody, request.headers.get("x-shopify-hmac-sha256"))) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "unknown";
  const handle = readHandle(rawBody);

  // Every topic invalidates the shared Shopify data caches
  // (getInStockDiscountedProducts, getProductFacets and friends carry this tag)
  // and the listing pages, which are a couple of dozen paths in total.
  revalidateTag("products", "max");
  for (const path of LISTING_PATHS) revalidatePath(path, "page");

  // Detail pages are invalidated by handle, never as a whole route pattern.
  // inventory_levels/update in particular fires on every stock movement on
  // every variant at every location — sweeping the entire catalogue on each one
  // would mark thousands of pages stale continuously and turn every subsequent
  // visit into a cache miss, which is the exact ISR write storm the 30-minute
  // `revalidate` window exists to avoid. Its payload carries no product handle,
  // so those events settle through that window instead.
  if (handle) {
    if (topic.startsWith("products/")) {
      for (const lang of LOCALE_SEGMENTS) {
        revalidatePath(`/${lang}/products/${handle}`);
      }
    } else if (topic.startsWith("collections/")) {
      for (const lang of LOCALE_SEGMENTS) {
        revalidatePath(`/${lang}/collections/${handle}`);
      }
    }
  }

  return Response.json({ revalidated: true, topic, handle: handle ?? null });
}
