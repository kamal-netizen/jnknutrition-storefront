"use client";

import Link from "@/components/LocaleLink";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Search, X, Loader2, ArrowRight, TrendingUp } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { predictiveSearch } from "@/lib/queries/search";
import type { PredictiveSearchResults } from "@/lib/queries/search";
import { TRENDING_SEARCHES } from "@/lib/nav";
import { useDict, useNavLabel } from "@/lib/locale-context";
import Price from "@/components/Price";

// Terms cycled through the collapsed pill's typewriter placeholder.
const AUTO_TYPE = [
  "whey",
  "isolate",
  "pre workout",
  "bcaa",
  "creatine",
  "multivitamin",
  "collagen",
];

// Preset quick-search chips shown when the panel is expanded.
const PRESETS = TRENDING_SEARCHES.slice(0, 4);

// Typewriter timings (ms).
const TYPE_SPEED = 90;
const DELETE_SPEED = 45;
const HOLD_FULL = 1400;
const HOLD_EMPTY = 350;

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function FloatingSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const c = useDict().common;
  const navLabel = useNavLabel();

  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PredictiveSearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [placeholder, setPlaceholder] = useState(AUTO_TYPE[0]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSearchPage = pathname === "/search";

  // ── Typewriter placeholder (collapsed pill only) ──────────────────────────
  useEffect(() => {
    if (open || onSearchPage || prefersReducedMotion()) return;

    let termIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    function tick() {
      const term = AUTO_TYPE[termIndex];
      if (!deleting) {
        charIndex++;
        setPlaceholder(term.slice(0, charIndex));
        if (charIndex === term.length) {
          deleting = true;
          timer = setTimeout(tick, HOLD_FULL);
          return;
        }
        timer = setTimeout(tick, TYPE_SPEED);
      } else {
        charIndex--;
        setPlaceholder(term.slice(0, charIndex));
        if (charIndex === 0) {
          deleting = false;
          termIndex = (termIndex + 1) % AUTO_TYPE.length;
          timer = setTimeout(tick, HOLD_EMPTY);
          return;
        }
        timer = setTimeout(tick, DELETE_SPEED);
      }
    }

    timer = setTimeout(tick, TYPE_SPEED);
    return () => clearTimeout(timer);
  }, [open, onSearchPage]);

  // ── Auto hide / reveal on scroll (open/close rules) ───────────────────────
  useEffect(() => {
    if (open) return;
    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      // Reveal near the top; hide when scrolling down, reveal when scrolling up.
      if (y < 120) {
        setHidden(false);
      } else if (y > lastY + 8) {
        setHidden(true);
      } else if (y < lastY - 8) {
        setHidden(false);
      }
      lastY = y;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  // ── Debounced predictive search ───────────────────────────────────────────
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await predictiveSearch(trimmed);
        setResults(data);
      } finally {
        setSearching(false);
      }
    }, 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const expand = useCallback(() => {
    setOpen(true);
    setHidden(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const submit = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      setOpen(false);
      setQuery("");
      setResults(null);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [router]
  );

  // Auto-hide entirely on the full search results page.
  if (onSearchPage) return null;

  const hasResults =
    !!results &&
    (results.products.length > 0 ||
      results.collections.length > 0 ||
      results.pages.length > 0);

  return (
    <div
      ref={containerRef}
      className={`jnk-floating-search hidden md:block fixed left-1/2 z-40 -translate-x-1/2 transition-all duration-300 ease-out ${
        hidden && !open
          ? "pointer-events-none translate-y-24 opacity-0"
          : "translate-y-0 opacity-100"
      }`}
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      {/* Expanded panel (above the bar) */}
      {open && (
        <div className="mb-3 w-[calc(100vw-1.5rem)] sm:w-[30rem] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Input row */}
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] px-4">
            <Search className="h-4 w-4 shrink-0 text-[#94A3B8]" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit(query);
                if (e.key === "Escape") setOpen(false);
              }}
              className="w-full bg-transparent py-3.5 text-sm text-[#0B0F14] outline-none placeholder:text-[#94A3B8] [&::-webkit-search-cancel-button]:appearance-none"
            />
            {searching ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#94A3B8]" />
            ) : query ? (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="shrink-0 text-[#94A3B8] transition-colors hover:text-[#0B0F14]"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setOpen(false)}
                aria-label="Close search"
                className="shrink-0 text-[#94A3B8] transition-colors hover:text-[#0B0F14]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Presets (shown until user types) */}
          {!query.trim() && (
            <div className="px-4 py-4">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                <TrendingUp className="h-3 w-3" />
                {c.trendingSearches}
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((term) => (
                  <button
                    key={term.query}
                    onClick={() => submit(term.query)}
                    className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] transition-colors hover:border-[#F9D20F] hover:text-[#0B0F14]"
                  >
                    {navLabel(term.labelKey, term.query)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Predictive results */}
          {query.trim() && results && (
            <div className="max-h-[55vh] overflow-y-auto">
              {!hasResults ? (
                <p className="px-4 py-6 text-center text-sm text-[#64748B]">
                  No results for{" "}
                  <span className="font-semibold text-[#0B0F14]">
                    &quot;{query}&quot;
                  </span>
                </p>
              ) : (
                results.products.length > 0 && (
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
                            setOpen(false);
                            setQuery("");
                            setResults(null);
                          }}
                          className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-[#F5F7FA]"
                        >
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-[#E2E8F0] bg-[#F5F7FA]">
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
                            <span className="line-clamp-1 block text-sm leading-tight text-[#0B0F14]">
                              {p.title}
                            </span>
                            <Price
                              amount={p.priceRange.minVariantPrice.amount}
                              currencyCode={
                                p.priceRange.minVariantPrice.currencyCode
                              }
                              className="text-xs font-bold text-[#64748B]"
                            />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          )}

          {/* View all footer */}
          {query.trim() && (
            <button
              onClick={() => submit(query)}
              className="flex w-full items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#0B0F14] transition-colors hover:bg-[#F1F5F9]"
            >
              <span className="truncate">
                View all results for &quot;{query}&quot;
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#F9D20F]" />
            </button>
          )}
        </div>
      )}

      {/* Collapsed pill */}
      {!open && (
        <button
          onClick={expand}
          aria-label="Open search"
          className="group flex h-12 items-center gap-3 rounded-full border border-[#E2E8F0] bg-white/95 pl-4 pr-5 shadow-xl backdrop-blur-md transition-all hover:border-[#F9D20F] hover:shadow-2xl"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B0F14] text-white transition-colors group-hover:bg-[#F9D20F] group-hover:text-[#0B0F14]">
            <Search className="h-4 w-4" />
          </span>
          <span className="flex items-center text-sm text-[#64748B]">
            <span className="min-w-[7ch] text-left">
              {placeholder || "Search"}
            </span>
            <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-[#94A3B8]" />
          </span>
        </button>
      )}
    </div>
  );
}
