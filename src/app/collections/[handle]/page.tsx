import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import {
  getCollection,
  getCollections,
  type Filter,
} from "@/lib/queries/collections";
import { getInStockDiscountedProducts, getProducts, type Product } from "@/lib/queries/products";
import ProductCard from "@/components/ProductCard";
import ProductFilters, {
  ProductFilterChips,
  type FacetValue,
} from "@/components/ProductFilters";
import PaginatedProductGrid from "@/components/PaginatedProductGrid";
import {
  COLLECTION_SORT_OPTIONS,
  parseProductFilters,
  resolveSort,
  toShopifyFilters,
  productIsDiscounted,
} from "@/lib/product-filters";
import {
  absoluteUrl,
  collectionFallbackTitle,
  collectionFallbackDescription,
} from "@/lib/seo";
import { getCollectionSeo } from "@/lib/collection-seo";
import { loadMoreCollection } from "./actions";

export const revalidate = 300;

// Collections that should ignore their curated (often stale) product list and
// instead surface every in-stock, discounted product across the whole store.
const DISCOUNT_ONLY_HANDLES = new Set(["super-saver"]);

// Like DISCOUNT_ONLY but the full filter sidebar is still rendered and URL
// filter params (brand, type, price, sort) are honoured post-fetch.
const AGGREGATE_DEALS_HANDLES = new Set(["today-deals"]);

// Collections that are empty in Shopify but correspond to a product type.
// Products are fetched store-wide by productType and all filters still apply.
// Value can be a single type string or an array of types (OR-joined in query).
const TYPE_COLLECTION_MAP: Record<string, string | string[]> = {
  "fat-burner": "FAT BURNER",
  "weight-loss": ["FAT BURNER", "WEIGHT LOSS", "L-CARNITINE", "CLA", "KETO"],
};

// Map collection sort keys to the equivalent ProductSortKeys used store-wide.
const PRODUCT_SORT_KEY: Record<string, string> = {
  COLLECTION_DEFAULT: "BEST_SELLING",
  BEST_SELLING: "BEST_SELLING",
  CREATED: "CREATED_AT",
  PRICE: "PRICE",
};

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Extract brand/category facet options (with live counts) from Shopify's
// collection `filters` response.
function extractFacets(filters: Filter[]): {
  vendors: FacetValue[];
  productTypes: FacetValue[];
} {
  const vendors: FacetValue[] = [];
  const productTypes: FacetValue[] = [];
  for (const facet of filters) {
    for (const value of facet.values) {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(value.input) as Record<string, unknown>;
      } catch {
        continue;
      }
      if (typeof parsed.productVendor === "string") {
        vendors.push({
          value: parsed.productVendor,
          label: value.label,
          count: value.count,
        });
      } else if (typeof parsed.productType === "string") {
        productTypes.push({
          value: parsed.productType,
          label: value.label,
          count: value.count,
        });
      }
    }
  }
  return { vendors, productTypes };
}

/** Derive vendor facets with counts from an arbitrary product list. */
function buildVendorFacets(products: Product[]): FacetValue[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    if (p.vendor) counts.set(p.vendor, (counts.get(p.vendor) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, label: value, count }));
}

/** Derive product-type facets with counts from an arbitrary product list. */
function buildTypeFacets(products: Product[]): FacetValue[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    if (p.productType) counts.set(p.productType, (counts.get(p.productType) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, label: value, count }));
}

export async function generateStaticParams() {
  const collections = await getCollections(50);
  return collections.map((c) => ({ handle: c.handle }));
}

