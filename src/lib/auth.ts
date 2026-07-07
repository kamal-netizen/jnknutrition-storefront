import "server-only";
import { cookies } from "next/headers";
import {
  refreshAccessToken,
  getOrigin,
  type TokenSet,
} from "@/lib/customer-account";

const SESSION_COOKIE = "jnk_customer_session";
const PKCE_COOKIE = "jnk_oauth";

// ─── Session (post-login tokens) ──────────────────────────────────────────────

export type CustomerSession = TokenSet;

export async function getSession(): Promise<CustomerSession | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomerSession;
  } catch {
    return null;
  }
}

export async function setSession(session: CustomerSession): Promise<void> {
  const store = await cookies();
  try {
    store.set(SESSION_COOKIE, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // Refresh tokens outlive access tokens; keep the cookie for 30 days.
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch {
    // Cookies can't be mutated during a Server Component render. The caller
    // still receives the fresh token for the current request; it will be
    // persisted on the next Server Action or Route Handler invocation.
  }
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  try {
    store.delete(SESSION_COOKIE);
  } catch {
    // See setSession: cookie mutation is a no-op during render.
  }
}

/**
 * Returns a valid Customer Account API access token, transparently refreshing
 * it when expired. Returns null when the user is not logged in or the refresh
 * fails (in which case the session is cleared).
 */
export async function getValidAccessToken(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;

  if (session.expiresAt > Date.now()) {
    return session.accessToken;
  }

  if (!session.refreshToken) {
    await clearSession();
    return null;
  }

  try {
    const origin = await getOrigin();
    const refreshed = await refreshAccessToken({
      refreshToken: session.refreshToken,
      idToken: session.idToken,
      origin,
    });
    await setSession(refreshed);
    return refreshed.accessToken;
  } catch {
    await clearSession();
    return null;
  }
}

// ─── PKCE (short-lived, during the OAuth redirect handshake) ──────────────────

export type PkceState = {
  codeVerifier: string;
  state: string;
  nonce: string;
};

export async function setPkce(pkce: PkceState): Promise<void> {
  const store = await cookies();
  store.set(PKCE_COOKIE, JSON.stringify(pkce), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes to complete the login
  });
}

export async function getPkce(): Promise<PkceState | null> {
  const store = await cookies();
  const raw = store.get(PKCE_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PkceState;
  } catch {
    return null;
  }
}

export async function clearPkce(): Promise<void> {
  const store = await cookies();
  store.delete(PKCE_COOKIE);
}
