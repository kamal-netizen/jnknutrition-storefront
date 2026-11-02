import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";
import { getTopDiscountedProducts } from "@/lib/queries/products";
import ProductCard from "@/components/ProductCard";
import { Kandil } from "@/components/DiwaliToran";
import { absoluteUrl } from "@/lib/seo";
import { getLocale, localizePath } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { isDiwaliLive, DIWALI_CSS, DIWALI_OFFERS_CSS, DIWALI_OFFERS_PATH } from "@/lib/seasonal";
import { notAdHidden } from "@/lib/ad-landing";
import { FREE_SHIPPING_THRESHOLD, FREE_SHIPPING_CURRENCY } from "@/lib/shipping";

// Same schedule as the collections, so the page opens and closes with the
// festival window (lib/seasonal.ts) within half an hour, and prices follow
// Shopify on the same beat as the Today's Deals strip.
export const revalidate = 1800;

// Every in-stock markdown in the store fits well under this; it is the cap on
// the catalog scan, not a page size.
const MAX_OFFERS = 200;

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = getLocale(lang);
  const url = localizePath(DIWALI_OFFERS_PATH, locale);
  const title = "Diwali Offers — Supplement Deals in Dubai & UAE";
  const description =
    "Diwali deals on 100% genuine supplements — whey protein, creatine, " +
    "pre-workout and more, biggest discounts first. Free UAE delivery over " +
    `${FREE_SHIPPING_CURRENCY} ${FREE_SHIPPING_THRESHOLD}, cash on delivery.`;
  return {
    title,
    description,
    // English only, like the rest of the Diwali theme: /ar redirects.
    alternates: { canonical: url },
    openGraph: { type: "website", title, description, url },
  };
}

/**
 * The Diwali Offers page: every discounted in-stock product, biggest discount
 * first. Built like a collection tag page — the dark header box, then a plain
 * grid of ProductCards, which already carry the sale price, the struck-through
 * compare-at price and the "-x%" badge. Outside the festival window, and on
 * locales the theme doesn't cover, it hands over to Today's Deals.
 */
export default async function DiwaliOffersPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = getLocale(lang);
  if (!isDiwaliLive(locale.code)) {
    redirect(localizePath("/collections/today-deals", locale));
  }

  const dict = getDictionary(locale);
  const t = dict.home;
  const language = locale.isDefault ? undefined : locale.shopifyLanguage;
  const products = (await getTopDiscountedProducts(MAX_OFFERS, language)).filter(notAdHidden);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl(localizePath("/", locale)) },
      {
        "@type": "ListItem",
        position: 2,
        name: t.diwaliOffersTitle,
        item: absoluteUrl(localizePath(DIWALI_OFFERS_PATH, locale)),
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Hoisted into <head> and deduped by React; see DIWALI_OFFERS_CSS. */}
      <link rel="stylesheet" href={DIWALI_CSS} precedence="default" />
      <link rel="stylesheet" href={DIWALI_OFFERS_CSS} precedence="default" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="dwn-offers mb-8 rounded-3xl border border-white/10 px-6 py-10 sm:px-10 sm:py-12">
        <div className="dwl-stars" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        {(["a", "b"] as const).map((v) => (
          <span key={v} className={`dwl-kandil dwn-offers-lantern--${v}`} aria-hidden="true">
            <span className="dwl-kandil-swing">
              <span className="dwl-kandil-string" />
              <span className="dwl-kandil-glow" />
              <Kandil />
            </span>
          </span>
        ))}

        <div className="dwn-offers-copy relative z-[2]">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white/60"
          >
            <Link href="/" className="transition-colors hover:text-[#F9D20F]">
              {dict.common.home}
            </Link>
            <ChevronRight className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />
            <span className="text-white/90">{t.diwaliOffersTitle}</span>
          </nav>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#F9D20F]">
            {t.diwaliEyebrow}
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            {t.diwaliOffersTitle}
          </h1>
          <span
            aria-hidden="true"
            className="mt-4 block h-1 w-14 rounded-full bg-gradient-to-r from-[#F9D20F] to-[#F9D20F]/30"
          />
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
            {t.diwaliOffersBody}
          </p>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-12 text-center">
          <p className="text-lg font-bold text-[#0B0F14]">{t.diwaliOffersEmpty}</p>
          <p className="mt-2 text-sm text-[#55637A]">
            <Link
              href="/products"
              className="font-semibold text-[#0A3B66] underline"
            >
              {t.shopAllProducts}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
