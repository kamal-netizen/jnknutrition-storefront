"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

/**
 * Detects whether the current 404 is Shopify bouncing a checkout permalink
 * (/cart/c/…) back to our domain because the custom checkout domain points to
 * Vercel instead of Shopify's checkout servers.
 *
 * When that's the case we show a branded, helpful message instead of the
 * generic 404 page, with a direct link to the cart so the customer can retry.
 */
export default function CheckoutNotFound({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCheckout, setIsCheckout] = useState(false);
  const [checkoutHref, setCheckoutHref] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (!path.startsWith("/cart/c/")) {
      return;
    }

    setIsCheckout(true);

    // Reconstruct the checkout URL on the myshopify domain so the button gives
    // the user another direct shot at Shopify's checkout engine.
    const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    if (storeDomain) {
      try {
        const url = new URL(window.location.href);
        url.hostname = storeDomain;
        setCheckoutHref(url.toString());
      } catch {
        // ignore
      }
    }
  }, []);

  if (!isCheckout) {
    return <>{children}</>;
  }

  return (
    <div className="text-center max-w-md">
      <div className="flex justify-center mb-6">
        <ShoppingBag className="w-16 h-16 text-[#F9D20F]" />
      </div>
      <h1 className="text-3xl font-black text-[#0B0F14] uppercase tracking-tight">
        Checkout Unavailable
      </h1>
      <p className="mt-3 text-[#64748B]">
        We&apos;re having trouble routing to checkout right now. Your cart is
        still saved — please try again or contact us if this keeps happening.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        {checkoutHref && (
          <a
            href={checkoutHref}
            className="bg-[#F9D20F] text-[#0B0F14] font-black uppercase tracking-wide px-8 py-3 rounded hover:bg-[#E7BF00] transition-colors"
          >
            Try Checkout Again
          </a>
        )}
        <Link
          href="/cart"
          className="border-2 border-[#0B0F14] text-[#0B0F14] font-black uppercase tracking-wide px-8 py-3 rounded hover:bg-[#F5F7FA] transition-colors"
        >
          Back to Cart
        </Link>
      </div>
    </div>
  );
}
