// Storefront API credentials are intentionally NEXT_PUBLIC_ — the Storefront
// access token is scoped to public read/cart operations only (not Admin API).
// This allows cart mutations to run directly from the browser against Shopify.
//
// Validated by hand rather than with zod. This module reaches the browser — the
// cart store and the search box call the Storefront API from the client, by way
// of lib/shopify.ts — and zod was most of a ~110 KB client chunk, three-quarters
// of it unused, to check a handful of strings. The rules are the ones the zod
// schema had: a required value must be non-empty, an optional one may be absent
// but not empty, and the two API versions fall back to a default when absent.
//
// Every variable is read as a literal `process.env.NAME`: that is the only form
// Next inlines into a client bundle.

const issues: { name: string; problem: "missing" | "empty" }[] = [];

function required(name: string, value: string | undefined): string {
  if (!value) issues.push({ name, problem: value === undefined ? "missing" : "empty" });
  return value ?? "";
}

function optional(name: string, value: string | undefined): string | undefined {
  if (value === "") issues.push({ name, problem: "empty" });
  return value;
}

function withDefault(name: string, value: string | undefined, fallback: string): string {
  if (value === "") issues.push({ name, problem: "empty" });
  return value ?? fallback;
}

const values = {
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: required(
    "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN",
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  ),
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: required(
    "NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN",
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
  ),
  NEXT_PUBLIC_CHECKOUT_DOMAIN: required(
    "NEXT_PUBLIC_CHECKOUT_DOMAIN",
    process.env.NEXT_PUBLIC_CHECKOUT_DOMAIN
  ),
  NEXT_PUBLIC_SHOPIFY_API_VERSION: required(
    "NEXT_PUBLIC_SHOPIFY_API_VERSION",
    process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION
  ),
  // ── New Customer Accounts (Customer Account API / OAuth) ──────────────────
  // Server-only. Optional so the app still boots before credentials are set;
  // login routes validate their presence at request time.
  SHOPIFY_SHOP_ID: optional("SHOPIFY_SHOP_ID", process.env.SHOPIFY_SHOP_ID),
  SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: optional(
    "SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID",
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID
  ),
  SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION: withDefault(
    "SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION",
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION,
    "2025-04"
  ),
  // ── Admin API (order data for the monthly best-seller ranking) ────────────
  // Server-only, and deliberately optional: without it the storefront runs
  // exactly as before, with "Trending Now" falling back to Shopify's all-time
  // BEST_SELLING sort. Needs only the `read_orders` scope — create it as a
  // custom app under Settings > Apps and sales channels > Develop apps.
  // NEVER prefix this NEXT_PUBLIC_: unlike the Storefront token it can read
  // order and customer data, and must never reach the browser.
  SHOPIFY_ADMIN_ACCESS_TOKEN: optional(
    "SHOPIFY_ADMIN_ACCESS_TOKEN",
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
  ),
  SHOPIFY_ADMIN_API_VERSION: withDefault(
    "SHOPIFY_ADMIN_API_VERSION",
    process.env.SHOPIFY_ADMIN_API_VERSION,
    "2025-01"
  ),
};

if (issues.length) {
  console.error("Missing or invalid environment variables:", issues);
  throw new Error(
    "Cannot start: missing Shopify environment variables. " +
      "Ensure NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN, " +
      "NEXT_PUBLIC_CHECKOUT_DOMAIN, and NEXT_PUBLIC_SHOPIFY_API_VERSION are set in .env.local."
  );
}

export const env = values;
