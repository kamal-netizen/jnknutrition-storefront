"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, useCallback } from "react";
import type { ComponentProps } from "react";
import { useLocalizePath } from "@/lib/locale-context";

type NextLinkProps = ComponentProps<typeof NextLink>;

/**
 * Hrefs already warmed this page load. Shared across every LocaleLink instance
 * because a product card stacks several links on the same target (image, title,
 * stretched overlay) — a per-instance guard would let one hover fire the same
 * prefetch once per link.
 */
const warmed = new Set<string>();

/**
 * Drop-in replacement for `next/link` that prefixes internal, root-relative
 * hrefs with the active locale (e.g. `/products` → `/ar/products` on the Arabic
 * site). External URLs, hash links, and protocol-relative URLs pass through
 * untouched. For the default (un-prefixed) locale this is a no-op, so the
 * English site behaves exactly as before.
 *
 * Adopt by swapping `import Link from "next/link"` →
 * `import Link from "@/components/LocaleLink"`; every existing `href="/…"`
 * call site keeps working with no other change.
 *
 * Prefetching is switched from next/link's viewport default to hover/focus
 * intent. A product grid puts 60+ links on screen, and the viewport default
 * fires a full RSC prefetch for every one of them — 60+ edge requests and
 * function invocations per scroll, for a visitor who clicked nothing. Hover
 * still lands well before the click, so navigation feels the same while the
 * request volume drops to the one or two links a visitor actually considers.
 * Pass `prefetch` explicitly to opt a specific link back into the default.
 */
const LocaleLink = forwardRef<HTMLAnchorElement, NextLinkProps>(
  function LocaleLink({ href, prefetch, onMouseEnter, onFocus, onTouchStart, ...rest }, ref) {
    const localize = useLocalizePath();
    const router = useRouter();

    let localizedHref = href;
    if (typeof href === "string") {
      localizedHref = shouldLocalize(href) ? localize(href) : href;
    } else if (href && typeof href === "object" && typeof href.pathname === "string") {
      localizedHref = shouldLocalize(href.pathname)
        ? { ...href, pathname: localize(href.pathname) }
        : href;
    }

    // Only internal string hrefs are worth warming; external URLs and object
    // hrefs fall through to whatever next/link does on its own.
    const warm = useCallback(() => {
      if (prefetch !== undefined || typeof localizedHref !== "string") return;
      if (!localizedHref.startsWith("/") || localizedHref.startsWith("//")) return;
      if (warmed.has(localizedHref)) return;
      warmed.add(localizedHref);
      router.prefetch(localizedHref);
    }, [localizedHref, prefetch, router]);

    return (
      <NextLink
        ref={ref}
        href={localizedHref}
        prefetch={prefetch ?? false}
        onMouseEnter={(e) => {
          warm();
          onMouseEnter?.(e);
        }}
        onFocus={(e) => {
          warm();
          onFocus?.(e);
        }}
        onTouchStart={(e) => {
          warm();
          onTouchStart?.(e);
        }}
        {...rest}
      />
    );
  }
);

/** Only prefix internal, root-relative paths ("/foo"), never "//", "#", or URLs. */
function shouldLocalize(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

export default LocaleLink;
