import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalCustomer } from "@/lib/customer-server";
import { isCustomerAccountConfigured } from "@/lib/customer-account";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sign In",
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_request: "Your sign-in session expired. Please try again.",
  invalid_nonce: "We couldn't verify your sign-in. Please try again.",
  access_denied: "Sign-in was cancelled.",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const customer = await getOptionalCustomer();
  if (customer) redirect("/account");

  const { error } = await searchParams;
  const configured = isCustomerAccountConfigured();
  const errorMessage = error
    ? ERROR_MESSAGES[error] ?? "Something went wrong. Please try again."
    : null;

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <h1 className="text-3xl font-black text-[#0B0F14] uppercase tracking-tight text-center mb-2">
        Sign In
      </h1>
      <p className="text-[#64748B] text-center mb-8">
        Access your orders and account. We&apos;ll email you a one-time code —
        no password needed.
      </p>

      {errorMessage && (
        <div className="mb-6 rounded border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
          {errorMessage}
        </div>
      )}

      {configured ? (
        <Button
          render={<a href="/account/authorize" />}
          nativeButton={false}
          className="w-full h-12 bg-[#F9D20F] text-[#0B0F14] font-bold hover:bg-[#E7BF00] uppercase tracking-wide"
        >
          Continue with Email
        </Button>
      ) : (
        <div className="rounded border border-[#E2E8F0] bg-[#F5F7FA] px-4 py-3 text-sm text-[#64748B]">
          Customer accounts aren&apos;t configured yet. Set
          {" "}
          <code className="text-[#0B0F14]">SHOPIFY_SHOP_ID</code> and
          {" "}
          <code className="text-[#0B0F14]">SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID</code>
          {" "}
          to enable sign-in.
        </div>
      )}
    </div>
  );
}
