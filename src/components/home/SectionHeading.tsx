import type { ReactNode } from "react";

/**
 * Section title with a small brand-yellow accent bar. Keeps the heading
 * left-aligned with the container (no horizontal shift) and adds only a few
 * pixels of height below the text.
 *
 * Optional `eyebrow` renders a small label above the heading. It uses deep
 * navy text (not brand yellow) so it stays legible on light backgrounds —
 * the yellow is carried by a short leading bar, keeping the brand accent
 * without failing contrast.
 */
export default function SectionHeading({
  children,
  eyebrow,
  className = "",
}: {
  children: ReactNode;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow && (
        <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#082D4C]">
          <span
            aria-hidden="true"
            className="h-3 w-1 rounded-full bg-[#F9D20F]"
          />
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight">
        {children}
      </h2>
      <span
        aria-hidden="true"
        className="mt-3 block h-1 w-10 rounded-full bg-gradient-to-r from-[#F9D20F] to-[#F9D20F]/30"
      />
    </div>
  );
}
