import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { Home, Search, ArrowRight } from "lucide-react";
import "./globals.css";
import { SITE_NAME } from "@/lib/seo";

// 404 for URLs that match no route at all — /null, old Shopify asset paths,
// scraped junk. `not-found.tsx` cannot cover these: it only renders when a
// route segment throws notFound(), and this app's root layout lives at
// app/[lang]/layout.tsx, so an unmatched path never reaches a layout. That is
// the case the docs point at global-not-found for (enabled by
// experimental.globalNotFound in next.config.ts).
//
// Routing serves this file directly without rendering a layout, so it owns its
// whole document: styles, font, <html>/<body>. That also means no
// LocaleProvider — every string here is English and every link points at the
// default (un-prefixed) locale. Arabic visitors who land on a real route get
// the localized app/[lang]/not-found.tsx instead.

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `Page Not Found | ${SITE_NAME}`,
  description:
    "The page you're looking for doesn't exist. Browse supplements, brands and categories at JNK Nutrition.",
  robots: { index: false, follow: true },
};

const POPULAR_CATEGORIES: { handle: string; label: string }[] = [
  { handle: "whey-protein", label: "Whey Protein" },
  { handle: "pre-workouts", label: "Pre Workout" },
  { handle: "creatine", label: "Creatine" },
  { handle: "mass-gainers", label: "Mass Gainer" },
  { handle: "fat-burner", label: "Fat Burners" },
  { handle: "bcaa", label: "BCAA" },
  { handle: "multivitamin", label: "Multivitamin" },
  { handle: "fish-oil", label: "Fish Oil" },
];

const HELPFUL_LINKS: { href: string; label: string }[] = [
  { href: "/products", label: "All Products" },
  { href: "/collections", label: "Collections" },
  { href: "/brands", label: "Brands" },
  { href: "/blogs/news", label: "News" },
  { href: "/pages/about", label: "About Us" },
  { href: "/pages/faq", label: "FAQ" },
  { href: "/pages/wholesale", label: "Wholesale" },
  { href: "/pages/contact", label: "Contact" },
  { href: "/account", label: "My Account" },
  { href: "/cart", label: "Cart" },
];

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" className={geistSans.variable}>
      <body className="bg-white antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <Link
            href="/"
            className="text-xl font-black uppercase tracking-tight text-[#0B0F14]"
          >
            {SITE_NAME}
          </Link>

          <div className="w-full max-w-4xl">
            <div className="text-center mt-10">
              <p className="text-7xl sm:text-8xl font-black text-[#F9D20F] leading-none">
                404
              </p>
              <h1 className="mt-4 text-3xl sm:text-4xl font-black text-[#0B0F14] uppercase tracking-tight">
                Page Not Found
              </h1>
              <p className="mt-3 text-[#64748B] max-w-lg mx-auto">
                The page you&apos;re looking for doesn&apos;t exist, or it moved
                when we rebuilt the store.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-[#F9D20F] text-[#0B0F14] font-black uppercase tracking-wide px-8 py-3 rounded hover:bg-[#E7BF00] transition-colors"
                >
                  <Search className="w-4 h-4" />
                  All Products
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 border-2 border-[#0B0F14] text-[#0B0F14] font-black uppercase tracking-wide px-8 py-3 rounded hover:bg-[#F5F7FA] transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>
            </div>

            <section className="mt-14">
              <h2 className="text-xs font-black text-[#0B0F14] uppercase tracking-widest text-center">
                Popular Categories
              </h2>
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {POPULAR_CATEGORIES.map(({ handle, label }) => (
                  <Link
                    key={handle}
                    href={`/collections/${handle}`}
                    className="group flex items-center justify-between gap-2 rounded border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-bold text-[#0B0F14] hover:border-[#F9D20F] hover:bg-[#FFFDF2] transition-colors"
                  >
                    <span className="truncate">{label}</span>
                    <ArrowRight className="w-4 h-4 shrink-0 text-[#94A3B8] group-hover:text-[#0B0F14] transition-colors" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-xs font-black text-[#0B0F14] uppercase tracking-widest text-center">
                Helpful Links
              </h2>
              <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3">
                {HELPFUL_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm font-semibold text-[#64748B] underline-offset-4 hover:text-[#0B0F14] hover:underline transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </body>
    </html>
  );
}
