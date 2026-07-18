"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import CollectionBrowserView from "@/components/CollectionBrowserView";
import type { FacetValue } from "@/components/ProductFilters";
import { parseProductFilters, hasAnyActiveFilter, type ActiveFilters } from "@/lib/product-filters";
import type { Product } from "@/lib/queries/products";
import { loadMoreCollection, getFilteredCollectionView } from "@/app/[lang]/collections/[handle]/actions";

type Props = {
  handle: string;
  language?: string;
  initialFilters: ActiveFilters;
  initialProducts: Product[];
  initialCursor: string | null;
  initialHasNextPage: boolean;
  initialVendors: FacetValue[];
  initialProductTypes: FacetValue[];
  discountOnly: boolean;
  isAggregateDeal: boolean;
  isTypeCollection: boolean;
};

/**
 * Reacts to the URL's filter/sort query params on the client so the collection
 * page's Server Component never touches `searchParams` — that's what keeps
 * `/collections/[handle]` statically cacheable. See ProductsBrowserClient for
 * the same pattern applied to /products.
 */
export default function CollectionBrowserClient({
  handle,
  language,
  initialFilters,
  initialProducts,
  initialCursor,
  initialHasNextPage,
  initialVendors,
  initialProductTypes,
  discountOnly,
  isAggregateDeal,
  isTypeCollection,
}: Props) {
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseProductFilters(Object.fromEntries(searchParams.entries())),
    [searchParams]
  );
  // discountOnly collections render no filter sidebar, so their URL never
  // carries filter params — always treat them as "default".
  const isDefault = discountOnly || !hasAnyActiveFilter(filters);
  const filterKey = JSON.stringify(filters);

  const [state, setState] = useState(() => ({
    key: JSON.stringify(initialFilters),
    products: initialProducts,
    cursor: initialCursor,
    hasNextPage: initialHasNextPage,
    vendors: initialVendors,
    productTypes: initialProductTypes,
  }));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDefault) {
      setState({
        key: JSON.stringify(initialFilters),
        products: initialProducts,
        cursor: initialCursor,
        hasNextPage: initialHasNextPage,
        vendors: initialVendors,
        productTypes: initialProductTypes,
      });
      setLoading(false);
      return;
    }
    if (state.key === filterKey) return;
    let active = true;
    setLoading(true);
    getFilteredCollectionView(handle, filters, language).then((res) => {
      if (!active || !res) return;
      setState({
        key: filterKey,
        products: res.products,
        cursor: res.endCursor,
        hasNextPage: res.hasNextPage,
        vendors: res.vendors,
        productTypes: res.productTypes,
      });
      setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, isDefault, handle, language]);

  return (
    <CollectionBrowserView
      handle={handle}
      filters={filters}
      vendors={state.vendors}
      productTypes={state.productTypes}
      products={state.products}
      cursor={state.cursor}
      hasNextPage={state.hasNextPage}
      discountOnly={discountOnly}
      isAggregateDeal={isAggregateDeal}
      isTypeCollection={isTypeCollection}
      loading={loading}
      loadMore={loadMoreCollection.bind(null, handle, filters)}
    />
  );
}
