import {
  Dumbbell,
  Flame,
  Zap,
  Heart,
  Activity,
  Leaf,
  type LucideIcon,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type BadgeTag = "new" | "sale" | "hot" | "bestseller";

export type MegaLink = { label: string; handle: string; badge?: BadgeTag };

export type GoalCard = {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Smart collection the whole card links to. */
  handle: string;
  items: MegaLink[];
};

export type CategoryGroup = {
  title: string;
  /** Collection handle for the "View All" link. */
  viewAllHandle: string;
  items: MegaLink[];
};

export type BrandLink = { name: string; handle: string };

export type FeaturedItem = {
  label: string;
  handle: string;
  emoji: string;
};

export type SimpleLink = { label: string; href: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const collectionHref = (handle: string) => `/collections/${handle}`;

export const BADGE_STYLES: Record<
  BadgeTag,
  { label: string; className: string }
> = {
  new: { label: "NEW", className: "bg-[#16A34A] text-white" },
  bestseller: { label: "BEST SELLER", className: "bg-[#F9D20F] text-[#0B0F14]" },
  hot: { label: "HOT", className: "bg-[#F97316] text-white" },
  sale: { label: "SALE", className: "bg-[#DC2626] text-white" },
};

// ─── Section 1: Shop by Goals ────────────────────────────────────────────────

export const GOAL_CARDS: GoalCard[] = [
  {
    id: "build-muscle",
    icon: Dumbbell,
    title: "Build Muscle",
    subtitle: "Protein, mass & strength",
    handle: "muscle-building",
    items: [
      { label: "Whey Protein", handle: "whey-protein", badge: "bestseller" },
      { label: "Isolate Protein", handle: "isolate-protein" },
      { label: "Casein", handle: "casein" },
      { label: "Mass Gainer", handle: "mass-gainers", badge: "sale" },
      { label: "Creatine", handle: "creatine", badge: "new" },
    ],
  },
  {
    id: "fat-loss",
    icon: Flame,
    title: "Fat Loss",
    subtitle: "Burn & define",
    handle: "weight-loss",
    items: [
      { label: "Fat Burners", handle: "fat-burner" },
      { label: "L-Carnitine", handle: "l-carnitine" },
      { label: "CLA", handle: "cla" },
      { label: "Keto Support", handle: "keto" },
    ],
  },
  {
    id: "performance",
    icon: Zap,
    title: "Performance",
    subtitle: "Power & energy",
    handle: "energy-performance",
    items: [
      { label: "Pre Workout", handle: "pre-workouts" },
      { label: "Pump", handle: "pump" },
      { label: "Energy", handle: "energy-booster" },
      { label: "Post-Workout", handle: "post-workouts" },
    ],
  },
  {
    id: "health",
    icon: Heart,
    title: "Health",
    subtitle: "Daily essentials",
    handle: "health-support",
    items: [
      { label: "Fish Oil", handle: "fish-oil", badge: "hot" },
      { label: "Multivitamin", handle: "multivitamin" },
      { label: "Joint Support", handle: "joint-support" },
      { label: "Vitamin D", handle: "vitamin-d" },
      { label: "Vitamin C", handle: "vitamin-c" },
    ],
  },
  {
    id: "recovery",
    icon: Activity,
    title: "Recovery",
    subtitle: "Repair & rebuild",
    handle: "recovery",
    items: [
      { label: "BCAA", handle: "bcaa" },
      { label: "EAA", handle: "eaas" },
      { label: "Glutamine", handle: "glutamine" },
      { label: "Amino Acids", handle: "amino-acids" },
    ],
  },
  {
    id: "wellness",
    icon: Leaf,
    title: "Wellness",
    subtitle: "Feel your best",
    handle: "health-wellness",
    items: [
      { label: "Immune Support", handle: "immunity-support" },
      { label: "Liver Support", handle: "liver-support" },
      { label: "Digestive Health", handle: "digestion-support" },
      { label: "Men's Health", handle: "mens-health" },
      { label: "Women's Health", handle: "female-wellness" },
    ],
  },
];

// ─── Section 2: Shop by Category ─────────────────────────────────────────────

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    title: "Protein",
    viewAllHandle: "protein",
    items: [
      { label: "Whey Protein", handle: "whey-protein" },
      { label: "Isolate", handle: "isolate-protein" },
      { label: "Casein", handle: "casein" },
      { label: "Vegan Protein", handle: "vegan-protein" },
      { label: "Diet Protein", handle: "diet-protein" },
      { label: "Mass Gainer", handle: "mass-gainers" },
    ],
  },
  {
    title: "Performance",
    viewAllHandle: "energy-performance",
    items: [
      { label: "Creatine", handle: "creatine", badge: "new" },
      { label: "Pre Workout", handle: "pre-workouts" },
      { label: "Pump", handle: "pump" },
      { label: "Post-Workout", handle: "post-workouts" },
      { label: "Beta-Alanine", handle: "beta-alanine" },
    ],
  },
  {
    title: "Health",
    viewAllHandle: "health-wellness",
    items: [
      { label: "Fish Oil", handle: "fish-oil", badge: "hot" },
      { label: "Multivitamin", handle: "multivitamin" },
      { label: "Vitamin C", handle: "vitamin-c" },
      { label: "Vitamin D", handle: "vitamin-d" },
      { label: "Joint Support", handle: "joint-support" },
      { label: "Liver Support", handle: "liver-support" },
    ],
  },
  {
    title: "Weight Management",
    viewAllHandle: "weight-loss",
    items: [
      { label: "Fat Burners", handle: "fat-burner" },
      { label: "Keto", handle: "keto" },
      { label: "CLA", handle: "cla" },
      { label: "L-Carnitine", handle: "l-carnitine" },
    ],
  },
  {
    title: "Accessories",
    viewAllHandle: "accessories",
    items: [
      { label: "Shakers", handle: "shakers" },
      { label: "Belt & Gloves", handle: "belt-gloves" },
      { label: "Gym Wear", handle: "gym-wear" },
      { label: "Hoodies", handle: "hoodiee" },
      { label: "T-Shirts", handle: "t-shirt" },
    ],
  },
];

