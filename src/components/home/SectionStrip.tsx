import Link from "next/link";
import type { Product } from "@/lib/queries/products";
import ProductCard from "@/components/ProductCard";
import ScrollRow from "@/components/home/ScrollRow";

type Props = {
  title: string;
  subtitle?: string;
  href: string;
  products: Product[];
  /** When true, renders a wrapping grid instead of a horizontal scroll strip. */
  grid?: boolean;
  className?: string;
};

export default function SectionStrip({
  title,
  subtitle,
  href,
  products,
  grid = false,
  className = "",
}: Props) {
  if (products.length === 0) return null;

  return (
    <section
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full ${className}`}
    >
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight">
            {title}
          </h2>
          {subtitle && <p className="mt-2 text-[#64748B]">{subtitle}</p>}
        </div>
        <Link
          href={href}
          className="shrink-0 text-sm font-bold text-[#F9D20F] hover:text-[#E7BF00] uppercase tracking-wide"
        >
          View All →
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
    </section>
  );
}
