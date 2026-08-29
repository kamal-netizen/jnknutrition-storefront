import { Archivo } from "next/font/google";
import Link from "@/components/LocaleLink";

/**
 * The animated Muscle Rulz brand strip, ported from the design handoff package
 * ("Option C").
 *
 * Stands in for the usual SectionHeading + CTA row on the Muscle Rulz section,
 * so the page does not announce the brand name and a "View All" link twice.
 * Everything moves on `transform` and `opacity` only — the megaphone shout, the
 * bolt flash, the bobbing weights and the speed lines are all compositor work,
 * which is the constraint the rest of this page's animations were written to
 * meet.
 *
 * The artwork is inline SVG, not 3D: flat fills with a heavy ink outline, at a
 * deliberate weight hierarchy — 7px on the strip silhouette, 5–6px on the
 * props, 3–4px on the small chips. Keep that hierarchy if anything is resized.
 * The strip has no fixed width; it fills its container.
 */

// Declared here rather than in app/[lang]/layout.tsx: this is the only surface
// that uses Archivo, so scoping it to the component means the face is preloaded
// on routes that render the banner and nowhere else. The handoff shipped a
// Google Fonts <link>; next/font self-hosts the same family, which keeps it off
// a third-party origin and out of the render-blocking path.
//
// No `weight`: Archivo is a variable font, so this ships one file spanning the
// whole range instead of a separate static cut per weight. The strip asks for
// three of them (900 headline, 800 offer chip, 700 CTA).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export default function MuscleRulzBanner({
  title,
  highlight,
  offer,
  ctaLabel,
  href,
}: {
  /** Leading words of the headline, e.g. "Shop Muscle". */
  title: string;
  /** Trailing word carrying the yellow accent, e.g. "Rulz". */
  highlight: string;
  /** Offer chip copy, e.g. "Up to 52% Off". */
  offer: string;
  ctaLabel: string;
  href: string;
}) {
  return (
    <div className={`${archivo.variable} mrz-wrap mb-8`}>
      <span className="mrz-sketch mrz-sk-a" aria-hidden="true" />
      <span className="mrz-sketch mrz-sk-b" aria-hidden="true" />
      <span className="mrz-sketch mrz-sk-c" aria-hidden="true" />

      <div className="mrz-strip">
        {/* Single 8-point path in a fixed viewBox with preserveAspectRatio
            "none", so the silhouette stretches to any width while
            non-scaling-stroke holds the outline at an even 7px. To change the
            shape, edit only the `d` — nothing else depends on it. */}
        <svg
          className="mrz-bg"
          viewBox="0 0 1200 182"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M10 34 L1122 8 L1190 52 L1168 146 L1096 174 L74 168 L18 140 L42 88 Z"
            fill="#2ab5ee"
            stroke="#0e2230"
            strokeWidth="7"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Megaphone: handle, cone, mouth, body, sound arc — back to front. */}
        <svg
          className="mrz-mega"
          aria-hidden="true"
          width="200"
          height="152"
          viewBox="0 0 200 152"
        >
          <g
            stroke="#0e2230"
            strokeWidth="6"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <path
              d="M124 100l10 32c2 7-3 13-10 13h-7c-6 0-11-5-11-11l2-34z"
              fill="#ffd400"
            />
            <path d="M44 26l74 30v40L44 126z" fill="#2ab5ee" />
            <ellipse cx="44" cy="76" rx="16" ry="50" fill="#ffd400" />
            <rect x="112" y="50" width="52" height="52" rx="14" fill="#fff" />
            <path d="M172 54c11 8 11 40 0 46" fill="none" strokeWidth="5" />
          </g>
        </svg>

        <div className="mrz-text">
          <h2 className="mrz-title">
            {title} <span className="mrz-lime">{highlight}</span>
          </h2>
          <p className="mrz-sub">
            <span>{offer}</span>
          </p>
        </div>

        <svg
          className="mrz-bolt"
          aria-hidden="true"
          width="44"
          height="64"
          viewBox="0 0 52 76"
        >
          <path
            d="M30 3 8 41h14L18 73l26-42H29z"
            fill="#ffd400"
            stroke="#0e2230"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </svg>

        <div className="mrz-speed" aria-hidden="true">
          <i />
          <i />
        </div>

        {/* A real flex item rather than absolute artwork, so the weights
            reserve their own space instead of floating over the headline. */}
        <div className="mrz-gym" aria-hidden="true">
          <svg
            className="mrz-float"
            width="180"
            height="78"
            viewBox="0 0 230 96"
          >
            <g
              stroke="#0e2230"
              strokeWidth="5"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <rect x="86" y="36" width="58" height="24" rx="6" fill="#fff" />
              <rect x="60" y="20" width="26" height="56" rx="7" fill="#ffd400" />
              <rect x="144" y="20" width="26" height="56" rx="7" fill="#ffd400" />
              <rect x="30" y="10" width="30" height="76" rx="9" fill="#0e2230" />
              <rect x="170" y="10" width="30" height="76" rx="9" fill="#0e2230" />
              <rect x="14" y="28" width="18" height="40" rx="6" fill="#fff" />
              <rect x="198" y="28" width="18" height="40" rx="6" fill="#fff" />
            </g>
          </svg>

          <svg
            className="mrz-float mrz-float-b"
            width="86"
            height="96"
            viewBox="0 0 118 132"
          >
            <g stroke="#0e2230" strokeWidth="5" strokeLinejoin="round">
              <path
                d="M33 50V38c0-14 11-23 26-23s26 9 26 23v12"
                fill="none"
                strokeWidth="11"
                strokeLinecap="round"
              />
              <rect x="40" y="46" width="38" height="12" rx="4" fill="#0e2230" />
              <circle cx="59" cy="90" r="38" fill="#fff" />
              <path
                d="M42 90h34"
                stroke="#0e2230"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>

        {/*
          Several strips on this page share the same CTA wording while pointing
          at different collections, which reads as one repeated link to a screen
          reader running a links list. The brand name disambiguates them without
          changing the visible label.
        */}
        <Link
          className="mrz-cta"
          href={href}
          aria-label={`${ctaLabel}: ${title} ${highlight}`}
        >
          {ctaLabel}{" "}
          <span aria-hidden="true" className="rtl:rotate-180">
            →
          </span>
        </Link>
      </div>

      <span className="mrz-dot mrz-dot-a" aria-hidden="true" />
      <span className="mrz-dot mrz-dot-b" aria-hidden="true" />
    </div>
  );
}
