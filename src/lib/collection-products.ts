import {
  getCollection,
  type CollectionWithProducts,
  type Filter,
} from "@/lib/queries/collections";
import { getInStockDiscountedProducts, getProducts, type Product } from "@/lib/queries/products";
import type { FacetValue } from "@/components/ProductFilters";
import {
  COLLECTION_SORT_OPTIONS,
  resolveSort,
  toShopifyFilters,
  productIsDiscounted,
  type ActiveFilters,
} from "@/lib/product-filters";

// Collections that should ignore their curated (often stale) product list and
// instead surface every in-stock, discounted product across the whole store.
export const DISCOUNT_ONLY_HANDLES = new Set(["super-saver"]);

// Like DISCOUNT_ONLY but the full filter sidebar is still rendered and URL
// filter params (brand, type, price, sort) are honoured post-fetch.
export const AGGREGATE_DEALS_HANDLES = new Set(["today-deals"]);

// Collections that are empty in Shopify but correspond to a product type.
// Products are fetched store-wide by productType and all filters still apply.
// Value can be a single type string or an array of types (OR-joined in query).
export const TYPE_COLLECTION_MAP: Record<string, string | string[]> = {
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

export type CollectionProductsView = {
  collection: CollectionWithProducts;
  products: Product[];
  vendors: FacetValue[];
  productTypes: FacetValue[];
  discountOnly: boolean;
  isAggregateDeal: boolean;
  isTypeCollection: boolean;
};

/**
 * Resolve a collection's product listing for a given filter/sort state,
 * handling the four collection "modes" (discount-only, aggregate-deals,
 * type-mapped, and regular curated collections) identically regardless of
 * whether it's called during the static/ISR default render or from the
 * client-triggered Server Action for a filtered URL (see
 * collections/[handle]/actions.ts and CollectionBrowserClient).
 */
export async function getCollectionProductsView(
  handle: string,
  filters: ActiveFilters,
  language?: string
): Promise<CollectionProductsView | null> {
  const selectedSort = resolveSort(COLLECTION_SORT_OPTIONS, filters.sortLabel);
  const discountOnly = DISCOUNT_ONLY_HANDLES.has(handle);
  const isAggregateDeal = AGGREGATE_DEALS_HANDLES.has(handle);
  const isTypeCollection = handle in TYPE_COLLECTION_MAP;

  const collection = await getCollection(handle, {
    // Type/deal pages only need metadata; skip the product list fetch.
    first: isAggregateDeal || isTypeCollection ? 1 : 48,
    sortKey: selectedSort.sortKey,
    reverse: selectedSort.reverse,
    filters:
      discountOnly || isAggregateDeal || isTypeCollection
        ? undefined
        : toShopifyFilters(filters),
    language,
  });

  if (!collection) return null;

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

  return {
    collection,
    products,
    vendors,
    productTypes,
    discountOnly,
    isAggregateDeal,
    isTypeCollection,
  };
}
