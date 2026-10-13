import { env } from "./env";

const endpoint = `https://${env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/${env.NEXT_PUBLIC_SHOPIFY_API_VERSION}/graphql.json`;

const headers = {
  "Content-Type": "application/json",
  "X-Shopify-Storefront-Access-Token":
    env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
};

type GraphQLErrorish = { extensions?: { code?: string }; message?: string };

/**
 * A failed Storefront request: a non-2xx status, an unreadable body, or a
 * GraphQL `errors` array, which Shopify sends with HTTP 200. `response` keeps
 * the shape graphql-request's ClientError had, which isTransient() reads.
 */
export class StorefrontError extends Error {
  response: { status: number; errors?: GraphQLErrorish[] };

  constructor(message: string, response: { status: number; errors?: GraphQLErrorish[] }) {
    super(message);
    this.name = "StorefrontError";
    this.response = response;
  }
}

// A plain fetch rather than graphql-request. This module runs in the browser
// too (the cart store and the search box call Shopify directly), and
// graphql-request carried the whole graphql reference implementation into that
// bundle — it parses every query only to read its operation name, which
// Shopify does not need. Errors surface as they did: thrown, with the response
// status and the GraphQL errors attached.
async function request<T>(
  query: string,
  variables: Record<string, unknown> | undefined,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    ...init,
  });
  const body = (await res.json().catch(() => null)) as {
    data?: T;
    errors?: GraphQLErrorish[];
  } | null;
  if (!res.ok || !body || body.errors?.length) {
    const errors = body?.errors;
    throw new StorefrontError(
      errors?.[0]?.message ?? `Storefront API responded ${res.status}`,
      { status: res.status, errors }
    );
  }
  return body.data as T;
}

// Retries skip the cache. Shopify reports an internal error as HTTP 200 with
// the failure inside the GraphQL `errors` array, and Next's fetch cache sees
// only the status — so it stores the failure as a perfectly good response.
// That is not hypothetical: a single blip during one build got cached, and
// every build afterwards replayed it and died on the same page, while the same
// query run directly succeeded every time. Retrying against the cache would
// just re-read the poisoned entry, so retries must reach the network.
const UNCACHED: RequestInit = { cache: "no-store" };

// Storefront buyer context. Declaring the variables with defaults (AE/EN — the
// store's default market) keeps every existing call byte-for-byte identical
// unless a caller passes `language`/`country`. Interpolate both into a query's
// operation definition to localize its response.
export const IN_CONTEXT_ARGS =
  "$country: CountryCode = AE, $language: LanguageCode = EN";
export const IN_CONTEXT_DIRECTIVE =
  "@inContext(country: $country, language: $language)";

// ─── Transient-failure retry ─────────────────────────────────────────────────
// `next build` prerenders with ~31 workers, which puts a burst of Storefront
// API calls on the wire at once, and Shopify answers some of them with an
// internal error. One such answer used to fail the entire build:
//
//   Error occurred prerendering page "/ar/collections/gaspari-nutrition"
//   Internal error. Looks like something went wrong on our end. Request ID: …
//
// The same query, run on its own, succeeds every time — so it is load, not
// data. Note the shape: Shopify returns **HTTP 200** with the failure in the
// GraphQL `errors` array, so status-code checks alone never see it.
//
// Only transient classes are retried. A malformed query or a bad token fails
// identically on every attempt, and retrying those would just multiply the
// wait before the build reports the real problem.

const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 300;

type ClientErrorish = {
  response?: { status?: number; errors?: GraphQLErrorish[] };
};

const TRANSIENT_CODES = new Set([
  "INTERNAL_SERVER_ERROR",
  "THROTTLED",
  "TIMEOUT",
]);

function isTransient(error: unknown): boolean {
  const response = (error as ClientErrorish)?.response;

  // A network-level failure (DNS, reset, abort) carries no response at all.
  if (!response) return true;

  const status = response.status;
  if (status === 429 || (typeof status === "number" && status >= 500)) {
    return true;
  }

  return (response.errors ?? []).some(
    (e) =>
      TRANSIENT_CODES.has(e?.extensions?.code ?? "") ||
      /internal error|timeout|try again/i.test(e?.message ?? "")
  );
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // First attempt may be served from Next's fetch cache; retries never are.
      return await request<T>(query, variables, attempt === 1 ? undefined : UNCACHED);
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS || !isTransient(error)) throw error;
      // Exponential backoff, with jitter so a burst of workers that all failed
      // together does not retry together and reproduce the same burst.
      const backoff = BASE_BACKOFF_MS * 2 ** (attempt - 1);
      await delay(backoff + Math.random() * backoff);
    }
  }

  throw lastError;
}

export const checkoutDomain = env.NEXT_PUBLIC_CHECKOUT_DOMAIN;
