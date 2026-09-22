import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/queries/content";
import {
  fitSerpTitle,
  looksHandWritten,
  normalizeSerpText,
} from "@/lib/seo-serp";

export const revalidate = 86400;

// Render on first request, then serve from the ISR cache (see the note in
// collections/[handle]/[tag] — without this the route is dynamic per-hit).
export function generateStaticParams() {
  return [];
}

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const page = await getPage(handle);
  if (!page) return { title: "Page Not Found" };
  // Shopify page titles arrive shouted ("CONTACT US", "ABOUT US") and their
  // descriptions are `bodySummary` — body copy the API clipped mid-sentence,
  // which Google then clips again. Normalize the title; only keep a description
  // that reads like one, and say something concrete otherwise.
  const shopifyDescription = [page.seo.description, page.bodySummary].find(
    looksHandWritten
  );
  return {
    title: fitSerpTitle(page.seo.title || page.title),
    description:
      normalizeSerpText(shopifyDescription) ||
      `${normalizeSerpText(page.title)} at JNK Nutrition — UAE's official ` +
        `distributor of 100% genuine supplements, Deira, Dubai.`,
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
        dir="auto"
        className="prose max-w-none text-[#55637A] [&_a]:text-[#F9D20F] [&_h2]:text-[#0B0F14] [&_h3]:text-[#0B0F14] [&_strong]:text-[#0B0F14]"
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
    </div>
  );
}
