import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCollection,
  getCollections,
  type Filter,
} from "@/lib/queries/collections";
import { getInStockDiscountedProducts, type Product } from "@/lib/queries/products";
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
import { absoluteUrl } from "@/lib/seo";
import { loadMoreCollection } from "./actions";

export const revalidate = 300;

// Collections that should ignore their curated (often stale) product list and
// instead surface every in-stock, discounted product across the whole store.
const DISCOUNT_ONLY_HANDLES = new Set(["super-saver"]);

// Like DISCOUNT_ONLY but the full filter sidebar is still rendered and URL
// filter params (brand, type, price, sort) are honoured post-fetch.
const AGGREGATE_DEALS_HANDLES = new Set(["today-deals"]);

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle, { first: 1 });
  if (!collection) return { title: "Collection Not Found" };
  const title = collection.seo.title || collection.title;
  const description = collection.seo.description || collection.description;
  const url = `/collections/${collection.handle}`;
  return {
    title,
    description,
    alternates: { canonical: url },
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

  const collection = await getCollection(handle, {
    // Aggregate-deal pages only need collection metadata (title/SEO), not products.
    first: isAggregateDeal ? 1 : 48,
    sortKey: selectedSort.sortKey,
    reverse: selectedSort.reverse,
    filters: (discountOnly || isAggregateDeal) ? undefined : toShopifyFilters(filters),
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-[#0B0F14] uppercase tracking-tight">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="mt-3 text-[#64748B] max-w-2xl">
            {collection.description}
          </p>
        )}
      </div>

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
            (discountOnly || isAggregateDeal) ? (
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
    </div>
  );
}
