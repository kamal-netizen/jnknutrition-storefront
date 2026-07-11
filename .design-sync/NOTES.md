## Repo shape

This is a Next.js app (`next build --webpack`), not a published component package — no `dist/`, no `main`/`module`/`exports` in `package.json`. The sync uses synth-entry mode via `.ds-entry.mjs` (repo root, re-exports the 6 `src/components/ui/*` primitives) and `cfg.componentSrcMap` to explicitly pin component names, since there's no `.d.ts` export list to scan.

**Scope is intentionally narrow**: only `src/components/ui/` (Badge, Button, Input, Separator, Sheet, Skeleton) is synced. `src/components/home/` and `src/components/account/` were excluded — they're page-specific compositions coupled to `next/link`, `next/navigation`, and Shopify data fetching, not portable design-system components. If the brand later grows a real component library (dedicated card/banner/product components with their own styling, not just page sections), re-scope `cfg.componentSrcMap`/`cfg.srcDir` to include them.

## CSS

`cfg.cssEntry` points at `.design-sync/build-assets/compiled.css`, a **manually copied** snapshot of `next build`'s compiled Tailwind v4 output (`.next/static/css/<hash>.css`) — the raw `src/app/globals.css` only has `@import "tailwindcss"` etc., which the converter can't resolve (those are npm packages, not files). This snapshot is NOT auto-regenerated.

**Re-sync risk**: if the brand's Tailwind theme/tokens change (colors, radius, spacing in `globals.css`'s `@theme` block), `.design-sync/build-assets/compiled.css` goes stale. Before any re-sync, re-run `npm run build` and re-copy the fresh `.next/static/css/<hash>.css` (pick the larger of the two emitted chunks — it's the one with `@layer properties` / tailwindcss header, not the font-face-only chunk) over `.design-sync/build-assets/compiled.css`.

## Entry / package resolution

`.ds-entry.mjs` (repo root, gitignored is NOT set — it's a small durable synth-entry file, committed) re-exports the 6 ui primitives. `cfg.entry` points at it. Do NOT create a `node_modules/storefront` self-junction/symlink pointing back at the repo root — this was tried and caused infinite recursion / OOM during `.d.ts` scanning (ts-morph walked itself forever). The `--entry` override + `componentSrcMap` approach avoids that entirely.

## Preview scope

Only Badge, Button, Input got authored previews (`.design-sync/previews/`) — Separator, Sheet, Skeleton ship as floor cards (functional but unauthored; the API is importable, no rich preview yet). All 3 authored components graded `good`. Authoring more is a fine incremental follow-up — no config changes needed, just add `.design-sync/previews/<Name>.tsx` and re-run the driver.

## Known render warns

None outstanding — render check is fully clean (6/6).
