import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

/**
 * Shopify's checkoutUrl uses the store's primary domain (www.jnknutrition.com),
 * which now points to this headless Next.js app. Any request hitting
 * /cart/c/{token} needs to be forwarded to the actual Shopify checkout engine
 * at the myshopify domain, preserving all query parameters (key, _s, _y, …).
 */
export function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Response {
  const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (!shopDomain) {
    return new Response("Shopify store domain not configured.", { status: 500 });
  }

  // Resolve params (Next.js 15 passes them as a Promise in Route Handlers).
  // We do a synchronous workaround: read the pathname directly from the URL.
  const reqUrl = new URL(req.url);
  // Reconstruct the target URL on the Shopify checkout domain.
  const target = new URL(reqUrl.pathname + reqUrl.search, `https://${shopDomain}`);

  redirect(target.toString());
}
