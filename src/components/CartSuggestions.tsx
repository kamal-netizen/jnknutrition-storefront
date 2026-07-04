"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check, Loader2 } from "lucide-react";
import type { Product } from "@/lib/queries/products";
import { getProducts } from "@/lib/queries/products";
import { useCartStore, useCartLines, useCartSubtotal } from "@/lib/store/cart";
import { freeShippingRemaining, FREE_SHIPPING_CURRENCY } from "@/lib/shipping";
import Price from "@/components/Price";

type Props = {
  className?: string;
  onNavigate?: () => void;
};

export default function CartSuggestions({ className, onNavigate }: Props) {
  const subtotal = useCartSubtotal();
  const lines = useCartLines();
  const { addLine, isLoading } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);
  // Stable random order, computed once per fetched batch.
  const [seed] = useState(() => Math.random());

  useEffect(() => {
    let active = true;
    getProducts({
      first: 50,
      query: "available_for_sale:true",
      sortKey: "BEST_SELLING",
      reverse: false,
    })
      .then((conn) => {
        if (active) setProducts(conn.edges.map((e) => e.node));
      })
      .catch(() => {
        /* silently ignore — suggestions are non-critical */
      });
    return () => {
      active = false;
    };
  }, []);

  const amount = subtotal ? parseFloat(subtotal.amount) : 0;
  const remaining = freeShippingRemaining(amount);
  const unlocked = remaining <= 0;

  const inCartKey = lines.map((l) => l.merchandise.product.handle).join(",");

  const suggestions = useMemo(() => {
    const inCart = new Set(inCartKey ? inCartKey.split(",") : []);
    const available = products.filter(
      (p) => p.availableForSale && !inCart.has(p.handle)
    );
    if (unlocked) {
      // Free shipping met — show other products in a stable random order.
      return [...available]
        .sort((a, b) => hash(a.id + seed) - hash(b.id + seed))
        .slice(0, 3);
    }
    // Still nudging — surface the cheapest add-ons to close the gap.
    return [...available]
      .sort(
        (a, b) =>
          parseFloat(a.priceRange.minVariantPrice.amount) -
          parseFloat(b.priceRange.minVariantPrice.amount)
      )
      .slice(0, 3);
  }, [products, inCartKey, unlocked, seed]);

  if (!subtotal || Number.isNaN(amount)) return null;
  if (suggestions.length === 0) return null;

  async function handleAdd(product: Product) {
    const variant =
      product.variants.edges.find((e) => e.node.availableForSale)?.node ??
      product.variants.edges[0]?.node;
    if (!variant || isLoading) return;
    await addLine(variant.id, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId((id) => (id === product.id ? null : id)), 2000);
  }

  return (
    <div className={className}>
      <p className="text-xs font-bold uppercase tracking-widest text-[#0B0F14]">
        {unlocked ? "You might also like" : "Add a little more for free shipping"}
      </p>
      <p className="mt-0.5 text-[11px] text-[#64748B]">
        {unlocked ? (
          "Complete your stack with these picks."
        ) : (
          <>
            You&apos;re {FREE_SHIPPING_CURRENCY} {remaining.toFixed(2)} away —
            grab a small add-on.
          </>
        )}
      </p>

      <ul className="mt-3 space-y-2">
        {suggestions.map((product) => {
          const image = product.images.edges[0]?.node ?? null;
          const price = product.priceRange.minVariantPrice;
          const added = addedId === product.id;
          return (
            <li
              key={product.id}
              className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-white p-2"
            >
              <Link
                href={`/products/${product.handle}`}
                onClick={onNavigate}
                className="shrink-0"
              >
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.altText ?? product.title}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-md object-cover bg-[#FAFBFC] border border-[#E2E8F0]"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-md bg-[#F1F5F9]" />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${product.handle}`}
                  onClick={onNavigate}
                  className="block text-[11px] font-semibold text-[#0B0F14] leading-tight line-clamp-1 hover:text-[#F9D20F] transition-colors"
                >
                  {product.title}
                </Link>
                <Price
                  amount={price.amount}
                  currencyCode={price.currencyCode}
                  className="mt-0.5 block text-[11px] font-bold text-[#0B0F14] tabular-nums"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAdd(product)}
                disabled={isLoading || added}
                aria-label={`Add ${product.title} to cart`}
                className="shrink-0 h-7 w-7 rounded-full bg-[#F9D20F] text-[#0B0F14] flex items-center justify-center hover:bg-[#E7BF00] transition-colors disabled:opacity-60"
              >
                {added ? (
                  <Check className="w-3.5 h-3.5" />
                ) : isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Deterministic pseudo-random value from a string key (for stable shuffling). */
function hash(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
  }
  return (h >>> 0) / 0xffffffff;
}
