"use client";

import { useState } from "react";
import { ShoppingBag, Check, Loader2, Plus } from "lucide-react";
import type { MoneyV2 } from "@/lib/queries/products";
import { useCartStore } from "@/lib/store/cart";
import { useDict } from "@/lib/locale-context";
import Price from "@/components/Price";

/**
 * Props are the four scalars this needs rather than the product it belongs to.
 * Every prop of a client component is serialized into the RSC payload, and a
 * grid page mounts two of these per card — handing over the whole product meant
 * shipping its entire variant list twice per tile.
 */
type Props = {
  title: string;
  /** The variant add-to-cart targets, or null when there is nothing to add. */
  variantId: string | null;
  soldOut: boolean;
  /** Shown on the "bar" variant only. */
  price: MoneyV2;
  /** "bar" = full-width slide-up bar (desktop hover); "icon" = compact round button (mobile). */
  variant?: "bar" | "icon";
};

export default function QuickAddButton({
  title,
  variantId,
  soldOut,
  price,
  variant = "bar",
}: Props) {
  const { addLine, isLoading } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);
  const c = useDict().common;

  async function handleAdd() {
    if (!variantId || soldOut || isLoading) return;
    if (!(await addLine(variantId, 1))) return;
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  if (variant === "icon") {
    if (soldOut) return null;
    return (
      <button
        onClick={(e) => { e.preventDefault(); handleAdd(); }}
        disabled={isLoading || justAdded}
        aria-label={`${c.addToCart}: ${title}`}
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
        amount={price.amount}
        currencyCode={price.currencyCode}
        className="text-xs font-bold text-[#0B0F14] tabular-nums shrink-0"
      />
      <button
        onClick={(e) => { e.preventDefault(); handleAdd(); }}
        disabled={soldOut || !variantId || isLoading || justAdded}
        aria-label={`${c.addToCart}: ${title}`}
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
