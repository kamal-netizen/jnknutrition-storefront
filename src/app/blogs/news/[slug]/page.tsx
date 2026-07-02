import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllNews,
  getNewsBySlug,
  formatNewsDate,
  type NewsArticle,
} from "@/lib/news";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllNews().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getNewsBySlug(slug);
  if (!article) return { title: "Article Not Found" };

  const url = `/blogs/news/${article.slug}`;
  return {
    title: article.seo.title,
    description: article.seo.description,
    keywords: article.seo.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: article.seo.title,
      description: article.seo.description,
      type: "article",
      url,
      publishedTime: article.publishedAt,
      authors: [article.author],
      images: [{ url: article.image.url, alt: article.image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.seo.title,
      description: article.seo.description,
      images: [article.image.url],
    },
  };
}

function ArticleJsonLd({ article }: { article: NewsArticle }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "JNK Nutrition",
    },
    image: `https://www.jnknutrition.com${article.image.url}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.jnknutrition.com/blogs/news/${article.slug}`,
    },
    articleSection: article.category,
    keywords: article.seo.keywords.join(", "),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getNewsBySlug(slug);

  if (!article) notFound();

  const related = getAllNews()
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <ArticleJsonLd article={article} />

      <nav className="mb-6 text-sm text-[#64748B]">
        <Link href="/blogs/news" className="hover:text-[#0B0F14] transition-colors">
          ← News &amp; Articles
        </Link>
      </nav>

      <span className="inline-block bg-[#F9D20F] text-[#0B0F14] text-xs font-black uppercase tracking-wide px-3 py-1 rounded">
        {article.category}
      </span>

      <h1 className="mt-4 text-3xl md:text-5xl font-black text-[#0B0F14] uppercase tracking-tight leading-tight">
        {article.title}
      </h1>

      <p className="mt-4 text-sm text-[#64748B]">
        By {article.author} · {formatNewsDate(article.publishedAt)} ·{" "}
        {article.readingMinutes} min read
      </p>

      <div className="relative aspect-[16/9] mt-8 rounded-lg overflow-hidden border border-[#E2E8F0]">
        <Image
          src={article.image.url}
          alt={article.image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          priority
          className="object-cover"
        />
      </div>

      <div
        className="prose max-w-none mt-10 text-[#64748B] [&_a]:text-[#F9D20F] [&_h2]:text-[#0B0F14] [&_h2]:font-black [&_h2]:uppercase [&_h2]:tracking-tight [&_h3]:text-[#0B0F14] [&_strong]:text-[#0B0F14] [&_ul]:list-disc [&_ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      {/* ─── Related articles ───────────────────────────────── */}
      {related.length > 0 && (
        <div className="mt-16 pt-10 border-t border-[#E2E8F0]">
          <h2 className="text-xl md:text-2xl font-black text-[#0B0F14] uppercase tracking-tight mb-6">
            Keep Reading
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blogs/news/${r.slug}`}
                className="group flex flex-col rounded-lg overflow-hidden border border-[#E2E8F0] hover:border-[#F9D20F] transition-colors"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={r.image.url}
                    alt={r.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-black text-[#0B0F14] uppercase tracking-tight leading-snug group-hover:text-[#E7BF00] transition-colors">
                    {r.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
