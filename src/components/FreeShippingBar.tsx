"use client";

import { Truck, Check } from "lucide-react";
import { useCartSubtotal } from "@/lib/store/cart";
import {
  FREE_SHIPPING_CURRENCY,
  freeShippingRemaining,
  freeShippingProgress,
} from "@/lib/shipping";
import { useDict, useLocale } from "@/lib/locale-context";

type Props = {
  className?: string;
};

export default function FreeShippingBar({ className }: Props) {
  const subtotal = useCartSubtotal();
  const ct = useDict().cart;
  const locale = useLocale();
  if (!subtotal) return null;

  const amount = parseFloat(subtotal.amount);
  if (Number.isNaN(amount)) return null;

  const remaining = freeShippingRemaining(amount);
  const progress = freeShippingProgress(amount);
  const unlocked = remaining <= 0;

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {unlocked ? (
          <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
        ) : (
          <Truck className="w-4 h-4 text-[#F9D20F] shrink-0" />
        )}
        <p className="text-xs font-semibold text-[#0B0F14]">
          {unlocked ? (
            ct.freeShippingUnlocked
          ) : (
            <>
              {ct.add}{" "}
              <span className="font-bold text-[#0B0F14]">
                {locale.code === "ar"
                  ? `${remaining.toFixed(2)} د.إ`
                  : `${FREE_SHIPPING_CURRENCY} ${remaining.toFixed(2)}`}
              </span>{" "}
              {ct.addAmountForFree}
            </>
          )}
        </p>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label="Progress toward free shipping"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            unlocked ? "bg-[#16A34A]" : "bg-[#F9D20F]"
          }`}
          style={{ width: `${Math.max(progress * 100, 4)}%` }}
        />
      </div>
    </div>
  );
}
