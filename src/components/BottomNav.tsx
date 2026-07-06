"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCartStore, useCartCount } from "@/lib/store/cart";
import { useUIStore } from "@/lib/store/ui";

/**
 * App-style bottom navigation bar. Mobile only (`md:hidden`). Hidden on product
 * pages while the sticky add-to-cart bar is visible (see globals.css) so the two
 * never stack. Coordinates with the floating search pill, which is lifted above
 * this bar on mobile.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const cartCount = useCartCount();
  const { openCart } = useCartStore();
  const openMenu = useUIStore((s) => s.openMenu);

  const isHome = pathname === "/";
  const isAccount = pathname.startsWith("/account");

  return (
    <nav
      className="jnk-bottom-nav md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8F0] bg-white/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(11,15,20,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg items-stretch">
        <NavItem as="link" href="/" icon={Home} label="Home" active={isHome} />
        <NavItem
          as="button"
          onClick={openMenu}
          icon={LayoutGrid}
          label="Categories"
        />
        <NavItem
          as="button"
          onClick={openCart}
          icon={ShoppingBag}
          label="Cart"
          badge={cartCount}
        />
        <NavItem
          as="link"
          href="/account"
          icon={User}
          label="Account"
          active={isAccount}
        />
      </div>
    </nav>
  );
}

type NavItemProps = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: number;
} & (
  | { as: "link"; href: string; onClick?: never }
  | { as: "button"; onClick: () => void; href?: never }
);

function NavItem({
  icon: Icon,
  label,
  active = false,
  badge = 0,
  ...rest
}: NavItemProps) {
  const content = (
    <>
      {/* Active top indicator */}
      <span
        className={`absolute top-0 h-0.5 w-8 rounded-full bg-[#F9D20F] transition-opacity duration-200 ${
          active ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      />

      {/* Icon chip */}
      <span
        className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 ${
          active
            ? "bg-[#F9D20F]/15 text-[#0B0F14]"
            : "text-[#94A3B8] group-hover:text-[#0B0F14]"
        }`}
      >
        <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
        {badge > 0 && (
          <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F9D20F] px-1 text-[10px] font-black leading-none text-[#0B0F14] ring-2 ring-white">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>

      <span
        className={`text-[10px] font-bold uppercase tracking-wide transition-colors duration-200 ${
          active ? "text-[#0B0F14]" : "text-[#94A3B8] group-hover:text-[#0B0F14]"
        }`}
      >
        {label}
      </span>
    </>
  );

  const className =
    "group relative flex flex-1 flex-col items-center justify-center gap-0.5 pt-2 pb-1.5";

  if (rest.as === "link") {
    return (
      <Link
        href={rest.href}
        className={className}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={rest.onClick} className={className}>
      {content}
    </button>
  );
}
