"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "@/components/LocaleLink";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDict, useLocale } from "@/lib/locale-context";

type Banner = {
  src: string;
  /** Locale-specific artwork, keyed by locale code. Falls back to `src`. */
  srcByLocale?: Record<string, string>;
  alt: string;
  /** Localized alt text, when the artwork itself is translated. */
  altKey?: "heroAltTopProducts";
  href: string;
  external?: boolean;
};

// Each banner is fully-designed artwork with baked-in headline and CTA,
// supplied in both English and Arabic. The `en` art is the default `src`;
// the Arabic typeset version is served on /ar via `srcByLocale`.
const BANNERS: Banner[] = [
  {
    src: "/banners/banner/EN/top products en.jpg",
    srcByLocale: { ar: "/banners/banner/AR/top products ar.jpg" },
    alt: "Fuel Your Goals — everything you need for strength, recovery and performance",
    altKey: "heroAltTopProducts",
    href: "/products",
  },
  {
    src: "/banners/banner/EN/CORE CHAMPS EN.jpg",
    srcByLocale: { ar: "/banners/banner/AR/CORE CHAMPS AR.jpg" },
    alt: "Core Champs",
    href: "/collections/core-champs",
  },
  {
    src: "/banners/banner/EN/ISO 100 EN.jpg",
    srcByLocale: { ar: "/banners/banner/AR/ISO 100 AR.jpg" },
    alt: "ISO 100 — hydrolyzed whey protein isolate",
    href: "/collections/isolate-protein",
  },
  {
    src: "/banners/banner/EN/DOWNLOAD APP EN.jpg",
    srcByLocale: { ar: "/banners/banner/AR/DOWNLOAD APP PUSH AR.jpg" },
    alt: "Download the App",
    href: "https://play.google.com/store/apps/details?id=com.simicart.jnknutrition",
    external: true,
  },
];

const INTERVAL = 5000;

export default function HeroBanner() {
  const t = useDict().home;
  const locale = useLocale();
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number) => {
    setIndex((next + BANNERS.length) % BANNERS.length);
  }, []);

  useEffect(() => {
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % BANNERS.length);
    }, INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return (
    <section
      dir="ltr"
      className="relative bg-white px-4 pt-6 pb-8 sm:px-6 lg:px-8"
      aria-roledescription="carousel"
      aria-label="Promotional banners"
    >
      <div className="relative mx-auto max-w-7xl">
        {/* Clean bordered frame */}
        <div className="relative rounded-2xl border border-[#E7ECF2] p-1 shadow-[0_12px_32px_-16px_rgba(11,15,20,0.25)]">
          <div className="relative overflow-hidden rounded-xl bg-[#0B0F14]">
            {/* Aspect-ratio track (matches banner ~3.41:1 so images are never cropped) */}
            <div className="relative w-full aspect-[41/12]">
              <div
                className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {BANNERS.map((banner, i) => {
                  const linkProps = banner.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {};
                  // Prefer locale-specific artwork (e.g. the Arabic-typeset
                  // banner on /ar) and its translated alt text.
                  const src = banner.srcByLocale?.[locale.code] ?? banner.src;
                  const alt = banner.altKey ? t[banner.altKey] : banner.alt;
                  return (
                    <div
                      key={banner.src}
                      className={`relative h-full w-full shrink-0 ${
                        i === index ? "hero-slide-active" : ""
                      }`}
                      aria-hidden={i !== index}
                    >
                      <Link
                        href={banner.href}
                        tabIndex={i === index ? 0 : -1}
                        aria-label={alt}
                        className="absolute inset-0"
                        {...linkProps}
                      >
                        <Image
                          src={src}
                          alt={alt}
                          fill
                          priority={i === 0}
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
              {BANNERS.map((banner, i) => (
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
