"use client";

import NextLink from "next/link";
import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { useLocalizePath } from "@/lib/locale-context";

type NextLinkProps = ComponentProps<typeof NextLink>;

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
 */
const LocaleLink = forwardRef<HTMLAnchorElement, NextLinkProps>(
  function LocaleLink({ href, ...rest }, ref) {
    const localize = useLocalizePath();

    let localizedHref = href;
    if (typeof href === "string") {
      localizedHref = shouldLocalize(href) ? localize(href) : href;
    } else if (href && typeof href === "object" && typeof href.pathname === "string") {
      localizedHref = shouldLocalize(href.pathname)
        ? { ...href, pathname: localize(href.pathname) }
        : href;
    }

    return <NextLink ref={ref} href={localizedHref} {...rest} />;
  }
);

/** Only prefix internal, root-relative paths ("/foo"), never "//", "#", or URLs. */
function shouldLocalize(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

export default LocaleLink;
