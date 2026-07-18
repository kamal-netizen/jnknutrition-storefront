import ProductCard from "@/components/ProductCard";
import ProductFilters, {
  ProductFilterChips,
  type FacetValue,
} from "@/components/ProductFilters";
import PaginatedProductGrid, {
  type LoadMoreResult,
} from "@/components/PaginatedProductGrid";
import { COLLECTION_SORT_OPTIONS, type ActiveFilters } from "@/lib/product-filters";
import type { Product } from "@/lib/queries/products";

const GRID_CLASS = "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6";
const SKELETON = Array.from({ length: 9 }, (_, i) => i);

type Props = {
  handle: string;
  filters: ActiveFilters;
  vendors: FacetValue[];
  productTypes: FacetValue[];
  products: Product[];
  cursor: string | null;
  hasNextPage: boolean;
  discountOnly: boolean;
  isAggregateDeal: boolean;
  isTypeCollection: boolean;
  loading: boolean;
  loadMore: (after: string) => Promise<LoadMoreResult>;
};

/**
 * Pure presentational shell for a collection's filter sidebar + product grid —
 * shared between the server-rendered default (unfiltered) view and the
 * client-hydrated view that reacts to `?brand=/&type=/...` query params. Used
 * from both places so the two are pixel-identical for the unfiltered case,
 * with zero duplicated markup. Mirrors ProductsBrowserView's role for /products.
 */
export default function CollectionBrowserView({
  handle,
  filters,
  vendors,
  productTypes,
  products,
  cursor,
  hasNextPage,
  discountOnly,
  isAggregateDeal,
  isTypeCollection,
  loading,
  loadMore,
}: Props) {
  const basePath = `/collections/${handle}`;
  const usesFixedGrid = discountOnly || isAggregateDeal || isTypeCollection;

  return (
    <>
      {!discountOnly && <ProductFilterChips basePath={basePath} filters={filters} />}

      <div className="flex flex-col lg:flex-row gap-8">
        {!discountOnly && (
          <ProductFilters
            basePath={basePath}
            filters={filters}
            sortOptions={COLLECTION_SORT_OPTIONS}
            vendors={vendors}
            productTypes={productTypes}
            resultCount={products.length}
          />
        )}

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className={GRID_CLASS}>
              {SKELETON.map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-2xl bg-[#F1F5F9] animate-pulse"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            usesFixedGrid ? (
              <div className={GRID_CLASS}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <PaginatedProductGrid
                key={`${handle}-${JSON.stringify(filters)}`}
                initialProducts={products}
                initialCursor={cursor}
                initialHasNextPage={hasNextPage}
                loadMore={loadMore}
                gridClassName={GRID_CLASS}
              />
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-12 text-center">
              <p className="text-lg font-bold text-[#0B0F14]">
                No products match your filters
              </p>
              <p className="mt-2 text-sm text-[#64748B]">
                Try removing a filter to see more products.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
