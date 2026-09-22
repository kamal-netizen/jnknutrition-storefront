// ─── SERP copy composition (CTR) ─────────────────────────────────────────────
// Search Console (28 days to 2026-09-22) shows ~43K impressions at 2.0% CTR,
// with pages ranking at positions 2–5 converting under 0.5%. The cause is
// visible in the live <head>: Shopify's own SEO fields were winning over
// src/lib/seo.ts's fallbacks and reaching the SERP raw —
//
//   /collections/special-deal   pos 2.1  "SPECIAL DEAL — Buy in Dubai & UAE"
//   /pages/contact-us           pos 3.9  "CONTACT US", and no description at all
//   /collections/musclemeds     pos 10.6 "Musclemeds Carnivor Beef Protein  "
//   /collections/all-products   pos 2.6  a 78-char keyword run that truncates
//
// …over descriptions that were the first ~300 characters of brand body copy,
// clipped mid-sentence by Google. Meanwhile the one cluster with hand-written
// copy — near-expiry — runs 9–24% CTR at worse positions.
//
// So Shopify's SEO fields are treated here as candidates, not as output: they
// get normalized, and a description only survives if it reads like a real meta
// description rather than scraped body text. Everything else is composed from
// the hooks that demonstrably earn the click on this store — genuine stock, an
// AED price, UAE delivery, cash on delivery.
//
// Lives apart from seo.ts so that file stays what it says it is: configuration.

import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { SITE_NAME } from "@/lib/seo";

/** Total <title> budget, brand suffix included. ~65 chars survives on mobile. */
export const MAX_TITLE_LENGTH = 65;
/**
 * Total length past which a title is trimmed on a word boundary — also brand
 * suffix included, or the trim just moves the invisible part around instead of
 * removing it.
 */
const TITLE_HARD_CEILING = 72;
/** Length of " | JNK Nutrition", which the root layout's template appends. */
const BRAND_SUFFIX_LENGTH = ` | ${SITE_NAME}`.length;
/** Google renders ~155 characters of a description on mobile. */
export const MAX_DESCRIPTION_LENGTH = 155;

const SMALL_WORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "by",
  "for",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

/** True when a Latin string is all-caps — an admin field, not written copy. */
function isShouting(text: string): boolean {
  return /[A-Z]/.test(text) && !/[a-z]/.test(text);
}

/** "SPECIAL DEAL" → "Special Deal". Leaves caseless scripts untouched. */
function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(/(\s+|[-/])/)
    .map((part, i) =>
      !/[a-z]/.test(part) || (i > 0 && SMALL_WORDS.has(part))
        ? part
        : part[0].toUpperCase() + part.slice(1)
    )
    .join("");
}

/**
 * Trim to `max` on a word boundary, leaving no dangling separator — and no
 * dangling preposition either ("…Supplements for" reads like a cut-off cable).
 */
function truncateWords(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  const trimmed = (space > max * 0.6 ? cut.slice(0, space) : cut).replace(
    /[\s,;:|.\-–—]+$/,
    ""
  );
  const lastWord = trimmed.slice(trimmed.lastIndexOf(" ") + 1).toLowerCase();
  return SMALL_WORDS.has(lastWord)
    ? trimmed.slice(0, trimmed.lastIndexOf(" "))
    : trimmed;
}

/**
 * Collapse whitespace, drop a brand suffix the title template re-adds anyway,
 * and de-shout an all-caps admin field.
 */
export function normalizeSerpText(raw?: string | null): string {
  const collapsed = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!collapsed) return "";
  const unbranded = collapsed
    .replace(/\s*[|\-–—]\s*JNK(\s+Nutrition)?\s*$/i, "")
    .trim();
  return isShouting(unbranded) ? titleCase(unbranded) : unbranded;
}

/**
 * Whether a Shopify description is a deliberate meta description rather than
 * body copy the Storefront API summarized for us. Body copy runs long and
 * arrives clipped mid-sentence with an ellipsis; both shapes lose to composed
 * copy in the SERP, so both are rejected.
 */
