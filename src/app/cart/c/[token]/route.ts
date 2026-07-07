import { type NextRequest } from "next/server";

// Run in Node.js so we can stream large Shopify checkout HTML without the
// 4 MB edge-function response-size limit.
export const runtime = "nodejs";

// Headers we must not forward from the incoming browser request to Shopify.
const DROP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "transfer-encoding",
  "accept-encoding", // We want uncompressed content to avoid re-encoding issues
]);

// Headers from Shopify's response that Next.js / the proxy must not forward.
const DROP_RESPONSE_HEADERS = new Set([
  "transfer-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "content-encoding", // Body is already decoded by Node fetch; skip this header
]);

/**
 * Proxy handler for Shopify's cart-permalink checkout URLs.
 *
 * Background
 * ----------
 * Shopify generates checkoutUrl using the store's primary domain, e.g.
 *   https://www.jnknutrition.com/cart/c/{token}?key=…
 * Because www.jnknutrition.com points to Vercel (this Next.js app), not
 * Shopify's checkout servers, the URL would otherwise 404.
 *
 * Strategy
 * --------
 * 1. Rewrite the destination host to jnk-supplements.myshopify.com and fetch
 *    server-side (the browser never knows).
 * 2. If Shopify redirects back to www.jnknutrition.com (its configured custom
 *    checkout domain), rewrite that URL to myshopify and follow server-side
 *    again. This breaks the browser-level redirect loop.
 * 3. Once Shopify returns real HTML (typically after Shopify has set _s/_y
 *    session cookies and is happy to serve checkout), stream it to the browser.
 *    The browser stays at www.jnknutrition.com/cart/c/… throughout.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (!shopDomain) {
    return new Response("Shopify store domain not configured.", { status: 500 });
  }

  const reqUrl = new URL(req.url);

  // Build outgoing headers (forward browser headers minus the blocked ones)
  const outHeaders: Record<string, string> = {};
  for (const [key, value] of req.headers) {
    if (!DROP_REQUEST_HEADERS.has(key.toLowerCase())) {
      outHeaders[key] = value;
    }
  }

  // Start at the myshopify equivalent of the requested URL
  let currentUrl = new URL(
    reqUrl.pathname + reqUrl.search,
    `https://${shopDomain}`
  ).toString();

  // Track visited base-paths (without query) to detect genuine loops
  const visited = new Set<string>();
  const MAX_HOPS = 8;

  for (let hop = 0; hop < MAX_HOPS; hop++) {
    const basePath = new URL(currentUrl).pathname;
    if (visited.has(basePath)) {
      // Real redirect loop — give up
      return new Response(
        "Checkout temporarily unavailable (redirect loop detected).",
        { status: 502 }
      );
    }
    visited.add(basePath);

    const res = await fetch(currentUrl, {
      method: "GET",
      headers: outHeaders,
      redirect: "manual", // Handle redirects ourselves
    });

    const location = res.headers.get("location");

    if ((res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) && location) {
      const next = new URL(location, currentUrl);

      // If Shopify redirects to our own domain, rewrite host → myshopify
      // so we follow server-side instead of sending the browser back to us.
      if (next.hostname === reqUrl.hostname) {
        next.hostname = shopDomain;
      }

      currentUrl = next.toString();
      continue; // Follow the redirect internally
    }

    // We have a real response (2xx, 4xx, 5xx) — forward it to the browser.
    const responseHeaders = new Headers();
    for (const [key, value] of res.headers) {
      if (!DROP_RESPONSE_HEADERS.has(key.toLowerCase())) {
        responseHeaders.append(key, value);
      }
    }

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  }

  return new Response("Checkout temporarily unavailable.", { status: 502 });
}
