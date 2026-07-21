import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/LocaleLink";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/queries/content";

export const revalidate = 600;

type Props = {
  params: Promise<{ blog: string; article: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blog, article } = await params;
  const data = await getArticle(blog, article);
  if (!data) return { title: "Article Not Found" };
  return {
    title: data.seo.title || data.title,
    description: data.seo.description || data.excerpt || undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { blog, article } = await params;
  const data = await getArticle(blog, article);

  if (!data) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-6">
        <Link
          href={`/blogs/${blog}`}
          className="text-sm text-[#64748B] hover:text-[#0B0F14] transition-colors"
        >
          ← Blog
        </Link>
      </div>

      <h1 className="text-3xl md:text-5xl font-black text-[#0B0F14] uppercase tracking-tight leading-tight">
        {data.title}
      </h1>
      <p className="mt-4 text-sm text-[#64748B]">
        {data.author?.name && <>By {data.author.name} · </>}
        {new Date(data.publishedAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {data.image && (
          <div className="relative aspect-[16/9] mt-8 rounded-lg overflow-hidden border border-[#E2E8F0]">
          <Image
            src={data.image.url}
            alt={data.image.altText ?? data.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            className="object-cover"
          />
        </div>
      )}

      <div
        dir="auto"
        className="prose max-w-none mt-10 text-[#64748B] [&_a]:text-[#F9D20F] [&_h2]:text-[#0B0F14] [&_h3]:text-[#0B0F14] [&_strong]:text-[#0B0F14]"
        dangerouslySetInnerHTML={{ __html: data.contentHtml }}
      />
    </article>
  );
}
