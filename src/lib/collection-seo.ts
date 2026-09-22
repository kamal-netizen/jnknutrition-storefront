// ─── Enriched SEO content for priority collections ───────────────────────────
// Extra on-page copy + FAQ + metadata overrides for collections that represent
// high-intent search niches. Search Console shows the "near-expiry" cluster
// converting at 20–37% CTR, so those pages get dedicated, keyword-targeted copy.
// Keyed by collection handle (base) or "handle/tag" for two-segment URLs.

import { DEFAULT_LOCALE } from "@/lib/i18n";

export type CollectionFaq = { question: string; answer: string };

export type CollectionSeoContent = {
  /** Overrides the Shopify SEO title when set (before the brand suffix). */
  title?: string;
  /** Overrides the Shopify SEO description when set. */
  description?: string;
  /** Short unique intro paragraph rendered above the product grid. */
  intro?: string;
  /** FAQ rendered on-page and emitted as FAQPage JSON-LD. */
  faqs?: CollectionFaq[];
  /**
   * Per-locale metadata overrides, keyed by locale code. Shopify's Arabic
   * translations are machine-generated and show it: /ar/collections/mass-gainers
   * ranks at position 9.9 on 251 impressions with zero clicks under the title
   * "الرابحون الشاملون" — literally "the comprehensive winners". Where an entry
   * supplies Arabic copy here it wins; everything else falls through to the
   * composed Arabic snippet in seo-serp.ts.
   */
  locales?: Record<string, { title?: string; description?: string }>;
};

