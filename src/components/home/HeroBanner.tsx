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
      className="relative bg-[#F8FAFC] overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Promotional banners"
    >
      {/* Aspect-ratio track (matches banner ~3.41:1 so images are never cropped) */}
      <div className="relative w-full aspect-[41/12]">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {BANNERS.map((banner, i) => {
            const linkProps = banner.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {};
            return (
              <div
                key={banner.src}
                className="relative h-full w-full shrink-0"
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
                    sizes="100vw"
                    className="object-contain"
                  />
                </Link>
                {/* CTA pill — hidden on very small screens where the banner is short */}
                <Link
                  href={banner.href}
                  tabIndex={-1}
                  aria-hidden="true"
                  {...linkProps}
                  className="hidden sm:inline-flex absolute bottom-6 left-6 lg:bottom-10 lg:left-10 items-center gap-2 rounded-full bg-[#F9D20F] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-[#0B0F14] shadow-card hover:bg-[#E7BF00] hover:shadow-card-hover transition-all"
                >
                  {banner.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prev / Next */}
      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Previous banner"
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 border border-[#E2E8F0] text-[#0B0F14] hover:border-[#F9D20F] hover:text-[#F9D20F] transition-colors shadow-lg z-10"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Next banner"
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 border border-[#E2E8F0] text-[#0B0F14] hover:border-[#F9D20F] hover:text-[#F9D20F] transition-colors shadow-lg z-10"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2 z-10">
        {BANNERS.map((banner, i) => (
          <button
            key={banner.src}
            type="button"
            onClick={() => go(i)}
            aria-label={`Go to banner ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${
              i === index
                ? "w-6 bg-[#F9D20F]"
                : "w-2 bg-white/70 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
