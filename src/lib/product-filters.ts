import type { ProductFilterInput } from "@/lib/queries/collections";
import type { Product } from "@/lib/queries/products";

// ─── Sort ────────────────────────────────────────────────────────────────────

export type SortOption = {
  /** Stable, locale-independent identifier. This is what goes in the URL. */
  id: string;
  /** Display text only — safe to translate. Never used for matching. */
  label: string;
  sortKey: string;
  reverse: boolean;
};

// Sort keys valid for the top-level `products` connection (ProductSortKeys).
export const SORT_OPTIONS: SortOption[] = [
  { id: "best-selling", label: "Best Selling", sortKey: "BEST_SELLING", reverse: false },
  { id: "newest", label: "Newest", sortKey: "CREATED_AT", reverse: true },
  { id: "price-asc", label: "Price: Low to High", sortKey: "PRICE", reverse: false },
  { id: "price-desc", label: "Price: High to Low", sortKey: "PRICE", reverse: true },
  { id: "title", label: "A–Z", sortKey: "TITLE", reverse: false },
];

// Equivalent sort keys for `collection.products` (ProductCollectionSortKeys).
export const COLLECTION_SORT_OPTIONS: SortOption[] = [
  { id: "featured", label: "Featured", sortKey: "COLLECTION_DEFAULT", reverse: false },
  { id: "best-selling", label: "Best Selling", sortKey: "BEST_SELLING", reverse: false },
  { id: "newest", label: "Newest", sortKey: "CREATED", reverse: true },
  { id: "price-asc", label: "Price: Low to High", sortKey: "PRICE", reverse: false },
  { id: "price-desc", label: "Price: High to Low", sortKey: "PRICE", reverse: true },
];

/**
 * Resolve a `?sort=` param to an option, falling back to the first (default).
 * Matches on `id`; the legacy label match keeps links minted before sort ids
 * existed (e.g. `?sort=Price:+Low+to+High`) pointing at the same option.
 */
export function resolveSort(options: SortOption[], id?: string): SortOption {
  if (!id) return options[0];
  return (
    options.find((o) => o.id === id) ??
    options.find((o) => o.label === id) ??
    options[0]
  );
}

// ─── Price buckets ───────────────────────────────────────────────────────────

export type PriceBucket = {
  id: string;
  label: string;
  min?: number;
  max?: number;
};

export const PRICE_BUCKETS: PriceBucket[] = [
  { id: "0-50", label: "Under 50", max: 50 },
  { id: "50-100", label: "50 – 100", min: 50, max: 100 },
  { id: "100-200", label: "100 – 200", min: 100, max: 200 },
  { id: "200-", label: "200 & Above", min: 200 },
];

export function resolvePriceBucket(id?: string): PriceBucket | null {
  if (!id) return null;
  return PRICE_BUCKETS.find((b) => b.id === id) ?? null;
}

// ─── Active filter state ─────────────────────────────────────────────────────

export type ActiveFilters = {
  /** When true, include out-of-stock products. Default: in-stock only. */
  includeSoldOut: boolean;
  vendors: string[];
  productTypes: string[];
  price: PriceBucket | null;
  onSale: boolean;
  /** Selected SortOption id; "" means the default option. */
  sortId: string;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Split a comma-separated multi-value param into a de-duplicated string list. */
function toList(value: string | string[] | undefined): string[] {
  const flat = Array.isArray(value) ? value.join(",") : (value ?? "");
  const parts = flat
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set(parts));
}

export function parseProductFilters(sp: RawSearchParams): ActiveFilters {
  return {
    includeSoldOut: firstValue(sp.stock) === "all",
    vendors: toList(sp.brand),
    productTypes: toList(sp.type),
    price: resolvePriceBucket(firstValue(sp.price)),
    onSale: firstValue(sp.sale) === "1",
    sortId: firstValue(sp.sort) ?? "",
  };
}

// ─── URL building ────────────────────────────────────────────────────────────

/** Serialize active filters back into a URLSearchParams-friendly query string. */
export function buildFilterHref(
  basePath: string,
  filters: ActiveFilters
): string {
  const params = new URLSearchParams();
  if (filters.sortId) params.set("sort", filters.sortId);
  if (filters.includeSoldOut) params.set("stock", "all");
  if (filters.vendors.length) params.set("brand", filters.vendors.join(","));
  if (filters.productTypes.length)
    params.set("type", filters.productTypes.join(","));
  if (filters.price) params.set("price", filters.price.id);
  if (filters.onSale) params.set("sale", "1");
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Toggle a value inside a multi-select list. */
export function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function hasAnyActiveFilter(f: ActiveFilters): boolean {
  return (
    f.includeSoldOut ||
    f.vendors.length > 0 ||
    f.productTypes.length > 0 ||
    f.price !== null ||
    f.onSale
  );
}

// ─── Shopify query translation (top-level `products` connection) ─────────────

function escapeValue(value: string): string {
  return value.replace(/'/g, "\\'");
}

/** Build a Shopify storefront search query for the `products` connection. */
export function buildProductsQuery(filters: ActiveFilters): string | undefined {
  const clauses: string[] = [];

  if (!filters.includeSoldOut) clauses.push("available_for_sale:true");

  if (filters.vendors.length) {
    const or = filters.vendors
      .map((v) => `vendor:'${escapeValue(v)}'`)
      .join(" OR ");
    clauses.push(`(${or})`);
  }

  if (filters.productTypes.length) {
    const or = filters.productTypes
      .map((t) => `product_type:'${escapeValue(t)}'`)
      .join(" OR ");
    clauses.push(`(${or})`);
  }

  if (filters.price) {
    if (filters.price.min != null)
      clauses.push(`variants.price:>=${filters.price.min}`);
    if (filters.price.max != null)
      clauses.push(`variants.price:<=${filters.price.max}`);
  }

  return clauses.length ? clauses.join(" AND ") : undefined;
}

// ─── Shopify ProductFilter translation (collection.products) ─────────────────

/** Build ProductFilter inputs for the `collection.products(filters:)` argument. */
export function toShopifyFilters(filters: ActiveFilters): ProductFilterInput[] {
  const out: ProductFilterInput[] = [];
  if (!filters.includeSoldOut) out.push({ available: true });
  for (const vendor of filters.vendors) out.push({ productVendor: vendor });
  for (const type of filters.productTypes) out.push({ productType: type });
  if (filters.price) {
    out.push({
      price: {
        ...(filters.price.min != null ? { min: filters.price.min } : {}),
        ...(filters.price.max != null ? { max: filters.price.max } : {}),
      },
    });
  }
  return out;
}

// ─── Post-fetch helpers ──────────────────────────────────────────────────────

/** True when any variant is priced below its compare-at (an active discount). */
export function productIsDiscounted(product: Product): boolean {
  return product.variants.edges.some(({ node }) => {
    const compare = node.compareAtPrice
      ? parseFloat(node.compareAtPrice.amount)
      : 0;
    return compare > parseFloat(node.price.amount);
  });
}