export function looksHandWritten(raw?: string | null): boolean {
  const text = (raw ?? "").replace(/\s+/g, " ").trim();
  if (text.length < 50 || text.length > 170) return false;
  return !/(\.{3}|…)/.test(text);
}

/**
 * Append the first hook that still fits the title budget. A title under the
 * hard ceiling is otherwise left alone: a name cut mid-spec ("… Isolate 100")
 * reads worse in the SERP than one Google clips itself.
 */
export function fitSerpTitle(
  core: string,
  hooks: readonly string[] = []
): string {
  const base = normalizeSerpText(core);
  const budget = MAX_TITLE_LENGTH - BRAND_SUFFIX_LENGTH;
  for (const hook of hooks) {
    if (base.length + hook.length <= budget) return `${base}${hook}`;
  }
  return truncateWords(base, TITLE_HARD_CEILING - BRAND_SUFFIX_LENGTH);
}

/**
 * Assemble a description in which the *name* is the only part allowed to give.
 * Everything around it — the price, the store, the delivery promise — is what
 * earns the click, and trimming the whole line instead once produced
 * "…Bag 100% Beef Protein (AED", with the offer cut off entirely.
 */
function describe(before: string, name: string, after: string): string {
  const room = MAX_DESCRIPTION_LENGTH - before.length - after.length;
  return `${before}${truncateWords(name, Math.max(room, 0))}${after}`;
}

