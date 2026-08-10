"use client";

import { useEffect } from "react";
import { Toast } from "@base-ui/react/toast";
import { X, AlertCircle } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useDict, useLocale } from "@/lib/locale-context";
import { toastManager } from "@/lib/toast";

/**
 * Site-wide toast outlet. Mounted once in app/[lang]/layout.tsx.
 *
 * Anything outside React (the Zustand cart store, say) raises a toast through
 * the module-level `toastManager`; components can use Toast.useToastManager()
 * inside this provider instead.
 */
export default function Toaster() {
  return (
    <Toast.Provider toastManager={toastManager} timeout={6000}>
      <CartErrorBridge />
      <Toast.Portal>
        <Toast.Viewport
          // Sits above BottomNav on mobile (it occupies ~4.25rem plus the safe
          // area, which the body padding in layout.tsx already accounts for).
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] inset-x-0 z-[60] mx-auto flex w-[min(26rem,calc(100%-2rem))] flex-col gap-2 md:bottom-6 md:inset-x-auto md:end-6 md:mx-0"
        >
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  const dict = useDict();

  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      className={
        "flex items-start gap-3 rounded border bg-white p-4 shadow-lg " +
        "transition-all data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 " +
        (toast.type === "error"
          ? "border-[#DC2626]/30"
          : "border-[#E2E8F0]")
      }
    >
      {toast.type === "error" && (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]" />
      )}
      <div className="min-w-0 flex-1">
        {toast.title && (
          <Toast.Title className="text-sm font-black uppercase tracking-tight text-[#0B0F14]">
            {toast.title}
          </Toast.Title>
        )}
        {toast.description && (
          <Toast.Description className="mt-1 text-sm text-[#64748B]">
            {toast.description}
          </Toast.Description>
        )}
      </div>
      <Toast.Close
        aria-label={dict.common.clearAll}
        className="shrink-0 rounded p-1 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#0B0F14]"
      >
        <X className="h-4 w-4" />
      </Toast.Close>
    </Toast.Root>
  ));
}

/**
 * Translates the cart store's error code into a toast.
 *
 * The store can't do this itself: it's a plain module with no access to
 * `useDict`, and the only message it has is Shopify's raw English `userErrors`
 * text. So it records *which* operation failed and this bridge — which does sit
 * inside LocaleProvider — supplies the copy in the visitor's language.
 */
function CartErrorBridge() {
  const error = useCartStore((s) => s.error);
  const clearError = useCartStore((s) => s.clearError);
  const dict = useDict();
  const locale = useLocale();

  useEffect(() => {
    if (!error) return;

    const description =
      error === "add"
        ? dict.cart.errorAdd
        : error === "update"
          ? dict.cart.errorUpdate
          : error === "remove"
            ? dict.cart.errorRemove
            : null;

    // "refresh" is deliberately silent: it fires on page load for anyone with a
    // stored cart, and a toast on arrival for a transient network blip would be
    // noise. It's logged in the store instead.
    if (description) {
      toastManager.add({
        title: dict.cart.errorTitle,
        description,
        type: "error",
        priority: "high",
        // Announced urgently, so make sure the direction matches the page.
        positionerProps: { dir: locale.dir },
      });
    }

    clearError();
  }, [error, clearError, dict, locale.dir]);

  return null;
}
