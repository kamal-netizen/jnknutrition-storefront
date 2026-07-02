"use client";

import { useState } from "react";
import { ShoppingBag, Check, Loader2 } from "lucide-react";
import type { Product } from "@/lib/queries/products";
import { useCartStore } from "@/lib/store/cart";
import Price from "@/components/Price";

type Props = {
  product: Product;
};

export default function QuickAddButton({ product }: Props) {
  const variants = product.variants.edges.map((e) => e.node);
  const { addLine, isLoading } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);

  const soldOut = !product.availableForSale;
  const defaultVariant = variants.find((v) => v.availableForSale) ?? variants[0];
  const minPrice = product.priceRange.minVariantPrice;

  async function handleAdd() {
    if (!defaultVariant?.availableForSale || isLoading) return;
    await addLine(defaultVariant.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div className="px-3 py-2 bg-white/90 backdrop-blur-sm flex items-center gap-2">
      <Price
        amount={minPrice.amount}
        currencyCode={minPrice.currencyCode}
        className="text-xs font-bold text-[#F9D20F] tabular-nums shrink-0"
      />
      <button
        onClick={(e) => { e.preventDefault(); handleAdd(); }}
        disabled={soldOut || isLoading || justAdded}
        aria-label={`Add ${product.title} to cart`}
        className="flex-1 py-1.5 bg-[#F9D20F] text-[#0B0F14] text-[10px] font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 hover:bg-[#E7BF00] transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#F9D20F] focus-visible:outline-offset-1"
      >
        {soldOut ? (
          "Sold Out"
        ) : justAdded ? (
          <><Check className="w-3 h-3" /> Added</>
        ) : isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <><ShoppingBag className="w-3 h-3" /> Add to Cart</>
        )}
      </button>
    </div>
  );
}
