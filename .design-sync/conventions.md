## Setup

No provider/root wrapper is required — components read Tailwind CSS custom properties directly, not React context. Just import and use: `import { Button } from 'storefront'`.

## Styling idiom: Tailwind v4 utility classes + `cn()`

Every component takes a `className` prop merged via `cn()` (clsx + tailwind-merge) — pass Tailwind utility classes to override or extend styling; last class wins on conflicting utilities.

Design tokens are CSS custom properties consumed through Tailwind's semantic color/radius utilities (never raw hex or `var(--*)` in JSX):

| Token family | Utility examples |
|---|---|
| Brand/primary | `bg-primary`, `text-primary-foreground` |
| Secondary | `bg-secondary`, `text-secondary-foreground` |
| Destructive | `bg-destructive`, `text-destructive` |
| Surface | `bg-background`, `bg-muted`, `border-border`, `border-input` |
| Radius | `rounded-lg` (components use `--radius`-derived scale, not arbitrary values) |

Component variant props (`variant`, `size`) are the primary styling lever, not ad-hoc classes — e.g. `<Button variant="secondary" size="sm">`. Only reach for `className` to adjust layout (spacing, width), not to re-theme a component.

## Component API surface

- **Button** — `variant`: `default | outline | secondary | ghost | destructive | link`; `size`: `xs | sm | default | lg | icon | icon-xs | icon-sm | icon-lg`.
- **Badge** — `variant`: `default | secondary | destructive | outline | ghost | link`.
- **Input** — standard `<input>` props; styled via the shared border/ring token set.
- **Separator**, **Skeleton** — no variant props; layout-only via `className`.
- **Sheet** — compound: `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose` — compose together, not standalone.

## Where the truth lives

Read `styles.css` and its `@import` closure (`_ds_bundle.css`) for the full compiled token set before styling. Per-component `.d.ts` files are the authoritative prop contracts.

## Example

```tsx
import { Button, Badge } from 'storefront';

function ProductCard() {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary">In stock</Badge>
      <Button variant="default" size="sm">Add to cart</Button>
    </div>
  );
}
```
