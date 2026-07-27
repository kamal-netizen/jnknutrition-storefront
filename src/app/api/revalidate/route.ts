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

  // Drop the shared Shopify data caches (getInStockDiscountedProducts,
  // getProductFacets and friends all carry the "products" tag).
  revalidateTag("products", "max");

  // Then the rendered routes. These are route *patterns*, so both locales
  // (/[lang] = en-ae and ar) are covered by a single call each.
  const paths: [string, "page" | "layout"][] = [
    ["/[lang]", "page"],
    ["/[lang]/products", "page"],
    ["/[lang]/products/[handle]", "page"],
    ["/[lang]/collections", "page"],
    ["/[lang]/collections/[handle]", "page"],
    ["/[lang]/collections/[handle]/[tag]", "page"],
    ["/[lang]/brands", "page"],
  ];
  for (const [path, type] of paths) revalidatePath(path, type);

  return Response.json({ revalidated: true, topic });
}
