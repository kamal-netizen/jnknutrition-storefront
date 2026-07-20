"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { LOCALES, stripLocalePrefix, localizePath } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";

/**
 * EN ⇄ العربية switcher. Maps the current path to its equivalent in the other
 * locale (e.g. `/ar/collections/x` ⇄ `/collections/x`). Deliberately does NOT
 * read `useSearchParams()` — that would force a Suspense boundary on every
 * statically-prerendered page (the toggle lives in the site-wide Header). A
 * language switch drops any filter query and lands on the clean localized page,
 * which is the sensible behavior anyway. Uses a plain `next/link` (not
 * LocaleLink) because it builds fully-qualified target paths itself.
 */
export default function LanguageToggle({
  className = "",
  variant = "inline",
}: {
  className?: string;
  variant?: "inline" | "block";
}) {
  const active = useLocale();
  const pathname = usePathname();

  const basePath = stripLocalePrefix(pathname);
  const suffix = "";

  if (variant === "block") {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {LOCALES.map((l) => {
          const isActive = l.code === active.code;
          const href = `${localizePath(basePath, l)}${suffix}`;
          const label = l.htmlLang === "ar" ? "العربية" : "English";
          return (
            <Link
              key={l.code}
              href={href}
              hrefLang={l.hrefLang}
              aria-current={isActive ? "true" : undefined}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[#082D4C] text-white"
                  : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B0F14]"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    );
  }

  // Inline: a single control that flips to the *other* locale.
  const other = LOCALES.find((l) => l.code !== active.code) ?? active;
  const href = `${localizePath(basePath, other)}${suffix}`;
  const otherLabel = other.htmlLang === "ar" ? "العربية" : "EN";

  return (
    <Link
      href={href}
      hrefLang={other.hrefLang}
      aria-label={
        other.htmlLang === "ar" ? "التبديل إلى العربية" : "Switch to English"
      }
      className={`inline-flex items-center gap-1.5 text-[#64748B] transition-colors hover:text-[#0B0F14] ${className}`}
    >
      <Globe className="h-5 w-5" />
      <span className="text-sm font-semibold">{otherLabel}</span>
    </Link>
  );
}
