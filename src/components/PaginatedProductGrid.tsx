"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/queries/products";
import { useDict } from "@/lib/locale-context";

export type LoadMoreResult = {
  products: Product[];
  endCursor: string | null;
  hasNextPage: boolean;
};

type Props = {
  initialProducts: Product[];
  initialCursor: string | null;
  initialHasNextPage: boolean;
  loadMore: (after: string) => Promise<LoadMoreResult>;
  gridClassName?: string;
};

const DEFAULT_GRID =
  "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6";

export default function PaginatedProductGrid({
  initialProducts,
  initialCursor,
  initialHasNextPage,
  loadMore,
  gridClassName,
}: Props) {
  const c = useDict().common;
  const [products, setProducts] = useState(initialProducts);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [loading, setLoading] = useState(false);

  async function handleLoadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await loadMore(cursor);
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...res.products.filter((p) => !seen.has(p.id))];
      });
      setCursor(res.endCursor);
      setHasNextPage(res.hasNextPage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className={gridClassName ?? DEFAULT_GRID}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full border-2 border-[#0B0F14] bg-[#0B0F14] px-10 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#F9D20F] hover:text-[#0B0F14] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? c.loading : c.loadMore}
          </button>
        </div>
      )}
    </div>
  );
}
