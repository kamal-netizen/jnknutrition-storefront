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

type CartStore = {
  cartId: string | null;
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;

  // UI
  openCart: () => void;
  closeCart: () => void;

  // Cart ops
  addLine: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addLine: async (merchandiseId, quantity = 1) => {
        set({ isLoading: true });
        try {
          const { cart, cartId } = await ensureCart(get().cartId);
          const updated = await addCartLine(cartId, merchandiseId, quantity);
          set({ cart: updated, cartId, isOpen: true });
        } finally {
          set({ isLoading: false });
        }
      },

      updateLine: async (lineId, quantity) => {
        const { cartId } = get();
        if (!cartId) return;
        set({ isLoading: true });
        try {
          const updated = await updateCartLine(cartId, lineId, quantity);
          set({ cart: updated });
        } finally {
          set({ isLoading: false });
        }
      },

      removeLine: async (lineId) => {
        const { cartId } = get();
        if (!cartId) return;
        set({ isLoading: true });
        try {
          const updated = await removeCartLine(cartId, lineId);
          set({ cart: updated });
        } finally {
          set({ isLoading: false });
        }
      },

      refreshCart: async () => {
        const { cartId } = get();
        if (!cartId) return;
        const cart = await getCart(cartId);
        if (cart) {
          set({ cart });
        } else {
          // Cart expired — reset
          set({ cart: null, cartId: null });
        }
      },
    }),
    {
      name: "jnk-cart",
      // Only persist the cartId — cart data is always fetched fresh
      partialize: (state) => ({ cartId: state.cartId }),
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
