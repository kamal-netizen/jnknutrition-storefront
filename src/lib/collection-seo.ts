// ─── Enriched SEO content for priority collections ───────────────────────────
// Extra on-page copy + FAQ + metadata overrides for collections that represent
// high-intent search niches. Search Console shows the "near-expiry" cluster
// converting at 20–37% CTR, so those pages get dedicated, keyword-targeted copy.
// Keyed by collection handle (base) or "handle/tag" for two-segment URLs.

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
};

export const COLLECTION_SEO: Record<string, CollectionSeoContent> = {
  "near-expiry": {
    title: "Near-Expiry Supplements Sale — Up to 70% Off | UAE",
    description:
      "Genuine near-expiry protein, whey, pre-workout & supplements at up to " +
      "70% off. 100% authentic stock with clear expiry dates, sold by JNK " +
      "Nutrition — UAE's official distributor. Fast UAE delivery & cash on delivery.",
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
      "Authentic near-expiry whey protein at up to 70% off in the UAE. 100% " +
      "genuine isolate & concentrate with clear expiry dates from JNK Nutrition. " +
      "Fast UAE-wide delivery and cash on delivery.",
    intro:
      "Stock up on genuine whey protein for less. These near-expiry whey deals " +
      "are 100% authentic, with expiry dates listed on every product — ideal if " +
      "you go through protein quickly and want premium brands at a discount.",
  },
};

/** Look up enriched content for a collection handle (or "handle/tag"). */
export function getCollectionSeo(
  key: string
): CollectionSeoContent | undefined {
  return COLLECTION_SEO[key];
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
