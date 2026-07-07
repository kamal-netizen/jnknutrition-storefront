import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "jnk_customer_session";

type TokenSet = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  /** Absolute expiry time in ms since epoch. */
  expiresAt: number;
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  // Refresh tokens outlive access tokens; keep the cookie for 30 days.
  maxAge: 60 * 60 * 24 * 30,
};

/**
 * Refreshes the customer's access token when it has expired, persisting the
 * rotated tokens to the cookie. Runs before the Server Component render, where
 * cookies can be safely mutated (unlike during render). The refreshed token is
 * also forwarded onto the current request so the page reads the fresh value.
 */
export async function middleware(req: NextRequest) {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return NextResponse.next();

  let session: TokenSet;
  try {
    session = JSON.parse(raw) as TokenSet;
  } catch {
    return NextResponse.next();
  }

  // Token is still valid — nothing to do.
  if (session.expiresAt > Date.now()) return NextResponse.next();

  // Expired with no refresh token — clear the dead session.
  if (!session.refreshToken) {
    const res = NextResponse.next();
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  const shopId = process.env.SHOPIFY_SHOP_ID;
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  if (!shopId || !clientId) return NextResponse.next();

  try {
    const body = new URLSearchParams();
    body.append("grant_type", "refresh_token");
    body.append("refresh_token", session.refreshToken);
    body.append("client_id", clientId);

    const tokenRes = await fetch(
      `https://shopify.com/authentication/${shopId}/oauth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "JNK Storefront",
          Origin: req.nextUrl.origin,
        },
        body,
      }
    );

    const data = (await tokenRes.json()) as {
      access_token?: string;
      expires_in?: number;
      id_token?: string;
      refresh_token?: string;
    };

    if (!data.access_token) {
      // Refresh was rejected (e.g. revoked token) — clear the session.
      const res = NextResponse.next();
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }

    const refreshed: TokenSet = {
      accessToken: data.access_token,
      // Shopify rotates refresh tokens; fall back to the old one if omitted.
      refreshToken: data.refresh_token ?? session.refreshToken,
      idToken: data.id_token ?? session.idToken,
      expiresAt: Date.now() + ((data.expires_in ?? 7200) - 120) * 1000,
    };

    const value = JSON.stringify(refreshed);
    // Forward the new token onto the current request so the render sees it…
    req.cookies.set(SESSION_COOKIE, value);
    const res = NextResponse.next({ request: { headers: req.headers } });
    // …and persist it back to the browser.
    res.cookies.set(SESSION_COOKIE, value, COOKIE_OPTIONS);
    return res;
  } catch {
    // Transient failure (e.g. network) — leave the cookie untouched. The page
    // will treat the request as logged-out for this pass without crashing.
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/account", "/account/:path*"],
};
