import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/queries/products";
import { Badge } from "@/components/ui/badge";
import Price from "@/components/Price";
import QuickAddButton from "@/components/QuickAddButton";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const image = product.images.edges[0]?.node;
  const secondImage = product.images.edges[1]?.node;
  const minPrice = product.priceRange.minVariantPrice;

  // Find the variant with the highest discount to use for badge + strikethrough
  const saleVariant =
    product.variants.edges
      .map((e) => e.node)
      .filter(
        (v) =>
          v.compareAtPrice !== null &&
          parseFloat(v.compareAtPrice.amount) > parseFloat(v.price.amount)
      )
      .sort(
        (a, b) =>
          parseFloat(b.compareAtPrice!.amount) / parseFloat(b.price.amount) -
          parseFloat(a.compareAtPrice!.amount) / parseFloat(a.price.amount)
      )[0] ?? null;

  const isOnSale = saleVariant !== null && product.availableForSale;
  const discountPercent = saleVariant
    ? Math.round(
        (1 -
          parseFloat(saleVariant.price.amount) /
            parseFloat(saleVariant.compareAtPrice!.amount)) *
          100
      )
    : 0;

  const priceStr = `${minPrice.currencyCode} ${parseFloat(minPrice.amount).toFixed(2)}`;
  const a11yLabel = `${product.title}${product.vendor ? `, by ${product.vendor}` : ""}${isOnSale ? `, ${discountPercent}% off` : ""}, ${priceStr}`;

  return (
    <div className="group relative rounded-2xl bg-white border border-[#E2E8F0] shadow-card hover:border-[#F9D20F] hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#F9D20F] focus-within:ring-offset-2 focus-within:ring-offset-white">
      {/* Image layer — z-[2] sits above the stretched link (z-[1]) */}
      <div className="relative z-[2] aspect-square bg-[#FAFBFC] overflow-hidden rounded-t-2xl">
        {image ? (
          <>
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-contain p-3 transition-opacity duration-300${secondImage ? " group-hover:opacity-0" : ""}`}
            />
            {secondImage && (
              <Image
                src={secondImage.url}
                alt={secondImage.altText ?? product.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-black text-[#E2E8F0] opacity-20">JNK</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1" aria-hidden="true">
          {!product.availableForSale && (
            <Badge className="bg-[#E2E8F0] text-[#64748B] text-[10px] uppercase font-bold tracking-wider">
              Sold Out
            </Badge>
          )}
          {isOnSale && discountPercent > 0 && (
            <Badge className="bg-[#F9D20F] text-[#0B0F14] text-[10px] uppercase font-bold tracking-wider">
              -{discountPercent}%
            </Badge>
          )}
          {product.tags.includes("new") && product.availableForSale && (
            <Badge className="bg-[#EEF4FF] border border-[#F9D20F] text-[#F9D20F] text-[10px] uppercase font-bold tracking-wider">
              New
            </Badge>
          )}
        </div>

        {/* Quick Add — desktop: slides up from bottom of image on hover/focus */}
        <div className="hidden sm:block absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0 transition-transform duration-200 ease-out">
          <QuickAddButton product={product} />
        </div>

        {/* Quick Add — mobile/touch: always-visible compact button */}
        <div className="sm:hidden absolute bottom-2 right-2 z-[3]">
          <QuickAddButton product={product} variant="icon" />
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        {product.vendor && (
          <p className="text-[10px] uppercase tracking-widest text-[#64748B] mb-1 truncate" aria-hidden="true">
            {product.vendor}
          </p>
        )}
        <h3 className="text-sm font-bold text-[#0B0F14] leading-tight line-clamp-2 mb-2">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <Price
            amount={minPrice.amount}
            currencyCode={minPrice.currencyCode}
            className="text-sm font-bold text-[#0B0F14]"
          />
          {saleVariant?.compareAtPrice && (
            <Price
              amount={saleVariant.compareAtPrice.amount}
              currencyCode={saleVariant.compareAtPrice.currencyCode}
              className="text-xs text-[#64748B] line-through"
            />
          )}
        </div>
      </div>

      {/* Stretched link — covers the full card at z-[1]; image layer (z-[2]) and quick-add sit above it */}
      <Link
        href={`/products/${product.handle}`}
        className="absolute inset-0 z-[1] rounded-2xl"
        aria-label={a11yLabel}
      />
    </div>
  );
}
