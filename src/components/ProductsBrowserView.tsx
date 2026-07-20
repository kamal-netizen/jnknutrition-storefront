import Link from "@/components/LocaleLink";
import ProductFilters, {
  ProductFilterChips,
  type FacetValue,
} from "@/components/ProductFilters";
import PaginatedProductGrid, {
  type LoadMoreResult,
} from "@/components/PaginatedProductGrid";
import { SORT_OPTIONS, type ActiveFilters } from "@/lib/product-filters";
import type { Product } from "@/lib/queries/products";

const GRID_SKELETON = Array.from({ length: 12 }, (_, i) => i);

type Props = {
  basePath: string;
  filters: ActiveFilters;
  vendorFacets: FacetValue[];
  typeFacets: FacetValue[];
  products: Product[];
  cursor: string | null;
  hasNextPage: boolean;
  loading: boolean;
  loadMore: (after: string) => Promise<LoadMoreResult>;
};

/**
 * Pure presentational shell for the All Products browse UI — shared between the
 * server-rendered default (unfiltered) view and the client-hydrated view that
 * reacts to `?brand=/&type=/...` query params. Keeping this as one component
 * used from both places guarantees the two are pixel-identical for the
 * (overwhelmingly common) unfiltered case, with zero duplicated markup.
 */
export default function ProductsBrowserView({
  basePath,
  filters,
  vendorFacets,
  typeFacets,
  products,
  cursor,
  hasNextPage,
  loading,
  loadMore,
}: Props) {
  return (
    <>
      <ProductFilterChips basePath={basePath} filters={filters} />

      <div className="flex flex-col lg:flex-row gap-8">
        <ProductFilters
          basePath={basePath}
          filters={filters}
          sortOptions={SORT_OPTIONS}
          vendors={vendorFacets}
          productTypes={typeFacets}
          resultCount={products.length}
        />

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {GRID_SKELETON.map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-2xl bg-[#F1F5F9] animate-pulse"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <PaginatedProductGrid
              key={JSON.stringify(filters)}
              initialProducts={products}
              initialCursor={cursor}
              initialHasNextPage={hasNextPage}
              loadMore={loadMore}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-12 text-center">
              <p className="text-lg font-bold text-[#0B0F14]">
                No products match your filters
              </p>
              <p className="mt-2 text-sm text-[#64748B]">
                Try removing a filter or{" "}
                <Link
                  href={basePath}
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
    </>
  );
}
