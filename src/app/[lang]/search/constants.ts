export const SEARCH_PAGE_SIZE = 48;

export const SORT_OPTIONS = [
  { label: "Relevance", sortKey: "RELEVANCE", reverse: false },
  { label: "Price: Low to High", sortKey: "PRICE", reverse: false },
  { label: "Price: High to Low", sortKey: "PRICE", reverse: true },
];

export function resolveSort(label?: string) {
  return SORT_OPTIONS.find((o) => o.label === label) ?? SORT_OPTIONS[0];
}
