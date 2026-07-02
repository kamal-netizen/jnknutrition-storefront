import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProduct,
  getProducts,
  getProductRecommendations,
} from "@/lib/queries/products";
import ProductDetails from "@/components/ProductDetails";

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
  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    openGraph: image
      ? {
          images: [{ url: image.url, width: image.width, height: image.height }],
        }
      : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) notFound();

  const recommendations = await getProductRecommendations(product.id);
  const images = product.images.edges.map((e) => e.node);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: images.map((i) => i.url),
    brand: { "@type": "Brand", name: product.vendor || "JNK Nutrition" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      lowPrice: product.priceRange.minVariantPrice.amount,
      highPrice: product.priceRange.maxVariantPrice.amount,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetails
        product={product}
        recommendations={recommendations}
        descriptionHtml={product.descriptionHtml}
      />
    </div>
  );
}
