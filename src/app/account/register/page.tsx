import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalCustomer } from "@/lib/customer-server";
import RegisterForm from "@/components/account/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
};

export default async function RegisterPage() {
  const customer = await getOptionalCustomer();
  if (customer) redirect("/account");

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <h1 className="text-3xl font-black text-[#0B0F14] uppercase tracking-tight text-center mb-2">
        Create Account
      </h1>
      <p className="text-[#64748B] text-center mb-8">
        Join JNK and track your orders.
      </p>
      <RegisterForm />
    </div>
  );
}
