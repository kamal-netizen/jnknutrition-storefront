"use client";

import { Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDict } from "@/lib/locale-context";

/**
 * The overlay badges on a ProductCard (sold-out / discount / new + the
 * free-delivery pill). Split into its own client component so ProductCard can
 * stay a Server Component (product title/price stay in the SSR HTML for SEO)
 * while these short labels still localize via the locale dictionary.
 */
export default function ProductBadges({
  soldOut,
  discountPercent,
  isNew,
  freeDelivery,
}: {
  soldOut: boolean;
  discountPercent: number;
  isNew: boolean;
  freeDelivery: boolean;
}) {
  const c = useDict().common;
  return (
    <>
      <div className="absolute top-2 start-2 flex flex-col gap-1" aria-hidden="true">
        {soldOut && (
          <Badge className="bg-[#E2E8F0] text-[#64748B] text-[10px] uppercase font-bold tracking-wider">
            {c.soldOut}
          </Badge>
        )}
        {discountPercent > 0 && (
          <Badge className="bg-[#F9D20F] text-[#0B0F14] text-[10px] uppercase font-bold tracking-wider">
            -{discountPercent}%
          </Badge>
        )}
        {isNew && (
          <Badge className="bg-[#082D4C] text-white text-[10px] uppercase font-bold tracking-wider">
            {c.new}
          </Badge>
        )}
      </div>

      {freeDelivery && (
        <div
          className="absolute top-2 end-2 z-[2] inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#12925A] to-[#0B7A48] px-2.5 py-1 text-[9.5px] font-bold uppercase leading-none tracking-[0.08em] text-white shadow-[0_2px_6px_-1px_rgba(11,122,72,0.5)] ring-1 ring-inset ring-white/25"
          aria-hidden="true"
        >
          <Truck className="w-3 h-3 shrink-0" strokeWidth={2.5} aria-hidden />
          {c.freeDelivery}
        </div>
      )}
    </>
  );
}
