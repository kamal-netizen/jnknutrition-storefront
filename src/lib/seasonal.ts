// ─── Seasonal decoration windows ─────────────────────────────────────────────
// Festive dressing that switches itself on and off by date, so nobody has to
// remember to deploy on the first morning of a festival or to take it down
// afterwards.
//
// The check runs whenever a page is generated, not on every request, so a
// window opens and closes on each page's own revalidate schedule: within 30
// minutes for the homepage, products, collections and brands, within a day for
// the content pages, and immediately for search. The cart, news and wholesale
// pages are fully static and only change on a deploy — deploy once after the
// window opens and once after it closes.

const NATIONAL_DAY = {
  /** Manual kill switch. Set false to pull everything regardless of the date. */
  enabled: true,
  // Gulf time. From 24 November, the run-up through Commemoration Day (30 Nov)
  // and the Eid Al Etihad holiday around the 55th National Day on Wednesday
  // 2 December 2026. `end` is exclusive.
  start: Date.parse("2026-11-24T00:00:00+04:00"),
  end: Date.parse("2026-12-05T00:00:00+04:00"),
  /** Locale codes (see lib/i18n.ts) that show it. Both are UAE storefronts. */
  locales: ["en-ae", "ar"] as readonly string[],
};

/**
 * The National Day stylesheet, outside the global bundle so it costs nothing
 * while the theme is off (see the header of the file itself). Served immutable
 * for a year: an edit to the file needs a new name here as well.
 */
export const NATIONAL_DAY_CSS = "/seasonal/national-day-2026.css";

/**
 * Whether the National Day bunting and homepage band render for `localeCode`.
 * Decoration only: no offers page or discount goes with it.
 *
 * `SEASONAL_PREVIEW=national-day` forces the window open (still respecting the
 * kill switch and the locale list) so the decoration can be reviewed before it
 * goes live. It is unset everywhere by default.
 */
export function isNationalDayLive(localeCode: string, now = Date.now()): boolean {
  if (!NATIONAL_DAY.enabled || !NATIONAL_DAY.locales.includes(localeCode)) return false;
  if (process.env.SEASONAL_PREVIEW === "national-day") return true;
  return now >= NATIONAL_DAY.start && now < NATIONAL_DAY.end;
}
