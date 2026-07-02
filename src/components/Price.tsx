import { cn } from "@/lib/utils";

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
  const symbol = CURRENCY_SYMBOLS[currencyCode] ?? currencyCode + " ";
  const formatted = parseFloat(amount).toFixed(2);

  return (
    <span className={cn("tabular-nums", className)}>
      {symbol}
      {formatted}
    </span>
  );
}
