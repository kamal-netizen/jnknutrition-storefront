import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import Image from "next/image";
import { getCollections } from "@/lib/queries/collections";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse JNK Nutrition product collections.",
};

export const revalidate = 300;

export default async function CollectionsPage() {
  const collections = await getCollections(50);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-4xl md:text-5xl font-black text-[#0B0F14] uppercase tracking-tight mb-10">
        Collections
      </h1>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-[#E2E8F0] hover:border-[#F9D20F] transition-colors"
            >
              {collection.image ? (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText ?? collection.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#EEF4FF] to-[#F5F7FA]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  {collection.title}
                </h2>
                {collection.description && (
                  <p className="mt-1 text-sm text-[#E2E8F0] line-clamp-2 max-w-xs">
                    {collection.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-10 text-center">
          <p className="text-[#64748B]">No collections found.</p>
        </div>
      )}
    </div>
  );
}


