"use client";

import { create } from "zustand";

// ─── Types ───────────────────────────────────────────────────────────────────

type UIStore = {
  /** Whether the mobile navigation drawer is open. */
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  setMenuOpen: (open: boolean) => void;
};

// ─── Store ───────────────────────────────────────────────────────────────────

/**
 * Lightweight UI store for cross-component chrome state (e.g. the mobile menu
 * drawer that lives in the Header but is also opened from the bottom nav).
 */
export const useUIStore = create<UIStore>()((set) => ({
  menuOpen: false,
  openMenu: () => set({ menuOpen: true }),
  closeMenu: () => set({ menuOpen: false }),
  setMenuOpen: (open) => set({ menuOpen: open }),
}));