// ─── Section 3: Brands ───────────────────────────────────────────────────────

export const MEGA_BRANDS: BrandLink[] = [
  { name: "Core Champs", handle: "core-champs" },
  { name: "Muscle Rulz", handle: "muscle-rulz" },
  { name: "ProScience", handle: "proscience" },
  { name: "Muscletech", handle: "muscletech" },
  { name: "RuleOne", handle: "ruleone" },
  { name: "Dymatize", handle: "dymatize" },
  { name: "Optimum Nutrition", handle: "optimum-nutrition" },
  { name: "Redcon1", handle: "redcon1" },
];

// ─── Section 4: Featured ─────────────────────────────────────────────────────

export const FEATURED_ITEMS: FeaturedItem[] = [
  { label: "Best Sellers", handle: "best-sellers", emoji: "⭐" },
  { label: "New Arrivals", handle: "new-arrivals", emoji: "🔥" },
  { label: "Today's Deals", handle: "today-deals", emoji: "⚡" },
  { label: "Super Saver", handle: "super-saver", emoji: "🎁" },
  { label: "Trending Now", handle: "trending-now", emoji: "💎" },
];

// ─── Section 5: Popular / Trending Searches ──────────────────────────────────

export const TRENDING_SEARCHES: string[] = [
  "Creatine",
  "Whey Protein",
  "Mass Gainer",
  "Fish Oil",
  "Pre Workout",
  "Multivitamin",
  "Protein Bars",
  "Electrolytes",
  "BCAA",
];

// ─── Simple top-level links (no mega) ────────────────────────────────────────

export const SIMPLE_LINKS: SimpleLink[] = [
  { label: "Blog", href: "/blogs/news" },
  { label: "About", href: "/pages/about" },
];
