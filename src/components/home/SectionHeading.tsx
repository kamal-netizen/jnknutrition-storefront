import type { ReactNode } from "react";

/**
 * Section title with a small brand-yellow accent bar. Keeps the heading
 * left-aligned with the container (no horizontal shift) and adds only a few
 * pixels of height below the text.
 */
export default function SectionHeading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
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
