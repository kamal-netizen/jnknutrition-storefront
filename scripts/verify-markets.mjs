#!/usr/bin/env node
// Asserts the markets this app claims to serve actually exist in Shopify, with
// the currency the app expects.
//
// Why this exists: @inContext(country: XX) does not error for an unpublished
// market — Shopify silently falls back to the shop's primary market. The
// failure mode is a Saudi shopper being quoted AED with no error anywhere in
// the stack. This check turns that silence into a failed build.
//
//   node --env-file=.env.local scripts/verify-markets.mjs
//   node scripts/verify-markets.mjs            (env already in the environment)
//   node scripts/verify-markets.mjs --list     (report only, never fails)
//
// Keep EXPECTED_MARKETS in step with MARKETS in src/lib/i18n.ts. A .mjs script
// can't import the TypeScript source, so this is a deliberate, small duplicate
// — scripts/verify-locales.mjs is the place that will cross-check the two.

import { readFileSync } from "node:fs";

// Verified 2026-08-10: the shop publishes AE, BH, QA and SA — but all four in
// AED, and AR + EN are both published. So @inContext(country: SA) currently
// returns the same prices as AE. Switching the SA market to SAR in Shopify
// Admin is a prerequisite for launching Saudi locales; until then a /en-sa URL
// would be a true duplicate of /, with no currency difference to justify it.
// Uncommenting the SA line below before that change is made will fail the
// build, which is the point.
const EXPECTED_MARKETS = [
  { country: "AE", currency: "AED" },
  // { country: "SA", currency: "SAR" },  ← uncomment when SA switches to SAR
];

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

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION;

if (!domain || !token || !apiVersion) {
  console.error(
    "verify-markets: missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, " +
      "NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN or NEXT_PUBLIC_SHOPIFY_API_VERSION."
  );
  process.exit(1);
}

const QUERY = `
  query VerifyMarkets {
    localization {
      country { isoCode name currency { isoCode } }
      availableCountries { isoCode name currency { isoCode } }
      availableLanguages { isoCode endonymName }
    }
  }
`;

const response = await fetch(
  `https://${domain}/api/${apiVersion}/graphql.json`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query: QUERY }),
  }
);

if (!response.ok) {
  console.error(`verify-markets: Storefront API returned ${response.status}.`);
  process.exit(1);
}

const body = await response.json();
if (body.errors?.length) {
  console.error("verify-markets: GraphQL errors:", JSON.stringify(body.errors, null, 2));
  process.exit(1);
}

const { country, availableCountries, availableLanguages } = body.data.localization;

console.log(`Shop:            ${domain} (API ${apiVersion})`);
console.log(`Primary market:  ${country.isoCode} — ${country.currency.isoCode}`);
console.log(`Languages:       ${availableLanguages.map((l) => l.isoCode).join(", ")}`);
console.log("\nPublished markets:");
for (const c of availableCountries) {
  console.log(`  ${c.isoCode.padEnd(4)} ${c.currency.isoCode.padEnd(5)} ${c.name}`);
}

if (process.argv.includes("--list")) process.exit(0);

const problems = [];
for (const expected of EXPECTED_MARKETS) {
  const actual = availableCountries.find((c) => c.isoCode === expected.country);
  if (!actual) {
    problems.push(
      `${expected.country} is not a published market — @inContext(country: ${expected.country}) ` +
        `will silently return ${country.currency.isoCode} prices.`
    );
  } else if (actual.currency.isoCode !== expected.currency) {
    problems.push(
      `${expected.country} is published in ${actual.currency.isoCode}, but the app expects ` +
        `${expected.currency}. Prices and the free-shipping threshold would disagree.`
    );
  }
}

console.log("");
if (problems.length) {
  for (const p of problems) console.error(`FAIL  ${p}`);
  process.exit(1);
}
console.log(
  `OK    ${EXPECTED_MARKETS.map((m) => `${m.country}/${m.currency}`).join(", ")} verified.`
);
