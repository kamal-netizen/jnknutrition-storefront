import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { ShieldCheck, Zap, Headphones, BadgeCheck } from "lucide-react";
import { getPage } from "@/lib/queries/content";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import BrandCard, { BRANDS } from "@/components/home/BrandCard";

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return {
    title: page?.seo.title || page?.title || "About JNK",
    description:
      page?.seo.description ||
      page?.bodySummary ||
      "JNK is your trusted source for 100% authentic sports nutrition and supplements from the world's top brands.",
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = getLocale(lang);
  const dict = getDictionary(locale);
  const a = dict.about;
  const c = dict.common;
  const page = await getPage("about");

  const STATS = [
    { value: "50+", label: a.genuineBrands },
    { value: "2,000+", label: a.productsStocked },
    { value: "100%", label: a.authenticGuarantee },
    { value: "24/7", label: a.customerSupport },
  ];

  const VALUES = [
    { icon: BadgeCheck, title: a.val1Title, body: a.val1Body },
    { icon: Zap, title: a.val2Title, body: a.val2Body },
    { icon: ShieldCheck, title: a.val3Title, body: a.val3Body },
    { icon: Headphones, title: a.val4Title, body: a.val4Body },
  ];

  return (
    <div dir="auto" className="flex flex-col">
      {/* ─── Hero band ────────────────────────────────────────── */}
      <section className="bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
          <p className="text-[#F9D20F] text-xs font-black uppercase tracking-[0.2em] mb-3">
            {a.aboutUs}
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight max-w-4xl">
            {page?.title || a.heroTitle}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[#94A3B8] max-w-2xl">
            {a.heroBody}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/collections"
              className="inline-flex items-center bg-[#F9D20F] text-[#0B0F14] font-bold uppercase tracking-wide px-6 py-3 rounded hover:bg-[#E7BF00] transition-colors"
            >
              {c.shopNow} →
            </Link>
            <Link
              href="/pages/contact"
              className="inline-flex items-center border border-[#334155] text-white font-bold uppercase tracking-wide px-6 py-3 rounded hover:border-[#F9D20F] hover:text-[#F9D20F] transition-colors"
            >
              {a.contactUs}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats strip ──────────────────────────────────────── */}
      <section className="bg-[#EEF4FF] border-b border-[#CBD5E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <p className="text-3xl md:text-5xl font-black text-[#0B0F14] tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-bold uppercase tracking-wide text-[#64748B]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Story / Mission ──────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        <h2 className="text-2xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight mb-6">
          {a.ourStory}
        </h2>
        {page?.body ? (
          <div
            dir="auto"
            className="prose max-w-none text-[#64748B] [&_a]:text-[#F9D20F] [&_h2]:text-[#0B0F14] [&_h3]:text-[#0B0F14] [&_strong]:text-[#0B0F14]"
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        ) : (
          <div dir="auto" className="space-y-4 text-[#64748B] text-lg leading-relaxed">
            <p>{a.storyP1}</p>
            <p>{a.storyP2}</p>
          </div>
        )}
      </section>

      {/* ─── Values grid ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        <div className="mb-8">
          <h2 className="text-2xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight">
            {a.whyChoose}
          </h2>
          <p className="mt-2 text-[#64748B]">
            {a.whyChooseSub}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-6 hover:border-[#F9D20F] transition-colors"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F9D20F] text-[#0B0F14]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-black uppercase tracking-tight text-[#0B0F14]">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                  {value.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Brand strip ──────────────────────────────────────── */}
      <section className="bg-[#F8FAFC] border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
          <div className="mb-8">
            <h2 className="text-2xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight">
              {a.brandsWeCarry}
            </h2>
            <p className="mt-2 text-[#64748B]">
              {a.brandsWeCarrySub}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4">
            {BRANDS.map((brand) => (
              <BrandCard key={brand.handle} brand={brand} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA band ─────────────────────────────────────────── */}
      <section className="bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 w-full text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
            {a.ctaTitle}
          </h2>
          <p className="mt-4 text-[#94A3B8] max-w-xl mx-auto">
            {a.ctaBody}
          </p>
          <Link
            href="/collections"
            className="mt-8 inline-flex items-center bg-[#F9D20F] text-[#0B0F14] font-bold uppercase tracking-wide px-8 py-4 rounded hover:bg-[#E7BF00] transition-colors"
          >
            {a.shopAllProducts}
          </Link>
        </div>
      </section>
    </div>
  );
}
