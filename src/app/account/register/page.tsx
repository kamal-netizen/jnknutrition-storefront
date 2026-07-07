import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalCustomer } from "@/lib/customer-server";

export const metadata: Metadata = {
  title: "Create Account",
};

// New Customer Accounts create the account as part of the hosted email + OTP
// flow, so there's no separate registration form — send users to sign-in.
export default async function RegisterPage() {
  const customer = await getOptionalCustomer();
  if (customer) redirect("/account");
  redirect("/account/login");
}
