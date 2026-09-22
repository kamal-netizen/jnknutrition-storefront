import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProduct,
  getProducts,
  getProductRecommendations,
  getProductRating,
  getCanonicalOverride,
} from "@/lib/queries/products";
import ProductDetails from "@/components/ProductDetails";
import {
  absoluteUrl,
  SITE_NAME,
  MERCHANT_RETURN_POLICY,
  gtinFrom,
  offerShippingDetails,
  priceValidUntil,
} from "@/lib/seo";
import { composeProductSerp } from "@/lib/seo-serp";
import { getLocale, localizePath, hreflangAlternates } from "@/lib/i18n";
import { PRODUCT_FAQ } from "@/lib/product-faq";

export const revalidate = 1800;

type Props = {
  params: Promise<{ handle: string; lang: string }>;
};

export async function generateStaticParams() {
  const data = await getProducts({ first: 100 });
  return data.edges.map((e) => ({ handle: e.node.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle, lang } = await params;
  const locale = getLocale(lang);
  const product = await getProduct(
    handle,
    locale.isDefault ? undefined : locale.shopifyLanguage
  );
  if (!product) return { title: "Product Not Found" };

  const image = product.images.edges[0]?.node;
  // Shopify's SEO fields are candidates, not output — see seo-serp.ts for what
  // they were putting in front of 15K product-page impressions.
  const { title, description } = composeProductSerp({
    localeCode: locale.code,
    name: product.title,
    shopifyTitle: product.seo.title,
    shopifyDescription: product.seo.description,
    vendor: product.vendor,
    price: product.priceRange.minVariantPrice.amount,
    currency: product.priceRange.minVariantPrice.currencyCode,
  });
  const basePath = `/products/${product.handle}`;
  const selfPath = localizePath(basePath, locale);
  // Size-variant duplicates can point Google at a primary via a `seo.canonical_url`
  // metafield; otherwise the page self-canonicalizes (per-locale).
  const canonical = getCanonicalOverride(product) ?? selfPath;
  const images = image
    ? [{ url: image.url, width: image.width, height: image.height, alt: product.title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical, languages: hreflangAlternates(basePath) },
    openGraph: {
      type: "website",
      title,
      description,
      url: selfPath,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle, lang } = await params;
  const locale = getLocale(lang);
  const language = locale.isDefault ? undefined : locale.shopifyLanguage;
  const product = await getProduct(handle, language);

  if (!product) notFound();

  const recommendations = await getProductRecommendations(product.id, language);
  const images = product.images.edges.map((e) => e.node);

  const productUrl = absoluteUrl(localizePath(`/products/${product.handle}`, locale));

  const variants = product.variants.edges.map((e) => e.node);

  // Only emitted when the store's reviews app has real aggregate data — never
  // fabricated (Google penalizes invented ratings).
  const rating = getProductRating(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: images.map((i) => i.url),
    url: productUrl,
    // The merchant's SKU, not the Shopify variant GID this used to emit — a
    // GID identifies the product to Shopify and to nobody else.
    sku: variants[0]?.sku || undefined,
    gtin: gtinFrom(variants[0]?.sku),
    category: product.productType || undefined,
    brand: { "@type": "Brand", name: product.vendor || "JNK Nutrition" },
    ...(rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.ratingValue,
            reviewCount: rating.reviewCount,
          },
        }
      : {}),
    // Merchant listing fields. Search Console shows 15,179 impressions in the
    // "Product snippets" appearance at 1.79% CTR — eligible, but with nothing
    // in them. Shipping cost, delivery window and the return period are what
    // Google renders under a product result, and they come from here.
    offers: variants.map((variant) => ({
      "@type": "Offer",
      name: variant.title,
      sku: variant.sku || undefined,
      gtin: gtinFrom(variant.sku),
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      priceValidUntil: priceValidUntil(),
      url: productUrl,
      availability: variant.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
      shippingDetails: offerShippingDetails(variant.price.amount),
      hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
    })),
  };

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
        name: "Products",
        item: absoluteUrl(localizePath("/products", locale)),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: productUrl,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRODUCT_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ProductDetails
        product={product}
        recommendations={recommendations}
        descriptionHtml={product.descriptionHtml}
      />
    </div>
  );
}
