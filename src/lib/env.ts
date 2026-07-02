import { z } from "zod";

// Storefront API credentials are intentionally NEXT_PUBLIC_ — the Storefront
// access token is scoped to public read/cart operations only (not Admin API).
// This allows cart mutations to run directly from the browser against Shopify.
const envSchema = z.object({
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().min(1),
  NEXT_PUBLIC_CHECKOUT_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_SHOPIFY_API_VERSION: z.string().min(1),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN:
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN:
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  NEXT_PUBLIC_CHECKOUT_DOMAIN: process.env.NEXT_PUBLIC_CHECKOUT_DOMAIN,
  NEXT_PUBLIC_SHOPIFY_API_VERSION:
    process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION,
});

if (!parsed.success) {
  console.error(
    "Missing or invalid environment variables:",
    parsed.error.issues
  );
  throw new Error(
    "Cannot start: missing Shopify environment variables. " +
      "Ensure NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN, " +
      "NEXT_PUBLIC_CHECKOUT_DOMAIN, and NEXT_PUBLIC_SHOPIFY_API_VERSION are set in .env.local."
  );
}

export const env = parsed.data;
