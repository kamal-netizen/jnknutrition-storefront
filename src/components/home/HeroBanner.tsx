"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "@/components/LocaleLink";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDict, useLocale } from "@/lib/locale-context";
import { DIWALI_OFFERS_PATH } from "@/lib/seasonal";

type Banner = {
  src: string;
  /** Locale-specific artwork, keyed by locale code. Falls back to `src`. */
  srcByLocale?: Record<string, string>;
  /** Alt text from the dictionaries: it repeats the artwork's own words. */
  altKey: "heroAltDiwali" | "heroAltBestSellers" | "heroAltCoreChamps" | "heroAltCreatine";
  href: string;
  /** Locale-specific destination, keyed by locale code. Falls back to `href`. */
  hrefByLocale?: Record<string, string>;
};

// Each banner is fully-designed 1920 × 640 (3:1) artwork with baked-in
// headline and CTA, supplied in both English and Arabic. The `en` art is the
// default `src`; the Arabic typeset version is served on /ar via `srcByLocale`.
// File names carry no spaces: see localSrc() in lib/shopify-image-loader.ts.

/** Shown only while lib/seasonal.ts says the Diwali window is open. */
const DIWALI_BANNER: Banner = {
  src: "/banners/2026-11/diwali-deals-en-1920x640.webp",
  srcByLocale: { ar: "/banners/2026-11/diwali-deals-ar-1920x640.webp" },
  altKey: "heroAltDiwali",
  href: DIWALI_OFFERS_PATH,
  // The Diwali Offers page is English only and redirects /ar to Today's Deals;
  // link there directly rather than through the redirect.
  hrefByLocale: { ar: "/collections/today-deals" },
};

const BANNERS: Banner[] = [
  {
    src: "/banners/2026-11/best-sellers-en-1920x640.webp",
    srcByLocale: { ar: "/banners/2026-11/best-sellers-ar-1920x640.webp" },
    altKey: "heroAltBestSellers",
    href: "/collections/best-sellers",
  },
  {
    src: "/banners/2026-11/core-champs-en-1920x640.webp",
    srcByLocale: { ar: "/banners/2026-11/core-champs-ar-1920x640.webp" },
    altKey: "heroAltCoreChamps",
    href: "/collections/core-champs",
  },
  {
    src: "/banners/2026-11/creatine-en-1920x640.webp",
    srcByLocale: { ar: "/banners/2026-11/creatine-ar-1920x640.webp" },
    altKey: "heroAltCreatine",
    href: "/collections/creatine",
  },
];

const INTERVAL = 5000;

type Props = {
  /** Lead with the Diwali slide. Decided on the server, from the date. */
  diwali?: boolean;
};

export default function HeroBanner({ diwali = false }: Props) {
  const t = useDict().home;
  const locale = useLocale();
  const banners = diwali ? [DIWALI_BANNER, ...BANNERS] : BANNERS;
  const count = banners.length;
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => {
      setIndex((next + count) % count);
    },
    [count],
  );

  useEffect(() => {
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [count]);

  const firstSrc = banners[0].srcByLocale?.[locale.code] ?? banners[0].src;

  return (
    <section
      dir="ltr"
      className="relative bg-white px-4 pt-6 pb-8 sm:px-6 lg:px-8"
      aria-roledescription="carousel"
      aria-label="Promotional banners"
    >
      {/*
        This whole carousel sits inside `hidden md:block` — a phone never shows
        it. The first slide used to carry next/image's `priority`, which emits an
        unconditional <link rel="preload">, so every mobile visit fetched a
        ~130 KB desktop banner at high priority, ahead of the goal tile that is
        actually the mobile LCP element. The preload is scoped to the viewport
        that can see it; React hoists this link into <head>.
      */}
      <link
        rel="preload"
        as="image"
        media="(min-width: 768px)"
        href={firstSrc}
        fetchPriority="high"
      />
      <div className="relative mx-auto max-w-7xl">
        {/* Clean bordered frame */}
        <div className="relative rounded-2xl border border-[#E7ECF2] p-1 shadow-[0_12px_32px_-16px_rgba(11,15,20,0.25)]">
          <div className="relative overflow-hidden rounded-xl bg-[#0B0F14]">
            {/* Aspect-ratio track (matches the 3:1 banners so images are never cropped) */}
            <div className="relative w-full aspect-[3/1]">
              <div
                className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {banners.map((banner, i) => {
                  // Prefer locale-specific artwork (e.g. the Arabic-typeset
                  // banner on /ar) and destination.
                  const src = banner.srcByLocale?.[locale.code] ?? banner.src;
                  const href = banner.hrefByLocale?.[locale.code] ?? banner.href;
                  const alt = t[banner.altKey];
                  return (
                    <div
                      key={banner.src}
                      className={`relative h-full w-full shrink-0 ${
                        i === index ? "hero-slide-active" : ""
                      }`}
                      aria-hidden={i !== index}
                    >
                      <Link
                        href={href}
                        tabIndex={i === index ? 0 : -1}
                        aria-label={alt}
                        className="absolute inset-0"
                      >
                        <Image
                          src={src}
                          alt={alt}
                          fill
                          // Left lazy on purpose — both `priority` and
                          // `loading="eager"` make next/image emit its own
                          // unconditional <link rel="preload">, which is the
                          // thing being avoided. Desktop warms this image
                          // through the media-scoped preload above instead,
                          // and picks it up from cache the moment it lays out
                          // in the viewport.
                          sizes="(max-width: 1280px) 100vw, 1280px"
                          className="object-cover"
                        />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prev / Next — glass buttons */}
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous banner"
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition-all hover:border-[#F9D20F] hover:bg-[#F9D20F] hover:text-[#0B0F14] z-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next banner"
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition-all hover:border-[#F9D20F] hover:bg-[#F9D20F] hover:text-[#0B0F14] z-10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Segmented progress indicators */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 z-10">
              {banners.map((banner, i) => (
                <button
                  key={banner.src}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to banner ${i + 1}`}
                  aria-current={i === index}
                  className={`h-1.5 overflow-hidden rounded-full bg-white/40 transition-all duration-300 ${
                    i === index ? "w-10" : "w-4 hover:bg-white/70"
                  }`}
                >
                  {i === index && (
                    <span
                      key={index}
                      className="hero-progress-fill block h-full rounded-full bg-[#F9D20F]"
                      style={{ animationDuration: `${INTERVAL}ms` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
