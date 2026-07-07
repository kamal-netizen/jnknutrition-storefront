import Link from "next/link";
import CheckoutNotFound from "./CheckoutNotFound";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      {/*
        CheckoutNotFound is a client component that reads window.location at
        runtime. When Shopify bounces a checkout URL back to our domain
        (/cart/c/…), it shows a tailored message instead of the generic 404.
      */}
      <CheckoutNotFound>
        {/* Default 404 – shown for all non-checkout paths */}
        <div className="text-center max-w-md">
          <p className="text-7xl font-black text-[#F9D20F]">404</p>
          <h1 className="mt-4 text-3xl font-black text-[#0B0F14] uppercase tracking-tight">
            Page Not Found
          </h1>
          <p className="mt-3 text-[#64748B]">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-block mt-8 bg-[#F9D20F] text-[#0B0F14] font-black uppercase tracking-wide px-8 py-3 rounded hover:bg-[#E7BF00] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </CheckoutNotFound>
    </div>
  );
}

