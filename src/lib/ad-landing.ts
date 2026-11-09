// Products kept off the pages Google Ads campaigns point at — the homepage
// strips — while staying live on their own page
// and in collections. Google Ads checks an ad's destination and limits it for
// "unapproved substances" while one of these shows there.
export const AD_LANDING_HIDDEN = new Set([
  "musclemeds-nitro-lift-pre-workout-strength-performance",
]);

export const notAdHidden = (p: { handle: string }) => !AD_LANDING_HIDDEN.has(p.handle);
