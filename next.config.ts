import type { NextConfig } from "next";

// ─── Legacy Shopify URL map ───────────────────────────────────────────────────
// The old Shopify storefront is still all over Google's index and external
// links, in three shapes this app doesn't serve:
//
//   1. nested product URLs   /collections/<collection>/products/<handle>
//   2. Shopify Markets       /en-bh/…  /ar-qa/…  (one prefix per country)
//   3. both at once          /en-qa/collections/vendors/products/<handle>
//
// Every one of them currently returns 404 while the same product answers 200 at
// its flat URL, so the ranking those pages earned is being thrown away. These
// run at routing step 2 — before the proxy — so a redirect costs no function
// invocation, unlike the 404 render it replaces.
//
// Shape 3 resolves in two hops: the market rule strips the prefix, the client
// re-requests, and the nested rule (or its /ar twin) finishes the job.

/** Markets the Shopify store published. Arabic ones land on /ar, English at root. */
const AR_MARKETS = "ar-ae|ar-sa|ar-qa|ar-bh|ar-kw|ar-om";
const EN_MARKETS = "en-sa|en-qa|en-bh|en-kw|en-om";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Shopify's nested product URL → the flat one this app serves.
      {
        source: "/collections/:collection/products/:handle",
        destination: "/products/:handle",
        permanent: true,
      },
      {
        source: "/ar/collections/:collection/products/:handle",
        destination: "/ar/products/:handle",
        permanent: true,
      },
      // Old Markets country prefixes. AE is this store's home market, so its
      // English pages are the un-prefixed ones.
      {
        source: `/:market(${AR_MARKETS})/:path*`,
        destination: "/ar/:path*",
        permanent: true,
      },
      // Bare English market root, matched before the wildcard below: with an
      // empty `:path*` the wildcard destination collapses to an empty Location
      // header, which is a broken redirect rather than a trip to the homepage.
      {
        source: `/:market(${EN_MARKETS})`,
        destination: "/",
        permanent: true,
      },
      {
        source: `/:market(${EN_MARKETS})/:path*`,
        destination: "/:path*",
        permanent: true,
      },
      // Internal locale segment leaking into a public Arabic URL.
      {
        source: "/ar/en-ae/:path*",
        destination: "/ar/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