// Filter/sort params that produce faceted near-duplicate URLs.
const FILTER_PARAM_KEYS = ["brand", "type", "price", "sort", "sale", "stock"];

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { handle } = await params;
  const sp = await searchParams;
  const collection = await getCollection(handle, { first: 1 });
  if (!collection) return { title: "Collection Not Found" };

  const seo = getCollectionSeo(handle);
  const title =
    seo?.title || collection.seo.title || collectionFallbackTitle(collection.title);
  const description =
    seo?.description ||
    collection.seo.description ||
    collectionFallbackDescription(collection.title);
  const url = `/collections/${collection.handle}`;

  // Faceted/filtered variants are near-duplicates of the base collection — keep
  // them out of the index but let crawlers follow to products. The canonical
  // always resolves to the unfiltered base URL.
  const hasFilterParams = FILTER_PARAM_KEYS.some((k) => sp[k] != null);

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(hasFilterParams ? { robots: { index: false, follow: true } } : {}),
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

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle } = await params;
  const sp = await searchParams;
  const filters = parseProductFilters(sp);
  const selectedSort = resolveSort(COLLECTION_SORT_OPTIONS, filters.sortLabel);

  const discountOnly = DISCOUNT_ONLY_HANDLES.has(handle);
  const isAggregateDeal = AGGREGATE_DEALS_HANDLES.has(handle);
  const isTypeCollection = handle in TYPE_COLLECTION_MAP;

  const collection = await getCollection(handle, {
    // Type/deal pages only need metadata; skip the product list fetch.
    first: (isAggregateDeal || isTypeCollection) ? 1 : 48,
    sortKey: selectedSort.sortKey,
    reverse: selectedSort.reverse,
    filters: (discountOnly || isAggregateDeal || isTypeCollection) ? undefined : toShopifyFilters(filters),
  });

  if (!collection) notFound();

  let products: Product[];
  let vendors: FacetValue[];
  let productTypes: FacetValue[];

  if (discountOnly) {
    // Store-wide discounted products — no filter sidebar.
    products = await getInStockDiscountedProducts({
      max: 48,
      sortKey: PRODUCT_SORT_KEY[selectedSort.sortKey] ?? "BEST_SELLING",
      reverse: selectedSort.reverse,
    });
    vendors = [];
    productTypes = [];
  } else if (isAggregateDeal) {
    // Aggregate all in-stock discounted products store-wide, then apply URL
    // filter params post-fetch so the filter sidebar remains fully functional.
    const allDiscounted = await getInStockDiscountedProducts({
      max: 200,
      sortKey: PRODUCT_SORT_KEY[selectedSort.sortKey] ?? "BEST_SELLING",
      reverse: selectedSort.reverse,
    });
    vendors = buildVendorFacets(allDiscounted);
    productTypes = buildTypeFacets(allDiscounted);
    products = allDiscounted;
    if (filters.vendors.length) {
      products = products.filter((p) => filters.vendors.includes(p.vendor));
    }
    if (filters.productTypes.length) {
      products = products.filter((p) => filters.productTypes.includes(p.productType));
    }
    if (filters.price) {
      products = products.filter((p) => {
        const price = parseFloat(p.priceRange.minVariantPrice.amount);
        if (filters.price!.min != null && price < filters.price!.min) return false;
        if (filters.price!.max != null && price > filters.price!.max) return false;
        return true;
      });
    }
  } else if (isTypeCollection) {
    // Fetch all products of the mapped type(s) store-wide, compute facets from
    // the full set, then apply URL filter params post-fetch.
    const typeEntry = TYPE_COLLECTION_MAP[handle];
    const types = Array.isArray(typeEntry) ? typeEntry : [typeEntry];
    const typeQuery =
      types.length === 1
        ? `product_type:'${types[0]}'`
        : `(${types.map((t) => `product_type:'${t}'`).join(" OR ")})`;
    const sortKey = PRODUCT_SORT_KEY[selectedSort.sortKey] ?? "BEST_SELLING";
    const conn = await getProducts({
      first: 250,
      sortKey,
      reverse: selectedSort.reverse,
      query: typeQuery,
    });
    const allTypeProducts = conn.edges.map((e) => e.node);
    vendors = buildVendorFacets(allTypeProducts.filter((p) => p.availableForSale));
    // Show category facet only when the collection spans multiple product types.
    productTypes = types.length > 1 ? buildTypeFacets(allTypeProducts.filter((p) => p.availableForSale)) : [];
    products = allTypeProducts;
    if (!filters.includeSoldOut) {
      products = products.filter((p) => p.availableForSale);
    }
    if (filters.vendors.length) {
      products = products.filter((p) => filters.vendors.includes(p.vendor));
    }
    if (filters.productTypes.length) {
      products = products.filter((p) => filters.productTypes.includes(p.productType));
    }
    if (filters.price) {
      products = products.filter((p) => {
        const price = parseFloat(p.priceRange.minVariantPrice.amount);
        if (filters.price!.min != null && price < filters.price!.min) return false;
        if (filters.price!.max != null && price > filters.price!.max) return false;
        return true;
      });
    }
    if (filters.onSale) {
      products = products.filter(productIsDiscounted);
    }
  } else {
    products = collection.products.edges.map((e) => e.node);
    // On-sale is not a native Shopify filter input — apply it post-fetch.
    if (filters.onSale) {
      products = products.filter(productIsDiscounted);
    }
    ({ vendors, productTypes } = extractFacets(collection.products.filters));
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collections",
        item: absoluteUrl("/collections"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: collection.title,
        item: absoluteUrl(`/collections/${collection.handle}`),
      },
    ],
  };

  // Enriched, keyword-targeted copy for high-intent collections (near-expiry).
  const seoContent = getCollectionSeo(handle);

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
            url: absoluteUrl(`/products/${p.handle}`),
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
      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0A3B66] via-[#082D4C] to-[#061C31] px-6 py-10 sm:px-10 sm:py-12">
        {/* Collection image (when available) */}
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

        {/* Glow accents */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#F9D20F]/15 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[#0D3E66]/50 blur-3xl"
        />

        <div className="relative">
          {/* Breadcrumb */}
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

      {!discountOnly && (
        <ProductFilterChips
          basePath={`/collections/${handle}`}
          filters={filters}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter sidebar */}
        {!discountOnly && (
          <ProductFilters
            basePath={`/collections/${handle}`}
            filters={filters}
            sortOptions={COLLECTION_SORT_OPTIONS}
            vendors={vendors}
            productTypes={productTypes}
            resultCount={products.length}
          />
        )}

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {products.length > 0 ? (
            (discountOnly || isAggregateDeal || isTypeCollection) ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <PaginatedProductGrid
                key={`${handle}-${JSON.stringify(filters)}`}
                initialProducts={products}
                initialCursor={collection.products.pageInfo.endCursor}
                initialHasNextPage={collection.products.pageInfo.hasNextPage}
                loadMore={loadMoreCollection.bind(null, handle, filters)}
                gridClassName="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
              />
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-12 text-center">
              <p className="text-lg font-bold text-[#0B0F14]">
                No products match your filters
              </p>
              <p className="mt-2 text-sm text-[#64748B]">
                Try removing a filter to see more products.
              </p>
            </div>
          )}
        </div>
      </div>

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
