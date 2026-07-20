import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/LocaleLink";
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

  const faqLd =
    article.faqs && article.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
    </>
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
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      <ArticleJsonLd article={article} />

      {/* ─── Back nav ─────────────────────────────────────── */}
      <nav className="mb-8 text-sm text-[#94A3B8]">
        <Link
          href="/blogs/news"
          className="inline-flex items-center gap-1.5 hover:text-[#0B0F14] transition-colors"
        >
          ← News &amp; Articles
        </Link>
      </nav>

      {/* ─── Header ───────────────────────────────────────── */}
      <header className="mb-10">
        <span className="inline-block bg-[#F9D20F] text-[#0B0F14] text-xs font-black uppercase tracking-widest px-3 py-1 rounded mb-5">
          {article.category}
        </span>

        <h1 className="text-3xl md:text-5xl font-black text-[#0B0F14] uppercase tracking-tight leading-[1.1] mb-6">
          {article.title}
        </h1>

        {/* Excerpt as styled intro */}
        <p className="text-lg md:text-xl text-[#475569] leading-relaxed border-l-4 border-[#F9D20F] pl-5">
          {article.excerpt}
        </p>

        <div className="flex items-center gap-3 mt-6 text-sm text-[#94A3B8]">
          <span>{article.author}</span>
          <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
          <span>{formatNewsDate(article.publishedAt)}</span>
          <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
          <span>{article.readingMinutes} min read</span>
        </div>
      </header>

      {/* ─── Hero image ───────────────────────────────────── */}
      <div className="relative aspect-[16/9] mb-14 rounded-xl overflow-hidden shadow-sm">
        <Image
          src={article.image.url}
          alt={article.image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          priority
          className="object-cover"
        />
      </div>

      {/* ─── Body prose ───────────────────────────────────── */}
      <div
        className="
          prose max-w-none
          text-[17px] text-[#475569] leading-[1.85]

          [&_p]:mb-7 [&_p]:leading-[1.9]

          [&_h2]:mt-14 [&_h2]:mb-5
          [&_h2]:text-[#0B0F14] [&_h2]:font-black [&_h2]:uppercase [&_h2]:tracking-tight
          [&_h2]:text-xl [&_h2]:md:text-2xl
          [&_h2]:pb-3 [&_h2]:border-b [&_h2]:border-[#E2E8F0]

          [&_h3]:mt-10 [&_h3]:mb-4
          [&_h3]:text-[#0B0F14] [&_h3]:font-bold [&_h3]:text-lg

          [&_strong]:text-[#0B0F14] [&_strong]:font-semibold

          [&_a]:text-[#D4A900] [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4
          [&_a:hover]:text-[#0B0F14] [&_a]:transition-colors

          [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-3
          [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-3
          [&_li]:leading-relaxed

          [&_table]:w-full [&_table]:my-8 [&_table]:border-collapse
          [&_th]:text-left [&_th]:font-black [&_th]:text-[#0B0F14]
          [&_th]:py-3 [&_th]:border-b-2 [&_th]:border-[#E2E8F0]
          [&_td]:py-3 [&_td]:border-b [&_td]:border-[#F1F5F9] [&_td]:align-top
        "
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      {/* ─── FAQ section ───────────────────────────────────── */}
      {article.faqs && article.faqs.length > 0 && (
        <div className="mt-16 pt-12 border-t border-[#E2E8F0]">
          <h2 className="text-xl md:text-2xl font-black text-[#0B0F14] uppercase tracking-tight mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {article.faqs.map((faq, i) => (
              <details
                key={i}
                className="border border-[#E2E8F0] rounded-xl overflow-hidden group open:border-[#F9D20F] transition-colors"
              >
                <summary className="flex items-start justify-between gap-4 px-6 py-5 cursor-pointer list-none">
                  <span className="font-bold text-[#0B0F14] text-[15px] leading-snug">
                    {faq.q}
                  </span>
                  <span className="shrink-0 mt-0.5 w-6 h-6 flex items-center justify-center rounded-full bg-[#F8FAFC] group-open:bg-[#F9D20F] text-[#94A3B8] group-open:text-[#0B0F14] font-black text-lg leading-none transition-all group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 pt-1 text-[#64748B] text-sm leading-relaxed border-t border-[#F1F5F9]">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* ─── Related articles ───────────────────────────────── */}
      {related.length > 0 && (
        <div className="mt-20 pt-12 border-t border-[#E2E8F0]">
          <h2 className="text-xl md:text-2xl font-black text-[#0B0F14] uppercase tracking-tight mb-8">
            Keep Reading
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blogs/news/${r.slug}`}
                className="group flex flex-col rounded-xl overflow-hidden border border-[#E2E8F0] hover:border-[#F9D20F] hover:shadow-sm transition-all"
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
                <div className="p-5 flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">
                    {r.category}
                  </span>
                  <h3 className="text-sm font-black text-[#0B0F14] uppercase tracking-tight leading-snug group-hover:text-[#D4A900] transition-colors">
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
