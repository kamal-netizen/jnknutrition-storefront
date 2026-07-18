"use server";

import { getCollectionProductsPage } from "@/lib/queries/collections";
import {
  getCollectionProductsView,
  type CollectionProductsView,
} from "@/lib/collection-products";
import {
  COLLECTION_SORT_OPTIONS,
  resolveSort,
  toShopifyFilters,
  productIsDiscounted,
  type ActiveFilters,
} from "@/lib/product-filters";
import type { LoadMoreResult } from "@/components/PaginatedProductGrid";

const PAGE_SIZE = 24;

export async function loadMoreCollection(
  handle: string,
  filters: ActiveFilters,
  after: string
): Promise<LoadMoreResult> {
  const sort = resolveSort(COLLECTION_SORT_OPTIONS, filters.sortLabel);
  const page = await getCollectionProductsPage(handle, {
    first: PAGE_SIZE,
    after,
    sortKey: sort.sortKey,
    reverse: sort.reverse,
    filters: toShopifyFilters(filters),
  });
  if (!page) return { products: [], endCursor: null, hasNextPage: false };

  const products = filters.onSale
    ? page.products.filter(productIsDiscounted)
    : page.products;

  return {
    products,
    endCursor: page.endCursor,
    hasNextPage: page.hasNextPage,
  };
}

export type FilteredCollectionResult = Pick<
  CollectionProductsView,
  "products" | "vendors" | "productTypes" | "discountOnly" | "isAggregateDeal" | "isTypeCollection"
> & { endCursor: string | null; hasNextPage: boolean };

/**
 * Resolve a collection's product listing for an arbitrary filter/sort state.
 * Called client-side (see CollectionBrowserClient) when the URL carries
 * filters, since the page itself no longer reads `searchParams` server-side.
 */
export async function getFilteredCollectionView(
  handle: string,
  filters: ActiveFilters,
  language?: string
): Promise<FilteredCollectionResult | null> {
  const view = await getCollectionProductsView(handle, filters, language);
  if (!view) return null;
  return {
    products: view.products,
    vendors: view.vendors,
    productTypes: view.productTypes,
    discountOnly: view.discountOnly,
    isAggregateDeal: view.isAggregateDeal,
    isTypeCollection: view.isTypeCollection,
    endCursor: view.collection.products.pageInfo.endCursor,
    hasNextPage: view.collection.products.pageInfo.hasNextPage,
  };
}
