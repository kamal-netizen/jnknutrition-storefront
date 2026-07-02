import Link from "next/link";

export type Brand = {
  name: string;
  handle: string;
};

export const BRANDS: Brand[] = [
  { name: "REDCON1", handle: "redcon1" },
  { name: "OPTIMUM NUTRITION", handle: "optimum-nutrition" },
  { name: "MUSCLETECH", handle: "muscletech" },
  { name: "BSN", handle: "bsn-1" },
  { name: "GAT SPORT", handle: "gat-sport" },
  { name: "MUSCLEPHARM", handle: "musclepharm" },
  { name: "UNIVERSAL NUTRITION", handle: "universal-nutrition" },
  { name: "ULTIMATE NUTRITION", handle: "ultimate-nutrition" },
  { name: "NUTREX RESEARCH", handle: "nutrex-research" },
  { name: "RULEONE", handle: "ruleone" },
  { name: "CELLUCOR", handle: "cellucor-1" },
  { name: "GASPARI NUTRITION", handle: "gaspari-nutrition" },
];

export default function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/collections/${brand.handle}`}
      className="group flex h-24 md:h-28 min-w-[160px] md:min-w-[190px] items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] px-6 text-center hover:border-[#F9D20F] hover:bg-[#EEF4FF] transition-colors"
    >
      <span className="text-sm md:text-base font-black uppercase tracking-tight text-[#64748B] group-hover:text-[#0B0F14] leading-tight">
        {brand.name}
      </span>
    </Link>
  );
}
