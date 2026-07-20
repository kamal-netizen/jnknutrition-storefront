import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { requireCustomer } from "@/lib/customer-server";
import Price from "@/components/Price";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

export const metadata: Metadata = {
  title: "My Orders",
};

export default async function OrdersPage() {
  const customer = await requireCustomer();
  const orders = customer.orders;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex items-center gap-3 mb-10">
        <Link
          href="/account"
          className="text-sm text-[#64748B] hover:text-[#0B0F14] transition-colors"
        >
          ← Account
        </Link>
      </div>

      <h1 className="text-4xl font-black text-[#0B0F14] uppercase tracking-tight mb-8">
        Order History
      </h1>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.lineItems.reduce(
              (sum, item) => sum + item.quantity,
              0
            );
            return (
              <Link
                key={order.id}
                href={`/account/orders/${encodeURIComponent(order.id)}`}
                className="block rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-6 hover:border-[#F9D20F] transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#0B0F14] text-lg">
                      Order #{order.number}
                    </p>
                    <p className="text-sm text-[#64748B] mt-0.5">
                      {new Date(order.processedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      · {itemCount} {itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <Price
                      amount={order.totalPrice.amount}
                      currencyCode={order.totalPrice.currencyCode}
                      className="font-bold text-[#0B0F14] text-lg"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <OrderStatusBadge status={order.fulfillmentStatus} />
                  {order.financialStatus && (
                    <OrderStatusBadge status={order.financialStatus} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-10 text-center">
          <p className="text-[#64748B]">You haven&apos;t placed any orders yet.</p>
        </div>
      )}
    </div>
  );
}
