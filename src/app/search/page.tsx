import type { Metadata } from "next";
import Link from "next/link";
import { searchProducts } from "@/lib/queries/search";
import type { ProductFilterInput } from "@/lib/queries/collections";
import SearchGrid from "@/components/SearchGrid";
import { SEARCH_PAGE_SIZE, SORT_OPTIONS } from "./constants";

export const metadata: Metadata = {
  title: "Search",
  description: "Search JNK Nutrition products.",
  robots: { index: false, follow: true },
};

type Props = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    filter?: string | string[];
  }>;
};

// Normalize the repeated `filter` query param into an array of JSON strings.
function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

// Build an href for the search page with a modified query string.
function buildHref(
  query: string,
  sortLabel: string,
  filters: string[]
): string {
  const params = new URLSearchParams();
  params.set("q", query);
  if (sortLabel !== SORT_OPTIONS[0].label) params.set("sort", sortLabel);
  for (const f of filters) params.append("filter", f);
  return `/search?${params.toString()}`;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, sort, filter } = await searchParams;
  const query = q?.trim() ?? "";

  const selectedFilters = toArray(filter);
  const selectedSort =
    SORT_OPTIONS.find((o) => o.label === sort) ?? SORT_OPTIONS[0];

  const productFilters: ProductFilterInput[] = selectedFilters
    .map((f) => {
      try {
        return JSON.parse(f) as ProductFilterInput;
      } catch {
        return null;
      }
    })
    .filter((f): f is ProductFilterInput => f !== null);

  const results = query
    ? await searchProducts(query, {
        first: SEARCH_PAGE_SIZE,
        sortKey: selectedSort.sortKey,
        reverse: selectedSort.reverse,
        productFilters: productFilters.length > 0 ? productFilters : undefined,
      })
    : null;
  const products = results?.edges.map((e) => e.node) ?? [];
  const facets = results?.productFilters ?? [];
  const hasActiveFilters = selectedFilters.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight">
        {query ? (
          <>
            Search: <span className="text-[#F9D20F]">{query}</span>
          </>
        ) : (
          "Search"
        )}
      </h1>

      {results && (
        <p className="mt-2 text-[#64748B]">
          {results.totalCount} {results.totalCount === 1 ? "result" : "results"}
        </p>
      )}

      {!query ? (
        <div className="mt-10 rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-10 text-center">
          <p className="text-[#64748B]">
            Enter a search term to find products.
          </p>
        </div>
      ) : (
        <div className="mt-10 flex flex-col lg:flex-row gap-8">
          {/* Filter / sort sidebar */}
          <aside className="lg:w-56 shrink-0 space-y-6">
            {/* Sort */}
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#F9D20F] mb-3">
                Sort By
              </h3>
              <div className="flex flex-col gap-2">
                {SORT_OPTIONS.map((option) => (
                  <Link
                    key={option.label}
                    href={buildHref(query, option.label, selectedFilters)}
                    className={`text-sm transition-colors ${
                      option.label === selectedSort.label
                        ? "text-[#0B0F14] font-semibold"
                        : "text-[#64748B] hover:text-[#0B0F14]"
                    }`}
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#F9D20F]">
                    Active
                  </h3>
                  <Link
                    href={buildHref(query, selectedSort.label, [])}
                    className="text-xs text-[#64748B] hover:text-[#0B0F14] underline"
                  >
                    Clear all
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {facets.flatMap((f) =>
                    f.values
                      .filter((v) => selectedFilters.includes(v.input))
                      .map((v) => (
                        <Link
                          key={v.id}
                          href={buildHref(
                            query,
                            selectedSort.label,
                            selectedFilters.filter((s) => s !== v.input)
                          )}
                          className="inline-flex items-center gap-1 rounded-full bg-[#0B0F14] px-3 py-1 text-xs text-white hover:bg-[#F9D20F] hover:text-[#0B0F14] transition-colors"
                        >
                          {v.label}
                          <span aria-hidden>×</span>
                        </Link>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* Facets */}
            {facets.map((facet) => {
              const values = facet.values.filter((v) => v.count > 0);
              if (values.length === 0) return null;
              return (
                <div
                  key={facet.id}
                  className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-5"
                >
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#F9D20F] mb-3">
                    {facet.label}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {values.map((value) => {
                      const isSelected = selectedFilters.includes(value.input);
                      const nextFilters = isSelected
                        ? selectedFilters.filter((s) => s !== value.input)
                        : [...selectedFilters, value.input];
                      return (
                        <Link
                          key={value.id}
                          href={buildHref(
                            query,
                            selectedSort.label,
                            nextFilters
                          )}
                          className={`flex items-center justify-between text-sm transition-colors ${
                            isSelected
                              ? "text-[#0B0F14] font-semibold"
                              : "text-[#64748B] hover:text-[#0B0F14]"
                          }`}
                        >
                          <span>{value.label}</span>
                          <span className="text-xs text-[#94A3B8]">
                            {value.count}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {products.length > 0 ? (
              <SearchGrid
                key={`${query}|${selectedSort.label}|${selectedFilters.join(",")}`}
                initialProducts={products}
                initialCursor={results?.pageInfo.endCursor ?? null}
                initialHasNextPage={results?.pageInfo.hasNextPage ?? false}
                query={query}
                sortLabel={selectedSort.label}
                filters={selectedFilters}
              />
            ) : (
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-10 text-center">
                <p className="text-[#64748B]">
                  No results for{" "}
                  <span className="text-[#0B0F14] font-semibold">
                    &quot;{query}&quot;
                  </span>
                  {hasActiveFilters
                    ? " with the selected filters. Try clearing filters."
                    : ". Try a different search term."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
