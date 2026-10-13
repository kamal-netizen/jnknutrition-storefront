/**
 * A marigold toran with hanging lanterns and a chasing string of fairy lights,
 * kept deliberately light because it renders on every page: the first version
 * animated every bulb and lantern glow individually — on a phone, 20 running
 * animations and 23 extra compositor layers; this one settles at 8 and 5.
 *
 * strung under the site header while the Diwali window is open (see
 * lib/seasonal.ts — the layout gates it).
 *
 * Purely decorative: hidden from assistive tech and from the pointer. It sits in
 * normal flow under the sticky header with its height fixed in the server HTML,
 * so it scrolls away with the page instead of hanging over content, and it
 * costs no layout shift. Server-rendered SVG and CSS only — the entrance (the
 * garland drops in, the lanterns fall into place from the centre outward) plays
 * once per page load from CSS alone, since this is always in the first
 * viewport; the layout persists across client navigations, so it does not
 * replay on every click. Styled by the `.dwl-*` block in globals.css.
 */

/** Width of one swag of the garland, in SVG user units (= CSS px). */
const SWAG = 88;

const LAMPS = 8;
const BULB_PHASES = 4;

// Beads along one swag, hung on a parabola from cord to cord. Computed once at
// module load and rounded so the server markup is stable between renders.
const BEADS = Array.from({ length: 12 }, (_, i) => {
  const x = 4 + (i * (SWAG - 8)) / 11;
  const t = (x - SWAG / 2) / (SWAG / 2);
  return {
    x: Math.round(x * 100) / 100,
    y: Math.round((3 + 12 * (1 - t * t)) * 100) / 100,
    fill: i % 2 ? "#FFC21A" : "#FF8A00",
  };
});

/**
 * One kandil (Diwali sky lantern). Solid fills only, no gradients: a gradient
 * needs an id, the same lantern renders many times on a page, and an id that
 * resolves into a `display: none` copy (phones hide some) paints nothing.
 */
export function Kandil({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 44"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9 0h6l2 5H7z" fill="#F9D20F" />
      <path
        d="M7 5h10l5 9v10l-5 9H7l-5-9V14z"
        fill="#D6247A"
        stroke="#F9D20F"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M2 16.5h20v5H2z" fill="#FF8A00" />
      <ellipse cx="12" cy="19" rx="5" ry="8" fill="#FFE58A" opacity="0.5" />
      <path d="M12 5v28" stroke="#F9D20F" strokeWidth="1" opacity="0.8" />
      <path d="M8 33h8l-1.5 3h-5z" fill="#F9D20F" />
      <path
        d="M10 36v6M12 36v7.5M14 36v6"
        stroke="#F9D20F"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A marigold head with a mango leaf beneath it, centred on `x`. */
function Knot({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M0 6c3.2 3 3.2 8.5 0 12.5C-3.2 14.5-3.2 9 0 6z" fill="#2E8B3E" />
      <circle cx="0" cy="3.5" r="4.5" fill="#FF7A00" />
      <circle cx="0" cy="3.5" r="2" fill="#FFD23F" />
    </g>
  );
}

export default function DiwaliToran() {
  return (
    <div className="dwl-toran" aria-hidden="true">
      <svg className="dwl-toran-garland" width="100%" height="22" focusable="false">
        <defs>
          <pattern
            id="dwl-toran-swag"
            width={SWAG}
            height="22"
            patternUnits="userSpaceOnUse"
          >
            {BEADS.map((b) => (
              <circle key={b.x} cx={b.x} cy={b.y} r="3.2" fill={b.fill} />
            ))}
            {/* Drawn at both edges so the halves meet across each tile seam. */}
            <Knot x={0} />
            <Knot x={SWAG} />
          </pattern>
        </defs>
        <rect width="100%" height="1.5" y="1.5" fill="#C98A1B" />
        <rect width="100%" height="22" fill="url(#dwl-toran-swag)" />
      </svg>

      {/* Four strips, not one element per bulb: each strip draws every fourth
          bulb as a repeating gradient and pulses as a whole, offset a quarter
          beat from the next, which reads as the same chase. Four animated
          layers instead of two dozen — this renders on every page, and each
          layer is set up in the first frame. */}
      <span className="dwl-toran-bulbs">
        {Array.from({ length: BULB_PHASES }, (_, i) => (
          <i key={i} />
        ))}
      </span>

      {/* Two layers per lamp: the outer one drops it into place on load, the
          inner one swings it. One element can't run both, as both are
          `transform`. */}
      {Array.from({ length: LAMPS }, (_, i) => (
        <span key={i} className="dwl-toran-lamp">
          <span className="dwl-toran-swing">
            <span className="dwl-toran-string" />
            <span className="dwl-toran-glow" />
            <Kandil />
          </span>
        </span>
      ))}
    </div>
  );
}
