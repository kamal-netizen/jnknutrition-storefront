"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";

type Props = {
  amount: string;
  currencyCode: string;
  className?: string;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  CAD: "CA$",
  AUD: "A$",
};

export default function Price({ amount, currencyCode, className }: Props) {
  const locale = useLocale();
  const formatted = parseFloat(amount).toFixed(2);

  if (currencyCode === "AED" && locale.code === "ar") {
    return (
      <span className={cn("tabular-nums", className)}>
        {formatted} د.إ
      </span>
    );
  }

  const symbol = CURRENCY_SYMBOLS[currencyCode] ?? currencyCode + " ";
  return (
    <span className={cn("tabular-nums", className)}>
      {symbol}
      {formatted}
    </span>
  );
}
