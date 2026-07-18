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

type FetchedView = {
  key: string;
  products: Product[];
  cursor: string | null;
  hasNextPage: boolean;
  vendors: FacetValue[];
  productTypes: FacetValue[];
};

/**
 * Reacts to the URL's filter/sort query params on the client so the collection
 * page's Server Component never touches `searchParams` — that's what keeps
 * `/collections/[handle]` statically cacheable. The unfiltered case (the
 * overwhelming majority of visits) renders the server-provided data directly
 * with no extra fetch or state; only an actual filtered URL triggers a
 * client-side fetch, via the same Server Action pattern already used for
 * "Load More" pagination.
 *
 * `fetched` is only ever set from the fetch's resolution callback (never
 * synchronously in the effect body); the "loading" state is a pure
 * derivation of filterKey vs. fetched.key, not a separate setState call. See
 * ProductsBrowserClient for the same pattern applied to /products.
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

  const [fetched, setFetched] = useState<FetchedView | null>(null);
  const isPending = !isDefault && fetched?.key !== filterKey;

  useEffect(() => {
    if (!isPending) return;
    let active = true;
    getFilteredCollectionView(handle, filters, language).then((res) => {
      if (!active || !res) return;
      setFetched({
        key: filterKey,
        products: res.products,
        cursor: res.endCursor,
        hasNextPage: res.hasNextPage,
        vendors: res.vendors,
        productTypes: res.productTypes,
      });
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, isPending, handle, language]);

  const current: FetchedView =
    isDefault || fetched?.key !== filterKey
      ? {
          key: JSON.stringify(initialFilters),
          products: initialProducts,
          cursor: initialCursor,
          hasNextPage: initialHasNextPage,
          vendors: initialVendors,
          productTypes: initialProductTypes,
        }
      : fetched;

  return (
    <CollectionBrowserView
      handle={handle}
      filters={filters}
      vendors={current.vendors}
      productTypes={current.productTypes}
      products={current.products}
      cursor={current.cursor}
      hasNextPage={current.hasNextPage}
      discountOnly={discountOnly}
      isAggregateDeal={isAggregateDeal}
      isTypeCollection={isTypeCollection}
      loading={isPending}
      loadMore={loadMoreCollection.bind(null, handle, filters)}
    />
  );
}
