"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, getLocale, localizePath, type Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Provides the active locale + its UI dictionary to client components. Set once
 * in app/[lang]/layout.tsx from the resolved route params, so the whole client
 * tree (Header, Footer, ProductCard, …) can read locale-aware strings and build
 * locale-prefixed links without threading params through every component.
 */
export function LocaleProvider({
  code,
  dict,
  children,
}: {
  code: string;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const locale = getLocale(code);
  return (
    <LocaleContext.Provider value={{ locale, dict }}>
      {children}
    </LocaleContext.Provider>
  );
}

/** Active locale (falls back to default outside a provider, e.g. in tests). */
export function useLocale(): Locale {
  return useContext(LocaleContext)?.locale ?? DEFAULT_LOCALE;
}

/** Active UI dictionary. Throws if used outside the provider (a real bug). */
export function useDict(): Dictionary {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useDict must be used within a LocaleProvider");
  return ctx.dict;
}

/** Prefix a site-relative path for the active locale (client-side). */
export function useLocalizePath(): (path: string) => string {
  const locale = useLocale();
  return (path: string) => localizePath(path, locale);
}

/**
 * Translate a nav entry by its collection handle. nav.ts owns the structure and
 * the English copy; the dictionary supplies translations keyed by handle. An
 * untranslated handle falls back to the English label rather than rendering
 * blank, so adding a collection to nav.ts can never break the menu.
 */
export function useNavLabel(): (handle: string, fallback: string) => string {
  const dict = useDict();
  return (handle, fallback) => dict.nav.labels[handle] ?? fallback;
}
