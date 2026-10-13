import Link from "@/components/LocaleLink";
import ImagePreload from "@/components/ImagePreload";
import Image from "next/image";

export type Goal = {
  title: string;
  description: string;
  href: string;
  image: string;
};

export const GOALS: Goal[] = [
  {
    title: "Whey Protein",
    description: "Build lean muscle",
    href: "/collections/whey-protein",
    image: "/feature image/whey.webp",
  },
  {
    title: "Creatine",
    description: "Strength & power",
    href: "/collections/creatine",
    image: "/feature image/creatine.webp",
  },
  {
    title: "Fat Loss",
    description: "Shred & burn",
    href: "/collections/energy-performance",
    image: "/feature image/fat-loss.webp",
  },
  {
    title: "EAAs & Aminos",
    description: "Recover faster",
    href: "/collections/bcaa",
    image: "/feature image/EAAS_600x.webp",
  },
  {
    title: "Pre-Workout",
    description: "Energy & focus",
    href: "/collections/pre-workouts",
    image: "/feature image/preworkout.webp",
  },
  {
    title: "Vitamins & Health",
    description: "Daily wellness",
    href: "/collections/health-wellness",
    image: "/feature image/MULTIVITAMINS_AND_MINERALS_600x.webp",
  },
];

// The tile's rendered width: 2-up below md, 3-up to lg, then 6-up inside
// max-w-7xl (~189px). These images now have real narrower copies
// (scripts/image-variants.mjs), so this decides which one a screen downloads.
const SIZES =
  "(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 17vw, 190px";

/** Where the grid is the hero: phones, where the carousel is `hidden md:block`. */
const MOBILE = "(max-width: 767px)";

export default function GoalCard({
  goal,
  priority = false,
}: {
  goal: Goal;
  /**
   * Load this tile's image eagerly, and preload it at high priority on a
   * phone. Set on the tiles that are above the fold there.
   *
   * This grid carries `order-first` on mobile — it *is* the mobile hero, since
   * the carousel above it is `hidden md:block`. Lighthouse names one of these
   * images as the Largest Contentful Paint element. On desktop the grid sits
   * below the carousel and the deals strip, so the preload is phone-only:
   * next/image's `priority` preloaded these everywhere, competing with the
   * desktop hero. (Those preloads also fetched nothing at all — the space in
   * "/feature image" broke their srcset; see shopify-image-loader.ts.)
   */
  priority?: boolean;
}) {
  return (
    <Link
      href={goal.href}
      className="group relative block overflow-hidden rounded-xl aspect-[3/4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9D20F] focus-visible:ring-offset-2"
    >
      {/* Image */}
      {priority && (
        <ImagePreload src={goal.image} sizes={SIZES} fill media={MOBILE} fetchPriority="high" />
      )}
      <Image
        src={goal.image}
        alt={goal.title}
        fill
        loading={priority ? "eager" : "lazy"}
        sizes={SIZES}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

      {/* Bottom CTA strip */}
      <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
        <div className="bg-[#F9D20F] px-4 py-3 flex items-center justify-between">
          <span className="text-[#0B0F14] text-xs font-black uppercase tracking-widest">
            {goal.description}
          </span>
          <span className="text-[#0B0F14] font-black text-sm">→</span>
        </div>
      </div>
    </Link>
  );
}
