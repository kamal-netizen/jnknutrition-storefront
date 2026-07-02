import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { getPage } from "@/lib/queries/content";
import ContactForm from "@/components/ContactForm";

export const revalidate = 600;

// Update these with your real business details.
const CONTACT_EMAIL = "support@jnknutrition.com";
const CONTACT_PHONE = "+971 4 000 0000";
const CONTACT_PHONE_HREF = "+97140000000";
const WHATSAPP = "+971 50 000 0000";
const WHATSAPP_HREF = "971500000000";
const ADDRESS = "Dubai, United Arab Emirates";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("contact");
  return {
    title: page?.seo.title || page?.title || "Contact Us",
    description:
      page?.seo.description ||
      page?.bodySummary ||
      "Get in touch with the JNK team — we're here to help with orders, products, and anything else.",
  };
}

const METHODS = [
  {
    icon: Mail,
    title: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: Phone,
    title: "Call Us",
    value: CONTACT_PHONE,
    href: `tel:${CONTACT_PHONE_HREF}`,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: WHATSAPP,
    href: `https://wa.me/${WHATSAPP_HREF}`,
  },
  {
    icon: MapPin,
    title: "Location",
    value: ADDRESS,
    href: null,
  },
] as const;

export default async function ContactPage() {
  const page = await getPage("contact");

  return (
    <div className="flex flex-col">
      {/* ─── Hero band ────────────────────────────────────────── */}
      <section className="bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 w-full">
          <p className="text-[#F9D20F] text-xs font-black uppercase tracking-[0.2em] mb-3">
            Contact
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
            {page?.title || "Get In Touch"}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[#94A3B8] max-w-2xl">
            Questions about an order, a product, or your training goals? Our team
            is here to help — reach out any way you like.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ─── Contact methods ──────────────────────────────── */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#0B0F14] uppercase tracking-tight mb-6">
              Reach Us
            </h2>

            {page?.body ? (
              <div
                className="prose max-w-none text-[#64748B] mb-8 [&_a]:text-[#F9D20F] [&_h2]:text-[#0B0F14] [&_h3]:text-[#0B0F14] [&_strong]:text-[#0B0F14]"
                dangerouslySetInnerHTML={{ __html: page.body }}
              />
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {METHODS.map((method) => {
                const Icon = method.icon;
                const inner = (
                  <>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F9D20F] text-[#0B0F14] shrink-0">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">
                        {method.title}
                      </p>
                      <p className="text-sm font-medium text-[#0B0F14] break-words">
                        {method.value}
                      </p>
                    </div>
                  </>
                );
                return method.href ? (
                  <a
                    key={method.title}
                    href={method.href}
                    className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-4 hover:border-[#F9D20F] transition-colors"
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={method.title}
                    className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-4"
                  >
                    {inner}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-lg border border-[#E2E8F0] bg-[#EEF4FF] p-4">
              <Clock className="h-5 w-5 text-[#0B0F14] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#0B0F14] uppercase tracking-wide">
                  Support Hours
                </p>
                <p className="text-sm text-[#64748B]">
                  Sat – Thu, 9:00 AM – 9:00 PM (GST). We reply within 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* ─── Contact form ─────────────────────────────────── */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#0B0F14] uppercase tracking-tight mb-6">
              Send A Message
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ─── CTA band ─────────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14 w-full text-center">
          <p className="text-[#64748B]">
            Looking for quick answers? Check our{" "}
            <Link
              href="/pages/faq"
              className="text-[#0B0F14] font-bold hover:text-[#E7BF00] underline"
            >
              FAQ page
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
