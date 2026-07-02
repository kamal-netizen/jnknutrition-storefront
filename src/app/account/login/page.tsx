import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalCustomer } from "@/lib/customer-server";
import LoginForm from "@/components/account/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function LoginPage() {
  const customer = await getOptionalCustomer();
  if (customer) redirect("/account");

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <h1 className="text-3xl font-black text-[#0B0F14] uppercase tracking-tight text-center mb-2">
        Sign In
      </h1>
      <p className="text-[#64748B] text-center mb-8">
        Welcome back. Access your orders and account.
      </p>
      <LoginForm />
    </div>
  );
}
