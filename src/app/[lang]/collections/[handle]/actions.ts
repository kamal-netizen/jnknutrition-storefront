"use server";

import { getCollectionProductsPage } from "@/lib/queries/collections";
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
