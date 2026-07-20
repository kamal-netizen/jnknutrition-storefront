import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "@/components/LocaleLink";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getCollection, getCollections } from "@/lib/queries/collections";
import { getCollectionProductsView } from "@/lib/collection-products";
import CollectionBrowserView from "@/components/CollectionBrowserView";
import CollectionBrowserClient from "@/components/CollectionBrowserClient";
import { type ActiveFilters } from "@/lib/product-filters";
import {
  absoluteUrl,
  collectionFallbackTitle,
  collectionFallbackDescription,
} from "@/lib/seo";
import { getLocale, localizePath, hreflangAlternates } from "@/lib/i18n";
import { getCollectionSeo } from "@/lib/collection-seo";
import { loadMoreCollection } from "./actions";

export const revalidate = 300;

const DEFAULT_FILTERS: ActiveFilters = {
  includeSoldOut: false,
  vendors: [],
  productTypes: [],
  price: null,
  onSale: false,
  sortLabel: "",
};

type Props = {
  params: Promise<{ handle: string; lang: string }>;
};

export async function generateStaticParams() {
  const collections = await getCollections(50);
  return collections.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle, lang } = await params;
  const locale = getLocale(lang);
  const collection = await getCollection(handle, {
    first: 1,
    language: locale.isDefault ? undefined : locale.shopifyLanguage,
  });
  if (!collection) return { title: "Collection Not Found" };

  // Enriched English marketing copy applies to the default locale only; other
  // locales fall through to Shopify's own translated SEO fields.
  const seo = locale.isDefault ? getCollectionSeo(handle) : undefined;
  const title =
    seo?.title || collection.seo.title || collectionFallbackTitle(collection.title);
  const description =
    seo?.description ||
    collection.seo.description ||
    collectionFallbackDescription(collection.title);
  const basePath = `/collections/${collection.handle}`;
  const url = localizePath(basePath, locale);

  // No `searchParams` read here (intentionally — see the page component
  // below): every filter/sort variant of this URL now serves the same
  // cached, canonical HTML, with filtering applied client-side. There's no
  // longer a server-rendered "filtered" response for crawlers to see, so a
  // single canonical metadata block covers every query-string variant.
  return {
    title,
    description,
    alternates: { canonical: url, languages: hreflangAlternates(basePath) },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      images: collection.image
        ? [
            {
              url: collection.image.url,
              width: collection.image.width,
              height: collection.image.height,
              alt: collection.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { handle, lang } = await params;
  const locale = getLocale(lang);
  const language = locale.isDefault ? undefined : locale.shopifyLanguage;

  // No `searchParams` read here — that's what keeps this route statically
  // cacheable (ISR, revalidate=300) instead of forced-dynamic on every visit,
  // across all 100+ collections. Filter/sort interactions are handled
  // client-side in CollectionBrowserClient; see its file comment for why.
  const view = await getCollectionProductsView(handle, DEFAULT_FILTERS, language);
  if (!view) notFound();

  const { collection, products, vendors, productTypes, discountOnly, isAggregateDeal, isTypeCollection } = view;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl(localizePath("/", locale)) },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collections",
        item: absoluteUrl(localizePath("/collections", locale)),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: collection.title,
        item: absoluteUrl(localizePath(`/collections/${collection.handle}`, locale)),
      },
    ],
  };

  // Enriched, keyword-targeted copy for high-intent collections (near-expiry).
  // English-only; Arabic falls through to Shopify's translated content.
  const seoContent = locale.isDefault ? getCollectionSeo(handle) : undefined;

  // ItemList schema helps Google understand the listing and can surface the
  // collection as a rich result. Cap at the first 20 for a lean payload.
  const itemListJsonLd =
    products.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: collection.title,
          numberOfItems: products.length,
          itemListElement: products.slice(0, 20).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(localizePath(`/products/${p.handle}`, locale)),
            name: p.title,
          })),
        }
      : null;

  const faqJsonLd =
    seoContent?.faqs && seoContent.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: seoContent.faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {/* Hero — always server-rendered from the canonical (unfiltered) fetch;
          title/image/description never vary by filter, so this never needs
          to react to client-side filter state. */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0A3B66] via-[#082D4C] to-[#061C31] px-6 py-10 sm:px-10 sm:py-12">
        {collection.image && (
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 md:block" aria-hidden="true">
            <Image
              src={collection.image.url}
              alt=""
              fill
              sizes="40vw"
              className="object-cover opacity-30"
            />
            <span className="absolute inset-0 bg-gradient-to-r from-[#082D4C] via-[#082D4C]/70 to-transparent" />
          </div>
        )}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#F9D20F]/15 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[#0D3E66]/50 blur-3xl"
        />

        <div className="relative">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white/60"
          >
            <Link href="/" className="transition-colors hover:text-[#F9D20F]">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link href="/collections" className="transition-colors hover:text-[#F9D20F]">
              Collections
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="text-white/90">{collection.title}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            {collection.title}
          </h1>
          <span
            aria-hidden="true"
            className="mt-4 block h-1 w-14 rounded-full bg-gradient-to-r from-[#F9D20F] to-[#F9D20F]/30"
          />
          {collection.description && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 line-clamp-3">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {seoContent?.intro && (
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-[#475569]">
          {seoContent.intro}
        </p>
      )}

      {/*
        Suspense fallback = the plain server-rendered default view (identical
        markup to what the client renders for the no-filter case, via the
        shared CollectionBrowserView). Only URLs that actually carry filter
        params see the client fetch/loading state that follows.
      */}
      <Suspense
        fallback={
          <CollectionBrowserView
            handle={handle}
            filters={DEFAULT_FILTERS}
            vendors={vendors}
            productTypes={productTypes}
            products={products}
            cursor={collection.products.pageInfo.endCursor}
            hasNextPage={collection.products.pageInfo.hasNextPage}
            discountOnly={discountOnly}
            isAggregateDeal={isAggregateDeal}
            isTypeCollection={isTypeCollection}
            loading={false}
            loadMore={loadMoreCollection.bind(null, handle, DEFAULT_FILTERS)}
          />
        }
      >
        <CollectionBrowserClient
          handle={handle}
          language={language}
          initialFilters={DEFAULT_FILTERS}
          initialProducts={products}
          initialCursor={collection.products.pageInfo.endCursor}
          initialHasNextPage={collection.products.pageInfo.hasNextPage}
          initialVendors={vendors}
          initialProductTypes={productTypes}
          discountOnly={discountOnly}
          isAggregateDeal={isAggregateDeal}
          isTypeCollection={isTypeCollection}
        />
      </Suspense>

      {seoContent?.faqs && seoContent.faqs.length > 0 && (
        <section className="mt-16 border-t border-[#E2E8F0] pt-10">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#0B0F14]">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 max-w-3xl divide-y divide-[#E2E8F0]">
            {seoContent.faqs.map((faq) => (
              <div key={faq.question} className="py-4">
                <dt className="text-base font-bold text-[#0B0F14]">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-[#475569]">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
