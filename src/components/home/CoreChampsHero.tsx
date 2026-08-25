import Image from "next/image";
import { Anton } from "next/font/google";
import Link from "@/components/LocaleLink";

// Anton is the display face the banner was designed around. Scoped to this
// component, so it is only fetched on pages that render the hero.
const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap" });

/** One 16.2s loop shared by six products, each offset by this much. */
const STEP_SECONDS = 2.7;

type Item = {
  name: string;
  sub: string;
  src: string;
  alt: string;
};

// Source art is the 3000x3000 packshot set, resized to 1000px and re-encoded as
// alpha WebP (~30-175 KB each). Order sets the hand-off sequence.
const ITEMS: Item[] = [
  {
    name: "WHEY",
    sub: "100% Whey Protein · 5 LBS",
    src: "/banners/core-champs/whey-rich-chocolate.webp",
    alt: "Core Champs WHEY 100% Whey Protein, 5 LBS rich chocolate",
  },
  {
    name: "ISOLATE",
    sub: "100% Whey Protein Isolate",
    src: "/banners/core-champs/isolate-strawberry.webp",
    alt: "Core Champs ISOLATE 100% Whey Protein Isolate, strawberry",
  },
  {
    name: "MASS",
    sub: "High Calorie Mass Gainer · 15 LBS",
    src: "/banners/core-champs/mass-gainer-chocolate.webp",
    alt: "Core Champs MASS High Calorie Mass Gainer, 15 LBS chocolate",
  },
  {
    name: "RDX CAF+",
    sub: "Pre-Workout · 400mg Caffeine",
    src: "/banners/core-champs/rdx-fruit-punch.webp",
    alt: "Core Champs RDX CAF+ pre-workout, fruit punch",
  },
  {
    name: "MULTIVITAMIN",
    sub: "Advance Daily Formula · 90 Tablets",
    src: "/banners/core-champs/multivitamin.webp",
    alt: "Core Champs Multivitamin Advance Daily Formula, 90 tablets",
  },
  {
    name: "OMEGA-3",
    sub: "1000mg Fish Oil · 100 Softgels",
    src: "/banners/core-champs/omega-3.webp",
    alt: "Core Champs Omega-3 1000mg Fish Oil, 100 softgels",
  },
];

type Props = {
  /** "Performance" — first headline line. */
  headlineTop: string;
  /** "At Its Core" — second line, carries the metal sweep. */
  headlineBottom: string;
  /** "Bred To Be a Champion". */
  tagline: string;
  /** "Up to 30% Off". */
  offer: string;
  /** "Free shipping on orders over" — the amount is appended separately. */
  shippingLead: string;
  /** "AED 149". */
  shippingAmount: string;
  /** "100% Genuine". */
  genuine: string;
  /** Accessible label for the link wrapping the whole band. */
  ctaLabel: string;
};

/**
 * Animated Core Champs brand band. Pure CSS motion (see the "Core Champs hero"
 * section of globals.css) so this stays a server component with no client JS.
 *
 * Laid out fluidly rather than as the fixed 1920x700 artboard it was designed
 * on: the type column stacks above the product stage below `lg`, which is the
 * portrait treatment the original spec left open.
 *
 * `dir="ltr"` is pinned because the composition is built around Latin display
 * type and a right-hand product stage; mirroring it on /ar would put the
 * packshot behind the headline. Same reasoning as HeroBanner.
 */
