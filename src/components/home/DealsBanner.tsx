import { Fragment } from "react";
import Link from "@/components/LocaleLink";

/**
 * The animated "Today's Deals" strip, ported from the design handoff package.
 *
 * Stands in for the usual SectionHeading + CTA row on the deals section, so the
 * page does not announce "Today's Deals / Shop Deals" twice. Everything moves on
 * `transform` and `opacity` only — the props, the sparkles and the gloss sweep
 * are all compositor work, which is the constraint the rest of this file's
 * animations were rewritten to meet.
 *
 * The artwork is CSS, not 3D: gradients and layered shadows that read as solid
 * objects. The handoff spec calls for replacing it with a Lottie composition
 * later; the star, tag and dumbbell each occupy their own layer here so a real
 * asset can drop into the same positions.
 */
export default function DealsBanner({
  title,
  eyebrow,
  ctaLabel,
  href,
}: {
  title: string;
  eyebrow: string;
  ctaLabel: string;
  href: string;
}) {
  // The wordmark animates per word with an offset phase, so the heading is split
  // on whitespace rather than hard-coded — "Today's Deals" and "عروض اليوم" are
  // both two words, but nothing here depends on that.
  const words = title.split(/\s+/).filter(Boolean);

  return (
    <div className="jnk-strip mb-8">
      <div className="jnk-hill jnk-hill--back" aria-hidden="true" />
      <div className="jnk-hill" aria-hidden="true" />

      <div className="jnk-row">
        <div className="jnk-art">
          <div className="jnk-star" aria-hidden="true">
            <i />
            <i />
          </div>

          <h2 className="jnk-word">
            <span className="jnk-shine" aria-hidden="true">
              <i />
            </span>
            {words.map((word, i) => (
              <Fragment key={`${word}-${i}`}>
                {/* A real space between the spans, or the heading's text
                    content reads "Today'sDeals" to a crawler and a screen
                    reader. Whitespace-only nodes between flex items are
                    dropped from layout, so the visual gap is still the CSS. */}
                {i > 0 ? " " : null}
                <span>{word}</span>
              </Fragment>
            ))}
          </h2>

          <div className="jnk-tag" aria-hidden="true">
            <div className="body" />
            <div className="hole" />
            <div className="pct">%</div>
          </div>

          <div className="jnk-bell" aria-hidden="true">
            <div className="bar" />
            <div className="plate l" />
            <div className="plate r" />
          </div>
        </div>

        <div className="jnk-cta">
          <span className="jnk-eyebrow">{eyebrow}</span>
          <Link
            href={href}
            aria-label={`${ctaLabel}: ${title}`}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#F9D20F] px-3.5 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm font-bold uppercase tracking-wide text-[#0B0F14] shadow-card hover:bg-[#E7BF00] hover:shadow-card-hover transition-all"
          >
            {ctaLabel}{" "}
            <span aria-hidden="true" className="rtl:rotate-180">
              →
            </span>
          </Link>
        </div>
      </div>

      <div className="jnk-sparkles" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
