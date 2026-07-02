import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection, getCollections } from "@/lib/queries/collections";
import { getInStockDiscountedProducts } from "@/lib/queries/products";
import ProductCard from "@/components/ProductCard";

export const revalidate = 300;

// Collections that should ignore their curated (often stale) product list and
// instead surface every in-stock, discounted product across the whole store.
const DISCOUNT_ONLY_HANDLES = new Set(["super-saver"]);

// Map collection sort keys to the equivalent ProductSortKeys used store-wide.
const PRODUCT_SORT_KEY: Record<string, string> = {
  COLLECTION_DEFAULT: "BEST_SELLING",
  BEST_SELLING: "BEST_SELLING",
  CREATED: "CREATED_AT",
  PRICE: "PRICE",
};

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ sort?: string; available?: string }>;
};

const SORT_OPTIONS = [
  { label: "Featured", sortKey: "COLLECTION_DEFAULT", reverse: false },
  { label: "Best Selling", sortKey: "BEST_SELLING", reverse: false },
  { label: "Newest", sortKey: "CREATED", reverse: true },
  { label: "Price: Low to High", sortKey: "PRICE", reverse: false },
  { label: "Price: High to Low", sortKey: "PRICE", reverse: true },
];

export async function generateStaticParams() {
  const collections = await getCollections(50);
  return collections.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle, { first: 1 });
  if (!collection) return { title: "Collection Not Found" };
  return {
    title: collection.seo.title || collection.title,
    description: collection.seo.description || collection.description,
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle } = await params;
  const { sort, available } = await searchParams;

  const selectedSort =
    SORT_OPTIONS.find((o) => o.label === sort) ?? SORT_OPTIONS[0];

  const discountOnly = DISCOUNT_ONLY_HANDLES.has(handle);

  const filters = available === "true" ? [{ available: true }] : undefined;

  const collection = await getCollection(handle, {
    first: 48,
    sortKey: selectedSort.sortKey,
    reverse: selectedSort.reverse,
    filters,
  });

  if (!collection) notFound();

  // Deal collections aggregate live in-stock discounted products store-wide
  // instead of relying on the (often stale) curated collection list.
  const products = discountOnly
    ? await getInStockDiscountedProducts({
        max: 48,
        sortKey: PRODUCT_SORT_KEY[selectedSort.sortKey] ?? "BEST_SELLING",
        reverse: selectedSort.reverse,
      })
    : collection.products.edges.map((e) => e.node);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-[#0B0F14] uppercase tracking-tight">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="mt-3 text-[#64748B] max-w-2xl">
            {collection.description}
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter sidebar */}
        <aside className="lg:w-56 shrink-0 space-y-6">
          {!discountOnly && (
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#F9D20F] mb-3">
                Availability
              </h3>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/collections/${handle}?sort=${encodeURIComponent(selectedSort.label)}`}
                  className={`text-sm transition-colors ${
                    available !== "true"
                      ? "text-[#0B0F14] font-semibold"
                      : "text-[#64748B] hover:text-[#0B0F14]"
                  }`}
                >
                  All Products
                </Link>
                <Link
                  href={`/collections/${handle}?sort=${encodeURIComponent(selectedSort.label)}&available=true`}
                  className={`text-sm transition-colors ${
                    available === "true"
                      ? "text-[#0B0F14] font-semibold"
                      : "text-[#64748B] hover:text-[#0B0F14]"
                  }`}
                >
                  In Stock Only
                </Link>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#F9D20F] mb-3">
              Sort By
            </h3>
            <div className="flex flex-col gap-2">
              {SORT_OPTIONS.map((option) => (
                <Link
                  key={option.label}
                  href={`/collections/${handle}?sort=${encodeURIComponent(option.label)}${available === "true" ? "&available=true" : ""}`}
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
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <p className="text-sm text-[#64748B] mb-4">{products.length} products</p>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-10 text-center">
              <p className="text-[#64748B]">No products in this collection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
