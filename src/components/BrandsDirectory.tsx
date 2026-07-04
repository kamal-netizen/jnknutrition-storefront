"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import type { Collection } from "@/lib/queries/collections";
import { resolveBrandLogo } from "@/lib/brands";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function firstLetter(title: string): string {
  const ch = title.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : "#";
}

export default function BrandsDirectory({
  collections,
}: {
  collections: Collection[];
}) {
  const [query, setQuery] = useState("");

  const sorted = useMemo(
    () =>
      [...collections].sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
      ),
    [collections]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((c) => c.title.toLowerCase().includes(q));
  }, [sorted, query]);

  const groups = useMemo(() => {
    const map = new Map<string, Collection[]>();
    for (const c of filtered) {
      const letter = firstLetter(c.title);
      const list = map.get(letter);
      if (list) list.push(c);
      else map.set(letter, [c]);
    }
    return map;
  }, [filtered]);

  const activeLetters = useMemo(() => new Set(groups.keys()), [groups]);
  const letters = useMemo(() => [...ALPHABET, "#"], []);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brands…"
          aria-label="Search brands"
          className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0B0F14] placeholder:text-[#94A3B8] focus:border-[#F9D20F] focus:outline-none focus:ring-2 focus:ring-[#F9D20F]/30"
        />
      </div>

      {/* A–Z index */}
      <div className="mb-8 flex flex-wrap gap-1">
        {letters.map((letter) => {
          const enabled = activeLetters.has(letter);
          return enabled ? (
            <a
              key={letter}
              href={`#brand-letter-${letter === "#" ? "num" : letter}`}
              className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-black text-[#082D4C] transition-colors hover:bg-[#F9D20F] hover:text-[#0B0F14]"
            >
              {letter}
            </a>
          ) : (
            <span
              key={letter}
              className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-black text-[#CBD5E1]"
            >
              {letter}
            </span>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-10 text-center">
          <p className="text-[#64748B]">
            No brands match &ldquo;{query}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {letters
            .filter((letter) => groups.has(letter))
            .map((letter) => (
              <section
                key={letter}
                id={`brand-letter-${letter === "#" ? "num" : letter}`}
                className="scroll-mt-24"
              >
                <h2 className="mb-4 text-lg font-black uppercase tracking-tight text-[#0B0F14]">
                  {letter}
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {groups.get(letter)!.map((collection) => (
                    <BrandTile key={collection.id} collection={collection} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}

function BrandTile({ collection }: { collection: Collection }) {
  const logo = resolveBrandLogo(collection.handle, collection.title);

  return (
    <Link
      href={`/collections/${collection.handle}`}
      className="group flex h-28 items-center justify-center overflow-hidden rounded-xl border border-[#ECECEC] bg-white px-4 text-center transition-colors hover:border-[#F9D20F] hover:bg-[#EEF4FF]"
    >
      {logo ? (
        <Image
          src={logo}
          alt={collection.title}
          width={190}
          height={112}
          className="max-h-16 w-auto object-contain"
        />
      ) : collection.image ? (
        <Image
          src={collection.image.url}
          alt={collection.image.altText ?? collection.title}
          width={190}
          height={112}
          className="max-h-20 w-auto object-contain"
        />
      ) : (
        <span className="text-sm font-black uppercase tracking-tight text-[#64748B] group-hover:text-[#0B0F14]">
          {collection.title}
        </span>
      )}
    </Link>
  );
}
