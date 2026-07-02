import { storefrontFetch } from "@/lib/shopify";
import type { Product } from "./products";
import type { Filter, ProductFilterInput } from "./collections";

// ─── Types ───────────────────────────────────────────────────────────────────

// Lightweight shape used by predictive search dropdown.
export type PredictiveProduct = {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: { edges: { node: { url: string; altText: string | null } }[] };
};

export type SearchCollection = {
  id: string;
  title: string;
  handle: string;
};

export type SearchPage = {
  id: string;
  title: string;
  handle: string;
};

// Full search results return complete Product nodes (for ProductCard).
export type SearchResults = {
  totalCount: number;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  productFilters: Filter[];
  edges: { node: Product }[];
};

export type PredictiveSearchResults = {
  products: PredictiveProduct[];
  collections: SearchCollection[];
  pages: SearchPage[];
};

// ─── Queries ─────────────────────────────────────────────────────────────────

const SEARCH_PRODUCTS = `
  query SearchProducts(
    $query: String!
    $first: Int!
    $after: String
    $sortKey: SearchSortKeys
    $reverse: Boolean
    $productFilters: [ProductFilter!]
    $unavailableProducts: SearchUnavailableProductsType
  ) {
    search(
      query: $query
      first: $first
      after: $after
      types: [PRODUCT]
      sortKey: $sortKey
      reverse: $reverse
      productFilters: $productFilters
      unavailableProducts: $unavailableProducts
    ) {
      totalCount
      pageInfo { hasNextPage endCursor }
      productFilters {
        id label type
        values { id label count input }
      }
      edges {
        node {
          ... on Product {
            id title handle description descriptionHtml
            tags vendor productType availableForSale
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            images(first: 10) { edges { node { url altText width height } } }
            variants(first: 100) {
              edges {
                node {
                  id title availableForSale
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  selectedOptions { name value }
                }
              }
            }
            seo { title description }
          }
        }
      }
    }
  }
`;

const PREDICTIVE_SEARCH = `
  query PredictiveSearch($query: String!) {
    predictiveSearch(query: $query, types: [PRODUCT, COLLECTION, PAGE]) {
      products {
        id title handle availableForSale
        priceRange { minVariantPrice { amount currencyCode } }
        images(first: 1) { edges { node { url altText } } }
      }
      collections { id title handle }
      pages { id title handle }
    }
  }
`;

// ─── Fetchers ────────────────────────────────────────────────────────────────

export async function searchProducts(
  query: string,
  options: {
    first?: number;
    after?: string;
    sortKey?: string;
    reverse?: boolean;
    productFilters?: ProductFilterInput[];
    unavailableProducts?: "SHOW" | "HIDE" | "LAST";
  } = {}
): Promise<SearchResults> {
  const data = await storefrontFetch<{ search: SearchResults }>(
    SEARCH_PRODUCTS,
    { query, first: 24, ...options }
  );
  return data.search;
}

export async function predictiveSearch(
  query: string
): Promise<PredictiveSearchResults> {
  const data = await storefrontFetch<{
    predictiveSearch: PredictiveSearchResults;
  }>(PREDICTIVE_SEARCH, { query });
  return {
    ...data.predictiveSearch,
    products: data.predictiveSearch.products.filter((p) => p.availableForSale),
  };
}
