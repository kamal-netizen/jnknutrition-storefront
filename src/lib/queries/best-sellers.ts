import { unstable_cache } from "next/cache";
import { adminFetch, hasAdminAccess } from "@/lib/shopify-admin";
import {
  getProducts,
  getProductsByIds,
  type ProductCardData,
} from "@/lib/queries/products";

// ─── Ranking ─────────────────────────────────────────────────────────────────

/** Trailing window the "monthly" ranking covers. */
export const BEST_SELLER_WINDOW_DAYS = 30;

/**
 * How many orders a single scan will read before it stops and ranks what it
 * has. A ceiling, not a target: the scan ends early when the window does. It
 * exists so a traffic spike (or a mis-set window) cannot turn one cache miss
 * into an unbounded walk of the order history.
 */
const MAX_ORDERS_SCANNED = 1200;

/**
 * Orders per request. The Admin API caps a single query at 1000 cost points,
 * charged as `2 + first × (node cost)`. Each order node here costs ~13 (its
 * `lineItems(first: 10)` connection is 2 + 10 × 1), putting 60 orders at ~782
 * points — inside the cap, while halving the round trips a page size of 30
 * would need. Raising either number risks a MAX_COST_EXCEEDED error rather
 * than merely a slower query.
 */
const ORDERS_PER_PAGE = 60;
const LINE_ITEMS_PER_ORDER = 10;

export type OrderLine = { productId: string; quantity: number };
export type ScannedOrder = { id: string; lines: OrderLine[] };

export type BestSellerRank = {
  productId: string;
  /** Distinct orders containing the product. */
  orders: number;
  /** Total units sold across those orders. */
  units: number;
};

/**
 * Rank products by demand across a set of orders.
 *
 * Ranked by *distinct orders containing the product*, not units sold, because
 * that is the metric Shopify's own best-selling sort uses — so this changes the
 * window (all-time → 30 days) without also changing what "best selling" means.
 * The distinction is not academic here: a 3-for-2 protein promo would outrank a
 * more widely bought shaker on units alone. `units` is carried through the
 * result so switching the sort is a one-line change, and so the validation
 * script can print both against Shopify's own report.
 *
 * Pure by design — every network concern lives in the caller, so this can be
 * exercised on fixtures with no token and no store.
 */
export function rankBestSellers(orders: ScannedOrder[]): BestSellerRank[] {
  const tally = new Map<string, BestSellerRank>();

  for (const order of orders) {
    // One order listing the same product on two lines (two variants, or a split
    // line) is still one order for that product, though both lines add units.
    const seenInOrder = new Set<string>();
    for (const line of order.lines) {
      if (!line.productId) continue;
      const entry = tally.get(line.productId) ?? {
        productId: line.productId,
        orders: 0,
        units: 0,
      };
      if (!seenInOrder.has(line.productId)) {
        entry.orders += 1;
        seenInOrder.add(line.productId);
      }
      entry.units += line.quantity;
      tally.set(line.productId, entry);
    }
  }

  return Array.from(tally.values()).sort(
    // Units break ties so the order is total, not dependent on Map insertion
    // order — otherwise the strip could reshuffle between identical scans.
    (a, b) => b.orders - a.orders || b.units - a.units
  );
}

// ─── Admin API scan ──────────────────────────────────────────────────────────

const ORDERS_QUERY = `
  query MonthlyOrders($first: Int!, $after: String, $query: String!) {
    orders(first: $first, after: $after, query: $query, sortKey: CREATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          cancelledAt
          test
          lineItems(first: ${LINE_ITEMS_PER_ORDER}) {
            edges { node { quantity product { id } } }
          }
        }
      }
    }
  }
`;

type OrdersResponse = {
  orders: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    edges: {
      node: {
        id: string;
        cancelledAt: string | null;
        test: boolean;
        lineItems: {
          edges: { node: { quantity: number; product: { id: string } | null } }[];
        };
      };
    }[];
  };
};

/** ISO timestamp `days` before `now`, as Shopify's order query filter expects. */
export function windowStart(days: number, now: Date): string {
  return new Date(now.getTime() - days * 86_400_000).toISOString();
}

/**
 * Read the trailing order window from the Admin API and reduce it to a ranking.
 *
 * Deliberately not on a request path: the homepage is statically generated with
 * `revalidate`, so this runs during background regeneration, where a
 * multi-request paginated scan costs a shopper nothing. The same miss on a
 * dynamically-rendered route would block a render — which is what the long TTL
 * on the cache below is protecting.
 */