export const COLLECTION_SEO: Record<string, CollectionSeoContent> = {
  "near-expiry": {
    title: "Near-Expiry Supplements Sale — Up to 70% Off | UAE",
    // Trimmed from 214 characters: Google was cutting it before "cash on
    // delivery", which is the part that closes a near-expiry shopper.
    description:
      "Genuine near-expiry whey, protein & pre-workout at up to 70% off in the " +
      "UAE. Clear expiry dates on every product. Fast delivery, cash on delivery.",
    intro:
      "Grab 100% genuine supplements at a fraction of the price. Our near-expiry " +
      "sale features authentic whey protein, mass gainers, pre-workouts and more " +
      "— all with clearly listed expiry dates, all safe to use before expiry. " +
      "Same brands, same quality, far lower prices. Stock moves fast and is " +
      "limited to what's on the shelf.",
    faqs: [
      {
        question: "Are near-expiry supplements safe to use?",
        answer:
          "Yes. Every product is 100% genuine and perfectly safe to consume " +
          "before its printed expiry date. An expiry date marks best quality, " +
          "not a safety cliff — you simply get the same authentic product at a " +
          "much lower price.",
      },
      {
        question: "How much can I save on the near-expiry sale?",
        answer:
          "Discounts typically range from 30% up to 70% off the regular price, " +
          "depending on how close the product is to its expiry date.",
      },
      {
        question: "Is the expiry date shown before I buy?",
        answer:
          "Yes. The expiry date is listed clearly on each near-expiry product " +
          "page so you know exactly what you're buying.",
      },
    ],
  },
  "near-expiry/whey-protein": {
    title: "Near-Expiry Whey Protein Sale — Genuine, Up to 70% Off | UAE",
    description:
      "Authentic near-expiry whey protein at up to 70% off in the UAE — genuine " +
      "isolate & concentrate, clear expiry dates, cash on delivery.",
    intro:
      "Stock up on genuine whey protein for less. These near-expiry whey deals " +
      "are 100% authentic, with expiry dates listed on every product — ideal if " +
      "you go through protein quickly and want premium brands at a discount.",
    locales: {
      ar: {
        title: "عروض بروتين واي قرب انتهاء الصلاحية — خصم حتى 70٪",
        description:
          "بروتين واي أصلي 100٪ بخصم يصل إلى 70٪ في الإمارات، مع تواريخ صلاحية " +
          "واضحة على كل منتج. توصيل سريع لكل الإمارات والدفع عند الاستلام.",
      },
    },
  },

  // ─── Pages ranking well and converting badly ───────────────────────────────
  // Everything below is a page Search Console (28 days to 2026-09-22) showed
  // holding a position most stores would pay for, on a title Shopify's admin
  // wrote. The comment on each entry is its impressions / CTR / position at the
  // time it was written — so a future reader can tell whether the copy worked.

  // 1,652 impressions · 0.73% · pos 10.6. Titled "Musclemeds Carnivor Beef
  // Protein" — a brand collection wearing one product's name, which is also why
  // it loses "carnivor beef protein" (390 impressions, 0.77%) to the homepage.
  musclemeds: {
    title: "MuscleMeds Carnivor Beef Protein — Buy in UAE",
    description:
      "Shop genuine MuscleMeds in Dubai & the UAE — Carnivor beef protein " +
      "isolate, Carnivor Mass and Carnivor Shred. Free delivery over AED 149, " +
      "cash on delivery.",
  },

  // 653 impressions · 1.68% · pos 2.1 — the site's best ranking outside brand
  // terms, spent on the title "SPECIAL DEAL".
  "special-deal": {
    title: "Supplement Deals & Offers in UAE — Up to 70% Off",
    description:
      "Genuine whey protein, mass gainers and pre-workout at up to 70% off in " +
      "Dubai & the UAE. Free delivery over AED 149 and cash on delivery.",
  },

  // 201 impressions · 0.50% · pos 4.7, as "TODAY DEALS".
  "today-deals": {
    title: "Today's Supplement Deals in Dubai & UAE",
    description:
      "Fresh markdowns every day on 100% genuine supplements in the UAE — " +
      "whey, gainers, pre-workout and more. Free delivery over AED 149, cash " +
      "on delivery.",
  },

  // 426 impressions · 0.94% · pos 2.6, under a 78-character keyword run that
  // Google truncates before it reaches a single benefit.
  "all-products": {
    title: "All Supplements — Buy Online in Dubai & UAE",
    description:
      "Browse 2,000+ genuine supplements at JNK Nutrition — whey protein, mass " +
      "gainers, pre-workout, vitamins. Free UAE delivery over AED 149.",
  },

  // 280 impressions · 0.71% · pos 3.1. Also the landing page that should be
  // taking "whey protein gold" (97) and "on whey protein" (85) off the homepage.
  "whey-protein": {
    title: "Whey Protein in Dubai & UAE — 100% Genuine",
    description:
      "Buy genuine whey protein in the UAE — Optimum Nutrition Gold Standard, " +
      "MuscleMeds, Dynamik and more. Best prices in Dubai, free delivery over " +
      "AED 149.",
  },

  // 155 impressions · 0% · pos 17.9.
  "isolate-protein": {
    title: "Whey Protein Isolate — Buy in Dubai & UAE",
    description:
      "Shop 100% genuine whey protein isolate in the UAE — low carb, low fat, " +
      "fast absorbing. Best prices in Dubai, free delivery over AED 149.",
  },

  // 63 impressions · 0% · pos 21.4 in English. The query "mass gainer" (200
  // impressions, 0% at position 9.6) currently lands on the homepage instead.
  // The Arabic twin is this site's largest zero-click page: 251 impressions.
  "mass-gainers": {
    title: "Mass Gainers & Weight Gain Protein in UAE",
    description:
      "Buy genuine mass gainers in Dubai & the UAE — MuscleMeds Carnivor Mass, " +
      "MHP Up Your Mass, MuscleTech Mass Tech. Free delivery over AED 149.",
    locales: {
      ar: {
        title: "مكملات زيادة الوزن والضخامة في دبي والإمارات",
        description:
          "اشترِ مكملات زيادة الوزن الأصلية 100٪ في الإمارات — كارنيفور ماس، " +
          "أب يور ماس، ماس تك. توصيل مجاني فوق 149 درهم والدفع عند الاستلام.",
      },
    },
  },

  // 288 impressions · 0% · pos 31.0. "protein shaker" (107) and "protein shaker
  // bottle" (73) both sit around position 30 — cheap volume if the snippet earns
  // the click once ranking improves.
  shakers: {
    title: "Protein Shaker Bottles — Buy in Dubai & UAE",
    description:
      "Leak-proof protein shaker bottles and mixers, in stock in Dubai. " +
      "Genuine brands, fast UAE-wide delivery and cash on delivery.",
  },

  // 108 impressions · 0% · pos 29.8. Should own "total war pre workout" (117)
  // and "rdx pre workout" (46).
  "pre-workouts": {
    title: "Pre-Workout Supplements in Dubai & UAE",
    description:
      "Buy genuine pre-workout in the UAE — Redcon1 Total War, GAT Nitraflex, " +
      "Core Champs RDX and more. Free delivery over AED 149, cash on delivery.",
  },

  // 295 impressions · 0% · pos 23.7; "gat supplements" is 62 impressions at 25.6.
  "gat-sport": {
    title: "GAT Sport Supplements — Buy in Dubai & UAE",
    description:
      "Shop genuine GAT Sport in the UAE — Nitraflex pre-workout and more. " +
      "Best prices in Dubai, free delivery over AED 149, cash on delivery.",
  },

  // 131 impressions · 0% · pos 44.5; "mp combat" is 89 impressions at 45.5.
  musclepharm: {
    title: "MusclePharm Supplements — Buy in Dubai & UAE",
    description:
      "Genuine MusclePharm in the UAE — Combat Protein Powder and more. Free " +
      "delivery over AED 149 and cash on delivery from Dubai.",
  },

  // 158 impressions · 3.80% · pos 8.3 — already the best of this group, which is
  // the argument for giving the rest the same treatment.
  "muscle-rulz": {
    title: "Muscle Rulz Supplements — Buy in Dubai & UAE",
    description:
      "Shop genuine Muscle Rulz in the UAE — protein, amino acids and more. " +
      "Free UAE delivery over AED 149, cash on delivery.",
  },

  // 152 impressions · 0.66% · pos 9.4.
  proscience: {
    title: "ProScience Nutra — Buy in Dubai & UAE",
    description:
      "Shop genuine ProScience Nutra in the UAE — 100% Whey Anabolic, Anabolic " +
      "Mass and creatine monohydrate. Free delivery over AED 149.",
  },

  // 34 impressions · 0% · pos 9.6 — small, but position 9.6 with no clicks is
  // the same failure as the rest and costs one entry to fix.
  creatine: {
    title: "Creatine Monohydrate in Dubai & UAE",
    description:
      "Buy 100% genuine creatine monohydrate in the UAE — powder and capsules. " +
      "Best prices in Dubai, free delivery over AED 149, cash on delivery.",
  },
};

