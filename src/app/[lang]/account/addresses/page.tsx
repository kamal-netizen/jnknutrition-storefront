import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { requireCustomer } from "@/lib/customer-server";
import AddressManager from "@/components/account/AddressManager";

export const metadata: Metadata = {
  title: "My Addresses",
};

export default async function AddressesPage() {
  const customer = await requireCustomer();
  const addresses = customer.addresses;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/account"
          className="text-sm text-[#64748B] hover:text-[#0B0F14] transition-colors"
        >
          ← Account
        </Link>
      </div>

      <h1 className="text-4xl font-black text-[#0B0F14] uppercase tracking-tight mb-8">
        Addresses
      </h1>

      <AddressManager addresses={addresses} />
    </div>
  );
}
