"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/queries/products";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import Price from "@/components/Price";
import TamaraWidget from "@/components/TamaraWidget";

type Props = {
  product: Product;
  onVariantChange?: (variant: ProductVariant) => void;
};

export default function AddToCart({ product, onVariantChange }: Props) {
  const variants = product.variants.edges.map((e) => e.node);
  const { addLine, isLoading } = useCartStore();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    variants.find((v) => v.availableForSale) ?? variants[0]
  );

  function selectVariant(v: ProductVariant) {
    setSelectedVariant(v);
    onVariantChange?.(v);
  }
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Options → available values (only render selector when there are real options)
  const hasVariants =
    variants.length > 1 ||
    (variants[0]?.selectedOptions.length ?? 0) > 0 &&
      variants[0]?.selectedOptions[0]?.value !== "Default Title";

  async function handleAdd() {
    if (!selectedVariant?.availableForSale) return;
    await addLine(selectedVariant.id, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  const soldOut = !selectedVariant?.availableForSale;

  const priceAmount = parseFloat(selectedVariant.price.amount);
  const compareAmount = selectedVariant.compareAtPrice
    ? parseFloat(selectedVariant.compareAtPrice.amount)
    : 0;
  const discountPercent =
    compareAmount > priceAmount
      ? Math.round(((compareAmount - priceAmount) / compareAmount) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="flex items-baseline flex-wrap gap-3">
        <Price
          amount={selectedVariant.price.amount}
          currencyCode={selectedVariant.price.currencyCode}
          className="text-3xl font-black text-[#F9D20F]"
        />
        {selectedVariant.compareAtPrice && compareAmount > priceAmount && (
          <Price
            amount={selectedVariant.compareAtPrice.amount}
            currencyCode={selectedVariant.compareAtPrice.currencyCode}
            className="text-lg text-[#64748B] line-through"
          />
        )}
        {discountPercent > 0 && (
          <span className="rounded bg-[#F9D20F] px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#0B0F14]">
            Save {discountPercent}%
          </span>
        )}
      </div>

      {/* Tamara — buy now, pay later */}
      <TamaraWidget
        amount={selectedVariant.price.amount}
        currencyCode={selectedVariant.price.currencyCode}
      />

      {/* Variant selector */}
      {hasVariants && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
            Options
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const active = variant.id === selectedVariant.id;
              return (
                <button
                  key={variant.id}
                  onClick={() => selectVariant(variant)}
                  disabled={!variant.availableForSale}
                  className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#F9D20F] text-[#0B0F14] border-[#F9D20F]"
                      : "bg-white text-[#0B0F14] border-[#E2E8F0] hover:border-[#F9D20F]"
                  } disabled:opacity-40 disabled:line-through disabled:cursor-not-allowed`}
                >
                  {variant.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
          Quantity
        </label>
        <div className="inline-flex items-center border border-[#E2E8F0] rounded">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-4 py-2 text-[#0B0F14] hover:text-[#F9D20F] transition-colors"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="px-4 py-2 text-[#0B0F14] font-medium w-12 text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-4 py-2 text-[#0B0F14] hover:text-[#F9D20F] transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to cart */}
      <Button
        onClick={handleAdd}
        disabled={soldOut || isLoading}
        className="w-full h-14 bg-[#F9D20F] text-[#0B0F14] font-bold hover:bg-[#E7BF00] uppercase tracking-wide text-base disabled:bg-[#E2E8F0] disabled:text-[#94A3B8]"
      >
        {soldOut ? (
          "Sold Out"
        ) : justAdded ? (
          <>
            <Check className="w-5 h-5" /> Added to Cart
          </>
        ) : isLoading ? (
          "Adding..."
        ) : (
          <>
            <ShoppingBag className="w-5 h-5" /> Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}
