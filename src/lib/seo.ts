// ─── Central SEO configuration ───────────────────────────────────────────────
// Single source of truth for the canonical site origin and shared metadata used
// by the root layout, sitemap, robots, and per-route structured data.

export const SITE_URL = "https://www.jnknutrition.com";

export const SITE_NAME = "JNK Nutrition";

export const SITE_DESCRIPTION =
  "Premium nutrition supplements — fuel your performance.";

/** Build an absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
