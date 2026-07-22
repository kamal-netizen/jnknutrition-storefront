import type { MetadataRoute } from "next";
import { absoluteUrl, PRIORITY_COLLECTION_HANDLES } from "@/lib/seo";
import { getProducts } from "@/lib/queries/products";
import { getCollections } from "@/lib/queries/collections";
import { getAllNews } from "@/lib/news";
import { NESTED_COLLECTION_URLS } from "@/lib/collection-seo";
import { LOCALES, localizePath } from "@/lib/i18n";

/** hreflang alternates map (absolute URLs) for a default-locale path. */
function altLanguages(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l.hrefLang] = absoluteUrl(localizePath(path, l));
  return languages;
}

export const revalidate = 3600;

// Static, always-present routes with hand-tuned crawl priorities.
const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
  { path: "/brands", changeFrequency: "weekly", priority: 0.8 },
  { path: "/collections", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blogs/news", changeFrequency: "weekly", priority: 0.6 },
  { path: "/pages/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/pages/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/pages/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/pages/wholesale", changeFrequency: "monthly", priority: 0.7 },
];

const POLICY_HANDLES = [
  "privacy-policy",
  "refund-policy",
  "shipping-policy",
  "terms-of-service",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Fetch as much of the catalog as the Storefront API allows in one page.
  const [productConn, collections] = await Promise.all([
    getProducts({ first: 250 }).catch(() => null),
    getCollections(100).catch(() => []),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
    alternates: { languages: altLanguages(r.path) },
  }));

  const productEntries: MetadataRoute.Sitemap =
    productConn?.edges.map(({ node }) => ({
      url: absoluteUrl(`/products/${node.handle}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: { languages: altLanguages(`/products/${node.handle}`) },
    })) ?? [];

  const collectionEntries: MetadataRoute.Sitemap = collections.map((c) => ({
    url: absoluteUrl(`/collections/${c.handle}`),
    lastModified: now,
    changeFrequency: "weekly",
    // High-intent / proven high-CTR collections (near-expiry deals) crawl hotter.
    priority: PRIORITY_COLLECTION_HANDLES.has(c.handle) ? 0.9 : 0.7,
    alternates: { languages: altLanguages(`/collections/${c.handle}`) },
  }));

  // Two-segment collection/tag URLs preserved from the previous theme.
  const nestedCollectionEntries: MetadataRoute.Sitemap =
    NESTED_COLLECTION_URLS.map(([handle, tag]) => ({
      url: absoluteUrl(`/collections/${handle}/${tag}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: altLanguages(`/collections/${handle}/${tag}`) },
    }));

  const newsEntries: MetadataRoute.Sitemap = getAllNews().map((article) => ({
    url: absoluteUrl(`/blogs/news/${article.slug}`),
    lastModified: new Date(article.publishedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const policyEntries: MetadataRoute.Sitemap = POLICY_HANDLES.map((handle) => ({
    url: absoluteUrl(`/policies/${handle}`),
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [
    ...staticEntries,
    ...productEntries,
    ...collectionEntries,
    ...nestedCollectionEntries,
    ...newsEntries,
    ...policyEntries,
  ];
}
