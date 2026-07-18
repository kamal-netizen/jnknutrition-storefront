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
        <div className="space-y-3">
          <Button
            render={<a href="/account/authorize" />}
            nativeButton={false}
            className="w-full h-12 bg-[#F9D20F] text-[#0B0F14] font-bold hover:bg-[#E7BF00] uppercase tracking-wide"
          >
            Continue with Email
          </Button>

          <Button
            render={<a href="/account/authorize" />}
            nativeButton={false}
            className="w-full h-12 bg-[#5A31F4] text-white font-bold hover:bg-[#4A28D0] uppercase tracking-wide"
          >
            <ShopIcon />
            Continue with Shop
          </Button>

          <Button
            render={<a href="/account/authorize" />}
            nativeButton={false}
            className="w-full h-12 border-[#E2E8F0] bg-white text-[#0B0F14] font-bold hover:bg-[#F5F7FA] uppercase tracking-wide"
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <p className="text-center text-xs text-[#94A3B8]">
            You&apos;ll choose your sign-in method on the next screen.
          </p>
        </div>
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

function ShopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 7H4a1 1 0 0 0-1 1v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1Zm-8 8a3 3 0 0 1-3-3h2a1 1 0 0 0 2 0h2a3 3 0 0 1-3 3ZM8 6a4 4 0 0 1 8 0h-2a2 2 0 0 0-4 0H8Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.46h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.75Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3.02c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}
