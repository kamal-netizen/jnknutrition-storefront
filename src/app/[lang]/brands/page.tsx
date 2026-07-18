import type { Metadata } from "next";
import { getCollections } from "@/lib/queries/collections";
import { getProductFacets } from "@/lib/queries/products";
import BrandsDirectory from "@/components/BrandsDirectory";

export const metadata: Metadata = {
  title: "Brands",
  description: "Browse all brands available at JNK Nutrition.",
};

export const revalidate = 300;

// Normalise a name to compare collection titles against product vendors.
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export default async function BrandsPage() {
  const [collections, facets] = await Promise.all([
    getCollections(250),
    getProductFacets(2000),
  ]);

  const vendorKeys = new Set(facets.vendors.map(normalize));
  const brands = collections.filter((c) => vendorKeys.has(normalize(c.title)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-4xl md:text-5xl font-black text-[#0B0F14] uppercase tracking-tight mb-3">
        Brands
      </h1>
      <p className="mb-10 max-w-2xl text-[#64748B]">
        Shop 100% authentic supplements from the world&rsquo;s top brands.
      </p>

      {brands.length > 0 ? (
        <BrandsDirectory collections={brands} />
      ) : (
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-10 text-center">
          <p className="text-[#64748B]">No brands found.</p>
        </div>
      )}
    </div>
  );
}

