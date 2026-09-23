"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ScrollRow({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    // Smooth is requested per-call here, which is why the row does NOT carry
    // Tailwind's `scroll-smooth` — see the className below.
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/*
        No `scroll-smooth` (scroll-behavior: smooth) here, deliberately. Paired
        with `snap-mandatory` it made the browser animate this row to its first
        snap target during load, and an in-flight scroll animation stops Chrome
        recording Largest Contentful Paint at all: the homepage renders twelve
        of these strips and emitted ZERO `largestContentfulPaint::Candidate`
        events, so CrUX had no LCP for the origin and Core Web Vitals came back
        "Not Applicable". Product and collection pages, which use no ScrollRow,
        reported LCP normally throughout.

        Nothing is lost by dropping it: `scroll-behavior` only governs
        *programmatic* scrolls, and the arrow buttons above already pass
        `behavior: "smooth"` themselves. Touch scrolling and swipe snapping are
        unaffected. Verified against the live markup — removing this class
        restored LCP on 3/3 runs, as did `scroll-snap-type: none` and
        `overflow-x: clip`; `snap-proximity` did not.
      */}
      <div
        ref={ref}
        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E2E8F0] text-[#0B0F14] hover:border-[#F9D20F] hover:text-[#F9D20F] transition-colors shadow-lg z-10"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E2E8F0] text-[#0B0F14] hover:border-[#F9D20F] hover:text-[#F9D20F] transition-colors shadow-lg z-10"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
