/**
 * A string of little UAE flags, strung under the site header
 * while the National Day window is open (see lib/seasonal.ts — the layout gates
 * it). Built on the Diwali toran's lessons, since this too renders on every
 * page: the art is three tiled SVG patterns rather than one element per
 * flag, and only two layers move.
 *
 * Alternate flags are split across those two layers, and each layer flutters
 * as a whole, half a beat apart, which reads as each flag catching the wind on
 * its own. The motion
 * runs on the wrapping spans, not the svgs: Chrome won't composite a transform
 * animation on an SVG element.
 *
 * Purely decorative: hidden from assistive tech and from the pointer. It sits
 * in normal flow under the sticky header with its height fixed in the server
 * HTML, so it scrolls away with the page and costs no layout shift. Server
 * markup and CSS only. Styled by the `.ndy-bunting*` rules in the National Day
 * stylesheet.
 */

import { NATIONAL_DAY_CSS } from "@/lib/seasonal";

/** Width of one swag of the cord, in SVG user units (= CSS px). */
const SWAG = 96;
const FLAG_COUNT = 6;
/** Each flag hangs portrait, in the real 1:2 proportion. */
const FLAG_W = 9;
const FLAG_H = 18;

const sag = (x: number) => {
  const t = (x - SWAG / 2) / (SWAG / 2);
  return 2.5 + 5 * (1 - t * t);
};
const r = (n: number) => Math.round(n * 100) / 100;

// Each flag hangs from the cord by its top edge, tilted to the cord's slope at
// that point. Computed once at module load and rounded so the server markup is
// stable between renders.
const FLAGS = Array.from({ length: FLAG_COUNT }, (_, i) => {
  const cx = (SWAG / FLAG_COUNT) * (i + 0.5);
  const slope = (sag(cx + 1) - sag(cx - 1)) / 2;
  return {
    transform: `translate(${r(cx)} ${r(sag(cx))}) rotate(${r((Math.atan(slope) * 180) / Math.PI)})`,
    layer: i % 2 ? "b" : "a",
  };
});

/**
 * One UAE flag hung vertically, drawn from its top-centre so it hangs on the
 * cord: the red band runs across the top, and the stripes run down with green
 * on the viewer's left (the top stripe goes left when a flag is hung this way).
 */
function MiniFlag({ transform }: { transform: string }) {
  const x = -FLAG_W / 2;
  const stripe = FLAG_W / 3;
  const hoist = FLAG_H / 4;
  return (
    <g transform={transform}>
      <rect x={x} y="0" width={stripe} height={FLAG_H} fill="#00843D" />
      <rect x={x + stripe} y="0" width={stripe} height={FLAG_H} fill="#FFFFFF" />
      <rect x={x + stripe * 2} y="0" width={stripe} height={FLAG_H} fill="#0B0F14" />
      <rect x={x} y="0" width={FLAG_W} height={hoist} fill="#EF3340" />
      {/* Hairline edge, so the white stripe reads on a white page. */}
      <rect
        x={x}
        y="0"
        width={FLAG_W}
        height={FLAG_H}
        fill="none"
        stroke="rgba(11,15,20,0.18)"
        strokeWidth="0.6"
      />
    </g>
  );
}

const CORD = Array.from({ length: 13 }, (_, i) => {
  const x = (SWAG / 12) * i;
  return `${i ? "L" : "M"}${r(x)} ${r(sag(x))}`;
}).join("");

function Layer({ layer }: { layer: "a" | "b" }) {
  const id = `ndy-bunting-${layer}`;
  return (
    <span className={`ndy-bunting-flags ndy-bunting-flags--${layer}`}>
      <svg width="100%" height="28" focusable="false">
        <defs>
          <pattern id={id} width={SWAG} height="28" patternUnits="userSpaceOnUse">
            {FLAGS.filter((f) => f.layer === layer).map((f) => (
              <MiniFlag key={f.transform} transform={f.transform} />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="28" fill={`url(#${id})`} />
      </svg>
    </span>
  );
}

export default function NationalDayBunting() {
  return (
    <div className="ndy-bunting" aria-hidden="true">
      {/* Hoisted into <head> and deduped by React; see NATIONAL_DAY_CSS. */}
      <link rel="stylesheet" href={NATIONAL_DAY_CSS} precedence="default" />
      <Layer layer="a" />
      <Layer layer="b" />
      <svg className="ndy-bunting-cord" width="100%" height="12" focusable="false">
        <defs>
          <pattern id="ndy-bunting-cord" width={SWAG} height="12" patternUnits="userSpaceOnUse">
            <path d={CORD} fill="none" stroke="#8A6A2B" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="12" fill="url(#ndy-bunting-cord)" />
      </svg>
    </div>
  );
}
