import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/queries/content";

export const revalidate = 600;

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const page = await getPage(handle);
  if (!page) return { title: "Page Not Found" };
  return {
    title: page.seo.title || page.title,
    description: page.seo.description || page.bodySummary || undefined,
  };
}

export default async function CmsPage({ params }: Props) {
  const { handle } = await params;
  const page = await getPage(handle);

  if (!page) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-4xl md:text-5xl font-black text-[#0B0F14] uppercase tracking-tight mb-8">
        {page.title}
      </h1>
      <div
        className="prose max-w-none text-[#64748B] [&_a]:text-[#F9D20F] [&_h2]:text-[#0B0F14] [&_h3]:text-[#0B0F14] [&_strong]:text-[#0B0F14]"
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
    </div>
  );
}
