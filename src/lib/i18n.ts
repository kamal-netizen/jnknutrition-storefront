// ─── Locale configuration ────────────────────────────────────────────────────
// The default locale (en-ae) is served WITHOUT a URL prefix so existing English
// URLs and their rankings are untouched. Additional locales get a path prefix
// (e.g. /ar). Shopify serves translated content + market context via
// @inContext(language, country). See src/proxy.ts for the as-needed prefixing.

export type Locale = {
  /** Internal [lang] segment value + Shopify-independent id. */
  code: string;
  /** URL prefix; "" for the default locale, "/ar" otherwise. */
  prefix: string;
  /** <html lang> value. */
  htmlLang: string;
  /** hreflang value emitted in alternates. */
  hrefLang: string;
  dir: "ltr" | "rtl";
  /** Shopify Storefront LanguageCode enum value. */
  shopifyLanguage: string;
  /** Shopify Storefront CountryCode enum value. */
  shopifyCountry: string;
  isDefault: boolean;
};

export const LOCALES: Locale[] = [
  {
    code: "en-ae",
    prefix: "",
    htmlLang: "en",
    hrefLang: "en-ae",
    dir: "ltr",
    shopifyLanguage: "EN",
    shopifyCountry: "AE",
    isDefault: true,
  },
  {
    code: "ar",
    prefix: "/ar",
    htmlLang: "ar",
    hrefLang: "ar",
    dir: "rtl",
    shopifyLanguage: "AR",
    shopifyCountry: "AE",
    isDefault: false,
  },
];

export const DEFAULT_LOCALE = LOCALES[0];

/** Internal segment codes used by app/[lang] and generateStaticParams. */
export const LOCALE_CODES = LOCALES.map((l) => l.code);

/** Non-default URL prefixes (without leading slash), e.g. ["ar"]. */
export const LOCALE_PREFIXES = LOCALES.filter((l) => !l.isDefault).map((l) =>
  l.prefix.replace(/^\//, "")
);

/** Resolve a [lang] segment value to a Locale, falling back to the default. */
export function getLocale(code: string | undefined): Locale {
  return LOCALES.find((l) => l.code === code) ?? DEFAULT_LOCALE;
}

/** Resolve a Locale from a full pathname by inspecting its first segment. */
export function localeFromPathname(pathname: string): Locale {
  const seg = pathname.split("/")[1] ?? "";
  return (
    LOCALES.find((l) => !l.isDefault && l.prefix === `/${seg}`) ?? DEFAULT_LOCALE
  );
}

/**
 * Strip any locale prefix from a pathname, returning the default-locale
 * (un-prefixed) form — e.g. "/ar/collections/x" → "/collections/x", "/ar" → "/".
 */
export function stripLocalePrefix(pathname: string): string {
  for (const l of LOCALES) {
    if (l.isDefault) continue;
    if (pathname === l.prefix) return "/";
    if (pathname.startsWith(`${l.prefix}/`)) return pathname.slice(l.prefix.length);
  }
  return pathname || "/";
}

/** Prefix a site-relative path for a locale (default locale → path unchanged). */
export function localizePath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale.isDefault) return clean;
  return clean === "/" ? locale.prefix : `${locale.prefix}${clean}`;
}

/**
 * Build the hreflang alternates map for a default-locale (un-prefixed) path.
 * Values are relative; metadataBase resolves them to absolute URLs.
 */
export function hreflangAlternates(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of LOCALES) out[l.hrefLang] = localizePath(path, l);
  out["x-default"] = localizePath(path, DEFAULT_LOCALE);
  return out;
}
