// ─── Legacy product and collection URLs ──────────────────────────────────────
// Handles that earned traffic in the 12 months to 2026-11-19 and now 404. Two
// causes, found by diffing that Search Console export against the live
// Storefront catalogue (747 products, 140 collections) on 2026-11-21:
//
//   1. the product was renamed or resized in Shopify, so the ranked URL died
//      while the product itself kept selling at a new handle — e.g.
//      /products/cloma-pharma-black-spider-100-tablets 404s while
//      …-100-capsules answers 200;
//   2. the product was delisted outright (the ephedra and male-libido lines,
//      mostly), so nothing equivalent is left to point at.
//
// Together these 152 URLs banked 1,246 clicks and 67,206 impressions over that
// year, and every one of them was answering 404 — a dead end for the visitor
// and an instruction to Google to drop the URL.
//
// The rule applied, deliberately conservative: a renamed product redirects to
// that same product; a product with no live equivalent redirects to its BRAND
// shelf (or, where the brand has no collection, its product-type shelf) and
// never to a different product. A redirect to the wrong bottle is worse for
// the visitor than a 404, and Google reads it as a soft 404 anyway, so where
// the match was ambiguous this list points at a shelf on purpose.
//
// Arabic handles are percent-encoded because a redirect `source` is matched
// against the raw request path, not a decoded one.
//
// next.config.ts expands each pair into the un-prefixed rule and its /ar twin.
// Rebuild with the Storefront API before adding to it: a destination that has
// itself been renamed turns one dead end into a redirect to another.

