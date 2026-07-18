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
  const sort = resolveSort(SORT_OPTIONS, filters.sortLabel);
  return getProductsPage({
    first: PAGE_SIZE,
    after,
    sortKey: sort.sortKey,
    reverse: sort.reverse,
    query: buildProductsQuery(filters),
    onSaleOnly: filters.onSale,
  });
}
