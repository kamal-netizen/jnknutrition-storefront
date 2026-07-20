import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getCollection } from "@/lib/queries/collections";
import type { Product } from "@/lib/queries/products";
import ProductCard from "@/components/ProductCard";
import {
  absoluteUrl,
  collectionFallbackDescription,
} from "@/lib/seo";
import { getLocale, localizePath, hreflangAlternates } from "@/lib/i18n";
import { getCollectionSeo, prettifyTag } from "@/lib/collection-seo";

export const revalidate = 300;

type Props = {
  params: Promise<{ handle: string; tag: string; lang: string }>;
};

/**
 * Two-segment Shopify collection URLs — /collections/{handle}/{tag} — render the
 * collection filtered by a product tag. These were indexed, high-CTR pages on
 * the previous theme (e.g. /collections/near-expiry/whey-protein), so we
 * re-serve them 1:1 to preserve their search equity.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle, tag, lang } = await params;
  const locale = getLocale(lang);
  const collection = await getCollection(handle, {
    first: 1,
    language: locale.isDefault ? undefined : locale.shopifyLanguage,
  });
  if (!collection) return { title: "Collection Not Found" };

  const tagLabel = prettifyTag(tag);
  const seo = locale.isDefault ? getCollectionSeo(`${handle}/${tag}`) : undefined;
  const title = seo?.title || `${collection.title} — ${tagLabel}`;
  const description =
    seo?.description ||
    collection.seo.description ||
    collectionFallbackDescription(`${tagLabel} ${collection.title}`);
  const basePath = `/collections/${handle}/${tag}`;
  const url = localizePath(basePath, locale);

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

export default async function CollectionTagPage({ params }: Props) {
  const { handle, tag, lang } = await params;
  const locale = getLocale(lang);
  const collection = await getCollection(handle, {
    first: 48,
    filters: [{ available: true }, { tag: decodeURIComponent(tag) }],
    language: locale.isDefault ? undefined : locale.shopifyLanguage,
  });

  if (!collection) notFound();

  const products: Product[] = collection.products.edges.map((e) => e.node);
  const tagLabel = prettifyTag(tag);
  const seoContent = locale.isDefault
    ? getCollectionSeo(`${handle}/${tag}`)
    : undefined;
  const heading = `${collection.title} — ${tagLabel}`;
  const url = absoluteUrl(localizePath(`/collections/${handle}/${tag}`, locale));

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
        item: absoluteUrl(localizePath(`/collections/${handle}`, locale)),
      },
      { "@type": "ListItem", position: 4, name: tagLabel, item: url },
    ],
  };

  const itemListJsonLd =
    products.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: heading,
          numberOfItems: products.length,
          itemListElement: products.slice(0, 20).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(localizePath(`/products/${p.handle}`, locale)),
            name: p.title,
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

      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0A3B66] via-[#082D4C] to-[#061C31] px-6 py-10 sm:px-10 sm:py-12">
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
            <Link
              href={`/collections/${handle}`}
              className="transition-colors hover:text-[#F9D20F]"
            >
              {collection.title}
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="text-white/90">{tagLabel}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            {heading}
          </h1>
          <span
            aria-hidden="true"
            className="mt-4 block h-1 w-14 rounded-full bg-gradient-to-r from-[#F9D20F] to-[#F9D20F]/30"
          />
        </div>
      </div>

      {seoContent?.intro && (
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-[#475569]">
          {seoContent.intro}
        </p>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-12 text-center">
          <p className="text-lg font-bold text-[#0B0F14]">
            Nothing here right now
          </p>
          <p className="mt-2 text-sm text-[#64748B]">
            <Link
              href={`/collections/${handle}`}
              className="font-semibold text-[#0A3B66] underline"
            >
              Browse the full {collection.title} collection
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
