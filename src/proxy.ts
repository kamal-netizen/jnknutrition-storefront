import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_PREFIXES } from "@/lib/i18n";

// Internal [lang] segment for the default (un-prefixed) locale. Public URLs stay
// un-prefixed; requests are rewritten under this segment so app/[lang] renders.
const DEFAULT_LOCALE_SEGMENT = "en-ae";

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

type AuthOutcome =
  | { kind: "noop" }
  | { kind: "clear" }
  | { kind: "set"; value: string };

/**
 * Refreshes the customer's access token when it has expired. Returns the action
 * to apply to the outgoing response (and mutates the request cookie so the
 * current render reads the fresh token). Only meaningful on account routes.
 */
async function refreshAuth(req: NextRequest): Promise<AuthOutcome> {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return { kind: "noop" };

  let session: TokenSet;
  try {
    session = JSON.parse(raw) as TokenSet;
  } catch {
    return { kind: "noop" };
  }

  if (session.expiresAt > Date.now()) return { kind: "noop" };
  if (!session.refreshToken) return { kind: "clear" };

  const shopId = process.env.SHOPIFY_SHOP_ID;
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  if (!shopId || !clientId) return { kind: "noop" };

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

    if (!data.access_token) return { kind: "clear" };

    const refreshed: TokenSet = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? session.refreshToken,
      idToken: data.id_token ?? session.idToken,
      expiresAt: Date.now() + ((data.expires_in ?? 7200) - 120) * 1000,
    };

    const value = JSON.stringify(refreshed);
    // Forward the new token onto the current request so the render sees it.
    req.cookies.set(SESSION_COOKIE, value);
    return { kind: "set", value };
  } catch {
    // Transient failure — leave the cookie untouched for this pass.
    return { kind: "noop" };
  }
}

function applyAuth(res: NextResponse, outcome: AuthOutcome): NextResponse {
  if (outcome.kind === "clear") res.cookies.delete(SESSION_COOKIE);
  if (outcome.kind === "set") res.cookies.set(SESSION_COOKIE, outcome.value, COOKIE_OPTIONS);
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const firstSeg = pathname.split("/")[1];

  // The internal default-locale prefix must never be publicly addressable —
  // redirect /en-ae/* to the clean un-prefixed URL (avoids duplicate content).
  if (firstSeg === DEFAULT_LOCALE_SEGMENT) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(`/${DEFAULT_LOCALE_SEGMENT}`.length) || "/";
    return NextResponse.redirect(url, 308);
  }

  const isPrefixedLocale = LOCALE_PREFIXES.includes(firstSeg);

  // Auth refresh only matters on account routes (in any locale).
  const outcome = pathname.includes("/account")
    ? await refreshAuth(req)
    : ({ kind: "noop" } as AuthOutcome);

  // Prefixed locales (e.g. /ar/...) already resolve app/[lang]=ar directly.
  if (isPrefixedLocale) {
    return applyAuth(
      NextResponse.next({ request: { headers: req.headers } }),
      outcome
    );
  }

  // Un-prefixed default locale: rewrite under /en-ae so app/[lang] renders,
  // while the browser URL stays clean.
  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE_SEGMENT}${pathname === "/" ? "" : pathname}`;
  return applyAuth(
    NextResponse.rewrite(url, { request: { headers: req.headers } }),
    outcome
  );
}

export const config = {
  // Run on everything except Next internals, API routes, and files with an
  // extension (sitemap.xml, robots.txt, favicon.ico, images, etc.).
  matcher: ["/((?!_next|api|.*\\.).*)"],
};
