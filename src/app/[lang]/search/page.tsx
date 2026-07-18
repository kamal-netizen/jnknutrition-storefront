import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { searchProducts } from "@/lib/queries/search";
import type { ProductFilterInput } from "@/lib/queries/collections";
import SearchGrid from "@/components/SearchGrid";
import SearchFilters from "@/components/SearchFilters";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight">
        {query ? (
          <>
            Search:{" "}
            <span className="rounded bg-[#FFF2B8] px-1.5 text-[#0B0F14]">
              {query}
            </span>
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
        <div className="mt-6 lg:mt-10 flex flex-col lg:flex-row gap-8">
          <SearchFilters
            query={query}
            sortLabel={selectedSort.label}
            selectedFilters={selectedFilters}
            facets={facets}
            resultCount={results?.totalCount ?? 0}
          />

          {/* Filter / sort sidebar */}
          <aside className="hidden lg:block lg:w-56 shrink-0 space-y-6">
            {/* Sort */}
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#0B0F14] mb-3">
                Sort By
              </h3>
              <div className="flex flex-col gap-1">
                {SORT_OPTIONS.map((option) => {
                  const isSelected = option.label === selectedSort.label;
                  return (
                    <Link
                      key={option.label}
                      href={buildHref(query, option.label, selectedFilters)}
                      className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                        isSelected
                          ? "bg-white font-semibold text-[#0B0F14]"
                          : "text-[#64748B] hover:text-[#0B0F14]"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          isSelected ? "border-[#F9D20F]" : "border-[#CBD5E1]"
                        }`}
                      >
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-[#F9D20F]" />
                        )}
                      </span>
                      {option.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0B0F14]">
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
              // Dedupe by input — Shopify can return repeated facet values,
              // which would otherwise produce duplicate React keys.
              const seen = new Set<string>();
              const values = facet.values.filter((v) => {
                if (v.count <= 0 || seen.has(v.input)) return false;
                seen.add(v.input);
                return true;
              });
              if (values.length === 0) return null;
              return (
                <div
                  key={facet.id}
                  className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-5"
                >
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0B0F14] mb-3">
                    {facet.label}
                  </h3>
                  <div className="flex flex-col gap-0.5">
                    {values.map((value) => {
                      const isSelected = selectedFilters.includes(value.input);
                      const nextFilters = isSelected
                        ? selectedFilters.filter((s) => s !== value.input)
                        : [...selectedFilters, value.input];
                      return (
                        <Link
                          key={value.input}
                          href={buildHref(
                            query,
                            selectedSort.label,
                            nextFilters
                          )}
                          className="group flex items-center justify-between gap-2 py-1.5 text-sm"
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                isSelected
                                  ? "border-[#F9D20F] bg-[#F9D20F] text-[#0B0F14]"
                                  : "border-[#CBD5E1] bg-white group-hover:border-[#F9D20F]"
                              }`}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3" strokeWidth={3} />
                              )}
                            </span>
                            <span
                              className={`truncate transition-colors ${
                                isSelected
                                  ? "font-semibold text-[#0B0F14]"
                                  : "text-[#475569] group-hover:text-[#0B0F14]"
                              }`}
                            >
                              {value.label}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs text-[#94A3B8]">
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
          <div className="flex-1 min-w-0">
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
