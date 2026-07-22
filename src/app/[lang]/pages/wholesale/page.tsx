import type { Metadata } from "next";
import type { SVGProps } from "react";
import Link from "@/components/LocaleLink";
import {
  Store,
  Truck,
  BadgeCheck,
  Wallet,
  Globe,
  Tags,
  Handshake,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";
import { getLocale, localizePath, hreflangAlternates } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.05 21.5h-.01a9.42 9.42 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43 2.52 0 4.88.98 6.66 2.76a9.36 9.36 0 0 1 2.76 6.67c-.01 5.2-4.24 9.43-9.44 9.43Zm8.02-17.46A11.32 11.32 0 0 0 12.05.7C5.8.7.72 5.78.72 12.02c0 2 .52 3.95 1.52 5.67L.62 23.3l5.76-1.51a11.3 11.3 0 0 0 5.66 1.44h.01c6.24 0 11.32-5.08 11.32-11.32 0-3.03-1.18-5.87-3.32-8.01Z" />
    </svg>
  );
}

const WHOLESALE_PATH = "/pages/wholesale";

/** B2B / trade-intent keyword cluster — low competition, high commercial value. */
const WHOLESALE_KEYWORDS = [
  "wholesale supplements UAE",
  "bulk supplements UAE",
  "wholesale supplements Dubai",
  "supplement distributor UAE",
  "supplement distributor Dubai",
  "wholesale sports nutrition UAE",
  "supplement export UAE",
  "private label supplements UAE",
  "private label protein manufacturer",
  "become a supplement distributor",
  "bulk protein wholesale Dubai",
  "gym supplement supplier UAE",
  "JNK Nutrition wholesale",
];

