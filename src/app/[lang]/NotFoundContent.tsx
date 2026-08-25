"use client";

import Link from "@/components/LocaleLink";
import { Home, Search, ArrowRight } from "lucide-react";
import { useDict, useNavLabel } from "@/lib/locale-context";

// The default 404 body. Client-side because `not-found.tsx` is a special file
// that never receives route params — the active locale can only be read from
// the context that app/[lang]/layout.tsx already provides.
//
// A bare "404, go home" page wastes the visit. Most arrivals here are old
// Shopify links that outlived the migration (see the redirect map in
// next.config.ts for the shapes we could match automatically); the rest are
// discontinued products. Both are shoppers with intent, so the page routes
// them to the category they were probably after instead of dead-ending.

/** Fallbacks are English; `useNavLabel` swaps in the translated label per locale. */
const POPULAR_CATEGORIES: { handle: string; fallback: string }[] = [
  { handle: "whey-protein", fallback: "Whey Protein" },
  { handle: "pre-workouts", fallback: "Pre Workout" },
  { handle: "creatine", fallback: "Creatine" },
  { handle: "mass-gainers", fallback: "Mass Gainer" },
  { handle: "fat-burner", fallback: "Fat Burners" },
  { handle: "bcaa", fallback: "BCAA" },
  { handle: "multivitamin", fallback: "Multivitamin" },
  { handle: "fish-oil", fallback: "Fish Oil" },
];

export default function NotFoundContent() {
  const dict = useDict();
  const navLabel = useNavLabel();

  const helpfulLinks: { href: string; label: string }[] = [
    { href: "/products", label: dict.footer.allProducts },
    { href: "/collections", label: dict.common.collections },
    { href: "/brands", label: dict.header.brands },
    { href: "/blogs/news", label: dict.header.blog },
    { href: "/pages/about", label: dict.footer.aboutUs },
    { href: "/pages/faq", label: dict.footer.faq },
    { href: "/pages/wholesale", label: dict.footer.wholesale },
    { href: "/pages/contact", label: dict.footer.contact },
    { href: "/account", label: dict.footer.myAccount },
    { href: "/cart", label: dict.common.cart },
  ];

  return (
    <div className="w-full max-w-4xl py-12">
      <div className="text-center">
        <p className="text-7xl sm:text-8xl font-black text-[#F9D20F] leading-none">
          404
        </p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-black text-[#0B0F14] uppercase tracking-tight">
          {dict.notFound.title}
        </h1>
        <p className="mt-3 text-[#55637A] max-w-lg mx-auto">
          {dict.notFound.body}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-[#F9D20F] text-[#0B0F14] font-black uppercase tracking-wide px-8 py-3 rounded hover:bg-[#E7BF00] transition-colors"
          >
            <Search className="w-4 h-4" />
            {dict.footer.allProducts}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border-2 border-[#0B0F14] text-[#0B0F14] font-black uppercase tracking-wide px-8 py-3 rounded hover:bg-[#F5F7FA] transition-colors"
          >
            <Home className="w-4 h-4" />
            {dict.notFound.backToHome}
          </Link>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="text-xs font-black text-[#0B0F14] uppercase tracking-widest text-center">
          {dict.notFound.popularCategories}
        </h2>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR_CATEGORIES.map(({ handle, fallback }) => (
            <Link
              key={handle}
              href={`/collections/${handle}`}
              className="group flex items-center justify-between gap-2 rounded border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-bold text-[#0B0F14] hover:border-[#F9D20F] hover:bg-[#FFFDF2] transition-colors"
            >
              <span className="truncate">{navLabel(handle, fallback)}</span>
              <ArrowRight className="w-4 h-4 shrink-0 text-[#94A3B8] group-hover:text-[#0B0F14] transition-colors rtl:rotate-180" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xs font-black text-[#0B0F14] uppercase tracking-widest text-center">
          {dict.notFound.helpfulLinks}
        </h2>
        <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {helpfulLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm font-semibold text-[#55637A] underline-offset-4 hover:text-[#0B0F14] hover:underline transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded border border-[#E2E8F0] bg-[#F5F7FA] px-6 py-6 text-center">
        <h2 className="text-lg font-black text-[#0B0F14] uppercase tracking-tight">
          {dict.notFound.stillStuck}
        </h2>
        <p className="mt-2 text-sm text-[#55637A] max-w-md mx-auto">
          {dict.notFound.stillStuckBody}
        </p>
        <Link
          href="/pages/contact"
          className="inline-block mt-5 border-2 border-[#0B0F14] text-[#0B0F14] font-black uppercase tracking-wide px-6 py-2.5 rounded hover:bg-white transition-colors"
        >
          {dict.footer.contact}
        </Link>
      </section>
    </div>
  );
}
