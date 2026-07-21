"use client";

import { useRef, useState } from "react";
import Link from "@/components/LocaleLink";
import {
  Truck,
  ShieldCheck,
  BadgeCheck,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import type { Product, ProductVariant } from "@/lib/queries/products";
import { useDict, useLocale } from "@/lib/locale-context";
import ProductGallery from "@/components/ProductGallery";
import AddToCart from "@/components/AddToCart";
import StickyAddToCart from "@/components/StickyAddToCart";
import ProductCard from "@/components/ProductCard";
import { PRODUCT_FAQ } from "@/lib/product-faq";

type Props = {
  product: Product;
  recommendations: Product[];
  descriptionHtml: string;
};

export default function ProductDetails({ product, recommendations, descriptionHtml }: Props) {
  const dict = useDict();
  const locale = useLocale();
  const c = dict.common;
  const t = dict.product;
  const images = product.images.edges.map((e) => e.node);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeVariantImageUrl, setActiveVariantImageUrl] = useState<string | null>(null);

  const variants = product.variants.edges.map((e) => e.node);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    variants.find((v) => v.availableForSale) ?? variants[0]
  );
  const buyBoxRef = useRef<HTMLDivElement>(null);

  function handleVariantChange(variant: ProductVariant) {
    setSelectedVariant(variant);
    if (!variant.image) {
      setActiveVariantImageUrl(null);
      setActiveIndex(0);
      return;
    }
    const variantBase = variant.image.url.split('?')[0];
    const idx = images.findIndex((img) => img.url.split('?')[0] === variantBase);
    if (idx !== -1) {
      setActiveVariantImageUrl(null);
      setActiveIndex(idx);
    } else {
      setActiveVariantImageUrl(variant.image.url);
    }
  }

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-[#64748B]">
          <li>
            <Link href="/" className="hover:text-[#0B0F14] transition-colors">
              {c.home}
            </Link>
          </li>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] rtl:rotate-180" aria-hidden="true" />
          <li>
            <Link
              href="/products"
              className="hover:text-[#0B0F14] transition-colors"
            >
              {c.products}
            </Link>
          </li>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] rtl:rotate-180" aria-hidden="true" />
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
          activeImageUrl={activeVariantImageUrl}
          onActiveChange={(i) => { setActiveVariantImageUrl(null); setActiveIndex(i); }}
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

          <div ref={buyBoxRef} className="mt-6">
            <AddToCart product={product} onVariantChange={handleVariantChange} />
          </div>

          {/* Trust / benefit strip */}
          <ul className="mt-6 grid grid-cols-2 gap-3">
            <li className="flex items-center gap-2 text-sm text-[#64748B]">
              <BadgeCheck className="w-4 h-4 text-[#F9D20F] shrink-0" aria-hidden="true" />
              <span>{t.authentic}</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-[#64748B]">
              <ShieldCheck className="w-4 h-4 text-[#F9D20F] shrink-0" aria-hidden="true" />
              <span>{t.secureCheckout}</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-[#64748B]">
              <Truck className="w-4 h-4 text-[#F9D20F] shrink-0" aria-hidden="true" />
              <span>{t.fastShipping}</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-[#64748B]">
              <RotateCcw className="w-4 h-4 text-[#F9D20F] shrink-0" aria-hidden="true" />
              <span>{t.easyReturns}</span>
            </li>
          </ul>

          <div className="mt-4 flex items-center gap-2 text-sm text-[#64748B]">
            <Truck className="w-4 h-4 text-[#F9D20F] shrink-0" />
            <span>
              {t.freeShippingOver}{" "}
              <span className="font-bold text-[#0B0F14]">{locale.code === "ar" ? "149 د.إ" : "AED149"}</span>
            </span>
          </div>

          <div className="mt-10 divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
            {descriptionHtml && (
              <details className="group py-5" open>
                <summary className="flex cursor-pointer items-center justify-between gap-4 list-none text-sm font-bold uppercase tracking-widest text-[#0B0F14]">
                  {t.details}
                  <ChevronRight
                    className="w-4 h-4 text-[#F9D20F] shrink-0 transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:-rotate-90"
                    aria-hidden="true"
                  />
                </summary>
                <div
                  dir="auto"
                  className="mt-4 prose prose-sm max-w-none text-[#64748B] [&_a]:text-[#F9D20F] [&_strong]:text-[#0B0F14]"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              </details>
            )}

            {/* Shipping & returns */}
            <details className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 list-none text-sm font-bold uppercase tracking-widest text-[#0B0F14]">
                {t.shippingReturns}
                <ChevronRight
                  className="w-4 h-4 text-[#F9D20F] shrink-0 transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:-rotate-90"
                  aria-hidden="true"
                />
              </summary>
              <div className="mt-4 space-y-3 text-sm text-[#64748B]">
                <p>
                  <span className="font-bold text-[#0B0F14]">{t.fastDelivery}</span>{" "}
                  {t.fastDeliveryBody}
                </p>
                <p>
                  <span className="font-bold text-[#0B0F14]">{t.freeShippingLabel}</span>{" "}
                  {t.freeShippingBody}
                </p>
                <p>
                  <span className="font-bold text-[#0B0F14]">{t.easyReturnsLabel}</span>{" "}
                  {t.easyReturnsBody}
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Sticky mobile add-to-cart */}
      {selectedVariant && (
        <StickyAddToCart
          product={product}
          selectedVariant={selectedVariant}
          watchRef={buyBoxRef}
        />
      )}

      {/* FAQ */}
      <section className="mt-20" aria-labelledby="product-faq-heading">
        <h2
          id="product-faq-heading"
          className="text-2xl md:text-3xl font-black text-[#0B0F14] uppercase tracking-tight mb-8"
        >
          {t.faq}
        </h2>
        <div className="max-w-3xl divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
          {PRODUCT_FAQ.map((item) => (
            <details key={item.question} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 list-none font-bold text-[#0B0F14]">
                <span>{item.question}</span>
                <ChevronRight
                  className="w-4 h-4 text-[#F9D20F] shrink-0 transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:-rotate-90"
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
            {t.youMightAlsoLike}
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
