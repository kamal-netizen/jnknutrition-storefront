import { env } from "./env";

/**
 * Minimal Admin API client — the storefront needs exactly one thing from it
 * (order counts per product, for the monthly best-seller ranking), so this
 * stays a thin fetch wrapper rather than a second GraphQLClient.
 *
 * Kept in its own module, and imported only from server-side data loaders: the
 * Storefront token in shopify.ts is safe in the browser, this one is not. The
 * variable has no NEXT_PUBLIC_ prefix, so Next will not inline it into a client
 * bundle — importing this file from a client component fails at build instead.
 */

const ADMIN_ENDPOINT = `https://${env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/${env.SHOPIFY_ADMIN_API_VERSION}/graphql.json`;

/** Whether an Admin token is configured. Every caller must degrade without it. */
export function hasAdminAccess(): boolean {
  return Boolean(env.SHOPIFY_ADMIN_ACCESS_TOKEN);
}

export class AdminApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminApiError";
  }
}

type AdminResponse<T> = {
  data?: T;
  errors?: { message: string; extensions?: { code?: string } }[];
};

export async function adminFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T> {
  const token = env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!token) {
    throw new AdminApiError("SHOPIFY_ADMIN_ACCESS_TOKEN is not configured");
  }

  const response = await fetch(ADMIN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    signal,
    // Order data is aggregated and cached by the caller; caching the raw HTTP
    // response on top of that would only pin stale pages of a paginated scan.
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AdminApiError(
      `Admin API responded ${response.status} ${response.statusText}`
    );
  }

  const body = (await response.json()) as AdminResponse<T>;
  if (body.errors?.length) {
    // ACCESS_DENIED here almost always means the custom app is missing the
    // read_orders scope, which is worth saying out loud in the server log.
    throw new AdminApiError(
      body.errors.map((e) => e.message).join("; ") || "Admin API returned errors"
    );
  }
  if (!body.data) throw new AdminApiError("Admin API returned no data");
  return body.data;
}
