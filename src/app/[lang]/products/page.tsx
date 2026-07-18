import type { Metadata } from "next";
import { Suspense } from "react";
import { getProductsPage, getProductFacets } from "@/lib/queries/products";
import type { FacetValue } from "@/components/ProductFilters";
import ProductsBrowserView from "@/components/ProductsBrowserView";
import ProductsBrowserClient from "@/components/ProductsBrowserClient";
import {
  SORT_OPTIONS,
  resolveSort,
  buildProductsQuery,
  type ActiveFilters,
} from "@/lib/product-filters";
import { loadMoreProducts } from "./actions";

export const metadata: Metadata = {
  title: "All Products",
  description: "Shop the full JNK Nutrition range of premium supplements.",
};

export const revalidate = 300;

// The unfiltered, default-sort view — used both for the initial server
// render and as the data fed to ProductsBrowserClient for hydration.
const DEFAULT_FILTERS: ActiveFilters = {
  includeSoldOut: false,
  vendors: [],
  productTypes: [],
  price: null,
  onSale: false,
  sortLabel: "",
};

export default async function ProductsPage() {
  // No `searchParams` read here — that's what keeps this route statically
  // cacheable (ISR, revalidate=300) instead of forced-dynamic on every visit.
  // Filter/sort interactions are handled client-side in ProductsBrowserClient;
  // see its file comment for why.
  const sort = resolveSort(SORT_OPTIONS, DEFAULT_FILTERS.sortLabel);

  const [facets, page] = await Promise.all([
    getProductFacets(),
    getProductsPage({
      first: 24,
      sortKey: sort.sortKey,
      reverse: sort.reverse,
      query: buildProductsQuery(DEFAULT_FILTERS),
      onSaleOnly: DEFAULT_FILTERS.onSale,
    }),
  ]);

  const vendorFacets: FacetValue[] = facets.vendors.map((v) => ({
    value: v,
    label: v,
  }));
  const typeFacets: FacetValue[] = facets.productTypes.map((t) => ({
    value: t,
    label: t,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      {/* Header banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#E2E8F0] bg-gradient-to-br from-[#0B0F14] via-[#111826] to-[#0B0F14] px-6 py-10 md:px-12 md:py-14">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#F9D20F] opacity-20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-[#F9D20F] opacity-10 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#F9D20F]">
            The Full Range
          </p>
          <h1 className="mt-2 text-4xl md:text-6xl font-black uppercase leading-none tracking-tight text-white">
            All Products
          </h1>
          <p className="mt-3 max-w-xl text-sm md:text-base text-[#94A3B8]">
            Premium supplements from the brands athletes trust. Filter by brand,
            category, price and more to find exactly what you need.
          </p>
        </div>
      </div>

      {/*
        Suspense fallback = the plain server-rendered default view (identical
        markup to what the client renders for the no-filter case, via the
        shared ProductsBrowserView). Only URLs that actually carry filter
        params see the client fetch/loading state that follows.
      */}
      <Suspense
        fallback={
          <ProductsBrowserView
            basePath="/products"
            filters={DEFAULT_FILTERS}
            vendorFacets={vendorFacets}
            typeFacets={typeFacets}
            products={page.products}
            cursor={page.endCursor}
            hasNextPage={page.hasNextPage}
            loading={false}
            loadMore={loadMoreProducts.bind(null, DEFAULT_FILTERS)}
          />
        }
      >
        <ProductsBrowserClient
          initialFilters={DEFAULT_FILTERS}
          initialProducts={page.products}
          initialCursor={page.endCursor}
          initialHasNextPage={page.hasNextPage}
          vendorFacets={vendorFacets}
          typeFacets={typeFacets}
        />
      </Suspense>
    </div>
  );
}
