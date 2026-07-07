import { redirect } from "next/navigation";
import { buildAuthorizationUrl, getOrigin } from "@/lib/customer-account";
import { setPkce } from "@/lib/auth";

// Starts the Shopify New Customer Accounts login (email + one-time passcode).
// Redirects the browser to Shopify's hosted authorization page.
export async function GET() {
  const origin = await getOrigin();
  const { url, codeVerifier, state, nonce } = await buildAuthorizationUrl(origin);
  await setPkce({ codeVerifier, state, nonce });
  redirect(url);
}
