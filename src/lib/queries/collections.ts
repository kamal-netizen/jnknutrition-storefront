import { storefrontFetch } from "@/lib/shopify";
import type { Product, MoneyV2, ProductImage } from "./products";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Collection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ProductImage | null;
  seo: { title: string; description: string };
};

export type FilterValue = {
  id: string;
  label: string;
  count: number;
  input: string;
};

export type Filter = {
  id: string;
  label: string;
  type: string;
  values: FilterValue[];
};

// Shape accepted by Shopify's `ProductFilter` input object.
export type ProductFilterInput = {
  available?: boolean;
  variantOption?: { name: string; value: string };
  productType?: string;
  productVendor?: string;
  price?: { min?: number; max?: number };
  productMetafield?: { namespace: string; key: string; value: string };
  tag?: string;
};

export type CollectionWithProducts = Collection & {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    filters: Filter[];
    edges: { node: Product }[];
  };
};

export type CollectionConnection = {
  edges: { node: Collection }[];
};

// ─── Fragments ───────────────────────────────────────────────────────────────

const PRODUCT_FRAGMENT = `
  fragment CollectionProductFragment on Product {
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
`;

const COLLECTION_FRAGMENT = `
  fragment CollectionFragment on Collection {
    id title handle description
    image { url altText width height }
    seo { title description }
  }
`;

// ─── Queries ─────────────────────────────────────────────────────────────────

const GET_COLLECTION = `
  ${COLLECTION_FRAGMENT}
  ${PRODUCT_FRAGMENT}
  query GetCollection(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      ...CollectionFragment
      products(
        first: $first
        after: $after
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
      ) {
        pageInfo { hasNextPage endCursor }
        filters {
          id label type
          values { id label count input }
        }
        edges { node { ...CollectionProductFragment } }
      }
    }
  }
`;

const GET_COLLECTIONS = `
  ${COLLECTION_FRAGMENT}
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges { node { ...CollectionFragment } }
    }
  }
`;

// ─── Fetchers ────────────────────────────────────────────────────────────────

export async function getCollection(
  handle: string,
  options: {
    first?: number;
    after?: string;
    sortKey?: string;
    reverse?: boolean;
    filters?: ProductFilterInput[];
  } = {}
): Promise<CollectionWithProducts | null> {
  const data = await storefrontFetch<{
    collection: CollectionWithProducts | null;
  }>(GET_COLLECTION, { handle, first: 24, ...options });
  return data.collection;
}

export async function getCollections(first = 20): Promise<Collection[]> {
  const data = await storefrontFetch<{ collections: CollectionConnection }>(
    GET_COLLECTIONS,
    { first }
  );
  return data.collections.edges.map((e) => e.node);
}
