"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  User,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Layers,
  BookOpen,
  Info,
  Store,
  Target,
  Truck,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCartStore, useCartCount } from "@/lib/store/cart";
import { predictiveSearch } from "@/lib/queries/search";
import type { PredictiveSearchResults } from "@/lib/queries/search";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Price from "@/components/Price";
import CartDrawer from "@/components/CartDrawer";
import DesktopNav from "@/components/MegaMenu";
import {
  GOAL_CARDS,
  CATEGORY_GROUPS,
  MEGA_BRANDS,
  SIMPLE_LINKS,
  TRENDING_SEARCHES,
  collectionHref,
} from "@/lib/nav";
import type { Collection } from "@/lib/queries/collections";

const APP_STORE_URL = "https://apps.apple.com/us/app/jnk-nutrition/id6743687638";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.simicart.jnknutrition";

const ANNOUNCEMENTS: React.ReactNode[] = [
  <>
    Free shipping on orders over{" "}
    <span className="font-bold text-[#F9D20F]">AED 149</span>
  </>,
  <>
    <span className="font-bold text-[#F9D20F]">Same-day dispatch</span> on
    orders before cut-off
  </>,
  <>
    <span className="font-bold text-[#F9D20F]">100% authentic</span> brands
    &mdash; UAE stock
  </>,
];

function getAppStoreUrl() {
  if (typeof navigator === "undefined") return PLAY_STORE_URL;
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod|Macintosh/i.test(ua) ? APP_STORE_URL : PLAY_STORE_URL;
}

const MOBILE_SECTIONS = [
  {
    label: "Shop by Goals",
    icon: Target,
    groups: [
      {
        title: "",
        links: GOAL_CARDS.map((g) => ({
          label: g.title,
          href: collectionHref(g.handle),
        })),
      },
    ],
  },
  {
    label: "Category",
    icon: Layers,
    groups: CATEGORY_GROUPS.map((c) => ({
      title: c.title,
      links: c.items.map((i) => ({
        label: i.label,
        href: collectionHref(i.handle),
      })),
    })),
  },
  {
    label: "Brands",
    icon: Store,
    groups: [
      {
        title: "",
        links: MEGA_BRANDS.map((b) => ({
          label: b.name,
          href: collectionHref(b.handle),
        })),
      },
    ],
  },
];

