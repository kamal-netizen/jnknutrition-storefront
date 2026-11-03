import Link from "@/components/LocaleLink";
import type { ProductCardData } from "@/lib/queries/products";
import ProductCard from "@/components/ProductCard";
import ScrollRow from "@/components/home/ScrollRow";

/**
 * A category scene made in ChatGPT: products on the right, empty background on
 * the left for the heading, and a bottom that fades into one flat colour.
 * Two crops of the same 1536 × 1024 render (banner-work/2026-11/prompts).
 */
export type ShelfScene = {
  /** Phone crop, 2:1. */
  mobile: { src: string; width: number; height: number };
  /** Desktop crop, 3:1. */
  desktop: { src: string; width: number; height: number };
  /** The flat colour the scene fades into; the section continues it. */
  color: string;
  /** A dark scene takes white heading text. */
  dark?: boolean;
};

type Props = {
  title: string;
  eyebrow?: string;
  body?: string;
  href: string;
  ctaLabel: string;
  products: ProductCardData[];
  scene: ShelfScene;
};

const TEXT = {
  light: { eyebrow: "text-[#082D4C]", title: "text-[#0B0F14]", body: "text-[#082D4C]" },
  dark: { eyebrow: "text-white/80", title: "text-white", body: "text-white/75" },
};

/**
 * A category "shelf": one coloured container whose scene image carries the
 * heading, with the product row overlapping the bottom of the scene and a
 * full-width "View All" under it.
 */
export default function ShelfSection({
  title,
  eyebrow,
  body,
  href,
  ctaLabel,
  products,
  scene,
}: Props) {
  if (products.length === 0) return null;
  const text = TEXT[scene.dark ? "dark" : "light"];

  // Art direction: a different crop per viewport, so a plain <picture> rather
  // than <Image>. Not getImageProps(): this is a server component and the
  // image loader is client-only. Local files pass through that loader
  // unchanged anyway, so the srcs go in as they are. The scene is decoration —
  // the heading is real text — hence the empty alt. Below the fold on every
  // viewport, so it stays lazy.
  return (
    <section style={{ backgroundColor: scene.color }}>
      <div className="max-w-7xl mx-auto md:px-6 lg:px-8 md:pt-10 w-full">
        <div className="relative">
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet={scene.desktop.src}
              width={scene.desktop.width}
              height={scene.desktop.height}
            />
            <img
              src={scene.mobile.src}
              width={scene.mobile.width}
              height={scene.mobile.height}
              alt=""
              loading="lazy"
              decoding="async"
              className="block h-auto w-full md:rounded-2xl"
            />
          </picture>
          {/* The scene leaves its left side empty for this block, on both
              locales: the artwork itself is not mirrored for /ar, so the
              padding is physical (left/right), not start/end. */}
          <div className="absolute inset-y-0 left-0 flex w-[40%] flex-col justify-center pl-4 pr-2 pb-6 md:pl-10 md:pr-4 md:pb-16">
            {eyebrow && (
              <p className={`mb-1.5 md:mb-3 flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ${text.eyebrow}`}>
                <span aria-hidden="true" className="h-3 w-1 rounded-full bg-[#F9D20F]" />
                {eyebrow}
              </p>
            )}
            <h2 className={`text-xl md:text-5xl font-black uppercase tracking-tight leading-[0.95] ${text.title}`}>
              {title}
            </h2>
            {body && (
              <p className={`mt-4 hidden max-w-sm text-sm leading-relaxed lg:block ${text.body}`}>
                {body}
              </p>
            )}
          </div>
        </div>

        {/* Pulled up over the scene's empty floor. The overlap is smaller at md,
            where the scene is only ~240px tall, so the cards stop short of the
            products standing in it (the crops keep ~90 rows of floor). */}
        <div className="relative -mt-4 px-4 md:-mt-8 md:px-6 lg:-mt-14">
          <ScrollRow>
            {products.map((product) => (
              <div
                key={product.id}
                className="snap-start shrink-0 w-[45%] sm:w-[240px] md:w-[260px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </ScrollRow>
        </div>

        <div className="px-4 pt-5 pb-8 md:px-0 md:pt-6 md:pb-12">
          {/* Several sections share the "View All" wording; the title tells
              them apart for a screen reader's links list (as SectionStrip). */}
          <Link
            href={href}
            aria-label={`${ctaLabel}: ${title}`}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white bg-white/90 px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#0B0F14] shadow-card transition-colors hover:bg-white md:mx-auto md:w-auto md:max-w-xs"
          >
            {ctaLabel} <span aria-hidden="true" className="rtl:rotate-180">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
