import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { Plus } from "lucide-react";
import { getPage } from "@/lib/queries/content";

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("faq");
  return {
    title: page?.seo.title || page?.title || "FAQ",
    description:
      page?.seo.description ||
      page?.bodySummary ||
      "Answers to the most common questions about orders, shipping, returns, and products at JNK.",
  };
}

type FaqItem = { q: string; a: string };
type FaqGroup = { title: string; items: FaqItem[] };

const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "Orders & Payment",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse our collections, add items to your cart, and proceed to secure checkout. You can check out as a guest or sign in to your account for faster ordering.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept Visa, Mastercard, Amex, and Apple Pay through our secure, encrypted checkout.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "If your order hasn't shipped yet, contact us as soon as possible and we'll do our best to update or cancel it.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        q: "How much does shipping cost?",
        a: "Shipping is free on orders over AED149. Orders below that are charged a flat delivery fee shown at checkout.",
      },
      {
        q: "How long will delivery take?",
        a: "Most orders are dispatched within 24 hours and delivered within 2–4 business days, depending on your location.",
      },
      {
        q: "Can I track my order?",
        a: "Yes. Once your order ships you'll receive a tracking link by email, and you can also view status from your account under Orders.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "Unopened products in original condition can be returned within the window described in our Refund Policy. Sealed supplements cannot be returned once opened for hygiene reasons.",
      },
      {
        q: "How long do refunds take?",
        a: "Approved refunds are processed to your original payment method, typically within 5–10 business days.",
      },
    ],
  },
  {
    title: "Products & Authenticity",
    items: [
      {
        q: "Are your products 100% authentic?",
        a: "Absolutely. Every product is sourced directly from authorised distributors and brand partners — we never sell counterfeits.",
      },
      {
        q: "How should I store my supplements?",
        a: "Keep products in a cool, dry place away from direct sunlight, and always reseal tubs tightly after use.",
      },
      {
        q: "Which product is right for me?",
        a: "Not sure where to start? Reach out via our Contact page and our team will help you build the right stack for your goals.",
      },
    ],
  },
];

export default async function FaqPage() {
  const page = await getPage("faq");

  return (
    <div dir="auto" className="flex flex-col">
      {/* ─── Hero band ────────────────────────────────────────── */}
      <section className="bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 w-full">
          <p className="text-[#F9D20F] text-xs font-black uppercase tracking-[0.2em] mb-3">
            Help Center
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
            {page?.title || "Frequently Asked Questions"}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[#94A3B8] max-w-2xl">
            Everything you need to know about orders, shipping, returns, and our
            products. Can&apos;t find your answer? We&apos;re one message away.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        {page?.body ? (
          <div
            dir="auto"
            className="prose max-w-none text-[#64748B] mb-12 [&_a]:text-[#F9D20F] [&_h2]:text-[#0B0F14] [&_h3]:text-[#0B0F14] [&_strong]:text-[#0B0F14]"
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        ) : null}

        <div className="space-y-10">
          {FAQ_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="text-xl md:text-2xl font-black text-[#0B0F14] uppercase tracking-tight mb-4">
                {group.title}
              </h2>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] open:border-[#F9D20F] transition-colors"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 list-none [&::-webkit-details-marker]:hidden">
                      <span className="text-sm md:text-base font-bold text-[#0B0F14]">
                        {item.q}
                      </span>
                      <Plus className="h-5 w-5 shrink-0 text-[#64748B] transition-transform group-open:rotate-45 group-open:text-[#0B0F14]" />
                    </summary>
                    <p className="px-5 pb-5 -mt-1 text-sm text-[#64748B] leading-relaxed">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA band ─────────────────────────────────────────── */}
      <section className="bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full text-center">
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">
            Still Have Questions?
          </h2>
          <p className="mt-3 text-[#94A3B8] max-w-xl mx-auto">
            Our team is happy to help with anything we haven&apos;t covered.
          </p>
          <Link
            href="/pages/contact"
            className="mt-6 inline-flex items-center bg-[#F9D20F] text-[#0B0F14] font-bold uppercase tracking-wide px-8 py-4 rounded hover:bg-[#E7BF00] transition-colors"
          >
            Contact Us →
          </Link>
        </div>
      </section>
    </div>
  );
}
