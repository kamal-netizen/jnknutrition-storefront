"use client";

// The module root re-exports createToastManager as a *type* only; the value
// lives on the Toast namespace.
import { Toast } from "@base-ui/react/toast";

/**
 * Module-level toast manager, so code that isn't a React component can raise a
 * toast — the Zustand cart store being the reason this exists.
 *
 * Wired into the tree by <Toaster /> (app/[lang]/layout.tsx) via
 * `<Toast.Provider toastManager={toastManager}>`. Components rendered inside
 * that provider can use `Toast.useToastManager()` instead.
 */
export const toastManager = Toast.createToastManager();
