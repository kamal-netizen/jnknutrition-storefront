import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "jnk_customer_token";

export async function getCustomerToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function setCustomerToken(
  token: string,
  expiresAt: string
): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearCustomerToken(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
