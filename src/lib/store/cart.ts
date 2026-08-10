"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import type { Cart } from "@/lib/queries/cart";
import {
  createCart,
  addCartLine,
  updateCartLine,
  removeCartLine,
  getCart,
} from "@/lib/queries/cart";

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Which operation failed. The store deliberately does NOT carry a display
 * string: `src/lib/queries/cart.ts` throws Shopify's own `userErrors` message,
 * which is always English and often internal ("Merchandise is out of stock").
 * The component layer maps this code to translated copy via the dictionary.
 */
export type CartErrorOp = "add" | "update" | "remove" | "refresh";

type CartStore = {
  cartId: string | null;
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  /** Set when an op fails; cleared when one succeeds or the toast is shown. */
  error: CartErrorOp | null;

  // UI
  openCart: () => void;
  closeCart: () => void;
  clearError: () => void;

  // Cart ops
  /** Resolves true when the line was actually added — callers gate their
   *  "Added ✓" state on this, so a failure can't render as a success. */
  addLine: (merchandiseId: string, quantity?: number) => Promise<boolean>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Keeps Shopify's real message reachable in devtools without showing it. */
function logCartError(op: CartErrorOp, error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`[cart] ${op} failed: ${detail}`);
}

async function ensureCart(cartId: string | null): Promise<{
  cart: Cart;
  cartId: string;
  isNew: boolean;
}> {
  if (cartId) {
    const existing = await getCart(cartId);
    if (existing) return { cart: existing, cartId, isNew: false };
  }
  const fresh = await createCart();
  return { cart: fresh, cartId: fresh.id, isNew: true };
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartId: null,
      cart: null,
      isOpen: false,
      isLoading: false,
      error: null,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      clearError: () => set({ error: null }),

      addLine: async (merchandiseId, quantity = 1) => {
        set({ isLoading: true, error: null });
        try {
          const { cartId } = await ensureCart(get().cartId);
          const updated = await addCartLine(cartId, merchandiseId, quantity);
          set({ cart: updated, cartId, isOpen: true });
          return true;
        } catch (error) {
          logCartError("add", error);
          // The drawer stays shut on failure — sliding open an unchanged cart
          // reads as success and is how a silent failure gets mistaken for one.
          set({ error: "add" });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      updateLine: async (lineId, quantity) => {
        const { cartId } = get();
        if (!cartId) return;
        set({ isLoading: true, error: null });
        try {
          const updated = await updateCartLine(cartId, lineId, quantity);
          set({ cart: updated });
        } catch (error) {
          logCartError("update", error);
          set({ error: "update" });
          // The stepper already moved optimistically in the UI; pull the real
          // cart back so the number on screen matches what Shopify holds.
          await get().refreshCart();
        } finally {
          set({ isLoading: false });
        }
      },

      removeLine: async (lineId) => {
        const { cartId } = get();
        if (!cartId) return;
        set({ isLoading: true, error: null });
        try {
          const updated = await removeCartLine(cartId, lineId);
          set({ cart: updated });
        } catch (error) {
          logCartError("remove", error);
          set({ error: "remove" });
          await get().refreshCart();
        } finally {
          set({ isLoading: false });
        }
      },

      refreshCart: async () => {
        const { cartId } = get();
        if (!cartId) return;
        try {
          const cart = await getCart(cartId);
          if (cart) {
            set({ cart });
          } else {
            // Cart expired — reset
            set({ cart: null, cartId: null });
          }
        } catch (error) {
          // Runs on every page load with a stored cart (see onRehydrateStorage),
          // so an unhandled rejection here fires for anyone with a cart the
          // moment Shopify blips. Keep the last known cart on screen.
          logCartError("refresh", error);
        }
      },
    }),
    {
      name: "jnk-cart",
      // Only persist the cartId — cart data is always fetched fresh
      partialize: (state) => ({ cartId: state.cartId }),
      onRehydrateStorage: () => (state) => {
        if (state?.cartId) {
          state.refreshCart();
        }
      },
    }
  )
);

// ─── Derived selectors ───────────────────────────────────────────────────────

export const useCartCount = () =>
  useCartStore((s) => s.cart?.totalQuantity ?? 0);

// Returns a new array via .map() — wrap in useShallow so the reference is
// stable across renders and doesn't break useSyncExternalStore caching.
export const useCartLines = () =>
  useCartStore(
    useShallow((s) => s.cart?.lines.edges.map((e) => e.node) ?? [])
  );

export const useCartTotal = () =>
  useCartStore((s) => s.cart?.cost.totalAmount ?? null);

export const useCartSubtotal = () =>
  useCartStore((s) => s.cart?.cost.subtotalAmount ?? null);

/**
 * Total compare-at savings across all lines (0 when nothing is discounted).
 * Returns the amount and the cart currency code.
 */
export const useCartSavings = () =>
  useCartStore(
    useShallow((s) => {
      const lines = s.cart?.lines.edges ?? [];
      let amount = 0;
      for (const { node: line } of lines) {
        const compareAt = line.merchandise.compareAtPrice;
        if (!compareAt) continue;
        const diff =
          parseFloat(compareAt.amount) -
          parseFloat(line.cost.amountPerQuantity.amount);
        if (diff > 0) amount += diff * line.quantity;
      }
      return {
        amount,
        currencyCode: s.cart?.cost.totalAmount.currencyCode ?? "AED",
      };
    })
  );

export const useCheckoutUrl = () =>
  useCartStore((s) => s.cart?.checkoutUrl ?? null);
