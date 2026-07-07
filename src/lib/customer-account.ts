import "server-only";
import { headers } from "next/headers";
import { env } from "./env";

// ─── Config ────────────────────────────────────────────────────────────────

const USER_AGENT = "JNK Storefront";
const LOGIN_SCOPE = "openid email customer-account-api:full";

export const CUSTOMER_ACCOUNT_CALLBACK_PATH = "/account/callback";

export type CustomerAccountConfig = {
  shopId: string;
  clientId: string;
  apiVersion: string;
};

/**
 * Returns the Customer Account API config, or throws a readable error when the
 * required credentials have not been provisioned yet.
 */
export function getCustomerAccountConfig(): CustomerAccountConfig {
  const shopId = env.SHOPIFY_SHOP_ID;
  const clientId = env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  if (!shopId || !clientId) {
    throw new Error(
      "New Customer Accounts are not configured. Set SHOPIFY_SHOP_ID and " +
        "SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID in your environment. See Shopify " +
        "admin → Settings → Customer accounts → API (Headless / Customer " +
        "Account API app) for the Client ID and shop ID."
    );
  }
  return {
    shopId,
    clientId,
    apiVersion: env.SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION,
  };
}

export function isCustomerAccountConfigured(): boolean {
  return Boolean(
    env.SHOPIFY_SHOP_ID && env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID
  );
}

const authBase = (shopId: string) =>
  `https://shopify.com/authentication/${shopId}`;

const authorizeUrl = (shopId: string) => `${authBase(shopId)}/oauth/authorize`;
const tokenUrl = (shopId: string) => `${authBase(shopId)}/oauth/token`;
const logoutUrl = (shopId: string) => `${authBase(shopId)}/logout`;
const graphqlUrl = (shopId: string, apiVersion: string) =>
  `https://shopify.com/${shopId}/account/customer/api/${apiVersion}/graphql`;

// ─── Origin ──────────────────────────────────────────────────────────────────

/** Derives the app's public origin (e.g. https://example.com) from the request. */
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// ─── PKCE / crypto helpers ────────────────────────────────────────────────────

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function randomString(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return String.fromCharCode(...Array.from(array));
}

export function generateCodeVerifier(): string {
  return base64UrlEncode(randomString());
}

export async function generateCodeChallenge(
  codeVerifier: string
): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier)
  );
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(digest)));
}

export function generateState(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2);
}

export function generateNonce(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/** Reads the `nonce` claim from an OpenID Connect id_token (JWT). */
export function getNonceFromIdToken(idToken: string): string | undefined {
  try {
    const payload = idToken.split(".")[1];
    const json = JSON.parse(
      Buffer.from(payload, "base64").toString("utf8")
    ) as { nonce?: string };
    return json.nonce;
  } catch {
    return undefined;
  }
}

// ─── OAuth flow ────────────────────────────────────────────────────────────────

export type AuthorizationRequest = {
  url: string;
  codeVerifier: string;
  state: string;
  nonce: string;
};

export async function buildAuthorizationUrl(
  origin: string
): Promise<AuthorizationRequest> {
  const { shopId, clientId } = getCustomerAccountConfig();

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();
  const nonce = generateNonce();

  const url = new URL(authorizeUrl(shopId));
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", LOGIN_SCOPE);
  url.searchParams.set("response_type", "code");
  url.searchParams.set(
    "redirect_uri",
    `${origin}${CUSTOMER_ACCOUNT_CALLBACK_PATH}`
  );
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  return { url: url.toString(), codeVerifier, state, nonce };
}

export type TokenSet = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  /** Absolute expiry time in ms since epoch (with a 2 min safety margin). */
  expiresAt: number;
};

type RawTokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
};

function toTokenSet(
  raw: RawTokenResponse,
  previousIdToken?: string
): TokenSet {
  if (raw.error || !raw.access_token) {
    throw new Error(
      raw.error_description || raw.error || "Token request failed."
    );
  }
  return {
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token ?? "",
    idToken: raw.id_token ?? previousIdToken ?? "",
    expiresAt: Date.now() + ((raw.expires_in ?? 7200) - 120) * 1000,
  };
}

export async function exchangeCodeForToken(params: {
  code: string;
  codeVerifier: string;
  origin: string;
}): Promise<TokenSet> {
  const { shopId, clientId } = getCustomerAccountConfig();

  const body = new URLSearchParams();
  body.append("grant_type", "authorization_code");
  body.append("client_id", clientId);
  body.append("redirect_uri", `${params.origin}${CUSTOMER_ACCOUNT_CALLBACK_PATH}`);
  body.append("code", params.code);
  body.append("code_verifier", params.codeVerifier);

  const res = await fetch(tokenUrl(shopId), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
      Origin: params.origin,
    },
    body,
  });

  const raw = (await res.json()) as RawTokenResponse;
  return toTokenSet(raw);
}

export async function refreshAccessToken(params: {
  refreshToken: string;
  idToken: string;
  origin: string;
}): Promise<TokenSet> {
  const { shopId, clientId } = getCustomerAccountConfig();

  const body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("refresh_token", params.refreshToken);
  body.append("client_id", clientId);

  const res = await fetch(tokenUrl(shopId), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
      Origin: params.origin,
    },
    body,
  });

  const raw = (await res.json()) as RawTokenResponse;
  const tokens = toTokenSet(raw, params.idToken);
  // Shopify keeps the same refresh token when one isn't returned.
  if (!tokens.refreshToken) tokens.refreshToken = params.refreshToken;
  return tokens;
}

export function buildLogoutUrl(idToken: string, origin: string): string {
  const { shopId } = getCustomerAccountConfig();
  const url = new URL(logoutUrl(shopId));
  url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", origin);
  return url.toString();
}

// ─── GraphQL ──────────────────────────────────────────────────────────────────

export async function customerAccountFetch<T>(params: {
  query: string;
  variables?: Record<string, unknown>;
  accessToken: string;
  origin: string;
}): Promise<T> {
  const { shopId, apiVersion } = getCustomerAccountConfig();

  const res = await fetch(graphqlUrl(shopId, apiVersion), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
      Origin: params.origin,
      Authorization: params.accessToken,
    },
    body: JSON.stringify({
      query: params.query,
      variables: params.variables ?? {},
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Customer Account API request failed: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  if (!json.data) {
    throw new Error("Customer Account API returned no data.");
  }
  return json.data;
}