const WHATSAPP_NUMBER = "971556238582";
const WHATSAPP_DISPLAY = "+971 55 623 8582";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi JNK Nutrition, I'm interested in your wholesale program.",
)}`;

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = getLocale(lang);
  const w = getDictionary(locale).wholesale;
  const url = localizePath(WHOLESALE_PATH, locale);
  return {
    // `absolute` owns an exact, keyword-led SERP title (bypasses the root
    // "%s | JNK Nutrition" template) while still carrying the brand suffix.
    title: { absolute: w.metaTitle },
    description: w.metaDescription,
    keywords: WHOLESALE_KEYWORDS,
    alternates: {
      canonical: url,
      languages: hreflangAlternates(WHOLESALE_PATH),
    },
    openGraph: {
      title: w.ogTitle,
      description: w.metaDescription,
      url,
      type: "website",
    },
  };
}

export default async function WholesalePage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocale(lang);
  const w = getDictionary(locale).wholesale;
  const pageUrl = absoluteUrl(localizePath(WHOLESALE_PATH, locale));

  const BENEFITS = [
    { icon: BadgeCheck, title: w.benefit1Title, body: w.benefit1Body },
    { icon: Wallet, title: w.benefit2Title, body: w.benefit2Body },
    { icon: Truck, title: w.benefit3Title, body: w.benefit3Body },
    { icon: Store, title: w.benefit4Title, body: w.benefit4Body },
  ];

  const SERVICES = [
    { icon: Globe, title: w.service1Title, body: w.service1Body },
    { icon: Tags, title: w.service2Title, body: w.service2Body },
    { icon: Handshake, title: w.service3Title, body: w.service3Body },
    { icon: BookOpen, title: w.service4Title, body: w.service4Body },
  ];

  const STEPS = [
    { step: "01", title: w.step1Title, body: w.step1Body },
    { step: "02", title: w.step2Title, body: w.step2Body },
    { step: "03", title: w.step3Title, body: w.step3Body },
    { step: "04", title: w.step4Title, body: w.step4Body },
  ];

  // Localized FAQ — the visible content AND the FAQPage markup share this source
  // so the structured data always matches what the crawler sees on the page.
  const FAQS = [
    { q: w.faq1Q, a: w.faq1A },
    { q: w.faq2Q, a: w.faq2A },
    { q: w.faq3Q, a: w.faq3A },
    { q: w.faq4Q, a: w.faq4A },
    { q: w.faq5Q, a: w.faq5A },
    { q: w.faq6Q, a: w.faq6A },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl(localizePath("/", locale)),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Wholesale",
        item: pageUrl,
      },
    ],
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Wholesale Supplement Supply & Distribution",
    serviceType: "Wholesale supplement distribution",
    description: w.metaDescription,
    url: pageUrl,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: [
      { "@type": "Country", name: "United Arab Emirates" },
      { "@type": "AdministrativeArea", name: "GCC" },
      "Worldwide",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "JNK Nutrition Wholesale Services",
      itemListElement: SERVICES.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.title,
          description: s.body,
        },
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div dir="auto" className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* ─── Hero band ────────────────────────────────────────── */}
      <section className="bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
          <p className="text-[#F9D20F] text-xs font-black uppercase tracking-[0.2em] mb-3">
            {w.eyebrow}
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight max-w-4xl">
            {w.heroTitle}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[#94A3B8] max-w-2xl">
            {w.heroBodyA}
            <span className="text-white">{w.heroBodyHighlight}</span>
            {w.heroBodyB}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-[#0B0F14] font-bold uppercase tracking-wide px-6 py-3 rounded hover:bg-[#1EBE57] transition-colors"
            >
              <WhatsAppIcon className="w-5 h-5" />
              {w.chatWhatsApp}
            </a>
            <Link
              href="/pages/contact"
              className="inline-flex items-center border border-[#334155] text-white font-bold uppercase tracking-wide px-6 py-3 rounded hover:border-[#F9D20F] hover:text-[#F9D20F] transition-colors"
            >
              {w.contactUs}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Benefits ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        <h2 className="text-2xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight mb-8">
          {w.whyPartner}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-[#E2E8F0] bg-white p-6"
            >
              <Icon className="w-8 h-8 text-[#F9D20F]" />
              <h3 className="mt-4 text-lg font-bold text-[#0B0F14]">{title}</h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Services ─────────────────────────────────────────── */}
      <section className="bg-[#EEF4FF] border-y border-[#CBD5E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
          <h2 className="text-2xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight mb-3">
            {w.servicesTitle}
          </h2>
          <p className="text-[#64748B] max-w-2xl mb-8">{w.servicesSub}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex gap-4 rounded-xl border border-[#CBD5E1] bg-white p-6"
              >
                <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-[#F9D20F]/15">
                  <Icon className="w-6 h-6 text-[#B8860B]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0B0F14]">{title}</h3>
                  <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works / Sales guide ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        <h2 className="text-2xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight mb-3">
          {w.howItWorks}
        </h2>
        <p className="text-[#64748B] max-w-2xl mb-8">{w.howItWorksSub}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ step, title, body }) => (
            <div key={step} className="relative rounded-xl border border-[#E2E8F0] bg-white p-6">
              <span className="text-3xl font-black text-[#F9D20F]">{step}</span>
              <h3 className="mt-3 text-lg font-bold text-[#0B0F14]">{title}</h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ (crawlable content + FAQPage rich results) ───── */}
      <section className="bg-[#F5F7FA] border-y border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
          <h2 className="text-2xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight mb-3">
            {w.faqTitle}
          </h2>
          <p className="text-[#64748B] mb-8">{w.faqSub}</p>
          <div className="flex flex-col gap-3">
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-[#0B0F14]">
                  {q}
                  <ChevronDown
                    className="w-5 h-5 shrink-0 text-[#F9D20F] transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="mt-3 text-sm text-[#64748B] leading-relaxed">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WhatsApp CTA ─────────────────────────────────────── */}
      <section className="bg-[#082D4C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              {w.ctaTitle}
            </h2>
            <p className="mt-2 text-[#C7D0DA]">
              {w.ctaBodyA}
              <span dir="ltr" className="font-bold text-white">
                {WHATSAPP_DISPLAY}
              </span>
              {w.ctaBodyB}
            </p>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 shrink-0 bg-[#25D366] text-[#0B0F14] font-bold uppercase tracking-wide px-8 py-4 rounded hover:bg-[#1EBE57] transition-colors"
          >
            <WhatsAppIcon className="w-5 h-5" />
            {w.chatWhatsApp}
          </a>
        </div>
      </section>
    </div>
  );
}
