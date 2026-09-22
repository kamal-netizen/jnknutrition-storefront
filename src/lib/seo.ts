// ─── Central SEO configuration ───────────────────────────────────────────────
// Single source of truth for the canonical site origin and shared metadata used
// by the root layout, sitemap, robots, and per-route structured data.

import {
  FREE_SHIPPING_THRESHOLD,
  FREE_SHIPPING_CURRENCY,
} from "@/lib/shipping";

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
export const BUSINESS_PHONE = "+97142522426";
export const BUSINESS_STREET_ADDRESS =
  "Shop 6, Baniyas Complex Building (Wasl R260), Opp. Choithrams, Deira";
export const BUSINESS_POSTAL_CODE = "";
export const BUSINESS_LATITUDE = ""; // e.g. "25.2685"
export const BUSINESS_LONGITUDE = ""; // e.g. "55.3095"
/** schema.org openingHours specs, e.g. ["Mo-Sa 10:00-22:00", "Su 14:00-22:00"]. */
export const BUSINESS_OPENING_HOURS: string[] = [
  "Mo-Sa 10:00-23:00",
  "Su 17:00-23:00",
];

/** True when enough real address data is present to emit LocalBusiness schema. */
export const HAS_LOCAL_BUSINESS_DATA = Boolean(BUSINESS_STREET_ADDRESS);

// ─── Shared contact details (footer + contact page) ──────────────────────────
// Display-formatted counterparts to the schema values above. Kept here so the
// footer and the contact page can never drift apart.
export const BUSINESS_PHONE_DISPLAY = "+971 4 252 2426";
export const BUSINESS_WHATSAPP = "971556238582";
export const BUSINESS_WHATSAPP_DISPLAY = "+971 55 623 8582";
export const BUSINESS_EMAIL = "support@jnknutrition.com";
export const BUSINESS_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("JNK Nutrition, Baniyas Complex Building, Deira, Dubai");

// ─── Social profiles ─────────────────────────────────────────────────────────
// Real profile URLs only. Empty entries are omitted from the footer and from
// the Organization `sameAs` — a bare "https://instagram.com" is a broken link
// that dumps shoppers on a platform homepage, and fake `sameAs` entries link
// the brand entity to profiles Google can't verify.
export const SOCIAL_PROFILES: Record<string, string> = {
  Instagram: "",
  Facebook: "",
  Twitter: "",
  YouTube: "",
};

/** Non-empty profile URLs, for Organization `sameAs`. */
export const SOCIAL_PROFILE_URLS = Object.values(SOCIAL_PROFILES).filter(Boolean);

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

// ─── Metadata copy ───────────────────────────────────────────────────────────
// Title/description composition moved to src/lib/seo-serp.ts, because the
// fallbacks that lived here only applied when Shopify's own SEO fields were
// blank — and Search Console showed the pages where those fields were *set*
// were the ones bleeding clicks. That file treats them as candidates instead.

// ─── Shipping & returns (published policy → structured data) ─────────────────
// These mirror what the product page already tells shoppers on-page (the
// `shippingReturns` block in src/lib/dictionaries.ts). They feed Google's
// merchant listing enhancements, which print delivery speed, shipping cost and
// the return window straight into the product result — the richest CTR lever a
// product listing has. Never let them drift from the on-page copy, and never
// state a policy the store does not actually publish.
export const DELIVERY_HANDLING_DAYS_MAX = 1; // same-day dispatch before cut-off
export const DELIVERY_TRANSIT_DAYS_MIN = 1;
export const DELIVERY_TRANSIT_DAYS_MAX = 3;
/** Unopened items, per the published returns copy. */
export const RETURN_WINDOW_DAYS = 7;

/**
 * schema.org `MerchantReturnEnumeration` value for who pays return postage,
 * e.g. "https://schema.org/FreeReturn" or
 * "https://schema.org/ReturnShippingFees". Deliberately blank: the store's
 * published policy does not say, and Google flags an invented value. Filling it
 * in completes the return-policy annotation.
 */
export const RETURN_FEES = "";

/**
 * `shippingDetails` for one Offer. Search Console shows 15,179 impressions in
 * the "Product snippets" appearance converting at 1.79% — the listings are
 * eligible but bare. Shipping and return annotations are what fill them out.
 *
 * The free-shipping rate is only claimed on variants that actually clear the
 * threshold; below it the block carries destination and delivery speed only,
 * because a free-shipping claim Google can disprove at checkout costs the whole
 * enhancement.
 */
export function offerShippingDetails(priceAmount: string | number) {
  const value =
    typeof priceAmount === "number" ? priceAmount : Number.parseFloat(priceAmount);
  const qualifiesForFreeShipping =
    Number.isFinite(value) && value >= FREE_SHIPPING_THRESHOLD;

  return {
    "@type": "OfferShippingDetails",
    ...(qualifiesForFreeShipping
      ? {
          shippingRate: {
            "@type": "MonetaryAmount",
            value: 0,
            currency: FREE_SHIPPING_CURRENCY,
          },
        }
      : {}),
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: BUSINESS_COUNTRY,
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: DELIVERY_HANDLING_DAYS_MAX,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: DELIVERY_TRANSIT_DAYS_MIN,
        maxValue: DELIVERY_TRANSIT_DAYS_MAX,
        unitCode: "DAY",
      },
    },
  };
}

/**
 * The SKU as a GTIN, when it is one. Many of this store's SKUs are the barcode
 * off the tub (e.g. "784922887733"), and `gtin` is the identifier Google
 * actually matches a product on across merchants — far stronger than a `sku`
 * only this store uses. Anything that isn't a valid GTIN length is not one.
 */
export function gtinFrom(sku?: string | null): string | undefined {
  const digits = (sku ?? "").trim();
  return /^(\d{8}|\d{12,14})$/.test(digits) ? digits : undefined;
}

/** `hasMerchantReturnPolicy` for an Offer, from the published returns policy. */
export const MERCHANT_RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: BUSINESS_COUNTRY,
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: RETURN_WINDOW_DAYS,
  ...(RETURN_FEES ? { returnFees: RETURN_FEES } : {}),
};

/**
 * A rolling `priceValidUntil`, 90 days out. Google drops an Offer whose
 * priceValidUntil has passed, so this must never be a fixed date.
 */
export function priceValidUntil(): string {
  const until = new Date();
  until.setDate(until.getDate() + 90);
  return until.toISOString().slice(0, 10);
}

/** Build an absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
