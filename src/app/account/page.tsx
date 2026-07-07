import type { Metadata } from "next";
import Link from "next/link";
import { requireCustomer } from "@/lib/customer-server";
import { logoutAction } from "@/app/account/actions";
import { Button } from "@/components/ui/button";
import Price from "@/components/Price";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountPage() {
  const customer = await requireCustomer();
  const orders = customer.orders;
  const recentOrders = orders.slice(0, 3);
  const name =
    customer.firstName || customer.email?.split("@")[0] || "there";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#0B0F14] uppercase tracking-tight">
            Hey, {name}
          </h1>
          <p className="mt-1 text-[#64748B]">{customer.email}</p>
        </div>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            className="border-[#E2E8F0] text-[#64748B] hover:text-[#0B0F14] hover:border-[#EF4444]"
          >
            Sign Out
          </Button>
        </form>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        <Link
          href="/account/orders"
          className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-6 hover:border-[#F9D20F] transition-colors"
        >
          <h2 className="font-bold text-[#0B0F14] uppercase tracking-tight">Orders</h2>
          <p className="text-sm text-[#64748B] mt-1">
            Track and manage {orders.length}{" "}
            {orders.length === 1 ? "order" : "orders"}
          </p>
        </Link>
        <Link
          href="/account/addresses"
          className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-6 hover:border-[#F9D20F] transition-colors"
        >
          <h2 className="font-bold text-[#0B0F14] uppercase tracking-tight">
            Addresses
          </h2>
          <p className="text-sm text-[#64748B] mt-1">Manage shipping addresses</p>
        </Link>
        <Link
          href="/products"
          className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-6 hover:border-[#F9D20F] transition-colors"
        >
          <h2 className="font-bold text-[#0B0F14] uppercase tracking-tight">Shop</h2>
          <p className="text-sm text-[#64748B] mt-1">Browse the full range</p>
        </Link>
      </div>

      {/* Recent orders */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-[#0B0F14] uppercase tracking-tight">
          Recent Orders
        </h2>
        {orders.length > 3 && (
          <Link
            href="/account/orders"
            className="text-sm font-bold text-[#F9D20F] hover:text-[#E7BF00] uppercase tracking-wide"
          >
            View All →
          </Link>
        )}
      </div>

      {recentOrders.length > 0 ? (
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${encodeURIComponent(order.id)}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-5 hover:border-[#F9D20F] transition-colors"
            >
              <div>
                <p className="font-bold text-[#0B0F14]">Order #{order.number}</p>
                <p className="text-sm text-[#64748B]">
                  {new Date(order.processedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.fulfillmentStatus} />
                <Price
                  amount={order.totalPrice.amount}
                  currencyCode={order.totalPrice.currencyCode}
                  className="font-bold text-[#F9D20F]"
                />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-10 text-center">
          <p className="text-[#64748B]">You haven&apos;t placed any orders yet.</p>
        </div>
      )}
    </div>
  );
}
