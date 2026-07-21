"use client";

import { useEffect, useState, type RefObject } from "react";
import Image from "next/image";
import { ShoppingBag, Check, Loader2 } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/queries/products";
import { useCartStore } from "@/lib/store/cart";
import { useDict } from "@/lib/locale-context";
import Price from "@/components/Price";

type Props = {
  product: Product;
  selectedVariant: ProductVariant;
  /** The buy-box element — the bar shows once this scrolls out of view. */
  watchRef: RefObject<HTMLElement | null>;
};

export default function StickyAddToCart({ product, selectedVariant, watchRef }: Props) {
  const { addLine, isLoading } = useCartStore();
  const dict = useDict();
  const c = dict.common;
  const [visible, setVisible] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const el = watchRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show only after the buy box has scrolled up out of view
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [watchRef]);

  // Let other bottom-fixed UI (e.g. the floating search pill) move out of the way
  useEffect(() => {
    if (visible) {
      document.body.dataset.stickyAtc = "true";
    } else {
      delete document.body.dataset.stickyAtc;
    }
    return () => {
      delete document.body.dataset.stickyAtc;
    };
  }, [visible]);

  const image = product.images.edges[0]?.node;
  const soldOut = !selectedVariant?.availableForSale;

  async function handleAdd() {
    if (soldOut || isLoading) return;
    await addLine(selectedVariant.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div
      aria-hidden={!visible}
      className={`lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-[0_-4px_16px_rgba(11,15,20,0.08)] transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {image && (
          <Image
            src={image.url}
            alt=""
            width={44}
            height={44}
            className="rounded-lg object-cover aspect-square bg-[#FAFBFC] border border-[#E2E8F0] shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#0B0F14] truncate">{product.title}</p>
          <Price
            amount={selectedVariant.price.amount}
            currencyCode={selectedVariant.price.currencyCode}
            className="text-sm font-black text-[#0B0F14] tabular-nums"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={soldOut || isLoading}
          tabIndex={visible ? 0 : -1}
          className="shrink-0 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-[#F9D20F] text-[#0B0F14] text-sm font-bold uppercase tracking-wide hover:bg-[#E7BF00] transition-colors disabled:bg-[#E2E8F0] disabled:text-[#94A3B8]"
        >
          {soldOut ? (
            c.soldOut
          ) : justAdded ? (
            <>
              <Check className="w-4 h-4" /> {c.added}
            </>
          ) : isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" /> {c.addToCart}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
