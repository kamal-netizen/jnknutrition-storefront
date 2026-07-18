import { GraphQLClient } from "graphql-request";
import { env } from "./env";

const endpoint = `https://${env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/${env.NEXT_PUBLIC_SHOPIFY_API_VERSION}/graphql.json`;

const client = new GraphQLClient(endpoint, {
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token":
      env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  },
});

// Storefront buyer context. Declaring the variables with defaults (AE/EN — the
// store's default market) keeps every existing call byte-for-byte identical
// unless a caller passes `language`/`country`. Interpolate both into a query's
// operation definition to localize its response.
export const IN_CONTEXT_ARGS =
  "$country: CountryCode = AE, $language: LanguageCode = EN";
export const IN_CONTEXT_DIRECTIVE =
  "@inContext(country: $country, language: $language)";

export async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  return client.request<T>(query, variables as Record<string, unknown>);
}

export const checkoutDomain = env.NEXT_PUBLIC_CHECKOUT_DOMAIN;