/**
 * Look up enriched *on-page* content (intro, FAQ) for a collection handle — or
 * "handle/tag". English only, by design: this copy is rendered, and an English
 * paragraph above an Arabic product grid is worse than none.
 */
export function getCollectionSeo(
  key: string
): CollectionSeoContent | undefined {
  return COLLECTION_SEO[key];
}

/**
 * Look up curated <title>/description for a collection in a given locale.
 * Unlike the on-page copy above this is locale-aware, because a curated Arabic
 * snippet is exactly what the Arabic pages are missing — see `locales` on
 * CollectionSeoContent.
 */
export function getCollectionSeoMeta(
  key: string,
  localeCode: string
): { title?: string; description?: string } {
  const entry = COLLECTION_SEO[key];
  if (!entry) return {};
  const override = entry.locales?.[localeCode];
  if (override) return override;
  // A locale with no override falls through to Shopify's own translation rather
  // than to this English copy, which would be the wrong language in the SERP.
  if (localeCode !== DEFAULT_LOCALE.code) return {};
  return { title: entry.title, description: entry.description };
}

// ─── Two-segment collection/tag URLs to preserve ─────────────────────────────
// Shopify serves /collections/{handle}/{tag} as the collection filtered by a
// product tag. These URLs are indexed and were high-CTR on the old theme, so we
// re-serve them (see collections/[handle]/[tag]) and list the known-good ones
// here for the sitemap. Format: [handle, tag].
export const NESTED_COLLECTION_URLS: [handle: string, tag: string][] = [
  ["near-expiry", "whey-protein"],
  ["deals", "near-expiry"],
  ["proscience", "whey"],
  ["dynamik", "whey-protein"],
  ["dynamik", "mass-gainer"],
  ["super-saver", "special-offer"],
];

/** Turn a URL tag segment into a human label, e.g. "whey-protein" → "Whey Protein". */
export function prettifyTag(tag: string): string {
  return decodeURIComponent(tag)
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
