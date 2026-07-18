import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/cart",
        // Filter/sort query-string variants of /collections/* and /products
        // are combinatorial (brand x type x price x sort x stock x sale) and
        // already noindex — disallow crawling them too so bots don't burn
        // crawl budget (and origin compute) working through every permutation
        // of a dynamically-rendered, uncached page.
        "/*?*brand=",
        "/*?*type=",
        "/*?*price=",
        "/*?*sort=",
        "/*?*sale=",
        "/*?*stock=",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
