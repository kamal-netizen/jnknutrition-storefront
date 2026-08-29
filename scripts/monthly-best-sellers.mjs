#!/usr/bin/env node
// Validates the "Trending Now" section against real order data.
//
// The section used to render Shopify's BEST_SELLING sort, which ranks by
// all-time orders with no recency in it. src/lib/queries/best-sellers.ts now
// ranks the trailing 30 days instead. This script answers the only question
// that matters: how different are those two lists, really?
//
//   node --env-file=.env.local scripts/monthly-best-sellers.mjs
//       Needs SHOPIFY_ADMIN_ACCESS_TOKEN. Scans 30 days of orders, prints the
//       ranking, and diffs it against the all-time list the site used before.
//
//   node --env-file=.env.local scripts/monthly-best-sellers.mjs --csv report.csv
//       No Admin token needed. Diffs a Shopify admin report export
//       (Analytics > Reports > "Products by units sold", last 30 days) against
//       the same all-time list. Use this to size the gap before wiring up a token.
//
//   --days 60      widen the window        --top 15   rows to compare
//
// The tally below is a deliberate small duplicate of rankBestSellers() in
// src/lib/queries/best-sellers.ts — a .mjs script cannot import the TypeScript
// source. Keep the two in step; the ranking rule is "distinct orders containing
// the product, units breaking ties".

import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const CSV_PATH = flag("csv", null);
const DAYS = Number(flag("days", 30));
const TOP = Number(flag("top", 15));

/** Minimal .env.local reader, so the script works without --env-file. */
function loadEnvFile(path = ".env.local") {
  try {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) continue;
      process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // No .env.local (CI) — the environment is expected to carry the vars.
  }
}
loadEnvFile();

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const STOREFRONT_VERSION = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? "2025-01";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const ADMIN_VERSION = process.env.SHOPIFY_ADMIN_API_VERSION ?? "2025-01";

if (!DOMAIN || !STOREFRONT_TOKEN) {
  console.error("Missing Shopify Storefront credentials in .env.local.");
  process.exit(1);
}

async function graphql(url, headers, query, variables) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${url}`);
  const body = await res.json();
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  return body.data;
}

const storefront = (query, variables) =>
  graphql(
    `https://${DOMAIN}/api/${STOREFRONT_VERSION}/graphql.json`,
    { "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN },
    query,
    variables
  );

const admin = (query, variables) =>
  graphql(
    `https://${DOMAIN}/admin/api/${ADMIN_VERSION}/graphql.json`,
    { "X-Shopify-Access-Token": ADMIN_TOKEN },
    query,
    variables
  );

// ─── The list the site rendered before this change ───────────────────────────

async function allTimeBestSellers(first) {
  const data = await storefront(
    `query AllTime($first: Int!) {
       products(first: $first, sortKey: BEST_SELLING, query: "available_for_sale:true") {
         edges { node { id title } }
       }
     }`,
    { first }
  );
  return data.products.edges.map((e) => e.node);
}

// ─── 30-day ranking from the Admin API ───────────────────────────────────────

async function monthlyRanking(days) {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const query = `created_at:>='${since}' AND status:any`;
  const tally = new Map();
  let after = null;
  let hasNextPage = true;
  let scanned = 0;

  process.stderr.write(`Scanning orders since ${since.slice(0, 10)}`);
  while (hasNextPage && scanned < 1200) {
    const data = await admin(
      `query MonthlyOrders($first: Int!, $after: String, $query: String!) {
         orders(first: $first, after: $after, query: $query, sortKey: CREATED_AT, reverse: true) {
           pageInfo { hasNextPage endCursor }
           edges { node {
             id cancelledAt test
             lineItems(first: 10) { edges { node { quantity title product { id title } } } }
           } }
         }
       }`,
      { first: 60, after, query }
    );

    for (const { node } of data.orders.edges) {
      scanned += 1;
      if (node.cancelledAt || node.test) continue;
      const seen = new Set();
      for (const line of node.lineItems.edges) {
        const product = line.node.product;
        if (!product) continue;
        const entry = tally.get(product.id) ?? {
          id: product.id,
          title: product.title,
          orders: 0,
          units: 0,
        };
        if (!seen.has(product.id)) {
          entry.orders += 1;
          seen.add(product.id);
        }
        entry.units += line.node.quantity;
        tally.set(product.id, entry);
      }
    }

    hasNextPage = data.orders.pageInfo.hasNextPage;
    after = data.orders.pageInfo.endCursor;
    process.stderr.write(".");
  }
  process.stderr.write(`\nScanned ${scanned} orders.\n\n`);

  return Array.from(tally.values()).sort(
    (a, b) => b.orders - a.orders || b.units - a.units
  );
}

// ─── Shopify report CSV (the no-token path) ──────────────────────────────────

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (ch !== "\r") cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

