type Props = {
  status: string;
  type?: "fulfillment" | "financial";
};

const STYLES: Record<string, string> = {
  // Fulfillment
  FULFILLED: "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30",
  UNFULFILLED: "bg-[#E2E8F0] text-[#64748B] border-[#E2E8F0]",
  PARTIALLY_FULFILLED: "bg-[#F9D20F]/15 text-[#F9D20F] border-[#F9D20F]/30",
  IN_PROGRESS: "bg-[#F9D20F]/15 text-[#F9D20F] border-[#F9D20F]/30",
  ON_HOLD: "bg-[#E2E8F0] text-[#64748B] border-[#E2E8F0]",
  SCHEDULED: "bg-[#E2E8F0] text-[#64748B] border-[#E2E8F0]",
  RESTOCKED: "bg-[#E2E8F0] text-[#64748B] border-[#E2E8F0]",
  // Financial
  PAID: "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30",
  PENDING: "bg-[#F9D20F]/15 text-[#F9D20F] border-[#F9D20F]/30",
  REFUNDED: "bg-[#E2E8F0] text-[#64748B] border-[#E2E8F0]",
  PARTIALLY_REFUNDED: "bg-[#E2E8F0] text-[#64748B] border-[#E2E8F0]",
  VOIDED: "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30",
  AUTHORIZED: "bg-[#F9D20F]/15 text-[#F9D20F] border-[#F9D20F]/30",
};

function label(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function OrderStatusBadge({ status }: Props) {
  const style =
    STYLES[status] ?? "bg-[#E2E8F0] text-[#64748B] border-[#E2E8F0]";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${style}`}
    >
      {label(status)}
    </span>
  );
}
