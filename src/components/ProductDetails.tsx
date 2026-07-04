"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Truck,
  ShieldCheck,
  BadgeCheck,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import type { Product, ProductVariant } from "@/lib/queries/products";
import ProductGallery from "@/components/ProductGallery";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";
import { PRODUCT_FAQ } from "@/lib/product-faq";

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
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-[#64748B]">
          <li>
            <Link href="/" className="hover:text-[#0B0F14] transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
          <li>
            <Link
              href="/products"
              className="hover:text-[#0B0F14] transition-colors"
            >
              Products
            </Link>
          </li>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
          <li>
            <span className="text-[#0B0F14] line-clamp-1" aria-current="page">
              {product.title}
            </span>
          </li>
        </ol>
      </nav>

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

          {/* Trust / benefit strip */}
          <ul className="mt-6 grid grid-cols-2 gap-3">
            <li className="flex items-center gap-2 text-sm text-[#64748B]">
              <BadgeCheck className="w-4 h-4 text-[#F9D20F] shrink-0" aria-hidden="true" />
              <span>100% Authentic</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-[#64748B]">
              <ShieldCheck className="w-4 h-4 text-[#F9D20F] shrink-0" aria-hidden="true" />
              <span>Secure Checkout</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-[#64748B]">
              <Truck className="w-4 h-4 text-[#F9D20F] shrink-0" aria-hidden="true" />
              <span>Fast UAE Shipping</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-[#64748B]">
              <RotateCcw className="w-4 h-4 text-[#F9D20F] shrink-0" aria-hidden="true" />
              <span>Easy 7-Day Returns</span>
            </li>
          </ul>

          <div className="mt-4 flex items-center gap-2 text-sm text-[#64748B]">
            <Truck className="w-4 h-4 text-[#F9D20F] shrink-0" />
            <span>
              Free shipping on orders over{" "}
              <span className="font-bold text-[#0B0F14]">AED149</span>
            </span>
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

          {/* Shipping & returns */}
          <div className="mt-10 pt-8 border-t border-[#E2E8F0]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#F9D20F] mb-4">
              Shipping &amp; Returns
            </h2>
            <div className="space-y-3 text-sm text-[#64748B]">
              <p>
                <span className="font-bold text-[#0B0F14]">Fast delivery:</span>{" "}
                Same-day dispatch on orders placed before the daily cut-off, with
                delivery across the UAE in 1–3 working days.
              </p>
              <p>
                <span className="font-bold text-[#0B0F14]">Free shipping:</span>{" "}
                Enjoy free delivery on every order over AED&nbsp;149.
              </p>
              <p>
                <span className="font-bold text-[#0B0F14]">Easy returns:</span>{" "}
                Unopened items can be returned within 7 days of delivery. Damaged
                or incorrect items are replaced free of charge.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="mt-20" aria-labelledby="product-faq-heading">
        <h2
          id="product-faq-heading"
          className="text-2xl md:text-3xl font-black text-[#0B0F14] uppercase tracking-tight mb-8"
        >
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
          {PRODUCT_FAQ.map((item) => (
            <details key={item.question} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 list-none font-bold text-[#0B0F14]">
                <span>{item.question}</span>
                <ChevronRight
                  className="w-4 h-4 text-[#F9D20F] shrink-0 transition-transform group-open:rotate-90"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 text-sm text-[#64748B]">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

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