async function scanMonthlyOrders(days: number): Promise<BestSellerRank[]> {
  const since = windowStart(days, new Date());
  // `status:any` so unfulfilled and archived orders still count as demand.
  // Cancelled and test orders are dropped per-node below instead of in the
  // query string, which Shopify does not reliably filter on.
  const query = `created_at:>='${since}' AND status:any`;

  const orders: ScannedOrder[] = [];
  let after: string | undefined;
  let hasNextPage = true;
  let truncatedLineItems = 0;

  while (hasNextPage && orders.length < MAX_ORDERS_SCANNED) {
    const data = await adminFetch<OrdersResponse>(ORDERS_QUERY, {
      first: ORDERS_PER_PAGE,
      after,
      query,
    });

    for (const { node } of data.orders.edges) {
      if (node.cancelledAt || node.test) continue;
      const lines: OrderLine[] = [];
      for (const line of node.lineItems.edges) {
        // A deleted product still has line items, but nothing left to rank.
        if (!line.node.product) continue;
        lines.push({
          productId: line.node.product.id,
          quantity: line.node.quantity,
        });
      }
      if (node.lineItems.edges.length === LINE_ITEMS_PER_ORDER) {
        truncatedLineItems += 1;
      }
      orders.push({ id: node.id, lines });
    }

    hasNextPage = data.orders.pageInfo.hasNextPage;
    after = data.orders.pageInfo.endCursor ?? undefined;
  }

  if (truncatedLineItems > 0) {
    // Not fatal — the tail of an unusually large basket is a rounding error
    // against a 30-day ranking — but silence here would look like clean data.
    console.warn(
      `[best-sellers] ${truncatedLineItems} order(s) exceeded ${LINE_ITEMS_PER_ORDER} line items; the remainder was not counted.`
    );
  }

  return rankBestSellers(orders);
}

/**
 * Cached ranking of product IDs by demand over the trailing window.
 *
 * Six hours because the input is a 30-day rolling window: a fresher TTL would
 * re-run a multi-request scan to move products that shift position over days,
 * not minutes. Tagged `products`, so the existing Shopify webhook still busts
 * it when the catalog changes.
 */
export const getMonthlyBestSellerRanks = unstable_cache(
  async (days: number = BEST_SELLER_WINDOW_DAYS): Promise<BestSellerRank[]> => {
    if (!hasAdminAccess()) return [];
    try {
      return await scanMonthlyOrders(days);
    } catch (error) {
      // A missing scope, an expired token or a throttled scan must never take
      // the homepage down — the caller falls back to the all-time sort.
      console.error("[best-sellers] Admin scan failed:", error);
      return [];
    }
  },
  ["monthly-best-seller-ranks"],
  { revalidate: 21600, tags: ["products"] }
);

/**
 * The store's best sellers over the trailing 30 days, as renderable cards.
 *
 * Falls back to Shopify's all-time BEST_SELLING sort whenever the ranking is
 * unavailable — no Admin token configured, the scan failed, or the window held
 * too few in-stock products to fill the strip. The section renders exactly as
 * it did before until the token exists, and never renders short.
 */
export async function getMonthlyBestSellers(options: {
  first: number;
  language?: string;
}): Promise<ProductCardData[]> {
  const { first, language } = options;
  const ranks = await getMonthlyBestSellerRanks();

  let ranked: ProductCardData[] = [];
  if (ranks.length) {
    // Over-fetch: sold-out and delisted products are still ranked (they did
    // sell) but must not be shown, and that is only knowable after hydration.
    const candidates = ranks.slice(0, first * 3).map((r) => r.productId);
    const byId = await getProductsByIds(candidates, language);
    ranked = candidates
      .map((id) => byId.get(id))
      .filter((p): p is ProductCardData => Boolean(p?.availableForSale))
      .slice(0, first);
  }

  if (ranked.length >= first) return ranked;

  const fallback = await getProducts({
    first,
    sortKey: "BEST_SELLING",
    query: "available_for_sale:true",
    language,
  });
  const seen = new Set(ranked.map((p) => p.id));
  return [
    ...ranked,
    ...fallback.edges
      .map((e) => e.node)
      .filter((p) => p.availableForSale && !seen.has(p.id)),
  ].slice(0, first);
}
