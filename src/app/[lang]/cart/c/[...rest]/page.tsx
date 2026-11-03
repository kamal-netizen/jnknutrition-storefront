import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Shopify checkout permalinks (/cart/c/<token>?key=…) bounce back to this
// domain when the store's checkout domain points at the storefront host
// instead of Shopify's checkout servers. Nothing is served here on purpose:
// the segment exists only so the path matches a route. Without it the request
// matches nothing and is answered by app/global-not-found.tsx, which bypasses
// the layout, so the checkout-specific message in app/[lang]/CheckoutNotFound
// (mounted by app/[lang]/not-found.tsx) could never render. Throwing
// notFound() from a real segment renders that not-found page inside the
// layout, where the client component reads the /cart/c/ path and shows the
// retry link to the myshopify checkout instead of the generic 404.

export const metadata: Metadata = {
  title: "Checkout Unavailable",
};

export default function CheckoutPermalinkPage(): never {
  notFound();
}
