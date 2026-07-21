"use server";

import { searchProducts } from "@/lib/queries/search";
import type { Product } from "@/lib/queries/products";
import type { ProductFilterInput } from "@/lib/queries/collections";
import { resolveSort, SEARCH_PAGE_SIZE } from "./constants";

export type LoadMoreResult = {
  products: Product[];
  endCursor: string | null;
  hasNextPage: boolean;
};

export async function loadMoreSearch(args: {
  query: string;
  sortId?: string;
  filters: string[];
  after: string;
}): Promise<LoadMoreResult> {
  const sort = resolveSort(args.sortId);

  const productFilters: ProductFilterInput[] = args.filters
    .map((f) => {
      try {
        return JSON.parse(f) as ProductFilterInput;
      } catch {
        return null;
      }
    })
    .filter((f): f is ProductFilterInput => f !== null);

  const results = await searchProducts(args.query, {
    first: SEARCH_PAGE_SIZE,
    after: args.after,
    sortKey: sort.sortKey,
    reverse: sort.reverse,
    productFilters: productFilters.length > 0 ? productFilters : undefined,
  });

  return {
    products: results.edges.map((e) => e.node),
    endCursor: results.pageInfo.endCursor,
    hasNextPage: results.pageInfo.hasNextPage,
  };
}
