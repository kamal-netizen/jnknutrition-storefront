"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/queries/products";
import { loadMoreSearch } from "@/app/search/actions";

type Props = {
  initialProducts: Product[];
  initialCursor: string | null;
  initialHasNextPage: boolean;
  query: string;
  sortLabel: string;
  filters: string[];
};

export default function SearchGrid({
  initialProducts,
  initialCursor,
  initialHasNextPage,
  query,
  sortLabel,
  filters,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [loading, setLoading] = useState(false);

  async function handleLoadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await loadMoreSearch({
        query,
        sortLabel,
        filters,
        after: cursor,
      });
      setProducts((prev) => [...prev, ...res.products]);
      setCursor(res.endCursor);
      setHasNextPage(res.hasNextPage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md border-2 border-[#0B0F14] bg-[#0B0F14] px-8 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#F9D20F] hover:text-[#0B0F14] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
