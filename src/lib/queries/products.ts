import { storefrontFetch } from "@/lib/shopify";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MoneyV2 = {
  amount: string;
  currencyCode: string;
};

export type ProductImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: MoneyV2;
  compareAtPrice: MoneyV2 | null;
  selectedOptions: { name: string; value: string }[];
  image: ProductImage | null;
};

export type Metafield = {
  namespace: string;
  key: string;
  value: string;
} | null;

export type Product = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  tags: string[];
  vendor: string;
  productType: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: MoneyV2;
    maxVariantPrice: MoneyV2;
  };
  images: { edges: { node: ProductImage }[] };
  variants: { edges: { node: ProductVariant }[] };
  seo: { title: string; description: string };
  /**
   * Aggregate review data (from the store's reviews app) + an optional SEO
   * canonical override, when present. Aligned to the identifiers requested in
   * PRODUCT_FRAGMENT; missing metafields come back as null.
   */
  metafields?: Metafield[];
};

/**
 * Extract aggregate rating from the product's review metafields. Defaults target
 * Judge.me (`reviews.rating` = JSON `{value, scale_max}`, `reviews.rating_count`
 * = number) but also handle a bare-number rating value. Returns null unless real
 * rating data with at least one review is present — ratings are NEVER fabricated.
 */
export function getProductRating(
  product: Product
): { ratingValue: number; reviewCount: number } | null {
  const mf = product.metafields ?? [];
  const ratingRaw = mf.find((m) => m?.key === "rating")?.value;
  const countRaw = mf.find((m) => m?.key === "rating_count")?.value;
  if (!ratingRaw || !countRaw) return null;

  const reviewCount = parseInt(countRaw, 10);
  if (!Number.isFinite(reviewCount) || reviewCount <= 0) return null;

  let ratingValue: number;
  try {
    ratingValue = ratingRaw.trim().startsWith("{")
      ? parseFloat((JSON.parse(ratingRaw) as { value: string }).value)
      : parseFloat(ratingRaw);
  } catch {
    return null;
  }
  if (!Number.isFinite(ratingValue) || ratingValue <= 0 || ratingValue > 5) {
    return null;
  }
  return { ratingValue, reviewCount };
}

/** Optional SEO canonical override stored in the `seo.canonical_url` metafield. */
export function getCanonicalOverride(product: Product): string | null {
  const value = (product.metafields ?? []).find(
    (m) => m?.namespace === "seo" && m?.key === "canonical_url"
  )?.value;
  return value && value.trim() ? value.trim() : null;
}

export type ProductConnection = {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  edges: { node: Product }[];
};

// ─── Fragments ───────────────────────────────────────────────────────────────

const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    title
    handle
    description
    descriptionHtml
    tags
    vendor
    productType
    availableForSale
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    images(first: 10) {
      edges {
        node { url altText width height }
      }
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
          image { url altText width height }
        }
      }
    }
    seo { title description }
    metafields(identifiers: [
      { namespace: "reviews", key: "rating" }
      { namespace: "reviews", key: "rating_count" }
      { namespace: "seo", key: "canonical_url" }
    ]) {
      namespace
      key
      value
    }
  }
`;

// ─── Queries ─────────────────────────────────────────────────────────────────

const GET_PRODUCT = `
  ${PRODUCT_FRAGMENT}
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      ...ProductFragment
    }
  }
`;

const GET_PRODUCTS = `
  ${PRODUCT_FRAGMENT}
  query GetProducts(
    $first: Int!
    $after: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
  ) {
    products(
      first: $first
      after: $after
      sortKey: $sortKey
      reverse: $reverse
      query: $query
    ) {
      pageInfo { hasNextPage endCursor }
      edges { node { ...ProductFragment } }
    }
  }
`;

const GET_PRODUCT_RECOMMENDATIONS = `
  ${PRODUCT_FRAGMENT}
  query GetProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...ProductFragment
    }
  }
