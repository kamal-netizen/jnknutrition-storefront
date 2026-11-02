import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/LocaleLink";
import { ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";
import { getTopDiscountedProducts } from "@/lib/queries/products";
import ProductCard from "@/components/ProductCard";
import { absoluteUrl } from "@/lib/seo";
import { getLocale, localizePath } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { isDiwaliLive, DIWALI_OFFERS_PATH } from "@/lib/seasonal";
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
 * first. A banner header, then a plain grid of ProductCards, which already
 * carry the sale price, the struck-through compare-at price and the "-x%"
 * badge. Outside the festival window, and on
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#55637A]"
      >
        <Link href="/" className="transition-colors hover:text-[#0B0F14]">
          {dict.common.home}
        </Link>
        <ChevronRight className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />
        <span className="text-[#0B0F14]">{t.diwaliOffersTitle}</span>
      </nav>

      {/* The page's header is its banner: 1920 × 640 (3:1) artwork with the
          title and offer baked in, framed like the homepage hero. English only,
          like the page. The heading is still in the markup, for screen readers
          and search, but not drawn a second time under the artwork that already
          shows it. The banner is the LCP element on every viewport, so it
          preloads. */}
      <h1 className="sr-only">{t.diwaliOffersTitle}</h1>
      <div className="mb-8 rounded-2xl border border-[#E7ECF2] p-1 shadow-[0_12px_32px_-16px_rgba(11,15,20,0.25)]">
        <div className="relative aspect-[3/1] overflow-hidden rounded-xl bg-[#0B0F14]">
          <Image
            src="/banners/2026-11/diwali-offers-page-en-1920x640.webp"
            alt="Diwali Offers, 1–12 Nov — up to 54% off genuine supplements"
            fill
            preload
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
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
