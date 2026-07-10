import Link from "next/link";
import type { Product } from "@/lib/queries/products";
import ProductCard from "@/components/ProductCard";
import ScrollRow from "@/components/home/ScrollRow";
import SectionHeading from "@/components/home/SectionHeading";

/** Background treatment for the section band. */
type Tone = "default" | "muted" | "accent";

const TONE_CLASS: Record<Tone, string> = {
  default: "",
  muted: "bg-[#F5F7FA] border-y border-[#E2E8F0]",
  accent: "bg-[#EEF4FF] border-y border-[#CBD5E1]",
};

type Props = {
  title: string;
  subtitle?: string;
  /** Small label above the heading (legible navy, brand-yellow bar). */
  eyebrow?: string;
  href: string;
  products: Product[];
  /** When true, renders a wrapping grid instead of a horizontal scroll strip. */
  grid?: boolean;
  /** Background band treatment. */
  tone?: Tone;
  /** "pill" = subtle outline link (default); "button" = solid brand CTA. */
  cta?: "pill" | "button";
  /** Label for the call-to-action. Defaults to "View All". */
  ctaLabel?: string;
  className?: string;
};

export default function SectionStrip({
  title,
  subtitle,
  eyebrow,
  href,
  products,
  grid = false,
  tone = "default",
  cta = "pill",
  ctaLabel = "View All",
  className = "",
}: Props) {
  if (products.length === 0) return null;

  const inner = (
    <>
      <div
        className={`mb-8 gap-4 ${
          cta === "button"
            ? "flex flex-col sm:flex-row sm:items-end sm:justify-between"
            : "flex items-end justify-between"
        }`}
      >
        <div>
          <SectionHeading eyebrow={eyebrow}>{title}</SectionHeading>
          {subtitle && <p className="mt-3 text-[#64748B]">{subtitle}</p>}
        </div>
        <Link
          href={href}
          className={
            cta === "button"
              ? "self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#F9D20F] px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#0B0F14] shadow-card hover:bg-[#E7BF00] hover:shadow-card-hover transition-all"
              : "shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#0B0F14] hover:border-[#F9D20F] hover:bg-[#FFFBEB] transition-colors"
          }
        >
          {ctaLabel} <span aria-hidden="true">→</span>
        </Link>
      </div>

      {grid ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
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
      )}
    </>
  );

  // Toned sections span full width with an inner max-width container; the
  // default (plain) tone is itself the max-width container.
  if (tone === "default") {
    return (
      <section
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full ${className}`}
      >
        {inner}
      </section>
    );
  }

  return (
    <section className={`${TONE_CLASS[tone]} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
        {inner}
      </div>
    </section>
  );
}
