"use client";

import Image from "next/image";
import Link from "@/components/LocaleLink";
import { useRef, useState, useCallback, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import type { Collection } from "@/lib/queries/collections";
import { useDict } from "@/lib/locale-context";
import {
  GOAL_CARDS,
  CATEGORY_GROUPS,
  MEGA_BRANDS,
  FEATURED_ITEMS,
  TRENDING_SEARCHES,
  SIMPLE_LINKS,
  BADGE_STYLES,
  collectionHref,
  type BadgeTag,
  type GoalCard as GoalCardType,
} from "@/lib/nav";

const CLOSE_DELAY = 120;

type MenuId = "goals" | "category" | "brands" | "featured";

function Badge({ tag }: { tag: BadgeTag }) {
  const b = BADGE_STYLES[tag];
  return (
    <span
      className={`ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase leading-none tracking-wide ${b.className}`}
    >
      {b.label}
    </span>
  );
}

export default function DesktopNav({
  collections,
}: {
  collections: Collection[];
}) {
  const dict = useDict();
  const h = dict.header;
  const c = dict.common;
  const MENUS: { id: MenuId; label: string }[] = [
    { id: "goals", label: h.shopByGoal },
    { id: "category", label: h.shopByCategory },
    { id: "brands", label: h.brands },
    { id: "featured", label: h.featured },
  ];
  const PANEL_TITLES: Record<MenuId, string> = {
    goals: h.shopByGoal,
    category: h.shopByCategory,
    brands: h.brands,
    featured: h.featured,
  };
  const simpleLinkLabel: Record<string, string> = { Blog: h.blog, About: h.about };

  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), CLOSE_DELAY);
  }, [cancelClose]);

  const openAt = useCallback(
    (menu: MenuId) => {
      cancelClose();
      setOpenMenu(menu);
    },
    [cancelClose]
  );

  const close = useCallback(() => setOpenMenu(null), []);

  useEffect(() => cancelClose, [cancelClose]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Match a live collection image by handle for the Featured panel.
  const collectionByHandle = (handle: string) =>
    collections.find((c) => c.handle === handle);

  return (
    <>
      <nav
        className="hidden md:flex items-center gap-7 mr-auto"
        onMouseLeave={scheduleClose}
      >
        {MENUS.map((menu) => {
          const isOpen = openMenu === menu.id;
          return (
            <div key={menu.id} onMouseEnter={() => openAt(menu.id)}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="true"
                onFocus={() => openAt(menu.id)}
                onClick={() =>
                  setOpenMenu((cur) => (cur === menu.id ? null : menu.id))
                }
                className="flex items-center gap-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#475569] hover:text-[#0B0F14] transition-colors relative group py-6 cursor-pointer bg-transparent border-0"
              >
                {menu.label}
                <span
                  className={`absolute bottom-4 left-0 h-0.5 bg-[#F9D20F] transition-all duration-200 ${
                    isOpen ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </button>
            </div>
          );
        })}

        {SIMPLE_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onMouseEnter={close}
            className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#475569] hover:text-[#0B0F14] transition-colors relative group py-6"
          >
            {simpleLinkLabel[link.label] ?? link.label}
            <span className="absolute bottom-4 left-0 w-0 h-0.5 bg-[#F9D20F] transition-all duration-200 group-hover:w-full" />
          </Link>
        ))}
      </nav>

      {/* Mega panel */}
      {openMenu && (
        <div
          className="absolute left-0 right-0 top-full z-40 hidden md:block"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="animate-in fade-in slide-in-from-top-1 duration-200 overflow-hidden rounded-b-[18px] border-x border-b border-[#ECECEC] bg-white shadow-[0_24px_60px_-15px_rgba(11,31,58,0.25)]">
            <div className="max-h-[calc(100vh-6rem)] overflow-y-auto p-8">
              {/* Header row */}
              <div className="mb-6 flex items-center justify-between border-b border-[#ECECEC] pb-4">
                <h2 className="text-lg font-black uppercase tracking-tight text-[#0B0F14]">
                  {PANEL_TITLES[openMenu]}
                </h2>
                <Link
                  href="/products"
                  onClick={close}
                  className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.15em] text-[#082D4C] hover:text-[#0B0F14]"
                >
                  {c.shopAll}
                  <ArrowRight className="w-3.5 h-3.5 text-[#F9D20F] rtl:rotate-180" />
                </Link>
              </div>

              {openMenu === "goals" && <GoalsTab onNavigate={close} />}
              {openMenu === "category" && <CategoryTab onNavigate={close} />}
              {openMenu === "brands" && <BrandsTab onNavigate={close} />}
              {openMenu === "featured" && (
                <FeaturedTab
                  onNavigate={close}
                  collectionByHandle={collectionByHandle}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Goals tab ───────────────────────────────────────────────────────────────

function GoalCardTile({
  goal,
  onNavigate,
}: {
  goal: GoalCardType;
  onNavigate: () => void;
}) {
  const Icon = goal.icon;
  const c = useDict().common;
  return (
    <Link
      href={collectionHref(goal.handle)}
      onClick={onNavigate}
      className="group flex flex-col rounded-xl border border-[#ECECEC] bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[#F9D20F] hover:shadow-[0_16px_30px_-12px_rgba(11,31,58,0.25)]"
    >
      <div className="mb-2 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#082D4C] transition-colors group-hover:bg-[#F9D20F]">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-[#0B0F14] leading-tight">
            {goal.title}
          </h3>
          <p className="text-[11px] text-[#94A3B8] leading-tight">
            {goal.subtitle}
          </p>
        </div>
      </div>
      <ul className="mb-2 flex flex-wrap gap-x-3 gap-y-0.5">
        {goal.items.slice(0, 5).map((item) => (
          <li
            key={item.handle}
            className="flex items-center text-[12px] font-medium text-[#475569]"
          >
            {item.label}
            {item.badge && <Badge tag={item.badge} />}
          </li>
        ))}
      </ul>
      <span className="mt-auto inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#082D4C] group-hover:text-[#0B0F14]">
        {c.explore}
        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
      </span>
    </Link>
  );
}

function GoalsTab({ onNavigate }: { onNavigate: () => void }) {
  const c = useDict().common;
  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {GOAL_CARDS.map((goal) => (
          <GoalCardTile key={goal.id} goal={goal} onNavigate={onNavigate} />
        ))}
      </div>

      <div className="mt-6 border-t border-[#ECECEC] pt-5">
        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.15em] text-[#94A3B8]">
          {c.trendingSearches}
        </p>
        <div className="flex flex-wrap gap-2">
          {TRENDING_SEARCHES.map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              onClick={onNavigate}
              className="rounded-full border border-[#ECECEC] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#475569] transition-colors hover:border-[#F9D20F] hover:bg-[#FAFAFA] hover:text-[#0B0F14]"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Category tab ────────────────────────────────────────────────────────────

function CategoryTab({ onNavigate }: { onNavigate: () => void }) {
  const c = useDict().common;
  return (
    <div className="grid grid-cols-5 gap-6">
      {CATEGORY_GROUPS.map((group) => (
        <div key={group.title}>
          <h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.15em] text-[#94A3B8]">
            {group.title}
          </h3>
          <ul className="space-y-1.5">
            {group.items.map((item) => (
              <li key={item.handle}>
                <Link
                  href={collectionHref(item.handle)}
                  onClick={onNavigate}
                  className="flex items-center text-[15px] font-medium text-[#334155] transition-colors hover:text-[#0B0F14]"
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#F9D20F] transition-all duration-200 group-hover:w-full" />
                  </span>
                  {item.badge && <Badge tag={item.badge} />}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={collectionHref(group.viewAllHandle)}
            onClick={onNavigate}
            className="mt-4 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#082D4C] hover:text-[#0B0F14]"
          >
            {c.viewAll}
            <ArrowRight className="w-3 h-3 rtl:rotate-180" />
          </Link>
        </div>
      ))}
    </div>
  );
}

// ─── Brands tab ──────────────────────────────────────────────────────────────

function BrandsTab({ onNavigate }: { onNavigate: () => void }) {
  const c = useDict().common;
  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {MEGA_BRANDS.map((brand) => (
          <Link
            key={brand.handle}
            href={collectionHref(brand.handle)}
            onClick={onNavigate}
            className="flex h-20 items-center justify-center rounded-xl border border-[#ECECEC] bg-white px-4 text-center text-sm font-black uppercase tracking-tight text-[#64748B] transition-colors hover:border-[#F9D20F] hover:bg-white hover:text-[#0B0F14]"
          >
            {brand.logo ? (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={160}
                height={80}
                className="max-h-12 w-auto object-contain"
              />
            ) : (
              brand.name
            )}
          </Link>
        ))}
      </div>
      <Link
        href="/brands"
        onClick={onNavigate}
        className="mt-5 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#082D4C] hover:text-[#0B0F14]"
      >
        {c.viewAllBrands}
        <ArrowRight className="w-3 h-3 rtl:rotate-180" />
      </Link>
    </div>
  );
}

// ─── Featured tab ────────────────────────────────────────────────────────────

function FeaturedTab({
  onNavigate,
  collectionByHandle,
}: {
  onNavigate: () => void;
  collectionByHandle: (handle: string) => Collection | undefined;
}) {
  const c = useDict().common;
  return (
    <div className="grid grid-cols-3 gap-4">
      {FEATURED_ITEMS.map((item) => {
        const col = collectionByHandle(item.handle);
        return (
          <Link
            key={item.handle}
            href={collectionHref(item.handle)}
            onClick={onNavigate}
            className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-[#082D4C] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F9D20F] hover:shadow-[0_20px_44px_-20px_rgba(8,45,76,0.65)]"
          >
            {col?.image ? (
              <span
                className="absolute inset-0 bg-cover bg-center opacity-45 transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${col.image.url})` }}
              />
            ) : (
              <span className="absolute inset-0 bg-gradient-to-br from-[#0A3B66] via-[#082D4C] to-[#061C31]" />
            )}

            {/* Yellow glow accent */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#F9D20F]/15 blur-2xl transition-opacity duration-300 group-hover:bg-[#F9D20F]/25"
            />
            {/* Bottom scrim for text legibility */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#04182B] via-[#04182B]/55 to-transparent"
            />

            {/* Emoji chip */}
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-xl ring-1 ring-white/15 backdrop-blur-sm transition-colors duration-300 group-hover:bg-[#F9D20F]/20 group-hover:ring-[#F9D20F]/40">
              {item.emoji}
            </span>
            <span className="relative mt-2.5 text-lg font-black uppercase tracking-tight text-white">
              {item.label}
            </span>
            <span className="relative mt-1 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.15em] text-[#F9D20F]">
              {c.shopNow}
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

