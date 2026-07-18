"use client";

import Link from "next/link";
import { useState } from "react";
import { Filter, X, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SORT_OPTIONS } from "@/app/[lang]/search/constants";

type FacetValue = {
  id: string;
  label: string;
  input: string;
  count: number;
};

type Facet = {
  id: string;
  label: string;
  values: FacetValue[];
};

type Props = {
  query: string;
  sortLabel: string;
  selectedFilters: string[];
  facets: Facet[];
  resultCount: number;
};

function buildHref(query: string, sortLabel: string, filters: string[]): string {
  const params = new URLSearchParams();
  params.set("q", query);
  if (sortLabel !== SORT_OPTIONS[0].label) params.set("sort", sortLabel);
  for (const filter of filters) params.append("filter", filter);
  return `/search?${params.toString()}`;
}

export default function SearchFilters({
  query,
  sortLabel,
  selectedFilters,
  facets,
  resultCount,
}: Props) {
  const [open, setOpen] = useState(false);

  const activeFilters = selectedFilters.length;
  const labelByInput = new Map(
    facets.flatMap((facet) =>
      facet.values.map((value) => [value.input, value.label] as const)
    )
  );

  return (
    <div className="lg:hidden mb-5 flex items-center gap-3">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#0B0F14] bg-white px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#0B0F14] cursor-pointer transition-colors active:bg-[#0B0F14] active:text-white">
          <Filter className="h-4 w-4" />
          Filters & Sort
          {activeFilters > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F9D20F] px-1.5 text-xs font-black text-[#0B0F14]">
              {activeFilters}
            </span>
          )}
        </SheetTrigger>
        <SheetContent side="left" className="w-[90%] max-w-sm overflow-y-auto p-0">
          <SheetHeader className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-white p-5">
            <SheetTitle className="text-lg font-black uppercase tracking-tight text-[#0B0F14]">
              Filters & Sort
            </SheetTitle>
            <p className="text-sm text-[#64748B]">{resultCount} results</p>
          </SheetHeader>

          <div className="space-y-5 p-5">
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#0B0F14] mb-3">
                Sort By
              </h3>
              <div className="flex flex-col gap-1">
                {SORT_OPTIONS.map((option) => {
                  const href = buildHref(query, option.label, selectedFilters);
                  const isSelected = option.label === sortLabel;
                  return (
                    <Link
                      key={option.label}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors ${
                        isSelected
                          ? "bg-white font-semibold text-[#0B0F14]"
                          : "text-[#64748B] hover:text-[#0B0F14]"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          isSelected ? "border-[#F9D20F]" : "border-[#CBD5E1]"
                        }`}
                      >
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-[#F9D20F]" />
                        )}
                      </span>
                      {option.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {activeFilters > 0 && (
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0B0F14]">
                    Active
                  </h3>
                  <Link
                    href={buildHref(query, sortLabel, [])}
                    onClick={() => setOpen(false)}
                    className="text-xs text-[#64748B] hover:text-[#0B0F14] underline"
                  >
                    Clear all
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedFilters.map((filter) => {
                    const nextFilters = selectedFilters.filter((item) => item !== filter);
                    const label = labelByInput.get(filter) ?? filter;
                    return (
                      <Link
                        key={filter}
                        href={buildHref(query, sortLabel, nextFilters)}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#0B0F14] px-3 py-1 text-xs text-white hover:bg-[#F9D20F] hover:text-[#0B0F14] transition-colors"
                      >
                        {label}
                        <X className="h-3 w-3" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {facets.map((facet) => {
              const seen = new Set<string>();
              const values = facet.values.filter((value) => {
                if (value.count <= 0 || seen.has(value.input)) return false;
                seen.add(value.input);
                return true;
              });

              if (values.length === 0) return null;

              return (
                <div key={facet.id} className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0B0F14] mb-3">
                    {facet.label}
                  </h3>
                  <div className="flex flex-col gap-0.5">
                    {values.map((value) => {
                      const isSelected = selectedFilters.includes(value.input);
                      const nextFilters = isSelected
                        ? selectedFilters.filter((item) => item !== value.input)
                        : [...selectedFilters, value.input];

                      return (
                        <Link
                          key={value.input}
                          href={buildHref(query, sortLabel, nextFilters)}
                          onClick={() => setOpen(false)}
                          className="group flex items-center justify-between gap-2 py-1.5 text-sm"
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                isSelected
                                  ? "border-[#F9D20F] bg-[#F9D20F] text-[#0B0F14]"
                                  : "border-[#CBD5E1] bg-white group-hover:border-[#F9D20F]"
                              }`}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3" strokeWidth={3} />
                              )}
                            </span>
                            <span
                              className={`truncate transition-colors ${
                                isSelected
                                  ? "font-semibold text-[#0B0F14]"
                                  : "text-[#475569] group-hover:text-[#0B0F14]"
                              }`}
                            >
                              {value.label}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs text-[#94A3B8]">
                            {value.count}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      <span className="shrink-0 whitespace-nowrap text-sm text-[#64748B]">
        {resultCount} results
      </span>
    </div>
  );
}