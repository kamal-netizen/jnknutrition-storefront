import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/LocaleLink";
import { getAllNews, formatNewsDate } from "@/lib/news";

export const metadata: Metadata = {
  title: "News & Articles",
  description:
    "Evidence-based sports nutrition news, supplement guides, and training tips from the JNK Nutrition team. Fuel your performance with the latest insights.",
  alternates: {
    canonical: "/blogs/news",
  },
  openGraph: {
    title: "News & Articles | JNK Nutrition",
    description:
      "Evidence-based sports nutrition news, supplement guides, and training tips from the JNK Nutrition team.",
    type: "website",
    url: "/blogs/news",
  },
};

export default function NewsPage() {
  const articles = getAllNews();
  const [featured, ...rest] = articles;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "JNK Nutrition News",
    description:
      "Evidence-based sports nutrition news, supplement guides, and training tips.",
    url: "https://www.jnknutrition.com/blogs/news",
    blogPost: articles.map((a) => ({
      "@type": "BlogPosting",
      headline: a.title,
      description: a.excerpt,
      datePublished: a.publishedAt,
      author: { "@type": "Organization", name: a.author },
      url: `https://www.jnknutrition.com/blogs/news/${a.slug}`,
    })),
  };

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── Hero band ────────────────────────────────────────── */}
      <section className="bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 w-full">
          <p className="text-[#F9D20F] text-xs font-black uppercase tracking-[0.2em] mb-3">
            News &amp; Articles
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight max-w-4xl">
            Fuel Your Knowledge
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[#94A3B8] max-w-2xl">
            Evidence-based supplement guides, nutrition science, and training
            insights from the JNK team — no hype, just what actually works.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        {/* ─── Featured article ───────────────────────────────── */}
        {featured && (
          <Link
            href={`/blogs/news/${featured.slug}`}
            className="group grid md:grid-cols-2 gap-6 md:gap-10 mb-14 items-center"
          >
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-[#E2E8F0]">
              <Image
                src={featured.image.url}
                alt={featured.image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div>
              <span className="inline-block bg-[#F9D20F] text-[#0B0F14] text-xs font-black uppercase tracking-wide px-3 py-1 rounded">
                {featured.category}
              </span>
              <h2 className="mt-4 text-2xl md:text-3xl font-black text-[#0B0F14] uppercase tracking-tight leading-tight group-hover:text-[#E7BF00] transition-colors">
                {featured.title}
              </h2>
              <p className="mt-3 text-[#64748B] text-base md:text-lg">
                {featured.excerpt}
              </p>
              <p className="mt-4 text-sm text-[#94A3B8]">
                {formatNewsDate(featured.publishedAt)} ·{" "}
                {featured.readingMinutes} min read
              </p>
            </div>
          </Link>
        )}

        {/* ─── Article grid ───────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {rest.map((article) => (
            <Link
              key={article.slug}
              href={`/blogs/news/${article.slug}`}
              className="group flex flex-col rounded-lg overflow-hidden border border-[#E2E8F0] hover:border-[#F9D20F] transition-colors"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={article.image.url}
                  alt={article.image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col flex-1 p-5">
                <span className="text-xs font-black uppercase tracking-wide text-[#082D4C]">
                  {article.category}
                </span>
                <h3 className="mt-2 text-lg font-black text-[#0B0F14] uppercase tracking-tight leading-snug group-hover:text-[#082D4C] transition-colors">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm text-[#64748B] line-clamp-3 flex-1">
                  {article.excerpt}
                </p>
                <p className="mt-4 text-xs text-[#94A3B8]">
                  {formatNewsDate(article.publishedAt)} ·{" "}
                  {article.readingMinutes} min read
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
