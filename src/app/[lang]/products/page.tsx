import type { Metadata } from "next";
import Link from "next/link";
import { getProductsPage, getProductFacets } from "@/lib/queries/products";
import ProductFilters, {
  ProductFilterChips,
  type FacetValue,
} from "@/components/ProductFilters";
import PaginatedProductGrid from "@/components/PaginatedProductGrid";
import {
  SORT_OPTIONS,
  parseProductFilters,
  resolveSort,
  buildProductsQuery,
} from "@/lib/product-filters";
import { loadMoreProducts } from "./actions";

export const metadata: Metadata = {
  title: "All Products",
  description: "Shop the full JNK Nutrition range of premium supplements.",
};

export const revalidate = 300;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = parseProductFilters(sp);
  const sort = resolveSort(SORT_OPTIONS, filters.sortLabel);

  const [facets, page] = await Promise.all([
    getProductFacets(),
    getProductsPage({
      first: 24,
      sortKey: sort.sortKey,
      reverse: sort.reverse,
      query: buildProductsQuery(filters),
      onSaleOnly: filters.onSale,
    }),
  ]);
  const products = page.products;

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

      <ProductFilterChips basePath="/products" filters={filters} />

      <div className="flex flex-col lg:flex-row gap-8">
        <ProductFilters
          basePath="/products"
          filters={filters}
          sortOptions={SORT_OPTIONS}
          vendors={vendorFacets}
          productTypes={typeFacets}
          resultCount={products.length}
        />

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {products.length > 0 ? (
            <PaginatedProductGrid
              key={JSON.stringify(filters)}
              initialProducts={products}
              initialCursor={page.endCursor}
              initialHasNextPage={page.hasNextPage}
              loadMore={loadMoreProducts.bind(null, filters)}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-12 text-center">
              <p className="text-lg font-bold text-[#0B0F14]">
                No products match your filters
              </p>
              <p className="mt-2 text-sm text-[#64748B]">
                Try removing a filter or{" "}
                <Link
                  href="/products"
                  className="font-semibold text-[#0B0F14] underline underline-offset-2 hover:text-[#F9D20F]"
                >
                  clear all
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
