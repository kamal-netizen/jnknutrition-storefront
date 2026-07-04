import Image from "next/image";
import Link from "next/link";
import { BRAND_LOGOS } from "@/lib/brands";

export type Brand = {
  name: string;
  handle: string;
  logo: string;
};

export const BRANDS: Brand[] = [
  { name: "REDCON1", handle: "redcon1", logo: BRAND_LOGOS["redcon1"] },
  { name: "OPTIMUM NUTRITION", handle: "optimum-nutrition", logo: BRAND_LOGOS["optimum-nutrition"] },
  { name: "MUSCLETECH", handle: "muscletech", logo: BRAND_LOGOS["muscletech"] },
  { name: "BSN", handle: "bsn-1", logo: BRAND_LOGOS["bsn-1"] },
  { name: "GAT SPORT", handle: "gat-sport", logo: BRAND_LOGOS["gat-sport"] },
  { name: "MUSCLEPHARM", handle: "musclepharm", logo: BRAND_LOGOS["musclepharm"] },
  { name: "UNIVERSAL NUTRITION", handle: "universal-nutrition", logo: BRAND_LOGOS["universal-nutrition"] },
  { name: "ULTIMATE NUTRITION", handle: "ultimate-nutrition", logo: BRAND_LOGOS["ultimate-nutrition"] },
  { name: "NUTREX RESEARCH", handle: "nutrex-research", logo: BRAND_LOGOS["nutrex-research"] },
  { name: "RULEONE", handle: "ruleone", logo: BRAND_LOGOS["ruleone"] },
  { name: "CELLUCOR", handle: "cellucor-1", logo: BRAND_LOGOS["cellucor-1"] },
  { name: "GASPARI NUTRITION", handle: "gaspari-nutrition", logo: BRAND_LOGOS["gaspari-nutrition"] },
];

export default function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/collections/${brand.handle}`}
      className="group flex h-24 md:h-28 min-w-[160px] md:min-w-[190px] items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-6 text-center hover:border-[#F9D20F] hover:bg-[#EEF4FF] transition-colors"
    >
      <Image
        src={brand.logo}
        alt={brand.name}
        width={190}
        height={112}
        className="max-h-16 md:max-h-20 w-auto object-contain"
      />
    </Link>
  );
}
