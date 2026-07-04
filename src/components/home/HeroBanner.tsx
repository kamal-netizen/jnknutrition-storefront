"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

type Banner = {
  src: string;
  alt: string;
  href: string;
  cta: string;
  external?: boolean;
};

const BANNERS: Banner[] = [
  {
    src: "/banners/Top Brands. Best Prices. Fast Results.jpg",
    alt: "Top Brands. Best Prices. Fast Results.",
    href: "/products",
    cta: "Shop Now",
  },
  {
    src: "/banners/core chamos eaa banner for jnk.jpg",
    alt: "Core Champs EAA",
    href: "/collections/core-champs",
    cta: "Shop Core Champs",
  },
  {
    src: "/banners/fat burn banner 2.jpg",
    alt: "Fat Burn",
    href: "/collections/fat-burner",
    cta: "Shop Fat Burners",
  },
  {
    src: "/banners/DOWNLOAD APP.jpg",
    alt: "Download the App",
    href: "https://play.google.com/store/apps/details?id=com.simicart.jnknutrition",
    cta: "Get the App",
    external: true,
  },
];

const INTERVAL = 5000;

export default function HeroBanner() {
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
      className="relative bg-gradient-to-b from-[#0B0F14] via-[#0B0F14] to-[#F8FAFC] px-3 pt-3 pb-6 sm:px-5 sm:pt-5 sm:pb-8"
      aria-roledescription="carousel"
      aria-label="Promotional banners"
    >
      <div className="relative mx-auto max-w-7xl">
        {/* Glow accents behind the frame */}
        <div
          className="pointer-events-none absolute -left-10 top-6 h-40 w-40 rounded-full bg-[#F9D20F] opacity-30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-8 bottom-4 h-48 w-48 rounded-full bg-[#F9D20F] opacity-20 blur-3xl"
          aria-hidden
        />

        {/* Gradient frame */}
        <div className="relative rounded-[1.75rem] bg-gradient-to-br from-[#F9D20F]/60 via-white/10 to-[#F9D20F]/30 p-[1.5px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)]">
          <div className="relative overflow-hidden rounded-[1.7rem] bg-[#0B0F14]">
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
                        aria-label={banner.alt}
                        className="absolute inset-0"
                        {...linkProps}
                      >
                        <Image
                          src={banner.src}
                          alt={banner.alt}
                          fill
                          priority={i === 0}
                          sizes="(max-width: 1280px) 100vw, 1280px"
                          className="object-cover"
                        />
                      </Link>
                      {/* Bottom gradient scrim for CTA legibility */}
                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent"
                        aria-hidden
                      />
                      {/* Glass CTA pill */}
                      <Link
                        href={banner.href}
                        tabIndex={-1}
                        aria-hidden="true"
                        {...linkProps}
                        className="hidden sm:inline-flex absolute bottom-6 left-6 lg:bottom-10 lg:left-10 items-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg backdrop-blur-md transition-all hover:border-[#F9D20F] hover:bg-[#F9D20F] hover:text-[#0B0F14]"
                      >
                        {banner.cta}
                        <ArrowRight className="w-4 h-4" />
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
