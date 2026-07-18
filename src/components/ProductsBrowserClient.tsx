"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductsBrowserView from "@/components/ProductsBrowserView";
import type { FacetValue } from "@/components/ProductFilters";
import type { LoadMoreResult } from "@/components/PaginatedProductGrid";
import {
  parseProductFilters,
  hasAnyActiveFilter,
  type ActiveFilters,
} from "@/lib/product-filters";
import type { Product } from "@/lib/queries/products";
import { loadMoreProducts, getFilteredProductsFirstPage } from "@/app/[lang]/products/actions";

type Props = {
  initialFilters: ActiveFilters;
  initialProducts: Product[];
  initialCursor: string | null;
  initialHasNextPage: boolean;
  vendorFacets: FacetValue[];
  typeFacets: FacetValue[];
};

type FetchedPage = {
  key: string;
  products: Product[];
  cursor: string | null;
  hasNextPage: boolean;
};

/**
 * Reacts to the URL's filter/sort query params on the client so the Server
 * Component page above it never touches `searchParams` — that's what keeps
 * `/products` statically cacheable. The unfiltered case (the overwhelming
 * majority of visits) renders the server-provided data directly with no
 * extra fetch or state; only an actual filtered URL triggers a client-side
 * fetch of the correctly-filtered page, via the same load-more Server Action
 * pattern already used for pagination.
 *
 * `fetched` is only ever set from the fetch's resolution callback (never
 * synchronously in the effect body); the "loading" state is a pure
 * derivation of filterKey vs. fetched.key, not a separate setState call.
 */
export default function ProductsBrowserClient({
  initialFilters,
  initialProducts,
  initialCursor,
  initialHasNextPage,
  vendorFacets,
  typeFacets,
}: Props) {
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseProductFilters(Object.fromEntries(searchParams.entries())),
    [searchParams]
  );
  const isDefault = !hasAnyActiveFilter(filters);
  const filterKey = JSON.stringify(filters);

  const [fetched, setFetched] = useState<FetchedPage | null>(null);
  const isPending = !isDefault && fetched?.key !== filterKey;

  useEffect(() => {
    if (!isPending) return;
    let active = true;
    getFilteredProductsFirstPage(filters).then((res: LoadMoreResult) => {
      if (!active) return;
      setFetched({
        key: filterKey,
        products: res.products,
        cursor: res.endCursor,
        hasNextPage: res.hasNextPage,
      });
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, isPending]);

  const current: FetchedPage =
    isDefault || fetched?.key !== filterKey
      ? { key: JSON.stringify(initialFilters), products: initialProducts, cursor: initialCursor, hasNextPage: initialHasNextPage }
      : fetched;

  return (
    <ProductsBrowserView
      basePath="/products"
      filters={filters}
      vendorFacets={vendorFacets}
      typeFacets={typeFacets}
      products={current.products}
      cursor={current.cursor}
      hasNextPage={current.hasNextPage}
      loading={isPending}
      loadMore={loadMoreProducts.bind(null, filters)}
    />
  );
}
