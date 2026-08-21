import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { Mail, Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { getPage } from "@/lib/queries/content";
import ContactForm from "@/components/ContactForm";
import {
  BUSINESS_EMAIL,
  BUSINESS_PHONE,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_WHATSAPP,
  BUSINESS_WHATSAPP_DISPLAY,
  BUSINESS_MAPS_URL,
} from "@/lib/seo";

export const revalidate = 86400;

const CONTACT_EMAIL = BUSINESS_EMAIL;
const CONTACT_PHONE = BUSINESS_PHONE_DISPLAY;
const CONTACT_PHONE_HREF = BUSINESS_PHONE;
const WHATSAPP = BUSINESS_WHATSAPP_DISPLAY;
const WHATSAPP_HREF = BUSINESS_WHATSAPP;
const ADDRESS =
  "Shop 6, Baniyas Complex Building, Opp. Choithrams, Deira, Dubai";
const MAPS_URL = BUSINESS_MAPS_URL;

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
    title: "Visit Our Store",
    value: ADDRESS,
    href: MAPS_URL,
  },
] as const;

export default async function ContactPage() {
  const page = await getPage("contact");

  return (
    <div dir="auto" className="flex flex-col">
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
                dir="auto"
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
                    {...(method.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
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
                  Store Hours
                </p>
                <p className="text-sm text-[#64748B]">
                  Mon – Sat, 10:00 AM – 11:00 PM · Sun, 5:00 PM – 11:00 PM
                  (GST). We reply to messages within 24 hours.
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
