"use client";

/**
 * next/image loader.
 *
 * Image optimization used to be switched off entirely (`images.unoptimized`),
 * which meant `<Image sizes=…>` emitted no srcset and every product tile
 * downloaded the Shopify original — 2000×2000 JPEGs into a 254px slot, ~1.4 MB
 * of waste on the homepage alone.
 *
 * Rather than turn Next's own optimizer on (it would resize on our servers, on
 * every cold cache), this hands the work to Shopify's CDN, which already
 * resizes on demand and content-negotiates WebP/AVIF from the Accept header.
 * The cost is a query parameter.
 *
 * Anything not served by Shopify — local files under /public, blobs, data URIs —
 * passes through untouched. Returning one URL for every srcset candidate is
 * fine: the browser dedupes to a single request.
 */

const SHOPIFY_CDN = "cdn.shopify.com";

/** Shopify's CDN rejects widths above this and serves the original instead. */
const MAX_WIDTH = 5760;

type LoaderArgs = {
  src: string;
  width: number;
  quality?: number;
};

export default function shopifyImageLoader({ src, width }: LoaderArgs): string {
  if (!src.startsWith("http")) return src;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }

  if (url.hostname !== SHOPIFY_CDN && !url.hostname.endsWith(`.${SHOPIFY_CDN}`)) {
    return src;
  }

  // A `height` inherited from the incoming URL would force a crop against the
  // width we are about to set, so it goes; `width` is replaced outright.
  url.searchParams.delete("height");
  url.searchParams.delete("crop");
  url.searchParams.set("width", String(Math.min(width, MAX_WIDTH)));

  return url.toString();
}
