"use client";

import { useState } from "react";
import { ShoppingBag, Check, Loader2, Plus } from "lucide-react";
import type { Product } from "@/lib/queries/products";
import { useCartStore } from "@/lib/store/cart";
import { useDict } from "@/lib/locale-context";
import Price from "@/components/Price";

type Props = {
  product: Product;
  /** "bar" = full-width slide-up bar (desktop hover); "icon" = compact round button (mobile). */
  variant?: "bar" | "icon";
};

export default function QuickAddButton({ product, variant = "bar" }: Props) {
  const variants = product.variants.edges.map((e) => e.node);
  const { addLine, isLoading } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);
  const c = useDict().common;

  const soldOut = !product.availableForSale;
  const defaultVariant = variants.find((v) => v.availableForSale) ?? variants[0];
  const minPrice = product.priceRange.minVariantPrice;

  async function handleAdd() {
    if (!defaultVariant?.availableForSale || isLoading) return;
    await addLine(defaultVariant.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  if (variant === "icon") {
    if (soldOut) return null;
    return (
      <button
        onClick={(e) => { e.preventDefault(); handleAdd(); }}
        disabled={isLoading || justAdded}
        aria-label={`${c.addToCart}: ${product.title}`}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F9D20F] text-[#0B0F14] shadow-card hover:bg-[#E7BF00] active:scale-95 transition-all disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-[#F9D20F] focus-visible:outline-offset-1"
      >
        {justAdded ? (
          <Check className="w-4 h-4" />
        ) : isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" strokeWidth={2.5} />
        )}
      </button>
    );
  }

  return (
    <div className="px-3 py-2 bg-white/90 backdrop-blur-sm flex items-center gap-2">
      <Price
        amount={minPrice.amount}
        currencyCode={minPrice.currencyCode}
        className="text-xs font-bold text-[#0B0F14] tabular-nums shrink-0"
      />
      <button
        onClick={(e) => { e.preventDefault(); handleAdd(); }}
        disabled={soldOut || isLoading || justAdded}
        aria-label={`${c.addToCart}: ${product.title}`}
        className="flex-1 py-1.5 bg-[#F9D20F] text-[#0B0F14] text-[10px] font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 hover:bg-[#E7BF00] transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#F9D20F] focus-visible:outline-offset-1"
      >
        {soldOut ? (
          c.soldOut
        ) : justAdded ? (
          <><Check className="w-3 h-3" /> {c.added}</>
        ) : isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <><ShoppingBag className="w-3 h-3" /> {c.addToCart}</>
        )}
      </button>
    </div>
  );
}
