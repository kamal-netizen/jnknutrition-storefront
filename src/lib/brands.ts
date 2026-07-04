// Single source of truth mapping brand collection handles → logo images in
// public/BRAND. Used by the homepage brand row, the mega-menu and the
// /collections brands directory.

export const BRAND_LOGOS: Record<string, string> = {
  redcon1: "/BRAND/Untitled-1_0000_REDCON1.jpg",
  "optimum-nutrition": "/BRAND/Untitled-1_0001_OPTIMUM NUTRITION.jpg",
  muscletech: "/BRAND/Untitled-1_0002_MUSCLETECH.jpg",
  "bsn-1": "/BRAND/Untitled-1_0003_BSN.jpg",
  "gat-sport": "/BRAND/Untitled-1_0004_GAT_2019_New_LOGO_REGISTERED-blue.jpg",
  musclepharm: "/BRAND/Untitled-1_0005_MUSCLEPHARM.jpg",
  "universal-nutrition": "/BRAND/Untitled-1_0006_UNIVERSAL NUTRITION.jpg",
  "ultimate-nutrition": "/BRAND/Untitled-1_0007_ULTIMATE NUTRITION.jpg",
  "nutrex-research": "/BRAND/Untitled-1_0008_NUTREX RESEARCH.jpg",
  ruleone: "/BRAND/Untitled-1_0009_RULEONE.jpg",
  "cellucor-1": "/BRAND/Untitled-1_0010_CELLUCOR.jpg",
  "gaspari-nutrition": "/BRAND/Untitled-1_0011_Gaspari_Nutrition.jpg",

  // BRAND 2 set
  allmax: "/BRAND/BRAND 2/LOGO-_0000_ALLMAX.jpg",
  mhp: "/BRAND/BRAND 2/LOGO-_0001_MHP.jpg",
  mutant: "/BRAND/BRAND 2/LOGO-_0002_MUTANT.jpg",
  musclemeds: "/BRAND/BRAND 2/LOGO-_0003_MUSCLEMEDS.jpg",
  "killer-labz": "/BRAND/BRAND 2/LOGO-_0004_KILLERLABS.jpg",
  "jnx-sports": "/BRAND/BRAND 2/LOGO-_0005_JNX SPORTS.jpg",
  enhanced: "/BRAND/BRAND 2/LOGO-_0006_ENHANCED.jpg",
  dynamik: "/BRAND/BRAND 2/LOGO-_0007_DYNAMIK MUSCLE.jpg",
  "fit-lean": "/BRAND/BRAND 2/LOGO-_0008_FIT & LEAN.jpg",
  "bpi-sports": "/BRAND/BRAND 2/LOGO-_0009_BPI.jpg",
  dymatize: "/BRAND/BRAND 2/LOGO-_0010_Dymatize.jpg",
  proscience: "/BRAND/BRAND 2/LOGO-_0011_ProScience.jpg",
  "proscience-nutra": "/BRAND/BRAND 2/LOGO-_0011_ProScience.jpg",
  "muscle-rulz": "/BRAND/BRAND 2/LOGO-_0012_Muscle Rulz.jpg",
  "core-champs": "/BRAND/BRAND 2/LOGO-_0013_Core Champs.jpg",
};

export function getBrandLogo(handle: string): string | undefined {
  return BRAND_LOGOS[handle];
}

// Fallback lookup by brand display name (normalised), for when a collection's
// handle differs from the key in BRAND_LOGOS but its title matches a brand.
const NAME_LOGOS: Record<string, string> = {
  allmax: "/BRAND/BRAND 2/LOGO-_0000_ALLMAX.jpg",
  mhp: "/BRAND/BRAND 2/LOGO-_0001_MHP.jpg",
  mutant: "/BRAND/BRAND 2/LOGO-_0002_MUTANT.jpg",
  musclemeds: "/BRAND/BRAND 2/LOGO-_0003_MUSCLEMEDS.jpg",
  killerlabz: "/BRAND/BRAND 2/LOGO-_0004_KILLERLABS.jpg",
  jnxsports: "/BRAND/BRAND 2/LOGO-_0005_JNX SPORTS.jpg",
  enhanced: "/BRAND/BRAND 2/LOGO-_0006_ENHANCED.jpg",
  dynamikmuscle: "/BRAND/BRAND 2/LOGO-_0007_DYNAMIK MUSCLE.jpg",
  dynamik: "/BRAND/BRAND 2/LOGO-_0007_DYNAMIK MUSCLE.jpg",
  fitlean: "/BRAND/BRAND 2/LOGO-_0008_FIT & LEAN.jpg",
  bpi: "/BRAND/BRAND 2/LOGO-_0009_BPI.jpg",
  bpisports: "/BRAND/BRAND 2/LOGO-_0009_BPI.jpg",
  dymatize: "/BRAND/BRAND 2/LOGO-_0010_Dymatize.jpg",
  proscience: "/BRAND/BRAND 2/LOGO-_0011_ProScience.jpg",
  musclerulz: "/BRAND/BRAND 2/LOGO-_0012_Muscle Rulz.jpg",
  corechamps: "/BRAND/BRAND 2/LOGO-_0013_Core Champs.jpg",
  redcon1: "/BRAND/Untitled-1_0000_REDCON1.jpg",
  optimumnutrition: "/BRAND/Untitled-1_0001_OPTIMUM NUTRITION.jpg",
  muscletech: "/BRAND/Untitled-1_0002_MUSCLETECH.jpg",
  bsn: "/BRAND/Untitled-1_0003_BSN.jpg",
  gatsport: "/BRAND/Untitled-1_0004_GAT_2019_New_LOGO_REGISTERED-blue.jpg",
  musclepharm: "/BRAND/Untitled-1_0005_MUSCLEPHARM.jpg",
  universalnutrition: "/BRAND/Untitled-1_0006_UNIVERSAL NUTRITION.jpg",
  ultimatenutrition: "/BRAND/Untitled-1_0007_ULTIMATE NUTRITION.jpg",
  nutrexresearch: "/BRAND/Untitled-1_0008_NUTREX RESEARCH.jpg",
  ruleone: "/BRAND/Untitled-1_0009_RULEONE.jpg",
  cellucor: "/BRAND/Untitled-1_0010_CELLUCOR.jpg",
  gasparinutrition: "/BRAND/Untitled-1_0011_Gaspari_Nutrition.jpg",
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
