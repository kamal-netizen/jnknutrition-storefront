import Image from "next/image";

type Props = {
  amount: string;
  currencyCode: string;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
  CAD: "CA$",
  AUD: "A$",
};

const TAMARA_INSTALMENTS = 6;

export default function TamaraWidget({ amount, currencyCode }: Props) {
  const total = parseFloat(amount);
  if (!Number.isFinite(total) || total <= 0) return null;

  const symbol = CURRENCY_SYMBOLS[currencyCode] ?? `${currencyCode} `;
  const perInstalment = (total / TAMARA_INSTALMENTS).toFixed(2);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-[#FAFBFC] px-4 py-3">
      <Image
        src="/TAMARA-PAYMENT.webp"
        alt="Tamara — buy now, pay later"
        width={56}
        height={28}
        className="h-7 w-auto shrink-0"
      />
      <p className="text-sm text-[#64748B]">
        Or split in {TAMARA_INSTALMENTS} payments of{" "}
        <span className="font-bold text-[#0B0F14]">
          {symbol}
          {perInstalment}
        </span>{" "}
        — No late fees.
      </p>
    </div>
  );
}
