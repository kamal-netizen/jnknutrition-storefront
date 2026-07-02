"use client";

import { useState } from "react";
import type { Product, ProductVariant } from "@/lib/queries/products";
import ProductGallery from "@/components/ProductGallery";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";

type Props = {
  product: Product;
  recommendations: Product[];
  descriptionHtml: string;
};

export default function ProductDetails({ product, recommendations, descriptionHtml }: Props) {
  const images = product.images.edges.map((e) => e.node);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleVariantChange(variant: ProductVariant) {
    if (!variant.image) return;
    const idx = images.findIndex((img) => img.url === variant.image!.url);
    if (idx !== -1) setActiveIndex(idx);
  }

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <ProductGallery
          images={images}
          title={product.title}
          activeIndex={activeIndex}
          onActiveChange={setActiveIndex}
        />

        {/* Details */}
        <div>
          {product.vendor && (
            <p className="text-xs font-bold uppercase tracking-widest text-[#64748B] mb-2">
              {product.vendor}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight leading-tight">
            {product.title}
          </h1>

          <div className="mt-6">
            <AddToCart product={product} onVariantChange={handleVariantChange} />
          </div>

          {descriptionHtml && (
            <div className="mt-10 pt-8 border-t border-[#E2E8F0]">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#F9D20F] mb-4">
                Details
              </h2>
              <div
                className="prose prose-sm max-w-none text-[#64748B] [&_a]:text-[#F9D20F] [&_strong]:text-[#0B0F14]"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </div>
          )}
        </div>
      </div>

      {recommendations.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl md:text-3xl font-black text-[#0B0F14] uppercase tracking-tight mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recommendations.slice(0, 4).map((rec) => (
              <ProductCard key={rec.id} product={rec} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
