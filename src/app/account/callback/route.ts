import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import {
  exchangeCodeForToken,
  getNonceFromIdToken,
  getOrigin,
} from "@/lib/customer-account";
import { getPkce, clearPkce, setSession } from "@/lib/auth";

// OAuth redirect target. Shopify sends the user back here with `code` + `state`
// after they authenticate with email + one-time passcode.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const error = params.get("error");

  if (error) {
    redirect(`/account/login?error=${encodeURIComponent(error)}`);
  }

  const pkce = await getPkce();
  if (!code || !state || !pkce || state !== pkce.state) {
    await clearPkce();
    redirect("/account/login?error=invalid_request");
  }

  const origin = await getOrigin();
  const tokens = await exchangeCodeForToken({
    code,
    codeVerifier: pkce.codeVerifier,
    origin,
  });

  // Verify the id_token nonce matches the one we generated to prevent replay.
  if (getNonceFromIdToken(tokens.idToken) !== pkce.nonce) {
    await clearPkce();
    redirect("/account/login?error=invalid_nonce");
  }

  await setSession(tokens);
  await clearPkce();
  redirect("/account");
}