/** "120.0" → "120"; "1250.50" → "1,250.50"; unparseable → "". */
function formatAmount(amount?: string): string {
  const value = Number.parseFloat(amount ?? "");
  if (!Number.isFinite(value)) return "";
  return value
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** "120.0" → "AED 120". Shopify hands us "120.0", which read as a typo. */
export function formatSeoPrice(amount?: string, currency = "AED"): string {
  const formatted = formatAmount(amount);
  return formatted ? `${currency} ${formatted}` : "";
}

/**
 * The vendor, ready to prefix a product name — empty when the name already
 * opens with it. Shopify stores vendors in caps, which was shipping
 * "Buy genuine KIRKLAND Kirkland Signature Fish Oil…" to the SERP.
 */
function vendorPrefix(vendor: string | undefined, name: string): string {
  const clean = normalizeSerpText(vendor);
  if (!clean) return "";
  return name.toLowerCase().startsWith(clean.toLowerCase()) ? "" : `${clean} `;
}

type SerpCopyPack = {
  /** Title hooks, longest first; the first that fits the budget wins. */
  productHooks: readonly string[];
  collectionHooks: readonly string[];
  /** Locale-appropriate money, e.g. "AED 289" vs "289 درهم". */
  price(amount?: string, currency?: string): string;
  product(opts: { name: string; vendor?: string; price: string }): string;
  collection(name: string): string;
};

const EN_COPY: SerpCopyPack = {
  productHooks: [" — Buy Online in UAE", " — Buy in UAE", " | UAE"],
  collectionHooks: [
    " — Best Prices in Dubai & UAE",
    " — Buy in Dubai & UAE",
    " in UAE",
  ],
  price: formatSeoPrice,
  product: ({ name, vendor, price }) =>
    describe(
      `Buy ${vendorPrefix(vendor, name)}`,
      name,
      `${price ? ` (${price})` : ""} at JNK Nutrition — 100% genuine, free UAE delivery over AED ${FREE_SHIPPING_THRESHOLD}, cash on delivery.`
    ),
  collection: (name) =>
    describe(
      "Shop ",
      name,
      ` in Dubai & the UAE at JNK Nutrition — 100% genuine stock at the best prices, free delivery over AED ${FREE_SHIPPING_THRESHOLD} and cash on delivery.`
    ),
};

// Arabic pages carry ~3K impressions at 1.7% CTR, and the largest of them
// (/ar/collections/mass-gainers, 251 impressions at position 9.9) has never been
// clicked: its SERP entry is a machine-translated Shopify title over a paragraph
// of body copy about carbohydrate content. Composing the Arabic snippet here at
// least puts the offer — genuine, priced, delivered, cash on delivery — in
// Arabic in front of an Arabic searcher.
const AR_COPY: SerpCopyPack = {
  productHooks: [" — اشترِ أونلاين في الإمارات", " — في الإمارات"],
  collectionHooks: [" — بأفضل الأسعار في دبي والإمارات", " — في دبي والإمارات"],
  // Arabic writes the amount before the unit: "289 درهم", not "AED 289".
  price: (amount, currency = "AED") => {
    const formatted = formatAmount(amount);
    if (!formatted) return "";
    return currency === "AED" ? `${formatted} درهم` : `${formatted} ${currency}`;
  },
  product: ({ name, vendor, price }) =>
    describe(
      `اشترِ ${vendorPrefix(vendor, name)}`,
      name,
      `${price ? ` بسعر ${price}` : ""} من JNK Nutrition دبي — أصلي 100٪، توصيل مجاني فوق ${FREE_SHIPPING_THRESHOLD} درهم والدفع عند الاستلام.`
    ),
  collection: (name) =>
    describe(
      "تسوّق ",
      name,
      ` في دبي والإمارات من JNK Nutrition — منتجات أصلية 100٪ بأفضل الأسعار، توصيل مجاني فوق ${FREE_SHIPPING_THRESHOLD} درهم والدفع عند الاستلام.`
    ),
};

const COPY_PACKS: Record<string, SerpCopyPack> = {
  "en-ae": EN_COPY,
  ar: AR_COPY,
};

function copyFor(localeCode: string): SerpCopyPack {
  return COPY_PACKS[localeCode] ?? EN_COPY;
}

export type SerpCopy = { title: string; description: string };

/**
 * Resolve the description: curated copy wins, a Shopify field survives only if
 * it reads hand-written, and otherwise the offer is composed.
 */
function resolveDescription(
  curated: string | undefined,
  shopify: string | undefined,
  composed: () => string
): string {
  if (curated) return curated.replace(/\s+/g, " ").trim();
  if (looksHandWritten(shopify)) return normalizeSerpText(shopify);
  return composed();
}

/** Compose the SERP title + description for a product detail page. */
export function composeProductSerp(opts: {
  localeCode: string;
  name: string;
  shopifyTitle?: string;
  shopifyDescription?: string;
  vendor?: string;
  price?: string;
  currency?: string;
}): SerpCopy {
  const copy = copyFor(opts.localeCode);
  const price = copy.price(opts.price, opts.currency);
  const core = normalizeSerpText(opts.shopifyTitle) || opts.name;
  return {
    title: fitSerpTitle(core, copy.productHooks),
    description: resolveDescription(undefined, opts.shopifyDescription, () =>
      copy.product({ name: opts.name, vendor: opts.vendor, price })
    ),
  };
}

/**
 * Compose the SERP title + description for a collection, or for a
 * /collections/{handle}/{tag} page via `name`.
 *
 * `curatedTitle` comes from COLLECTION_SEO and is used verbatim — it is written
 * to a length its author chose, and the near-expiry cluster is proof that such
 * copy out-earns anything generated here.
 */
export function composeCollectionSerp(opts: {
  localeCode: string;
  name: string;
  shopifyTitle?: string;
  shopifyDescription?: string;
  curatedTitle?: string;
  curatedDescription?: string;
}): SerpCopy {
  const copy = copyFor(opts.localeCode);
  const core = normalizeSerpText(opts.shopifyTitle) || opts.name;
  return {
    title: opts.curatedTitle ?? fitSerpTitle(core, copy.collectionHooks),
    description: resolveDescription(
      opts.curatedDescription,
      opts.shopifyDescription,
      () => copy.collection(normalizeSerpText(opts.name))
    ),
  };
}
