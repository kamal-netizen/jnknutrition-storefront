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

export async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  return client.request<T>(query, variables as Record<string, unknown>);
}

export const checkoutDomain = env.NEXT_PUBLIC_CHECKOUT_DOMAIN;
