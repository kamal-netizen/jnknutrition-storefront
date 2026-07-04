import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProduct,
  getProducts,
  getProductRecommendations,
} from "@/lib/queries/products";
import ProductDetails from "@/components/ProductDetails";
import { absoluteUrl } from "@/lib/seo";
import { PRODUCT_FAQ } from "@/lib/product-faq";

export const revalidate = 300;

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateStaticParams() {
  const data = await getProducts({ first: 100 });
  return data.edges.map((e) => ({ handle: e.node.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Product Not Found" };

  const image = product.images.edges[0]?.node;
  const title = product.seo.title || product.title;
  const description = product.seo.description || product.description;
  const url = `/products/${product.handle}`;
  const images = image
    ? [{ url: image.url, width: image.width, height: image.height, alt: product.title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
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
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) notFound();

  const recommendations = await getProductRecommendations(product.id);
  const images = product.images.edges.map((e) => e.node);

  const productUrl = absoluteUrl(`/products/${product.handle}`);

  const variants = product.variants.edges.map((e) => e.node);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: images.map((i) => i.url),
    url: productUrl,
    sku: variants[0]?.id,
    category: product.productType || undefined,
    brand: { "@type": "Brand", name: product.vendor || "JNK Nutrition" },
    offers: variants.map((variant) => ({
      "@type": "Offer",
      name: variant.title,
      sku: variant.id,
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      url: productUrl,
      availability: variant.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
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
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: absoluteUrl("/products"),
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
