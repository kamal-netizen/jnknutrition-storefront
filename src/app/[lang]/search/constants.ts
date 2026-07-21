import type { SortOption } from "@/lib/product-filters";

export const SEARCH_PAGE_SIZE = 48;

// Search keeps its own set because RELEVANCE only exists on the search
// connection. `id` is the URL value, `label` is display-only — see SortOption.
export const SORT_OPTIONS: SortOption[] = [
  { id: "relevance", label: "Relevance", sortKey: "RELEVANCE", reverse: false },
  { id: "price-asc", label: "Price: Low to High", sortKey: "PRICE", reverse: false },
  { id: "price-desc", label: "Price: High to Low", sortKey: "PRICE", reverse: true },
];

export function resolveSort(id?: string): SortOption {
  if (!id) return SORT_OPTIONS[0];
  return (
    SORT_OPTIONS.find((o) => o.id === id) ??
    SORT_OPTIONS.find((o) => o.label === id) ??
    SORT_OPTIONS[0]
  );
}
