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

/**
 * Reacts to the URL's filter/sort query params on the client so the Server
 * Component page above it never touches `searchParams` — that's what keeps
 * `/products` statically cacheable. The unfiltered case (the overwhelming
 * majority of visits) renders the server-provided data immediately with no
 * extra fetch; only an actual filtered URL triggers a client-side fetch of
 * the correctly-filtered page, via the same load-more Server Action pattern
 * already used for pagination.
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

  const [result, setResult] = useState<{
    key: string;
    products: Product[];
    cursor: string | null;
    hasNextPage: boolean;
  }>({
    key: JSON.stringify(initialFilters),
    products: initialProducts,
    cursor: initialCursor,
    hasNextPage: initialHasNextPage,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDefault) {
      setResult({
        key: JSON.stringify(initialFilters),
        products: initialProducts,
        cursor: initialCursor,
        hasNextPage: initialHasNextPage,
      });
      setLoading(false);
      return;
    }
    if (result.key === filterKey) return;
    let active = true;
    setLoading(true);
    getFilteredProductsFirstPage(filters).then((res: LoadMoreResult) => {
      if (!active) return;
      setResult({
        key: filterKey,
        products: res.products,
        cursor: res.endCursor,
        hasNextPage: res.hasNextPage,
      });
      setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, isDefault]);

  return (
    <ProductsBrowserView
      basePath="/products"
      filters={filters}
      vendorFacets={vendorFacets}
      typeFacets={typeFacets}
      products={result.products}
      cursor={result.cursor}
      hasNextPage={result.hasNextPage}
      loading={loading}
      loadMore={loadMoreProducts.bind(null, filters)}
    />
  );
}