`;

// ─── Fetchers ────────────────────────────────────────────────────────────────

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await storefrontFetch<{ product: Product | null }>(GET_PRODUCT, {
    handle,
  });
  return data.product;
}

export async function getProducts(options: {
  first?: number;
  after?: string;
  sortKey?: string;
  reverse?: boolean;
  query?: string;
}): Promise<ProductConnection> {
  const data = await storefrontFetch<{ products: ProductConnection }>(
    GET_PRODUCTS,
    { first: 24, ...options }
  );
  return data.products;
}

/** True when any variant is priced below its compare-at (an active discount). */
export function isDiscounted(product: Product): boolean {
  return product.variants.edges.some(({ node }) => {
    const compare = node.compareAtPrice
      ? parseFloat(node.compareAtPrice.amount)
      : 0;
    return compare > parseFloat(node.price.amount);
  });
}

/**
 * Fetch in-stock products that currently have a discount, aggregated across the
 * whole store (paginating until `max` are collected or the catalog is exhausted).
 */
export async function getInStockDiscountedProducts(options?: {
  max?: number;
  sortKey?: string;
  reverse?: boolean;
}): Promise<Product[]> {
  const max = options?.max ?? 48;
  const collected: Product[] = [];
  let after: string | undefined;
  let hasNextPage = true;

  while (hasNextPage && collected.length < max) {
    const conn = await getProducts({
      first: 250,
      after,
      query: "available_for_sale:true",
      sortKey: options?.sortKey ?? "BEST_SELLING",
      reverse: options?.reverse ?? false,
    });
    for (const { node } of conn.edges) {
      if (isDiscounted(node)) collected.push(node);
    }
    hasNextPage = conn.pageInfo.hasNextPage;
    after = conn.pageInfo.endCursor ?? undefined;
  }

  return collected.slice(0, max);
}

export async function getProductRecommendations(
  productId: string
): Promise<Product[]> {
  const data = await storefrontFetch<{
    productRecommendations: Product[];
  }>(GET_PRODUCT_RECOMMENDATIONS, { productId });
  return data.productRecommendations.filter((p) => p.availableForSale);
}

// ─── Faceted browsing (All Products) ─────────────────────────────────────────

export type ProductFacets = {
  vendors: string[];
  productTypes: string[];
  priceMin: number;
  priceMax: number;
};

/**
 * Scan the in-stock catalog once to derive the universe of filter options
 * (brands, product types, price bounds) shown on the All Products page.
 * Values are guaranteed to match real product data so filter queries never
 * return empty results.
 */
export async function getProductFacets(max = 250): Promise<ProductFacets> {
  const vendors = new Set<string>();
  const productTypes = new Set<string>();
  let priceMin = Infinity;
  let priceMax = 0;

  let after: string | undefined;
  let hasNextPage = true;
  let scanned = 0;

  while (hasNextPage && scanned < max) {
    const conn = await getProducts({
      first: 250,
      after,
      query: "available_for_sale:true",
      sortKey: "TITLE",
    });
    for (const { node } of conn.edges) {
      scanned++;
      if (node.vendor) vendors.add(node.vendor);
      if (node.productType) productTypes.add(node.productType);
      const min = parseFloat(node.priceRange.minVariantPrice.amount);
      const maxV = parseFloat(node.priceRange.maxVariantPrice.amount);
      if (Number.isFinite(min)) priceMin = Math.min(priceMin, min);
      if (Number.isFinite(maxV)) priceMax = Math.max(priceMax, maxV);
    }
    hasNextPage = conn.pageInfo.hasNextPage;
    after = conn.pageInfo.endCursor ?? undefined;
  }

  return {
    vendors: Array.from(vendors).sort((a, b) => a.localeCompare(b)),
    productTypes: Array.from(productTypes).sort((a, b) => a.localeCompare(b)),
    priceMin: Number.isFinite(priceMin) ? Math.floor(priceMin) : 0,
    priceMax: priceMax > 0 ? Math.ceil(priceMax) : 0,
  };
}

/**
 * Fetch one page of products for the All Products grid applying an optional
 * pre-built Shopify query string and (optionally) an on-sale post-filter.
 * Returns the raw connection cursor so callers can paginate ("Load More").
 */
export async function getProductsPage(options: {
  first: number;
  after?: string;
  sortKey: string;
  reverse: boolean;
  query?: string;
  onSaleOnly?: boolean;
}): Promise<{ products: Product[]; endCursor: string | null; hasNextPage: boolean }> {
  const conn = await getProducts({
    first: options.first,
    after: options.after,
    sortKey: options.sortKey,
    reverse: options.reverse,
    query: options.query,
  });
  let products = conn.edges.map((e) => e.node);
  if (options.onSaleOnly) products = products.filter(isDiscounted);
  return {
    products,
    endCursor: conn.pageInfo.endCursor,
    hasNextPage: conn.pageInfo.hasNextPage,
  };
}