export default function Header({
  collections = [],
}: {
  collections?: Collection[];
}) {
  const cartCount = useCartCount();
  const { openCart } = useCartStore();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PredictiveSearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rotate announcement-bar USP messages
  useEffect(() => {
    const id = setInterval(
      () => setAnnouncement((i) => (i + 1) % ANNOUNCEMENTS.length),
      4000
    );
    return () => clearInterval(id);
  }, []);

  // Predictive search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    debounceRef.current = setTimeout(
      async () => {
        if (!trimmed) {
          setResults(null);
          setSearching(false);
          return;
        }
        setSearching(true);
        try {
          const data = await predictiveSearch(trimmed);
          setResults(data);
        } finally {
          setSearching(false);
        }
      },
      trimmed ? 280 : 0
    );
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setResults(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigate to the full search results page and reset the dropdown.
  function submitSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    setResults(null);
    setQuery("");
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-[#082D4C] border-b border-[#0D3E66]">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-center gap-2">
          <span
            key={announcement}
            className="text-[11px] sm:text-xs uppercase tracking-[0.15em] text-[#C7D0DA] animate-in fade-in duration-500"
            aria-live="polite"
          >
            {ANNOUNCEMENTS[announcement]}
          </span>
          <span className="hidden md:inline h-4 w-px bg-[#3A5B7A]" aria-hidden="true" />
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.currentTarget.href = getAppStoreUrl();
            }}
            className="hidden md:inline text-[11px] sm:text-xs uppercase tracking-[0.15em] text-[#C7D0DA] transition-colors hover:text-[#F9D20F]"
          >
            Download the <span className="font-bold text-white">JNK App</span>
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            {/* Mobile menu (left) */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className="md:hidden text-[#64748B] hover:text-[#0B0F14] bg-transparent border-0 p-0 cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </SheetTrigger>
              <SheetContent
                side="left"
                showCloseButton={false}
                className="bg-white border-r border-[#E2E8F0] w-[86%] max-w-sm p-0 gap-0"
              >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 h-16 border-b border-[#E2E8F0]">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center"
                    aria-label="JNK Nutrition home"
                  >
                    <Image
                      src="/logo.svg"
                      alt="JNK Nutrition"
                      width={100}
                      height={55}
                      className="h-8 w-auto"
                    />
                  </Link>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center w-9 h-9 rounded-full text-[#64748B] hover:text-[#0B0F14] hover:bg-[#F1F5F9] transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search shortcut */}
                <div className="px-5 py-4 border-b border-[#E2E8F0]">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setSearchOpen(true);
                    }}
                    className="flex items-center gap-3 w-full h-11 px-4 rounded-full bg-[#F1F5F9] text-[#64748B] hover:bg-[#E8EDF3] transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span className="text-sm">Search products...</span>
                  </button>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.slice(0, 6).map((term) => (
                      <Link
                        key={term}
                        href={`/search?q=${encodeURIComponent(term)}`}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] hover:border-[#F9D20F] hover:text-[#0B0F14] transition-colors"
                      >
                        {term}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Primary navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-3">
                  {/* Shop All */}
                  <Link
                    href="/products"
                    onClick={() => setMobileOpen(false)}
                    className="group flex items-center gap-4 px-3 py-3.5 min-h-[48px] rounded-xl hover:bg-[#F8FAFC] transition-colors"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#082D4C] group-hover:bg-[#F9D20F] transition-colors">
                      <LayoutGrid className="w-5 h-5" />
                    </span>
                    <span className="flex-1 text-base font-bold uppercase tracking-wide text-[#0B0F14]">
                      Shop All
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#082D4C] transition-colors" />
                  </Link>

                  {/* Shop by Goals */}
                  {MOBILE_SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const isExpanded = mobileExpanded === section.label;
                    return (
                      <div key={section.label}>
                        <button
                          onClick={() =>
                            setMobileExpanded((cur) =>
                              cur === section.label ? null : section.label
                            )
                          }
                          aria-expanded={isExpanded}
                          className="group flex w-full items-center gap-4 px-3 py-3.5 min-h-[48px] rounded-xl hover:bg-[#F8FAFC] transition-colors"
                        >
                          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#082D4C] group-hover:bg-[#F9D20F] transition-colors">
                            <Icon className="w-5 h-5" />
                          </span>
                          <span className="flex-1 text-left text-base font-bold uppercase tracking-wide text-[#0B0F14]">
                            {section.label}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-[#94A3B8] transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="pl-14 pr-3 pb-2">
                            {section.groups.map((group) => (
                              <div key={group.title} className="pt-1">
                                {group.title && (
                                  <p className="pt-2 pb-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#94A3B8]">
                                    {group.title}
                                  </p>
                                )}
                                {group.links.map((link) => (
                                  <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block py-2.5 min-h-[44px] text-sm font-medium text-[#475569] hover:text-[#0B0F14]"
                                  >
                                    {link.label}
                                  </Link>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Blog / About */}
                  {SIMPLE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="group flex items-center gap-4 px-3 py-3.5 min-h-[48px] rounded-xl hover:bg-[#F8FAFC] transition-colors"
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#082D4C] group-hover:bg-[#F9D20F] transition-colors">
                        {link.label === "Blog" ? (
                          <BookOpen className="w-5 h-5" />
                        ) : (
                          <Info className="w-5 h-5" />
                        )}
                      </span>
                      <span className="flex-1 text-base font-bold uppercase tracking-wide text-[#0B0F14]">
                        {link.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#082D4C] transition-colors" />
                    </Link>
                  ))}

                  <div className="my-3 h-px bg-[#E2E8F0] mx-3" />

                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="group flex items-center gap-4 px-3 py-3.5 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#082D4C] group-hover:bg-[#F9D20F] transition-colors">
                      <User className="w-5 h-5" />
                    </span>
                    <span className="flex-1 text-base font-bold uppercase tracking-wide text-[#0B0F14]">
                      Account
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#082D4C] transition-colors" />
                  </Link>
                </nav>

                {/* Drawer footer */}
                <div className="mt-auto border-t border-[#E2E8F0]">
                  <div className="flex items-center gap-2 px-5 py-3 bg-[#082D4C]">
                    <Truck className="w-4 h-4 text-[#F9D20F] shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#F9D20F]">
                      Free shipping over AED149
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-xs text-[#94A3B8]">
                      &copy; {new Date().getFullYear()} JNK
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-[#F1F5F9] text-[#64748B] hover:bg-[#F9D20F] hover:text-[#082D4C] transition-colors"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4"
                        >
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                        </svg>
                      </a>
                      <a
                        href="https://youtube.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube"
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-[#F1F5F9] text-[#64748B] hover:bg-[#F9D20F] hover:text-[#082D4C] transition-colors"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4"
                        >
                          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                          <path d="m10 15 5-3-5-3z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="md:mr-10 flex items-center" aria-label="JNK Nutrition home">
              <Image
                src="/logo.svg"
                alt="JNK Nutrition"
                width={110}
                height={60}
                priority
                className="h-9 w-auto"
              />
            </Link>

            {/* Desktop nav */}
            <DesktopNav collections={collections} />

            {/* Right actions */}
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Search */}
              <div ref={searchRef} className="relative">
                <button
                  onClick={() => setSearchOpen((v) => !v)}
                  className="text-[#64748B] hover:text-[#0B0F14] transition-colors"
                  aria-label="Search"
                >
                  {searchOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>

                {searchOpen && (
                  <div className="absolute right-0 top-11 w-[calc(100vw-2rem)] sm:w-[26rem] bg-white border border-[#E2E8F0] rounded-lg shadow-2xl z-50 overflow-hidden">
                    {/* Input row */}
                    <div className="flex items-center gap-2 px-3 border-b border-[#E2E8F0]">
                      <Search className="w-4 h-4 shrink-0 text-[#94A3B8]" />
                      <input
                        autoFocus
                        type="search"
                        placeholder="Search products..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitSearch(query);
                          if (e.key === "Escape") setSearchOpen(false);
                        }}
                        className="w-full bg-transparent py-3 text-sm text-[#0B0F14] placeholder:text-[#94A3B8] outline-none [&::-webkit-search-cancel-button]:appearance-none"
                      />
                      {searching ? (
                        <Loader2 className="w-4 h-4 shrink-0 text-[#94A3B8] animate-spin" />
                      ) : (
                        query && (
                          <button
                            onClick={() => setQuery("")}
                            aria-label="Clear search"
                            className="shrink-0 text-[#94A3B8] hover:text-[#0B0F14] transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )
                      )}
                    </div>

                    {/* Empty prompt */}
                    {!query.trim() && (
                      <p className="px-4 py-6 text-center text-sm text-[#94A3B8]">
                        Start typing to search products.
                      </p>
                    )}

                    {/* Results */}
                    {query.trim() && results && (
                      <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto">
                        {results.products.length === 0 &&
                        results.collections.length === 0 &&
                        results.pages.length === 0 ? (
                          <p className="px-4 py-6 text-center text-sm text-[#64748B]">
                            No results for{" "}
                            <span className="font-semibold text-[#0B0F14]">
                              &quot;{query}&quot;
                            </span>
                          </p>
                        ) : (
                          <>
                            {/* Products */}
                            {results.products.length > 0 && (
                              <div className="py-2">
                                <p className="px-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                                  Products
                                </p>
                                {results.products.slice(0, 5).map((p) => {
                                  const img = p.images.edges[0]?.node;
                                  return (
                                    <Link
                                      key={p.id}
                                      href={`/products/${p.handle}`}
                                      onClick={() => {
                                        setSearchOpen(false);
                                        setResults(null);
                                        setQuery("");
                                      }}
                                      className="flex items-center gap-3 px-4 py-2 hover:bg-[#F5F7FA] transition-colors"
                                    >
                                      <span className="relative shrink-0 w-10 h-10 rounded bg-[#F5F7FA] overflow-hidden border border-[#E2E8F0]">
                                        {img && (
                                          <Image
                                            src={img.url}
                                            alt={img.altText ?? p.title}
                                            fill
                                            sizes="40px"
                                            className="object-cover"
                                          />
                                        )}
                                      </span>
                                      <span className="min-w-0 flex-1">
                                        <span className="block text-sm text-[#0B0F14] leading-tight line-clamp-1">
                                          {p.title}
                                        </span>
                                        <Price
                                          amount={
                                            p.priceRange.minVariantPrice.amount
                                          }
                                          currencyCode={
                                            p.priceRange.minVariantPrice
                                              .currencyCode
                                          }
                                          className="text-xs font-bold text-[#64748B]"
                                        />
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}

                            {/* Collections */}
                            {results.collections.length > 0 && (
                              <div className="py-2 border-t border-[#F1F5F9]">
                                <p className="px-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                                  Collections
                                </p>
                                {results.collections.slice(0, 4).map((c) => (
                                  <Link
                                    key={c.id}
                                    href={`/collections/${c.handle}`}
                                    onClick={() => {
                                      setSearchOpen(false);
                                      setResults(null);
                                      setQuery("");
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#0B0F14] hover:bg-[#F5F7FA] transition-colors"
                                  >
                                    <Layers className="w-4 h-4 shrink-0 text-[#94A3B8]" />
                                    <span className="line-clamp-1">
                                      {c.title}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            )}

                            {/* Pages */}
                            {results.pages.length > 0 && (
                              <div className="py-2 border-t border-[#F1F5F9]">
                                <p className="px-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                                  Pages
                                </p>
                                {results.pages.slice(0, 3).map((pg) => (
                                  <Link
                                    key={pg.id}
                                    href={`/pages/${pg.handle}`}
                                    onClick={() => {
                                      setSearchOpen(false);
                                      setResults(null);
                                      setQuery("");
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#0B0F14] hover:bg-[#F5F7FA] transition-colors"
                                  >
                                    <Info className="w-4 h-4 shrink-0 text-[#94A3B8]" />
                                    <span className="line-clamp-1">
                                      {pg.title}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* View all footer */}
                    {query.trim() && (
                      <button
                        onClick={() => submitSearch(query)}
                        className="flex items-center justify-between w-full px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] text-sm font-bold uppercase tracking-wide text-[#0B0F14] hover:bg-[#F1F5F9] transition-colors"
                      >
                        <span className="truncate">
                          View all results for &quot;{query}&quot;
                        </span>
                        <ArrowRight className="w-4 h-4 shrink-0 text-[#F9D20F]" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Account */}
              <Link
                href="/account"
                className="text-[#64748B] hover:text-[#0B0F14] transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative text-[#64748B] hover:text-[#0B0F14] transition-colors"
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#F9D20F] text-[#0B0F14] text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer />
    </>
  );
}