/** [dead path, live destination] — both default-locale (un-prefixed) paths. */
export const LEGACY_URL_REDIRECTS: ReadonlyArray<readonly [string, string]> = [
  //  141 clicks · 3302 impr · reviewed by hand
  ["/products/gat-sport-testrol-fire-testosterone-booster-with-thermogenic", "/collections/gat-sport"],
  //   99 clicks · 3670 impr
  ["/products/cloma-pharma-methyldrene-ephedra-eca-stack-100-tablets", "/products/cloma-pharma-methyldrene-25-ephedra-capsules"],
  //   60 clicks · 6055 impr
  ["/products/cloma-pharma-black-spider-fat-burning-venom-100-tablets", "/products/cloma-pharma-black-spider-100-capsules"],
  //   47 clicks · 3365 impr
  ["/products/nutrex-research-vitrix-mens-mega-booster-80-veg-capsules", "/products/nutrex-research-vitrix-60-capsules"],
  //   43 clicks ·  892 impr
  ["/products/cloma-pharma-china-white-powerfully-penetrating-thermogenic", "/products/cloma-pharma-china-white-100-tablets"],
  //   40 clicks · 2135 impr
  ["/products/musclemeds-stemtropin-gh-booster-60-capsules", "/products/musclemeds-stemtropin-60-capsules"],
  //   40 clicks · 1253 impr · reviewed by hand
  ["/products/nutrex-research-lipo-6-black-uc-stim-free-60-capsules", "/collections/nutrex-research"],
  //   35 clicks · 1352 impr
  ["/products/core-champs-multivitamin", "/products/core-champs-multivitamin-90-tablets-1"],
  //   33 clicks · 1216 impr
  ["/products/mutant-mass-5-lbs-mass-gainer", "/products/mutant-mass-gainer-5lbs"],
  //   32 clicks ·  599 impr
  ["/products/core-champs-test-freak-60-capsules", "/products/core-champs-test-freak-60-capsules-testosterone-booster"],
  //   30 clicks · 3216 impr
  ["/products/cloma-pharma-black-spider-100-tablets", "/products/cloma-pharma-black-spider-100-capsules"],
  //   29 clicks · 2668 impr
  ["/products/core-champs-rdx-caf-400mg-caffeine-strongest-pre-workout", "/collections/core-champs"],
  //   27 clicks · 1040 impr
  ["/products/nutrex-research-vitrix-male-libido-booster-80-capsules", "/products/nutrex-research-vitrix-60-capsules"],
  //   25 clicks · 1645 impr
  ["/products/bsn-n-o-xplode-pre-workout-30-servings", "/collections/pre-workouts"],
  //   23 clicks · 1194 impr
  ["/products/muscle-rulz-gain-rulz-mass-gainer", "/products/muscle-rulz-gain-rulz-50-gram-protein-advance-mass-gainer-16-lbs"],
  //   22 clicks · 1094 impr · reviewed by hand
  ["/products/sixstar-testosterone-booster-elite-series-60-caplets-from-muscletech", "/collections/testosterone"],
  //   20 clicks ·  842 impr
  ["/products/muscletech-hydroxycut%C2%AE-hardcore-super-elite-100-veg-capsules", "/products/muscletech-hydroxycut-hardcore-super-elite-100-veg-capsules-2"],
  //   19 clicks ·  521 impr · reviewed by hand
  ["/products/muscletech-muscle-builder-pm-90-capsules", "/collections/muscletech"],
  //   16 clicks ·  978 impr
  ["/products/enhanced-3-ad-dehydroandrosterol-75mg-best-prohormone", "/collections/enhanced"],
  //   16 clicks ·  726 impr
  ["/products/muscletech-test-hd-thermo-90-capsules-thermogenic-testosterone-booster", "/collections/muscletech"],
  //   16 clicks ·  245 impr
  ["/products/core-champs-heavyweight-gainer-21-servings-7-lbs", "/products/core-champs-super-heavyweight-mass-gainer-54-gram-protein"],
  //   15 clicks ·  720 impr
  ["/products/core-champs-testro-gen-testosterone-booster", "/products/core-champs-testro-gen-testosterone-booster-60-tablets"],
  //   15 clicks ·  660 impr
  ["/products/ultimate-nutrition-iso-sensation-5lbs", "/products/ultimate-nutrition-iso-sensation-93-5-lbs-whey-protein-isolate"],
  //   13 clicks · 1525 impr
  ["/products/gat-sport-mens-multi-test-vitamin", "/collections/gat-sport"],
  //   13 clicks ·  212 impr
  ["/products/redcon1-war-zone-muscle-building-accelerator-90-capsueles", "/collections/redcon1"],
  //   11 clicks ·  539 impr · reviewed by hand
  ["/products/%D9%85%D9%88%D8%AA%D8%A7%D9%86%D8%AA-%D9%85%D8%A7%D8%B3-%D8%A7%D9%83%D8%B3%D8%AA%D8%B1%D9%8A%D9%85-2500-6-%D8%B1%D8%B7%D9%84-%D9%84%D8%B2%D9%8A%D8%A7%D8%AF%D8%A9-%D9%83%D8%AA%D9%84%D8%A9-%D8%A7%D9%84%D8%B9%D8%B6%D9%84%D8%A7%D8%AA", "/products/mutant-mass-extreme-2500-6-lbs-muscle-mass-gainer"],
  //   10 clicks ·  284 impr
  ["/products/dynamik-prey-whey-gold-series-protein-5lbs-superior-whey-protein", "/products/dynamik-prey-whey-protein-5lbs-superior-whey-protein"],
  //    9 clicks ·  208 impr
  ["/products/mhp-up-your-mass-xxxl-12lbs-weight-gainer", "/products/mhp-up-your-mass-xxxl-1350-weight-gainer-6-lbs"],
  //    8 clicks ·  899 impr
  ["/products/dymatize-super-mass-gainer-12-lbs", "/products/dymatize-super-mass-gainer-12-lbs-high-protein-carb-blend"],
  //    8 clicks ·  508 impr
  ["/products/proscience-creatine-5000mg-creatine-monohydrate", "/products/proscience-nutra-5000mg-creatine-monohydrate"],
  //    8 clicks ·  444 impr
  ["/products/muscle-rulz-whey-rulz-plus-5lbs", "/products/muscle-rulz-whey-rulz-plus-5lbs-whey-protein-powder"],
  //    8 clicks ·  123 impr
  ["/products/enhanced-shred-xt-60-capsules-1", "/products/enhanced-shred-xt-60-capsules-improve-muscle-definition"],
  //    7 clicks ·  474 impr
  ["/products/redcon1-boom-stick-testosterone-support", "/collections/redcon1"],
  //    7 clicks ·  455 impr
  ["/products/cloma-pharma-methyldrene-100-tablets", "/collections/fat-burner"],
  //    7 clicks ·  381 impr
  ["/products/muscletech-nitro-tech-whey-protein-10-lbs-bag-whey-protein", "/products/muscletech-nitro-tech-30-gram-protein-2-2-lbs-whey-protein-with-creatine"],
  //    7 clicks ·  377 impr
  ["/products/gaspari-aminomax-8000-350-tablets", "/products/gaspari-nutrition-aminomax-8000-325-tablets"],
  //    7 clicks ·  292 impr
  ["/products/gat-sports-nitraflex-deep-wood-testosterone-booster", "/collections/gat-sport"],
  //    7 clicks ·  195 impr
  ["/products/muscletech-3-in-1-testosterone-booster-100-capsules", "/products/muscletech-alphatest-atp-testosterone-booster"],
  //    6 clicks ·  495 impr
  ["/products/universal-nutrition-gh-max-180-tablets-classic-series", "/collections/universal-nutrition"],
  //    6 clicks ·  440 impr
  ["/products/bsn-syntha-6-ultra-premium-protein-powder-2-91lb", "/products/bsn-syntha-6-protein-ultra-premium-protein-powder-2-91lb-1"],
  //    6 clicks ·  170 impr
  ["/products/muscletech-mass-tech-extreme-2000-12-%D8%B1%D8%B7%D9%84%D8%A7%D9%8B-%D9%85%D9%86-%D8%A8%D8%B1%D9%88%D8%AA%D9%8A%D9%86-%D8%B2%D9%8A%D8%A7%D8%AF%D8%A9-%D8%A7%D9%84%D9%83%D8%AA%D9%84%D8%A9", "/products/muscletech-mass-tech-extreme-2000-6-lbs-mass-gainer"],
  //    6 clicks ·   77 impr
  ["/products/redcon1-grunt-eaa-30-servings", "/products/redcon1-grunt-eaa-30-servings-essential-amino-acids"],
  //    5 clicks ·  499 impr
  ["/products/core-champs-whey", "/collections/core-champs"],
  //    5 clicks ·  330 impr
  ["/products/musclemeds-aromatest-30-capsules", "/products/musclemeds-aromatest-30-liquid-capsules"],
  //    5 clicks ·  258 impr
  ["/products/core-champs-mass-high-calorie-mass-gainer", "/products/core-champs-mass-high-calorie-mass-gainer-15lbs"],
  //    5 clicks ·  242 impr
  ["/products/muscletech-nitro-tech-100-whey-gold-churros-flavor-limited-edition", "/products/muscletech-nitro-tech-100-whey-gold-5-03-lbs-whey-protein"],
  //    5 clicks ·  223 impr
  ["/products/muscletech-cell-tech-hyper-build-30-servings", "/products/muscletech-cell-tech-creatine-research-backed-muscle-builder"],
  //    5 clicks ·  156 impr
  ["/products/bpi-sports-roxylean-60-servings", "/products/bpi-sports-roxylean-extreme-weight-loss-60-capsules"],
  //    5 clicks ·  147 impr
  ["/products/dynamik-creatine-gold-series-300gm", "/products/dynamik-creatine-gold-series-5000mg-60-servings"],
  //    5 clicks ·   89 impr
  ["/products/mutant-madness-pre-workout-30-servings", "/products/mutant-madness-pre-workout-30-servings-intense-energy"],
  //    5 clicks ·   42 impr · reviewed by hand
  ["/products/universal-nutrition-amino-tech-375-tablets", "/collections/universal-nutrition"],
  //    4 clicks ·  619 impr
  ["/products/gat-sport-carbotein-advanced-carbohydrate-formula-4lb", "/products/gat-sport-carbotein-advanced-carbohydrate-formula-4-lbs"],
  //    4 clicks ·  291 impr
  ["/products/proscience-super-pump-30-servings", "/products/proscience-nutra-super-pump-30-servings"],
  //    4 clicks ·  273 impr
  ["/products/dymatize-iso-100-hydrolyzed-protein-powder-1-6lbs", "/products/dymatize-iso-100-hydrolyzed-protein-powder-100-whey-protein-isolate"],
  //    4 clicks ·  160 impr
  ["/products/musclemeds-carnivor-shred-fat-burning-beef-protein", "/products/musclemeds-carnivor-shred-fat-burning-beef-protein-2-lbs"],
  //    4 clicks ·  126 impr
  ["/products/gat-sport-jetfuel-diuretic-90-oil-infused-capsules", "/products/gat-sport-jetfuel-superburn-120-oil-infused-capsules"],
  //    4 clicks ·   91 impr
  ["/products/dynamik-prey-mass-6lbs-mass-gainer", "/products/dynamik-prey-mass-6lbs-mass-gainer-chocolate-cheese-cake"],
  //    4 clicks ·   49 impr · reviewed by hand
  ["/products/sixstar-testosterone-booster-elite-series-60-caplets", "/collections/testosterone"],
  //    4 clicks ·   38 impr · reviewed by hand
  ["/products/%D8%AC%D8%A7%D8%AA-%D8%B3%D8%A8%D9%88%D8%B1%D8%AA-testrol-fire-%D9%85%D8%B9%D8%B2%D8%B2-%D8%A7%D9%84%D8%AA%D8%B3%D8%AA%D9%88%D8%B3%D8%AA%D9%8A%D8%B1%D9%88%D9%86-%D9%85%D8%B9-%D8%AA%D9%88%D9%84%D9%8A%D8%AF-%D8%A7%D9%84%D8%AD%D8%B1%D8%A7%D8%B1%D8%A9", "/collections/gat-sport"],
  //    4 clicks ·   16 impr · reviewed by hand
  ["/products/%D9%85%D8%A7%D8%B3%D9%84-%D8%B1%D9%88%D9%84%D8%B2-%D8%A5%D9%84-%D9%83%D8%A7%D8%B1%D9%86%D9%8A%D8%AA%D9%8A%D9%86-3000-%D9%85%D8%AC%D9%85-%D8%B9%D8%A8%D9%88%D8%A9-%D8%AC%D8%AF%D9%8A%D8%AF%D8%A9", "/products/muscle-rulz-l-carnitine-3000-mg-new-packing"],
  //    3 clicks ·  554 impr
  ["/products/nutrex-research-lipo6-black-hers-ultra-concentrate-60-capsules", "/products/nutrex-research-lipo-6-black-hers-ultra-concentrate-60-capsules"],
  //    3 clicks ·  306 impr
  ["/products/bpi-sports-1-m-r-vortex-50-servings", "/products/bpi-sports-1-m-r-vortex-pre-workout-50-servings"],
  //    3 clicks ·  288 impr
  ["/products/redcon1-fade-out-sleep-formula-30-servings", "/collections/redcon1"],
  //    3 clicks ·  250 impr
  ["/products/universal-nutrition-animal-tnt-30-packs-test-boosting-health-and-performance", "/products/universal-nutrition-animal-tnt-30-packs"],
  //    3 clicks ·  243 impr
  ["/products/muscletech-test-hd-90-caplets-high-performance-testosterone-booster", "/collections/muscletech"],
  //    3 clicks ·  227 impr
  ["/products/musclemeds-carnivor-beef-amino-300-tablets", "/products/musclemeds-carnivor-beef-amino-300-tablets-100-beef-aminos"],
  //    3 clicks ·  205 impr
  ["/products/nutrex-research-t-up-natural-testosterone-booster-120-capsules", "/products/nutrex-research-t-up-max-60-capsules"],
  //    3 clicks ·  203 impr
  ["/products/cloma-pharma-asia-black-100tab", "/products/cloma-pharma-asia-black-100-capsules"],
  //    3 clicks ·  200 impr
  ["/products/jnx-sports-the-curse-50-servings", "/collections/jnx-sports"],
  //    3 clicks ·  170 impr
  ["/products/mhp-up-your-mass-xxxl-milk-6lb-mass-gainer", "/products/mhp-up-your-mass-xxxl-1350-weight-gainer-6-lbs"],
  //    3 clicks ·  155 impr
  ["/products/enhanced-big-ramy-huge-gainz-12-lbs-chocolate-mass-gainer", "/collections/enhanced"],
  //    3 clicks ·  137 impr
  ["/products/ultimate-nutrition-dhea-50-mg-100-capsules", "/collections/ultimate-nutrition"],
  //    3 clicks ·  131 impr
  ["/products/mhp-super-fat-burner-60-capsules", "/products/mhp-super-fat-burner-60-capsules-powerful-weight-loss-matrix"],
  //    3 clicks ·  127 impr
  ["/products/ultimate-nutrition-dhea-100mg-100-capsules", "/collections/ultimate-nutrition"],
  //    3 clicks ·  102 impr
  ["/products/dynamik-prey-mass-12lbs-gold-series-mass-gainer-2", "/products/dynamik-gold-series-prey-mass-12lbs"],
  //    3 clicks ·   94 impr
  ["/products/nutrex-research-lipo-6-black-cleanse-detox-refresh-your-body", "/products/nutrex-research-lipo-6-black-cleanse-detox-60-capsules-refresh-your-body"],
  //    3 clicks ·   43 impr · reviewed by hand
  ["/products/natrol-biotin-10-000-mcg-fast-dissolve-tablets-250-tablets", "/products/natrol-biotin-10-000-mcg-fast-dissolve-250-tablets-strawberry"],
  //    3 clicks ·   32 impr · reviewed by hand
  ["/products/nitrix-pump-2-0", "/products/muscle-rulz-nitrix-pump-advance-formula-2-0-increased-muscle-pumps"],
  //    3 clicks ·   26 impr
  ["/products/cloma-pharma-china-white-%D9%8A%D8%AA%D8%BA%D9%84%D8%BA%D9%84-%D8%A8%D9%82%D9%88%D8%A9-%D9%81%D9%8A-%D8%AA%D9%88%D9%84%D9%8A%D8%AF-%D8%A7%D9%84%D8%AD%D8%B1%D8%A7%D8%B1%D8%A9", "/products/cloma-pharma-china-white-100-tablets"],
  //    2 clicks ·  626 impr
  ["/products/core-champs-creatine-5000mg", "/products/core-champs-creatine-monohydrate-5000mg-60-servings"],
  //    2 clicks ·  619 impr
  ["/products/bsn-aminox-effervescent-instantized-amino-acids", "/products/bsn-amino-x-effervescent-instantized-amino-acids-70-servings"],
  //    2 clicks ·  530 impr
  ["/products/gat-sport-jetmass-720-gram", "/products/gat-sport-jetmass-720-gram-creatine-powder"],
  //    2 clicks ·  398 impr · reviewed by hand
  ["/products/jetfuel-energy-performance-drink-pack-of-12", "/collections/gat-sport"],
  //    2 clicks ·  319 impr
  ["/products/ultimate-nutrition-prostar-whey-5-28lbs-chocolate", "/products/ultimate-nutrition-prostar-100-whey-protein-5-28-lbs"],
  //    2 clicks ·  279 impr
  ["/products/mhp-probolic-sr-sustained-release-casein-2lbs", "/products/mhp-probolic-sr-sustained-release-casein-2-lbs"],
  //    2 clicks ·  249 impr
  ["/products/core-champs-l-citrulline-90-servings", "/products/core-champs-l-citrulline-2000mg-90-servings-supports-vasodilation"],
  //    2 clicks ·  244 impr
  ["/products/mhp-activite-sport-multivitamin-120-tablets", "/products/mhp-activite-sport-multivitamin-120-tablets-maximum-human-performance"],
  //    2 clicks ·  243 impr
  ["/products/muscletech-nitro-tech-iso-whey-2lbs", "/products/muscletech-nitro-tech-iso-whey-5-lbs-whey-protein-isolate"],
  //    2 clicks ·  227 impr
  ["/products/gat-sport-nitraflex-burn-30-servings-burn-body-fat", "/collections/gat-sport"],
  //    2 clicks ·  213 impr
  ["/products/core-champs-cla-conjugated-linoleic-acid-1000mg", "/products/core-champs-cla-conjugated-linoleic-acid-1000mg-120-softgels"],
  //    2 clicks ·  207 impr
  ["/products/fit-lean-keto-coffee-medium-roast-blend-15-serving", "/products/fit-lean-keto-coffee-medium-roast-blend-15-servings"],
  //    2 clicks ·  155 impr
  ["/products/mhp-anadrox-pump-burn-112-capsules", "/products/mhp-anadrox-pump-burn-112-capsules-energy-pump-fatloss"],
  //    2 clicks ·  141 impr
  ["/products/gat-sport-nitraflex-pre-workout-30-servings-energy-focus-pump-strength", "/collections/gat-sport"],
  //    2 clicks ·  137 impr
  ["/products/muscletech-platinum-multivitamin-90-tablets", "/collections/muscletech"],
  //    2 clicks ·  124 impr
  ["/products/mhp-adrenaline-drive-peppermint-30-tablets", "/products/mhp-adrenaline-drive-peppermint-30-tablets-instant-energy"],
  //    2 clicks ·   96 impr
  ["/products/redcon1-canteen-hydration-electrolytes", "/products/redcon1-canteen-hydration-electrolytes-30"],
  //    2 clicks ·   91 impr
  ["/products/prosupps-hyde-test-surge-30-servings-pre-workout-with-test-booster", "/collections/prosupps"],
  //    2 clicks ·   88 impr
  ["/products/universal-nutrition-n1-t-testosterone-booster-90-capsules", "/collections/universal-nutrition"],
  //    2 clicks ·   78 impr
  ["/products/universal-nutrition-amino-2700-tab", "/products/universal-nutrition-amino-2700-tab-classic-series"],
  //    2 clicks ·   71 impr
  ["/products/redcon1-big-noise-pump-30-servings", "/products/redcon1-big-noise-pump-30-servings-pre-workout"],
  //    2 clicks ·   68 impr
  ["/products/bpi-sports-keto-weight-loss-25-servings", "/products/bpi-sports-keto-weight-loss-ketogenic-25-servings"],
  //    2 clicks ·   66 impr
  ["/products/mutant-bcaa-9-7-90-servings", "/products/mutant-bcaa-9-7-90-servings-premium-bcaa"],
  //    2 clicks ·   56 impr · reviewed by hand
  ["/collections/gh-booster", "/collections/testosterone"],
  //    2 clicks ·   53 impr · reviewed by hand
  ["/products/nutrex-outrage-ultra-stim-pre-workout-energy-focus-power", "/collections/nutrex-research"],
  //    2 clicks ·   42 impr
  ["/products/enhanced-ramys-rage-pump-reloaded-stim-free-pre-workout", "/collections/enhanced"],
  //    2 clicks ·   41 impr
  ["/products/mhp-probolic-sr-sustained-release-casein-4lbs", "/products/mhp-probolic-sr-sustained-release-casein-2-lbs"],
  //    2 clicks ·   40 impr
  ["/products/core-champs-glutamine-50-servings-pure-l-glutamine-5000mg", "/products/core-champs-glutamine-5000-mg-pure-l-glutamine-powder"],
  //    2 clicks ·   36 impr
  ["/products/musclepharm-assault-sport-pre-workout", "/products/musclepharm-assault-sport-pre-workout-30-servings"],
  //    2 clicks ·   35 impr
  ["/products/fit-lean-immune-green-20-serving", "/products/fit-lean-immune-green-50-organic-super-food-20-serving"],
  //    2 clicks ·   30 impr
  ["/products/dynamik-multivitamin-daily-gold-series-100-tablets", "/products/dynamik-multivitamin-daily-health-support-gold-series-100-tablets"],
  //    2 clicks ·   27 impr · reviewed by hand
  ["/products/muscletech-platinum-100-amino-2300-320-tablets", "/collections/amino-acids"],
  //    2 clicks ·   26 impr
  ["/products/enhanced-tudca-liver-detox-support", "/products/enhanced-labs-tudca-60-capsules"],
  //    2 clicks ·   24 impr
  ["/products/gat-sport-nitraflex-rtd-pre-workout-orange-flavor", "/collections/gat-sport"],
  //    2 clicks ·   24 impr
  ["/products/muscletech-euphoriq-%D8%B7%D8%A7%D9%82%D8%A9-%D9%85%D9%86%D8%B4%D8%B7-%D8%A7%D9%84%D8%B0%D9%87%D9%86-%D9%81%D8%A7%D8%A6%D9%82%D8%A9-%D8%A7%D9%84%D9%86%D8%B8%D8%A7%D9%81%D8%A9-%D9%82%D8%A8%D9%84-%D8%A7%D9%84%D8%AA%D9%85%D8%B1%D9%8A%D9%86", "/products/muscletech-euphoriq-pre-workout-ultra-clean-nootropic-energy"],
  //    2 clicks ·   18 impr
  ["/products/bpi-sports-shredding-gel-8oz", "/products/bpi-sports-shredding-gel-skin-tightening-formula-fat-loss"],
  //    2 clicks ·   10 impr
  ["/products/gat-sport-libido-boost-power-punch-flavor", "/collections/gat-sport"],
  //    2 clicks ·    5 impr
  ["/products/dynamik-gold-series-eaa-essential-amino-acids-30-servings", "/collections/dynamik"],
  //    1 clicks ·  983 impr
  ["/products/gat-sport-testrol-gold-es-60-tablets-testosterone-booster", "/products/gat-sport-testrol-gold-es-60-tablets"],
  //    1 clicks ·  731 impr · reviewed by hand
  ["/collections/all", "/collections/all-products"],
  //    1 clicks ·  617 impr
  ["/products/cellucor-c4-original-pre-workout-60-servings-beta-alanine-caffeine", "/products/cellucor-c4-original-pre-workout-30-servings-c4-energy-caffeine"],
  //    1 clicks ·  542 impr
  ["/products/gat-sport-essentials-zmag-t-90-tablets", "/products/gat-sport-essentials-cyclic-dextrin-750g-30-servings"],
  //    1 clicks ·  377 impr · reviewed by hand
  ["/products/kirkland-signature-daily-multi-500-tablets", "/collections/multivitamin"],
  //    1 clicks ·  320 impr
  ["/products/optimum-nutrition-100-whey-gold-standard-2lb", "/products/optimum-nutrition-100-whey-gold-standard-4-23-lbs-whey-protein"],
  //    1 clicks ·  238 impr
  ["/products/proscience-100-whey-anabolic-whey-protein-isolate", "/products/proscience-nutra-100-whey-anabolic-whey-protein-isolate"],
  //    1 clicks ·  237 impr
  ["/products/mhp-t-bomb-3xtreme-clinical-strength-168-tablets", "/products/mhp-t-bomb-3xtreme-clinical-strength-168-tablets-tesyosterone-formula"],
  //    1 clicks ·  191 impr
  ["/products/nutrex-research-anabol-hardcore-anabolic-activator-60tablets", "/products/nutrex-research-anabol-hardcore-anabolic-activator-60-tablets"],
  //    1 clicks ·  182 impr
  ["/products/musclemeds-carnivor-beef-protein-isolate-4lb", "/products/musclemeds-carnivor-beef-protein-isolate-2-lbs-100-beef-protein"],
  //    1 clicks ·  177 impr
  ["/products/gat-sport-flexx-eaas-hydration", "/products/gat-sport-flexx-eaas-hydration-essential-amino-acids"],
  //    1 clicks ·  172 impr
  ["/products/gat-sport-essentials-joint-support-60-tablets", "/products/gat-sport-essentials-cyclic-dextrin-750g-30-servings"],
  //    1 clicks ·  155 impr · reviewed by hand
  ["/products/muscle-meds-carnivor-mass-6lb-beef-protein-gainer", "/products/musclemeds-carnivor-mass-6-lbs-beef-protein-mass-gainer"],
  //    1 clicks ·  151 impr · reviewed by hand
  ["/products/gat-sport-testrol-gold-testosterone-booster-60-tablets", "/products/gat-sport-testrol-gold-es-60-tablets"],
  //    1 clicks ·  123 impr
  ["/products/optimum-nutrition-opti-women", "/products/optimum-nutrition-opti-women-multivitamin-for-active-women-60-capsules"],
  //    1 clicks ·  119 impr
  ["/products/dymatize-iso-100-hydrolyzed-protein-powder-5lbs", "/products/dymatize-iso-100-hydrolyzed-protein-powder-100-whey-protein-isolate"],
  //    1 clicks ·  118 impr
  ["/products/muscle-rulz-isorulz-5lbs-whey-protein-isolate", "/products/muscle-rulz-isorulz-5lbs-whey-protein-isolate-75-servings"],
  //    1 clicks ·  106 impr
  ["/products/kirkland-signature-chewable-vitamin-c-500-mg-tangy-orange-taste-500-tablets", "/collections/multivitamin"],
  //    1 clicks ·   97 impr
  ["/products/mhp-maximum-whey-100-whey-protein-complex-5lbs", "/products/mhp-maximum-whey-100-whey-protein-complex-5-lbs"],
  //    1 clicks ·   96 impr
  ["/products/gat-sport-pmp-30-servings-peak-muscle-performance", "/products/gat-sport-pmp-stim-free-pre-workout-30-servings-1"],
  //    1 clicks ·   95 impr · reviewed by hand
  ["/products/%D9%85%D8%B4%D8%B1%D9%88%D8%A8-%D8%A7%D9%84%D8%B7%D8%A7%D9%82%D8%A9-%D9%88%D8%A7%D9%84%D8%A3%D8%AF%D8%A7%D8%A1-%D9%85%D9%86-%D8%AC%D9%8A%D8%AA-%D9%81%D9%8A%D9%88%D9%84-%D8%B9%D8%A8%D9%88%D8%A9-%D9%85%D9%86-12-%D9%82%D8%B7%D8%B9%D8%A9", "/collections/gat-sport"],
  //    1 clicks ·   92 impr
  ["/products/dynamik-prey-5lbs-whey-protein-king-kai-series", "/products/dynamik-prey-whey-protein-5lbs-superior-whey-protein"],
  //    1 clicks ·   89 impr
  ["/products/proscience-nutra-isolate-5-lbs-chocolate", "/collections/proscience"],
  //    1 clicks ·   79 impr
  ["/products/mutant-caffeine-pharmaceutical-grade-caffeine-pills-240-tablets", "/collections/mutant"],
  //    1 clicks ·   76 impr
  ["/products/gat-sport-jetfuel-pyro-120-capsules", "/products/gat-sport-jetfuel-pyro-120-oil-infused-capsules"],
  //    1 clicks ·   76 impr
  ["/products/jnx-sports-the-ripper-30-servings", "/products/jnx-sports-the-ripper-30-servings-pre-workout-with-fat-burner"],
  //    1 clicks ·   74 impr
  ["/products/enhanced-ramys-rage-stim-reloaded-pre-workout-30-servings", "/collections/enhanced"],
  //    1 clicks ·   74 impr
  ["/products/optimum-nutrition-pro-gainer-high-protein-weight-gainer", "/collections/optimum-nutrition"],
  //    1 clicks ·   73 impr
  ["/products/core-champs-pro-matrix-5-lbs-ultra-premium-protein-matrix", "/collections/core-champs"],
  //    1 clicks ·   71 impr
  ["/products/cellucor-c4-original-pre-workout-60-servings", "/products/cellucor-c4-original-pre-workout-75-servings"],
  //    1 clicks ·   68 impr
  ["/products/optimum-nutrition-platinum-hydrowhey-3-5-lbs-whey-protein", "/products/optimum-nutrition-platinum-hydrowhey-protein-powder-20-servings"],
  //    1 clicks ·   66 impr
  ["/products/optimum-nutrition-pro-gainer", "/collections/optimum-nutrition"],
  //    1 clicks ·   63 impr
  ["/products/enhanced-labs-carb-tech-creatine-40-serving", "/collections/enhanced"],
  //    1 clicks ·   58 impr
  ["/products/mutant-pro-whey-protein-blend-5-lbs", "/products/mutant-pro-whey-protein-blend-5-lbs-whey-protein-matrix"],
  //    1 clicks ·   56 impr
  ["/products/muscle-rulz-l-arginine-1000mg-free-form-amino-acid", "/products/muscle-rulz-l-arginine-1000mg-free-form-amino-acid-180-capsules"],
];