export default function CoreChampsHero({
  headlineTop,
  headlineBottom,
  tagline,
  offer,
  shippingLead,
  shippingAmount,
  genuine,
  ctaLabel,
}: Props) {
  return (
    <section
      dir="ltr"
      aria-label="Core Champs"
      className="relative isolate overflow-hidden bg-[#050506] [background:radial-gradient(110%_140%_at_74%_48%,#23262b_0%,#14161a_34%,#0a0b0d_66%,#050506_100%)]"
    >
      {/* 80px grid wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[length:80px_80px] [background-image:linear-gradient(rgba(255,255,255,.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.028)_1px,transparent_1px)]"
      />

      <Link href="/collections/core-champs" aria-label={ctaLabel} className="group block">
        {/* Two columns at every width. Phones keep the side-by-side composition
            but drop the supporting lines (tagline, shipping, guarantee,
            product sub-line) so the narrow column holds a headline, an offer
            and a packshot rather than seven stacked things. */}
        <div className="relative mx-auto grid max-w-7xl grid-cols-[1fr_44%] items-center gap-4 px-4 py-9 sm:gap-6 sm:px-6 sm:py-14 lg:min-h-[620px] lg:grid-cols-[1fr_minmax(0,520px)] lg:gap-8 lg:px-8 lg:py-16">
          {/* ─── Type column ─────────────────────────────────── */}
          <div className="relative z-10 flex flex-col gap-2.5 text-start sm:gap-5">
            <div className="flex items-center gap-2 sm:gap-3.5">
              <span
                aria-hidden="true"
                className="hidden h-[3px] w-11 bg-[linear-gradient(90deg,#ffffff,#8b9099)] sm:block"
              />
              <span className="text-[clamp(0.5625rem,1.5vw,1.375rem)] font-extrabold uppercase tracking-[0.22em] text-[#b9bfc8] sm:tracking-[0.38em]">
                Core Champs
              </span>
            </div>

            <h2 className={`${anton.className} uppercase leading-[0.92]`}>
              <span className="block text-[clamp(1.625rem,5.6vw,6.75rem)] text-white">
                {headlineTop}
              </span>
              {/* The sweep band is clipped to this inline-block wrapper. */}
              <span className="relative mt-1 inline-block overflow-hidden text-[clamp(1.625rem,5.6vw,6.75rem)] leading-[1.04]">
                <span className="bg-[linear-gradient(180deg,#ffffff_0%,#e4e8ee_32%,#9aa0a9_60%,#f2f4f7_80%,#82888f_100%)] bg-clip-text text-transparent">
                  {headlineBottom}
                </span>
                <span
                  aria-hidden="true"
                  className="cc-sweep absolute inset-y-0 left-0 w-[120px] bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,.45)_50%,rgba(255,255,255,0)_100%)]"
                />
              </span>
            </h2>

            <p className="hidden text-[clamp(0.875rem,1.6vw,1.4375rem)] font-semibold uppercase tracking-[0.2em] text-white/50 sm:block">
              {tagline}
            </p>

            <div className="mt-1 flex flex-col items-start gap-3 sm:mt-2 sm:gap-5 md:flex-row md:items-center md:gap-7">
              {/* nowrap keeps the pill a pill — without it the offer breaks
                  onto a second line on narrow phones and the shape collapses. */}
              <span className="-rotate-[1.2deg] whitespace-nowrap rounded-lg bg-[linear-gradient(160deg,#ffffff_0%,#dfe3e9_40%,#a7adb6_100%)] px-3 py-2 text-[clamp(0.8125rem,2.2vw,2.125rem)] font-black leading-none text-[#0a0b0d] shadow-[0_10px_24px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.9)] transition-transform duration-300 group-hover:rotate-0 group-hover:scale-[1.03] sm:rounded-[10px] sm:px-6 sm:py-3.5 sm:shadow-[0_18px_38px_rgba(0,0,0,.6),inset_0_1px_0_rgba(255,255,255,.9)]">
                {offer}
              </span>
              <span className="hidden text-[clamp(0.9375rem,1.6vw,1.4375rem)] font-bold leading-[1.32] text-white/80 sm:block">
                {shippingLead}{" "}
                <span className="font-black text-white">{shippingAmount}</span>
              </span>
            </div>

            <p className="mt-2 hidden text-[clamp(0.75rem,1.1vw,1rem)] font-bold uppercase tracking-[0.2em] text-white/40 sm:block">
              {genuine}
            </p>
          </div>

          {/* ─── Product stage ───────────────────────────────── */}
          <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
            {/* Spotlight bloom, rings and pedestal all sit behind the packshot. */}
            <div className="relative aspect-square w-full">
              <div
                aria-hidden="true"
                className="cc-flare absolute left-1/2 top-1/2 h-[115%] w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full [background:radial-gradient(circle,rgba(214,222,234,.22)_0%,rgba(180,192,208,.07)_45%,rgba(180,192,208,0)_70%)] sm:h-[150%] sm:w-[150%]"
              />
              <div
                aria-hidden="true"
                className="cc-spin absolute inset-0 rounded-full border border-white/10"
              />
              <div
                aria-hidden="true"
                className="cc-spin-reverse absolute inset-[12%] rounded-full border border-dashed border-white/[0.07]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-[2%] bottom-[-4%] h-[20%] rounded-[50%] blur-[3px] [background:radial-gradient(ellipse_at_center,rgba(226,232,240,.2)_0%,rgba(226,232,240,0)_68%)] sm:blur-[6px] lg:blur-[8px]"
              />

              {ITEMS.map((item, i) => (
                <div
                  key={item.src}
                  className="cc-cycle-img absolute inset-[8%] opacity-0"
                  style={{ animationDelay: `${i * STEP_SECONDS}s` }}
                >
                  <div className="cc-bob relative h-full w-full">
                    {/* The drop shadow is scaled per breakpoint. At the
                        desktop offsets (34px/44px) it is larger than the whole
                        packshot on a phone and detaches into a dark blob. */}
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 640px) 180px, (max-width: 1024px) 420px, 520px"
                      className="object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,.65)] sm:drop-shadow-[0_20px_28px_rgba(0,0,0,.75)] lg:drop-shadow-[0_34px_44px_rgba(0,0,0,.8)]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Name (+ sub-line above sm). Fixed height because the items are
                stacked absolutely — without it the band would collapse. */}
            <div className="relative mt-2 h-[22px] sm:mt-4 sm:h-[104px]">
              {ITEMS.map((item, i) => (
                <div
                  key={item.src}
                  className="cc-cycle-name absolute inset-x-0 top-0 text-start opacity-0"
                  style={{ animationDelay: `${i * STEP_SECONDS}s` }}
                >
                  <div
                    className={`${anton.className} truncate bg-[linear-gradient(180deg,#ffffff_0%,#dfe4ea_40%,#9aa0a9_72%,#eef1f5_100%)] bg-clip-text text-[clamp(0.9375rem,3.4vw,2.875rem)] uppercase leading-none tracking-[0.02em] text-transparent`}
                  >
                    {item.name}
                  </div>
                  <div className="mt-2.5 hidden text-[clamp(0.6875rem,1.2vw,1.0625rem)] font-bold uppercase tracking-[0.2em] text-white/45 sm:block">
                    {item.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress rail */}
            <div aria-hidden="true" className="mt-2 flex gap-1.5 sm:mt-3 sm:gap-2.5">
              {ITEMS.map((item, i) => (
                <span
                  key={item.src}
                  className="cc-cycle-tick h-[2px] w-4 rounded-sm bg-white/15 sm:h-[3px] sm:w-[46px]"
                  style={{ animationDelay: `${i * STEP_SECONDS}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>

      {/* Vignette, scaled to the band. The desktop 240px blur / 70px spread is
          larger than the whole band on a phone (~270px tall), which darkens the
          packshot instead of framing it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_10px_rgba(0,0,0,.45)] sm:shadow-[inset_0_0_150px_40px_rgba(0,0,0,.55)] lg:shadow-[inset_0_0_240px_70px_rgba(0,0,0,.6)]"
      />
    </section>
  );
}
