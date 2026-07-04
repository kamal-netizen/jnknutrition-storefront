// ─── Free shipping ───────────────────────────────────────────────────────────
// Single source of truth for the free-shipping threshold. Keep this in sync
// with any copy shown to customers (announcement bar, footer, FAQ, etc.).

export const FREE_SHIPPING_THRESHOLD = 149;
export const FREE_SHIPPING_CURRENCY = "AED";

/** Amount left to reach free shipping. Returns 0 once the threshold is met. */
export function freeShippingRemaining(subtotal: number): number {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  return remaining > 0 ? remaining : 0;
}

/** Progress toward free shipping as a 0–1 fraction. */
export function freeShippingProgress(subtotal: number): number {
  if (subtotal <= 0) return 0;
  const fraction = subtotal / FREE_SHIPPING_THRESHOLD;
  return fraction > 1 ? 1 : fraction;
}
