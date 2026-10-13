import Link from "@/components/LocaleLink";
import { Kandil } from "@/components/DiwaliToran";
import DiwaliEntrance from "@/components/home/DiwaliEntrance";
import { DIWALI_CSS } from "@/lib/seasonal";

/**
 * The Diwali greeting band on the homepage, shown while the festival window is
 * open (lib/seasonal.ts — the page gates it).
 *
 * Built the same way as the Today's Deals and Muscle Rulz strips: a server
 * component, art in inline SVG and CSS, and every keyframe in the `.dwl-*` block
 * of globals.css moving only `transform` and `opacity`. The only client code is
 * DiwaliEntrance, which starts the entrance choreography once the band scrolls
 * into view. No gloss sweep on the wordmark — over a night sky a white sweep
 * reads as a light beam across the band rather than a glint on the letters, so
 * the title is lit in gold over a pulsing glow instead. The glow belongs to the
 * copy column, not the heading: the gold is the heading's own background
 * clipped to its glyphs, and anything inside the heading paints over that.
 *
 * Where an element needs both an entrance and a loop, it is two nested layers
 * (lantern / swing, fire / flame): both animate `transform`, and one element
 * can only run one animation per property.
 *
 * The SVGs use solid fills only. Gradients need ids, and an id that resolves
 * into a copy hidden at a breakpoint paints nothing.
 */

const DIYAS = 5;

// Rangoli layers, generated rather than hand-written: each ring is one shape
// repeated around the centre.
const ring = (count: number, offset = 0) =>
  Array.from({ length: count }, (_, i) => (360 / count) * i + offset);

/**
 * Outer and inner halves of the rangoli, turned in opposite directions. The
 * spans, not the svgs, carry the motion: Chrome won't composite the individual
 * `scale` property on an SVG element (compositeFailed:
 * SVGTargetHasIndependentTransformProperty, which Lighthouse's audit filters
 * out), so the inner half's breathing ran a main-thread frame every frame.
 */
function Rangoli() {
  return (
    <>
      <span className="dwl-rangoli-outer">
        <svg viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
          <circle r="98" fill="none" stroke="#F9D20F" strokeWidth="1" opacity="0.35" />
          {ring(16).map((a) => (
            <path
              key={`o${a}`}
              d="M0-96C10-82 10-68 0-58-10-68-10-82 0-96z"
              fill="#D6247A"
              transform={`rotate(${a})`}
            />
          ))}
          {ring(16, 11.25).map((a) => (
            <circle key={`d${a}`} cy="-74" r="3" fill="#F9D20F" transform={`rotate(${a})`} />
          ))}
          <circle r="56" fill="none" stroke="#F9D20F" strokeWidth="1.5" opacity="0.7" />
        </svg>
      </span>
      <span className="dwl-rangoli-inner">
        <svg viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
          {ring(8).map((a) => (
            <path
              key={`m${a}`}
              d="M0-52C16-40 16-22 0-14-16-22-16-40 0-52z"
              fill="#FF8A00"
              transform={`rotate(${a})`}
            />
          ))}
          {ring(8, 22.5).map((a) => (
            <path
              key={`t${a}`}
              d="M0-44C9-36 9-26 0-20-9-26-9-36 0-44z"
              fill="#17A398"
              transform={`rotate(${a})`}
            />
          ))}
          <circle r="15" fill="#F9D20F" />
          <circle r="8" fill="#D6247A" />
          <circle r="3.5" fill="#FFF3C4" />
        </svg>
      </span>
    </>
  );
}

function Diya() {
  return (
    <span className="dwl-diya">
      <span className="dwl-fire">
        <span className="dwl-halo" />
        <span className="dwl-flame">
          <i />
        </span>
      </span>
      <svg viewBox="0 0 72 34" aria-hidden="true" focusable="false">
        <path d="M30 29h12l2.5 4.5h-17z" fill="#7A2A12" />
        <path d="M1 8c10 4 60 4 70 0-3 14-17 22-35 22S4 22 1 8z" fill="#C8552A" />
        <path d="M6 13c12 3 48 3 60 0-2 4-5 7-9 9-14 2-28 2-42 0-4-2-7-5-9-9z" fill="#E2773F" opacity="0.55" />
        <ellipse cx="36" cy="9.5" rx="27" ry="3.4" fill="#5A1E0C" stroke="#F9D20F" strokeWidth="1.2" />
        {[16, 26, 36, 46, 56].map((cx) => (
          <circle key={cx} cx={cx} cy="20" r="1.7" fill="#FFD45C" />
        ))}
      </svg>
    </span>
  );
}

function Lantern({ variant }: { variant: "a" | "b" }) {
  return (
    <span className={`dwl-kandil dwl-kandil--${variant}`} aria-hidden="true">
      <span className="dwl-kandil-swing">
        <span className="dwl-kandil-string" />
        <span className="dwl-kandil-glow" />
        <Kandil />
      </span>
    </span>
  );
}

/** A rocket trail rising into a ring of sparks. */
function Firework({ variant }: { variant: "a" | "b" | "c" }) {
  return (
    <span className={`dwl-firework dwl-firework--${variant}`}>
      <span className="dwl-rocket" />
      <span className="dwl-burst">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} />
        ))}
      </span>
    </span>
  );
}

export default function DiwaliBanner({
  eyebrow,
  title,
  body,
  ctaLabel,
  href,
}: {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
}) {
  return (
    <section className="dwl-band" aria-labelledby="dwl-title" data-dwl-enter="wait">
      {/* Hoisted into <head> and deduped by React; see DIWALI_CSS. */}
      <link rel="stylesheet" href={DIWALI_CSS} precedence="default" />
      <DiwaliEntrance />

      <div className="dwl-bokeh" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} />
        ))}
      </div>

      <div className="dwl-stars" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} />
        ))}
      </div>

      <div className="dwl-fireworks" aria-hidden="true">
        <Firework variant="a" />
        <Firework variant="b" />
        <Firework variant="c" />
      </div>

      <div className="dwl-rangoli" aria-hidden="true">
        <Rangoli />
      </div>

      <Lantern variant="a" />
      <Lantern variant="b" />

      <div className="dwl-diyas" aria-hidden="true">
        {Array.from({ length: DIYAS }, (_, i) => (
          <Diya key={i} />
        ))}
      </div>

      <div className="dwl-embers" aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <i key={i} />
        ))}
      </div>

      <div className="dwl-copy">
        <span className="dwl-eyebrow">{eyebrow}</span>
        {/* The sparkles are the heading's siblings, not its children. The gold
            is the heading's background clipped to its glyphs under a blur
            filter — an expensive paint — and any animated descendant forces
            that whole paint again every frame. Measured inside the heading,
            three sparkles took a throttled phone from ~45 fps to ~15. */}
        <div className="dwl-title-wrap">
          <h2 id="dwl-title" className="dwl-title">
            {title}
          </h2>
          <span className="dwl-spark dwl-spark--a" aria-hidden="true" />
          <span className="dwl-spark dwl-spark--b" aria-hidden="true" />
          <span className="dwl-spark dwl-spark--c" aria-hidden="true" />
        </div>
        <p className="dwl-body">{body}</p>
        <Link
          href={href}
          aria-label={`${ctaLabel}: ${title}`}
          className="dwl-cta mt-1 shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#F9D20F] px-3.5 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm font-bold uppercase tracking-wide text-[#0B0F14] shadow-card hover:bg-[#E7BF00] hover:shadow-card-hover transition-all"
        >
          {ctaLabel}{" "}
          <span aria-hidden="true" className="rtl:rotate-180">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
