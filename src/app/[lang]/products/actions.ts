"use server";

import { getProductsPage } from "@/lib/queries/products";
import {
  SORT_OPTIONS,
  resolveSort,
  buildProductsQuery,
  type ActiveFilters,
} from "@/lib/product-filters";
import type { LoadMoreResult } from "@/components/PaginatedProductGrid";

const PAGE_SIZE = 24;

export async function loadMoreProducts(
  filters: ActiveFilters,
  after: string
): Promise<LoadMoreResult> {
  const sort = resolveSort(SORT_OPTIONS, filters.sortId);
  return getProductsPage({
    first: PAGE_SIZE,
    after,
    sortKey: sort.sortKey,
    reverse: sort.reverse,
    query: buildProductsQuery(filters),
    onSaleOnly: filters.onSale,
  });
}

/**
 * Fetch the first page of products for a given filter/sort combination.
 * Used client-side (see ProductsBrowserClient) when the URL carries filters,
 * since the page itself no longer reads `searchParams` server-side.
 */
export async function getFilteredProductsFirstPage(
  filters: ActiveFilters
): Promise<LoadMoreResult> {
  const sort = resolveSort(SORT_OPTIONS, filters.sortId);
  return getProductsPage({
    first: PAGE_SIZE,
    sortKey: sort.sortKey,
    reverse: sort.reverse,
    query: buildProductsQuery(filters),
    onSaleOnly: filters.onSale,
  });
}
