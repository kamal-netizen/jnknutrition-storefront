import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPolicies } from "@/lib/queries/content";
import type { Policy, ShopPolicies } from "@/lib/queries/content";

export const revalidate = 600;

type Props = {
  params: Promise<{ handle: string }>;
};

const HANDLE_MAP: Record<string, keyof ShopPolicies> = {
  "privacy-policy": "privacyPolicy",
  "refund-policy": "refundPolicy",
  "shipping-policy": "shippingPolicy",
  "terms-of-service": "termsOfService",
};

async function resolvePolicy(handle: string): Promise<Policy | null> {
  const key = HANDLE_MAP[handle];
  if (!key) return null;
  const policies = await getPolicies();
  return policies[key];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const policy = await resolvePolicy(handle);
  if (!policy) return { title: "Policy Not Found" };
  return { title: policy.title };
}

export default async function PolicyPage({ params }: Props) {
  const { handle } = await params;
  const policy = await resolvePolicy(handle);

  if (!policy) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-4xl md:text-5xl font-black text-[#0B0F14] uppercase tracking-tight mb-8">
        {policy.title}
      </h1>
      <div
        dir="auto"
        className="prose max-w-none text-[#64748B] [&_a]:text-[#F9D20F] [&_h2]:text-[#0B0F14] [&_h3]:text-[#0B0F14] [&_strong]:text-[#0B0F14]"
        dangerouslySetInnerHTML={{ __html: policy.body }}
      />
    </div>
  );
}
