import Link from "@/components/LocaleLink";
import Image from "next/image";

export type Goal = {
  title: string;
  description: string;
  href: string;
  image: string;
};

export const GOALS: Goal[] = [
  {
    title: "Whey Protein",
    description: "Build lean muscle",
    href: "/collections/whey-protein",
    image: "/feature image/whey.webp",
  },
  {
    title: "Creatine",
    description: "Strength & power",
    href: "/collections/creatine",
    image: "/feature image/creatine.webp",
  },
  {
    title: "Fat Loss",
    description: "Shred & burn",
    href: "/collections/energy-performance",
    image: "/feature image/fat-loss.webp",
  },
  {
    title: "EAAs & Aminos",
    description: "Recover faster",
    href: "/collections/bcaa",
    image: "/feature image/EAAS_600x.webp",
  },
  {
    title: "Pre-Workout",
    description: "Energy & focus",
    href: "/collections/pre-workouts",
    image: "/feature image/preworkout.webp",
  },
  {
    title: "Vitamins & Health",
    description: "Daily wellness",
    href: "/collections/health-wellness",
    image: "/feature image/MULTIVITAMINS_AND_MINERALS_600x.webp",
  },
];

export default function GoalCard({ goal }: { goal: Goal }) {
  return (
    <Link
      href={goal.href}
      className="group relative block overflow-hidden rounded-xl aspect-[3/4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9D20F] focus-visible:ring-offset-2"
    >
      {/* Image */}
      <Image
        src={goal.image}
        alt={goal.title}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

      {/* Bottom CTA strip */}
      <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
        <div className="bg-[#F9D20F] px-4 py-3 flex items-center justify-between">
          <span className="text-[#0B0F14] text-xs font-black uppercase tracking-widest">
            {goal.description}
          </span>
          <span className="text-[#0B0F14] font-black text-sm">→</span>
        </div>
      </div>
    </Link>
  );
}
