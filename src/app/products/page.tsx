import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/queries/products";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "All Products",
  description: "Shop the full JNK Nutrition range of premium supplements.",
};

export const revalidate = 300;

const SORT_OPTIONS = [
  { label: "Best Selling", sortKey: "BEST_SELLING", reverse: false },
  { label: "Newest", sortKey: "CREATED_AT", reverse: true },
  { label: "Price: Low to High", sortKey: "PRICE", reverse: false },
  { label: "Price: High to Low", sortKey: "PRICE", reverse: true },
  { label: "A–Z", sortKey: "TITLE", reverse: false },
];

type Props = {
  searchParams: Promise<{ sort?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const { sort } = await searchParams;
  const selected =
    SORT_OPTIONS.find((o) => o.label === sort) ?? SORT_OPTIONS[0];

  const data = await getProducts({
    first: 48,
    sortKey: selected.sortKey,
    reverse: selected.reverse,
  });
  const products = data.edges.map((e) => e.node);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0B0F14] uppercase tracking-tight">
            All Products
          </h1>
          <p className="mt-2 text-[#64748B]">{products.length} products</p>
        </div>

        {/* Sort */}
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <Link
              key={option.label}
              href={`/products?sort=${encodeURIComponent(option.label)}`}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                option.label === selected.label
                  ? "bg-[#F9D20F] text-[#0B0F14] border-[#F9D20F]"
                  : "bg-[#F5F7FA] text-[#64748B] border-[#E2E8F0] hover:border-[#F9D20F]"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-10 text-center">
          <p className="text-[#64748B]">
            No products found. Ensure products are published to the{" "}
            <span className="text-[#F9D20F] font-semibold">Headless</span> sales
            channel in Shopify admin.
          </p>
        </div>
      )}
    </div>
  );
}
