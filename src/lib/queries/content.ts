import { storefrontFetch } from "@/lib/shopify";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Page = {
  id: string;
  title: string;
  body: string;
  bodySummary: string;
  seo: { title: string; description: string };
};

export type ArticleImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type Article = {
  id: string;
  title: string;
  handle: string;
  contentHtml: string;
  excerpt: string | null;
  publishedAt: string;
  image: ArticleImage | null;
  author: { name: string };
  seo: { title: string; description: string };
};

export type Blog = {
  id: string;
  title: string;
  handle: string;
  articles: { edges: { node: Article }[] };
};

export type Policy = {
  title: string;
  body: string;
  url: string;
};

export type ShopPolicies = {
  privacyPolicy: Policy | null;
  refundPolicy: Policy | null;
  shippingPolicy: Policy | null;
  termsOfService: Policy | null;
};

// ─── Queries ─────────────────────────────────────────────────────────────────

const GET_PAGE = `
  query GetPage($handle: String!) {
    page(handle: $handle) {
      id title body bodySummary
      seo { title description }
    }
  }
`;

const GET_BLOG = `
  query GetBlog($handle: String!, $first: Int!) {
    blog(handle: $handle) {
      id title handle
      articles(first: $first) {
        edges {
          node {
            id title handle excerpt publishedAt
            image { url altText width height }
            author { name }
            seo { title description }
          }
        }
      }
    }
  }
`;

const GET_ARTICLE = `
  query GetArticle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        id title contentHtml excerpt publishedAt
        image { url altText width height }
        author { name }
        seo { title description }
      }
    }
  }
`;

const GET_POLICIES = `
  query GetPolicies {
    shop {
      privacyPolicy { title body url }
      refundPolicy { title body url }
      shippingPolicy { title body url }
      termsOfService { title body url }
    }
  }
`;

// ─── Fetchers ────────────────────────────────────────────────────────────────

export async function getPage(handle: string): Promise<Page | null> {
  const data = await storefrontFetch<{ page: Page | null }>(GET_PAGE, {
    handle,
  });
  return data.page;
}

export async function getBlog(
  handle: string,
  first = 20
): Promise<Blog | null> {
  const data = await storefrontFetch<{ blog: Blog | null }>(GET_BLOG, {
    handle,
    first,
  });
  return data.blog;
}

export async function getArticle(
  blogHandle: string,
  articleHandle: string
): Promise<Article | null> {
  const data = await storefrontFetch<{
    blog: { articleByHandle: Article | null } | null;
  }>(GET_ARTICLE, { blogHandle, articleHandle });
  return data.blog?.articleByHandle ?? null;
}

export async function getPolicies(): Promise<ShopPolicies> {
  const data = await storefrontFetch<{ shop: ShopPolicies }>(GET_POLICIES);
  return data.shop;
}
