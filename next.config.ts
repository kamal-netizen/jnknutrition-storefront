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
  // Serves app/global-not-found.tsx for URLs that match no route. Without it
  // those fall through to Next's built-in black-and-white 404, because this
  // app's root layout sits under the dynamic app/[lang] segment and an
  // unmatched path never reaches it.
  experimental: {
    globalNotFound: true,
  },
  // These lived in vercel.json until the move to Shipyard, which does not read
  // that file — verified on production, where /feature image/whey.webp came
  // back `Cache-Control: public, max-age=0` against the year-long immutable
  // rule vercel.json declares. Every banner and brand logo was revalidating on
  // each page load. headers() is framework-level, so it survives the next
  // platform move too.
  //
  // Security headers are deliberately NOT restated here: Shipyard already sets
  // HSTS, X-Content-Type-Options, X-Frame-Options and X-XSS-Protection at its
  // edge, and duplicating them risks two conflicting values on one response.
  async headers() {
    // Fingerprinted or content-stable asset directories. Replacing an image
    // means replacing the filename — these are cached for a year.
    // `source` is matched against the raw request path, so the directory with a
    // space in its name has to be listed percent-encoded — "/feature image"
    // never matches an incoming "/feature%20image/whey.webp". Both spellings are
    // listed so a hand-typed URL is covered too.
    const IMMUTABLE_ASSET_DIRS = [
      "/banners",
      "/blog-image",
      "/BRAND",
      "/feature image",
      "/feature%20image",
    ];

    return [
      ...IMMUTABLE_ASSET_DIRS.map((dir) => ({
        source: `${dir}/:path*`,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      })),
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      // Account pages carry customer data. The route is dynamic so Next already
      // sends no-store, but this covers every locale prefix explicitly rather
      // than relying on that — vercel.json only ever listed /account and
      // /ar/account, and would have missed any locale added later.
      {
        source: "/:locale(ar|en-sa|ar-sa)?/account/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, private" },
        ],
      },
    ];
  },
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
    // Optimization is delegated to Shopify's CDN rather than done here — see
    // src/lib/shopify-image-loader.ts for why. `unoptimized: true` used to sit
    // in this block, which suppressed srcset generation entirely and shipped
    // 2000x2000 originals into 254px product tiles.
    //
    // With a custom loader Next never touches the bytes, so `remotePatterns`
    // and `formats` no longer gate anything; remotePatterns stays as the record
    // of which host is expected, and so it is already correct if this ever
    // moves back to the built-in optimizer.
    loader: "custom",
    loaderFile: "./src/lib/shopify-image-loader.ts",
    // Trimmed from Next's defaults. Every candidate width becomes another full
    // Shopify CDN URL in each `srcset`, and the homepage carries ~190 of them;
    // the default ladder emitted ten candidates per image, half of them wider
    // than anything this layout can display. 512 is here specifically for a
    // ~254px product tile on a 2x screen, which would otherwise round up to 640,
    // and 384 for the same tile at the 1.75x DPR PageSpeed's Moto G Power
    // emulates, which was landing on 512 for a slot needing 360.
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [64, 128, 256, 384, 512],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
