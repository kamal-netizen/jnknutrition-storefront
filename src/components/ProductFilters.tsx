"use client";

import Link from "@/components/LocaleLink";
import { useState } from "react";
import { SlidersHorizontal, Check, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  type ActiveFilters,
  type SortOption,
  PRICE_BUCKETS,
  buildFilterHref,
  toggleValue,
  hasAnyActiveFilter,
} from "@/lib/product-filters";

export type FacetValue = { value: string; label: string; count?: number };

type Props = {
  basePath: string;
  filters: ActiveFilters;
  sortOptions: SortOption[];
  vendors: FacetValue[];
  productTypes: FacetValue[];
  resultCount: number;
};

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[#E2E8F0] pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0B0F14] mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function CheckRow({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className="group flex items-center justify-between gap-2 py-1.5 text-sm"
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
            active
              ? "border-[#F9D20F] bg-[#F9D20F] text-[#0B0F14]"
              : "border-[#CBD5E1] bg-white group-hover:border-[#F9D20F]"
          }`}
        >
          {active && <Check className="h-3 w-3" strokeWidth={3} />}
        </span>
        <span
          className={`truncate transition-colors ${
            active
              ? "font-semibold text-[#0B0F14]"
              : "text-[#475569] group-hover:text-[#0B0F14]"
          }`}
        >
          {label}
        </span>
      </span>
      {typeof count === "number" && (
        <span className="shrink-0 text-xs text-[#94A3B8]">{count}</span>
      )}
    </Link>
  );
}

function FilterPanel({
  basePath,
  filters,
  sortOptions,
  vendors,
  productTypes,
}: Omit<Props, "resultCount">) {
  const hrefWith = (patch: Partial<ActiveFilters>) =>
    buildFilterHref(basePath, { ...filters, ...patch });

  return (
    <div className="space-y-5">
      {/* Availability */}
      <Group title="Availability">
        <CheckRow
          href={hrefWith({ includeSoldOut: !filters.includeSoldOut })}
          active={filters.includeSoldOut}
          label="Include out of stock"
        />
      </Group>

      {/* On sale */}
      <Group title="Offers">
        <CheckRow
          href={hrefWith({ onSale: !filters.onSale })}
          active={filters.onSale}
          label="On sale only"
        />
      </Group>

      {/* Price */}
      <Group title="Price">
        <div className="flex flex-col gap-1">
          {PRICE_BUCKETS.map((bucket) => {
            const active = filters.price?.id === bucket.id;
            return (
              <CheckRow
                key={bucket.id}
                href={hrefWith({ price: active ? null : bucket })}
                active={active}
                label={bucket.label}
              />
            );
          })}
        </div>
      </Group>

      {/* Brands */}
      {vendors.length > 0 && (
        <Group title="Brand">
          <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto pr-1">
            {vendors.map((v) => {
              const active = filters.vendors.includes(v.value);
              return (
                <CheckRow
                  key={v.value}
                  href={hrefWith({
                    vendors: toggleValue(filters.vendors, v.value),
                  })}
                  active={active}
                  label={v.label}
                  count={v.count}
                />
              );
            })}
          </div>
        </Group>
      )}

      {/* Categories */}
      {productTypes.length > 0 && (
        <Group title="Category">
          <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto pr-1">
            {productTypes.map((t) => {
              const active = filters.productTypes.includes(t.value);
              return (
                <CheckRow
                  key={t.value}
                  href={hrefWith({
                    productTypes: toggleValue(filters.productTypes, t.value),
                  })}
                  active={active}
                  label={t.label}
                  count={t.count}
                />
              );
            })}
          </div>
        </Group>
      )}

      {/* Sort (mobile-friendly duplicate; hidden on desktop where a top bar exists) */}
      <Group title="Sort By">
        <div className="flex flex-col gap-1">
          {sortOptions.map((option) => {
            const active =
              (filters.sortLabel || sortOptions[0].label) === option.label;
            return (
              <CheckRow
                key={option.label}
                href={hrefWith({
                  sortLabel:
                    option.label === sortOptions[0].label ? "" : option.label,
                })}
                active={active}
                label={option.label}
              />
            );
          })}
        </div>
      </Group>
    </div>
  );
}

export function ProductFilterChips({
  basePath,
  filters,
}: Pick<Props, "basePath" | "filters">) {
  if (!hasAnyActiveFilter(filters)) return null;

  const chips: { key: string; label: string; href: string }[] = [];
  const hrefWith = (patch: Partial<ActiveFilters>) =>
    buildFilterHref(basePath, { ...filters, ...patch });

  if (filters.includeSoldOut)
    chips.push({
      key: "sold",
      label: "Incl. out of stock",
      href: hrefWith({ includeSoldOut: false }),
    });
  if (filters.onSale)
    chips.push({ key: "sale", label: "On sale", href: hrefWith({ onSale: false }) });
  if (filters.price)
    chips.push({
      key: "price",
      label: filters.price.label,
      href: hrefWith({ price: null }),
    });
  for (const v of filters.vendors)
    chips.push({
      key: `v-${v}`,
      label: v,
      href: hrefWith({ vendors: filters.vendors.filter((x) => x !== v) }),
    });
  for (const t of filters.productTypes)
    chips.push({
      key: `t-${t}`,
      label: t,
      href: hrefWith({ productTypes: filters.productTypes.filter((x) => x !== t) }),
    });

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          scroll={false}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#0B0F14] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#F9D20F] hover:text-[#0B0F14]"
        >
          {chip.label}
          <X className="h-3 w-3" strokeWidth={3} />
        </Link>
      ))}
      <Link
        href={buildFilterHref(basePath, {
          ...filters,
          includeSoldOut: false,
          onSale: false,
          price: null,
          vendors: [],
          productTypes: [],
        })}
        scroll={false}
        className="text-xs font-semibold text-[#64748B] underline underline-offset-2 hover:text-[#0B0F14]"
      >
        Clear all
      </Link>
    </div>
  );
}

export default function ProductFilters(props: Props) {
  const [open, setOpen] = useState(false);
  const activeCount =
    props.filters.vendors.length +
    props.filters.productTypes.length +
    (props.filters.price ? 1 : 0) +
    (props.filters.onSale ? 1 : 0) +
    (props.filters.includeSoldOut ? 1 : 0);

  return (
    <>
      {/* Mobile: trigger + drawer */}
      <div className="lg:hidden mb-5 flex items-center justify-between gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="inline-flex items-center gap-2 rounded-full border-2 border-[#0B0F14] bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-[#0B0F14] cursor-pointer">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F9D20F] px-1.5 text-xs font-black text-[#0B0F14]">
                {activeCount}
              </span>
            )}
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[86%] max-w-sm overflow-y-auto p-0"
          >
            <SheetHeader className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-white p-5">
              <SheetTitle className="text-lg font-black uppercase tracking-tight text-[#0B0F14]">
                Filters
              </SheetTitle>
              <p className="text-sm text-[#64748B]">
                {props.resultCount} products
              </p>
            </SheetHeader>
            <div className="p-5">
              <FilterPanel {...props} />
            </div>
          </SheetContent>
        </Sheet>
        <span className="text-sm text-[#64748B]">
          {props.resultCount} products
        </span>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-64 shrink-0">
        <div className="sticky top-24 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[#F9D20F]" />
            <span className="text-sm font-black uppercase tracking-widest text-[#0B0F14]">
              Filters
            </span>
          </div>
          <FilterPanel {...props} />
        </div>
      </aside>
    </>
  );
}
