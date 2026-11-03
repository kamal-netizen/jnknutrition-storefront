"use client";

import { useSyncExternalStore } from "react";
import Link from "@/components/LocaleLink";
import { ShoppingBag } from "lucide-react";
import { LOCALE_PREFIXES } from "@/lib/i18n";

/**
 * Detects whether the current 404 is Shopify bouncing a checkout permalink
 * (/cart/c/…) back to our domain because the custom checkout domain points to
 * Vercel instead of Shopify's checkout servers.
 *
 * When that's the case we show a branded, helpful message instead of the
 * generic 404 page, with a direct link to the cart so the customer can retry.
 *
 * app/[lang]/cart/c/[...rest]/page.tsx exists only to throw notFound() for
 * those paths. Without it they match no route and are answered by
 * app/global-not-found.tsx, which bypasses the layout and never mounts this.
 */

// Shopify bounces to the un-prefixed URL, but the route above matches under
// every locale, so an /ar/cart/c/… visit gets the same treatment. The prefix
// is stripped again for the retry link: the myshopify domain knows /cart/c/
// only.
const LOCALE_PREFIX = LOCALE_PREFIXES.length
  ? `(?:/(?:${LOCALE_PREFIXES.join("|")}))?`
  : "";
const CHECKOUT_BOUNCE_PATH = new RegExp(`^${LOCALE_PREFIX}/cart/c/`);
const LEADING_LOCALE_PREFIX = new RegExp(`^${LOCALE_PREFIX}`);

export default function CheckoutNotFound({
  children,
}: {
  children: React.ReactNode;
}) {
  // window.location is read through useSyncExternalStore: the server render
  // and the hydration render both use the server snapshot (no bounce), then
  // React re-renders once with the real client value. Same visible result as
  // the old setState-in-an-effect, without the cascading render.
  const bouncedHref = useSyncExternalStore(
    subscribe,
    getCheckoutBounceHref,
    getServerSnapshot,
  );

  if (bouncedHref === null) {
    return <>{children}</>;
  }

  const checkoutHref = toStoreCheckoutHref(bouncedHref);

  return (
    <div className="text-center max-w-md">
      <div className="flex justify-center mb-6">
        <ShoppingBag className="w-16 h-16 text-[#F9D20F]" />
      </div>
      <h1 className="text-3xl font-black text-[#0B0F14] uppercase tracking-tight">
        Checkout Unavailable
      </h1>
      <p className="mt-3 text-[#55637A]">
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

// The location never changes without a navigation, which remounts or
// re-renders this component anyway, so there is nothing to subscribe to.
function subscribe() {
  return () => {};
}

/** The bounced checkout URL on the client, or null when this is a normal 404. */
function getCheckoutBounceHref(): string | null {
  const { pathname, href } = window.location;
  return CHECKOUT_BOUNCE_PATH.test(pathname) ? href : null;
}

function getServerSnapshot(): string | null {
  return null;
}

/**
 * Reconstruct the checkout URL on the myshopify domain so the button gives
 * the user another direct shot at Shopify's checkout engine.
 */
function toStoreCheckoutHref(bouncedHref: string): string | null {
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (!storeDomain) {
    return null;
  }
  try {
    const url = new URL(bouncedHref);
    // Shopify checkout is https only. The port is cleared separately because
    // the hostname setter keeps whatever port the storefront was served on,
    // e.g. 3001 under a local `next start`.
    url.protocol = "https:";
    url.hostname = storeDomain;
    url.port = "";
    url.pathname = url.pathname.replace(LEADING_LOCALE_PREFIX, "");
    return url.toString();
  } catch {
    return null;
  }
}
