// Single source of truth mapping brand collection handles → logo images in
// public/BRAND. Used by the homepage brand row, the mega-menu and the
// /collections brands directory.

export const BRAND_LOGOS: Record<string, string> = {
  redcon1: "/BRAND/Untitled-1_0000_REDCON1.webp",
  "optimum-nutrition": "/BRAND/Untitled-1_0001_OPTIMUM NUTRITION.webp",
  muscletech: "/BRAND/Untitled-1_0002_MUSCLETECH.webp",
  "bsn-1": "/BRAND/Untitled-1_0003_BSN.webp",
  "gat-sport": "/BRAND/Untitled-1_0004_GAT_2019_New_LOGO_REGISTERED-blue.webp",
  musclepharm: "/BRAND/Untitled-1_0005_MUSCLEPHARM.webp",
  "universal-nutrition": "/BRAND/Untitled-1_0006_UNIVERSAL NUTRITION.webp",
  "ultimate-nutrition": "/BRAND/Untitled-1_0007_ULTIMATE NUTRITION.webp",
  "nutrex-research": "/BRAND/Untitled-1_0008_NUTREX RESEARCH.webp",
  ruleone: "/BRAND/Untitled-1_0009_RULEONE.webp",
  "cellucor-1": "/BRAND/Untitled-1_0010_CELLUCOR.webp",
  "gaspari-nutrition": "/BRAND/Untitled-1_0011_Gaspari_Nutrition.webp",

  // BRAND 2 set
  allmax: "/BRAND/BRAND 2/LOGO-_0000_ALLMAX.webp",
  mhp: "/BRAND/BRAND 2/LOGO-_0001_MHP.webp",
  mutant: "/BRAND/BRAND 2/LOGO-_0002_MUTANT.webp",
  musclemeds: "/BRAND/BRAND 2/LOGO-_0003_MUSCLEMEDS.webp",
  "killer-labz": "/BRAND/BRAND 2/LOGO-_0004_KILLERLABS.webp",
  "jnx-sports": "/BRAND/BRAND 2/LOGO-_0005_JNX SPORTS.webp",
  enhanced: "/BRAND/BRAND 2/LOGO-_0006_ENHANCED.webp",
  dynamik: "/BRAND/BRAND 2/LOGO-_0007_DYNAMIK MUSCLE.webp",
  "fit-lean": "/BRAND/BRAND 2/LOGO-_0008_FIT & LEAN.webp",
  "bpi-sports": "/BRAND/BRAND 2/LOGO-_0009_BPI.webp",
  dymatize: "/BRAND/BRAND 2/LOGO-_0010_Dymatize.webp",
  proscience: "/BRAND/BRAND 2/LOGO-_0011_ProScience.webp",
  "proscience-nutra": "/BRAND/BRAND 2/LOGO-_0011_ProScience.webp",
  "muscle-rulz": "/BRAND/BRAND 2/LOGO-_0012_Muscle Rulz.webp",
  "core-champs": "/BRAND/BRAND 2/LOGO-_0013_Core Champs.webp",
};

export function getBrandLogo(handle: string): string | undefined {
  return BRAND_LOGOS[handle];
}

// Fallback lookup by brand display name (normalised), for when a collection's
// handle differs from the key in BRAND_LOGOS but its title matches a brand.
const NAME_LOGOS: Record<string, string> = {
  allmax: "/BRAND/BRAND 2/LOGO-_0000_ALLMAX.webp",
  mhp: "/BRAND/BRAND 2/LOGO-_0001_MHP.webp",
  mutant: "/BRAND/BRAND 2/LOGO-_0002_MUTANT.webp",
  musclemeds: "/BRAND/BRAND 2/LOGO-_0003_MUSCLEMEDS.webp",
  killerlabz: "/BRAND/BRAND 2/LOGO-_0004_KILLERLABS.webp",
  jnxsports: "/BRAND/BRAND 2/LOGO-_0005_JNX SPORTS.webp",
  enhanced: "/BRAND/BRAND 2/LOGO-_0006_ENHANCED.webp",
  dynamikmuscle: "/BRAND/BRAND 2/LOGO-_0007_DYNAMIK MUSCLE.webp",
  dynamik: "/BRAND/BRAND 2/LOGO-_0007_DYNAMIK MUSCLE.webp",
  fitlean: "/BRAND/BRAND 2/LOGO-_0008_FIT & LEAN.webp",
  bpi: "/BRAND/BRAND 2/LOGO-_0009_BPI.webp",
  bpisports: "/BRAND/BRAND 2/LOGO-_0009_BPI.webp",
  dymatize: "/BRAND/BRAND 2/LOGO-_0010_Dymatize.webp",
  proscience: "/BRAND/BRAND 2/LOGO-_0011_ProScience.webp",
  musclerulz: "/BRAND/BRAND 2/LOGO-_0012_Muscle Rulz.webp",
  corechamps: "/BRAND/BRAND 2/LOGO-_0013_Core Champs.webp",
  redcon1: "/BRAND/Untitled-1_0000_REDCON1.webp",
  optimumnutrition: "/BRAND/Untitled-1_0001_OPTIMUM NUTRITION.webp",
  muscletech: "/BRAND/Untitled-1_0002_MUSCLETECH.webp",
  bsn: "/BRAND/Untitled-1_0003_BSN.webp",
  gatsport: "/BRAND/Untitled-1_0004_GAT_2019_New_LOGO_REGISTERED-blue.webp",
  musclepharm: "/BRAND/Untitled-1_0005_MUSCLEPHARM.webp",
  universalnutrition: "/BRAND/Untitled-1_0006_UNIVERSAL NUTRITION.webp",
  ultimatenutrition: "/BRAND/Untitled-1_0007_ULTIMATE NUTRITION.webp",
  nutrexresearch: "/BRAND/Untitled-1_0008_NUTREX RESEARCH.webp",
  ruleone: "/BRAND/Untitled-1_0009_RULEONE.webp",
  cellucor: "/BRAND/Untitled-1_0010_CELLUCOR.webp",
  gasparinutrition: "/BRAND/Untitled-1_0011_Gaspari_Nutrition.webp",
};

export function resolveBrandLogo(
  handle: string,
  title?: string
): string | undefined {
  const byHandle = BRAND_LOGOS[handle];
  if (byHandle) return byHandle;
  if (title) {
    const key = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    return NAME_LOGOS[key];
  }
  return undefined;
}
