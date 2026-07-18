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

/** Business location used for structured data. */
export const BUSINESS_LOCALITY = "Dubai";
export const BUSINESS_REGION = "Dubai";
export const BUSINESS_COUNTRY = "AE";

// ─── Physical storefront (LocalBusiness rich results) ────────────────────────
// These power the LocalBusiness/Store schema and help rank for local intent
// ("supplement store dubai", "…near me"). Fields left EMPTY are omitted from the
// schema — never emit fabricated address/geo/hours data. Fill with the real
// storefront details to switch on local rich results.
export const BUSINESS_PHONE = "+971556238582";
export const BUSINESS_STREET_ADDRESS = ""; // e.g. "Shop 5, Baniyas Square"
export const BUSINESS_POSTAL_CODE = "";
export const BUSINESS_LATITUDE = ""; // e.g. "25.2685"
export const BUSINESS_LONGITUDE = ""; // e.g. "55.3095"
/** schema.org openingHours specs, e.g. ["Mo-Sa 10:00-22:00", "Su 14:00-22:00"]. */
export const BUSINESS_OPENING_HOURS: string[] = [];

/** True when enough real address data is present to emit LocalBusiness schema. */
export const HAS_LOCAL_BUSINESS_DATA = Boolean(BUSINESS_STREET_ADDRESS);

/**
 * Collections that deserve elevated sitemap priority — high commercial intent or
 * proven high-CTR niches (e.g. near-expiry deals convert at 20%+ in Search).
 */
export const PRIORITY_COLLECTION_HANDLES = new Set([
  "near-expiry",
  "special-deal",
  "today-deals",
  "super-saver",
]);

// ─── Metadata fallback copy (CTR optimization) ───────────────────────────────
// Used only when Shopify's own SEO title/description is blank. The root layout
// applies the "%s | JNK Nutrition" title template, so titles here omit the brand
// suffix to avoid duplication.

/** UAE-localized fallback <title> for a product. */
export function productFallbackTitle(name: string): string {
  return `${name} — Buy Online in UAE`;
}

/** UAE-localized, benefit-led fallback meta description for a product. */
export function productFallbackDescription(opts: {
  name: string;
  vendor?: string;
  price?: string;
  currency?: string;
}): string {
  const brand = opts.vendor ? `${opts.vendor} ` : "";
  const priceStr = opts.price
    ? ` from ${opts.currency ?? "AED"} ${opts.price}`
    : "";
  return (
    `Buy genuine ${brand}${opts.name}${priceStr} at JNK Nutrition — UAE's ` +
    `official distributor of 100% authentic supplements. Fast UAE-wide ` +
    `delivery and cash on delivery.`
  );
}

/** UAE-localized fallback <title> for a collection. */
export function collectionFallbackTitle(name: string): string {
  return `${name} — Buy in Dubai & UAE`;
}

/** UAE-localized fallback meta description for a collection. */
export function collectionFallbackDescription(name: string): string {
  return (
    `Shop ${name} at JNK Nutrition, UAE's official distributor of 100% genuine ` +
    `supplements. Best prices in Dubai, fast UAE-wide delivery and cash on delivery.`
  );
}

/** Build an absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
