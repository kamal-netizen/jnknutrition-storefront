import NationalDayEntrance from "@/components/home/NationalDayEntrance";
import { NATIONAL_DAY_CSS } from "@/lib/seasonal";

/**
 * The National Day greeting band on the homepage, shown while the window is
 * open (lib/seasonal.ts — the page gates it). A greeting only: no offer, no
 * button.
 *
 * Built the way the Diwali band was: a server component, art in HTML and CSS,
 * and every keyframe in the National Day stylesheet moving only `transform`
 * and `opacity`. The only client code is NationalDayEntrance, which starts the
 * entrance once the band scrolls into view and pauses the loops while it is
 * off screen.
 *
 * The flag on its pole is physical, not mirrored for Arabic: the red band
 * belongs against the pole whichever way the page reads. Everything else uses
 * logical properties, so /ar mirrors without its own rules.
 */

/** A rocket trail rising into a ring of sparks. */
function Firework({ variant }: { variant: "a" | "b" | "c" }) {
  return (
    <span className={`ndy-firework ndy-firework--${variant}`}>
      <span className="ndy-rocket" />
      <span className="ndy-burst">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} />
        ))}
      </span>
    </span>
  );
}

export default function NationalDayBanner({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section
      className="ndy-band"
      aria-labelledby="ndy-title"
      data-ndy-enter="wait"
      // NationalDayEntrance's inline script may flip the attributes before
      // hydration.
      suppressHydrationWarning
    >
      {/* Hoisted into <head> and deduped by React; see NATIONAL_DAY_CSS. */}
      <link rel="stylesheet" href={NATIONAL_DAY_CSS} precedence="default" />
      <NationalDayEntrance />

      <div className="ndy-stars" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <i key={i} />
        ))}
      </div>

      <div className="ndy-fireworks" aria-hidden="true">
        <Firework variant="a" />
        <Firework variant="b" />
        <Firework variant="c" />
      </div>

      {/* The anniversary, drawn as outlined numerals behind the art. */}
      <span className="ndy-number" aria-hidden="true">
        55
      </span>

      <div className="ndy-flag" aria-hidden="true">
        <span className="ndy-pole" />
        <span className="ndy-cloth">
          <span className="ndy-cloth-sheen" />
        </span>
      </div>

      <div className="ndy-copy">
        <span className="ndy-eyebrow">{eyebrow}</span>
        <h2 id="ndy-title" className="ndy-title">
          {title}
        </h2>
        <span className="ndy-ribbon" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <p className="ndy-body">{body}</p>
      </div>
    </section>
  );
}
