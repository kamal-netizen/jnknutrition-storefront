import "server-only";
import { redirect } from "next/navigation";
import { getCustomerToken } from "@/lib/auth";
import { getCustomer } from "@/lib/queries/customer";
import type { Customer } from "@/lib/queries/customer";

/**
 * Returns the logged-in customer, or null if not authenticated.
 * Safe to call from any server component.
 */
export async function getOptionalCustomer(): Promise<Customer | null> {
  const token = await getCustomerToken();
  if (!token) return null;
  try {
    return await getCustomer(token);
  } catch {
    return null;
  }
}

/**
 * Returns the logged-in customer, or redirects to /account/login.
 * Use to protect account routes.
 */
export async function requireCustomer(): Promise<Customer> {
  const customer = await getOptionalCustomer();
  if (!customer) redirect("/account/login");
  return customer;
}
