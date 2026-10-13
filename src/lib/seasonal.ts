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

const DIWALI = {
  /** Manual kill switch. Set false to pull everything regardless of the date. */
  enabled: true,
  // Gulf time. Covers Dhanteras (6 Nov) through Bhai Dooj (11 Nov) around
  // Diwali itself on Sunday 8 November 2026. `end` is exclusive.
  start: Date.parse("2026-11-01T00:00:00+04:00"),
  end: Date.parse("2026-11-13T00:00:00+04:00"),
  /** Locale codes (see lib/i18n.ts) that show it. Add "ar" to extend to /ar. */
  locales: ["en-ae"] as readonly string[],
};

/**
 * Whether the Diwali homepage band and header garland render for `localeCode`.
 *
 * `SEASONAL_PREVIEW=diwali` forces the window open (still respecting the kill
 * switch and the locale list) so the decoration can be reviewed before it goes
 * live. It is unset everywhere by default.
 */
export function isDiwaliLive(localeCode: string, now = Date.now()): boolean {
  if (!DIWALI.enabled || !DIWALI.locales.includes(localeCode)) return false;
  if (process.env.SEASONAL_PREVIEW === "diwali") return true;
  return now >= DIWALI.start && now < DIWALI.end;
}