function readReport(path) {
  const rows = parseCsv(readFileSync(path, "utf8"));
  if (!rows.length) throw new Error(`${path} is empty`);
  const header = rows[0].map((h) => h.trim().toLowerCase());
  // Shopify has shipped several column namings for this report over the years.
  const titleCol = header.findIndex((h) => /product.*title|product.?name|^product$/.test(h));
  const qtyCol = header.findIndex((h) => /net.*quantity|units.*sold|quantity|orders/.test(h));
  if (titleCol === -1) {
    throw new Error(`No product-title column found in ${path}. Headers: ${header.join(", ")}`);
  }
  return rows.slice(1).map((r) => ({
    title: r[titleCol]?.trim(),
    value: qtyCol === -1 ? null : Number(r[qtyCol]?.replace(/[^0-9.-]/g, "")) || 0,
  })).filter((r) => r.title);
}

// ─── Comparison ──────────────────────────────────────────────────────────────

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function compare(label, ranked, allTime, top) {
  const a = ranked.slice(0, top);
  const b = allTime.slice(0, top);
  const bKeys = new Set(b.map((p) => norm(p.title)));
  const bRank = new Map(b.map((p, i) => [norm(p.title), i + 1]));

  const overlap = a.filter((p) => bKeys.has(norm(p.title)));
  const missing = a.filter((p) => !bKeys.has(norm(p.title)));

  const width = Math.max(...a.map((p) => p.title.length), 30);
  console.log(`${label} — top ${top}\n`);
  console.log(
    `${"#".padStart(3)}  ${"PRODUCT".padEnd(width)}  ${"METRIC".padStart(8)}  WAS (all-time)`
  );
  console.log("-".repeat(width + 32));
  for (const [i, p] of a.entries()) {
    const was = bRank.get(norm(p.title));
    const metric = p.orders != null ? `${p.orders} ord` : `${p.value}`;
    console.log(
      `${String(i + 1).padStart(3)}  ${p.title.slice(0, width).padEnd(width)}  ${String(metric).padStart(8)}  ${
        was ? `#${was}` : "— not shown"
      }`
    );
  }

  console.log(`\n  Overlap:   ${overlap.length}/${top} (${Math.round((overlap.length / top) * 100)}%)`);
  if (overlap.length > 1) {
    // Spearman's rho over the products present in both lists. 1.0 = identical
    // order, 0 = unrelated, negative = inverted. Low overlap with high rho
    // means the lists agree on ordering but not membership; the reverse means
    // the reshuffle is real. Ranks are taken *within the overlap* so the two
    // sequences are the same length, which is what the formula requires.
    const n = overlap.length;
    const inBOrder = overlap
      .slice()
      .sort((x, y) => bRank.get(norm(x.title)) - bRank.get(norm(y.title)));
    const rankInB = new Map(inBOrder.map((p, i) => [norm(p.title), i + 1]));
    const d2 = overlap.reduce(
      (sum, p, i) => sum + (i + 1 - rankInB.get(norm(p.title))) ** 2,
      0
    );
    const rho = 1 - (6 * d2) / (n * (n * n - 1));
    console.log(`  Rank corr: ${rho.toFixed(2)} (1.0 = same order, 0 = unrelated)`);
  }
  if (missing.length) {
    console.log(`\n  Selling now but absent from the old all-time strip:`);
    for (const p of missing) console.log(`    · ${p.title}`);
  }
  console.log(
    `\n  Read: high overlap means the all-time sort was already a fine proxy and\n` +
      `  this change is cosmetic. Low overlap is revenue the old strip was hiding.\n`
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

const allTime = await allTimeBestSellers(Math.max(TOP, 25));

if (CSV_PATH) {
  const report = readReport(CSV_PATH);
  compare(`Shopify report (${CSV_PATH}) vs all-time BEST_SELLING`, report, allTime, TOP);
} else if (!ADMIN_TOKEN) {
  console.error(
    "No SHOPIFY_ADMIN_ACCESS_TOKEN set, so there is no order data to rank.\n\n" +
      "Either:\n" +
      "  1. Export Analytics > Reports > 'Products by units sold' (last 30 days)\n" +
      "     from Shopify admin and re-run with --csv <path>, or\n" +
      "  2. Create a custom app with the read_orders scope (Settings > Apps and\n" +
      "     sales channels > Develop apps), then put its Admin API access token\n" +
      "     in .env.local as SHOPIFY_ADMIN_ACCESS_TOKEN.\n"
  );
  process.exit(1);
} else {
  const ranked = await monthlyRanking(DAYS);
  if (!ranked.length) {
    console.error(`No orders found in the last ${DAYS} days.`);
    process.exit(1);
  }
  compare(`Last ${DAYS} days by orders vs all-time BEST_SELLING`, ranked, allTime, TOP);
}
