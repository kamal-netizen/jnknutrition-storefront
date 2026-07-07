// ─── Central SEO configuration ───────────────────────────────────────────────
// Single source of truth for the canonical site origin and shared metadata used
// by the root layout, sitemap, robots, and per-route structured data.

export const SITE_URL = "https://www.jnknutrition.com";

export const SITE_NAME = "JNK Nutrition";

/** Short brand promise used across titles and social cards. */
export const SITE_TAGLINE =
  "UAE's Official Distributor of 100% Genuine Supplements";

export const SITE_DESCRIPTION =
  "JNK Nutrition is a UAE-based official distributor of 100% genuine sports " +
  "supplements from the world's top brands. Shop retail online, order wholesale " +
  "for gyms and resellers, and enjoy international export — all authentic, all guaranteed.";

/** Default keyword set reflecting UAE retail + wholesale + export positioning. */
export const DEFAULT_KEYWORDS = [
  "supplements UAE",
  "genuine supplements Dubai",
  "authentic sports nutrition UAE",
  "official supplement distributor UAE",
  "whey protein UAE",
  "buy supplements online Dubai",
  "wholesale supplements UAE",
  "supplement distributor Dubai",
  "bulk supplements wholesale",
  "supplement export UAE",
  "international supplement export",
  "gym supplements UAE",
  "protein powder Dubai",
  "pre-workout UAE",
  "JNK Nutrition",
];

/** Business location used for structured data (no exact street address yet). */
export const BUSINESS_LOCALITY = "Dubai";
export const BUSINESS_REGION = "Dubai";
export const BUSINESS_COUNTRY = "AE";

/** Build an absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
