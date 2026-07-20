import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Truck, ExternalLink, Package } from "lucide-react";
import { requireCustomer } from "@/lib/customer-server";
import { Button } from "@/components/ui/button";
import Price from "@/components/Price";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

export const metadata: Metadata = {
  title: "Order Details",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const orderId = decodeURIComponent(id);

  const customer = await requireCustomer();
  const order = customer.orders.find((o) => o.id === orderId);

  if (!order) notFound();

  const lineItems = order.lineItems;
  const fulfillments = order.fulfillments;
  const hasTracking = fulfillments.some(
    (f) => f.trackingInformation.length > 0
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/account/orders"
          className="text-sm text-[#64748B] hover:text-[#0B0F14] transition-colors"
        >
          ← Orders
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0B0F14] uppercase tracking-tight">
            Order #{order.number}
          </h1>
          <p className="mt-1 text-[#64748B]">
            Placed{" "}
            {new Date(order.processedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {order.statusPageUrl && (
          <Button
            render={<a href={order.statusPageUrl} target="_blank" rel="noopener noreferrer" />}
            nativeButton={false}
            className="bg-[#F9D20F] text-[#0B0F14] font-bold hover:bg-[#E7BF00] uppercase tracking-wide"
          >
            <ExternalLink className="w-4 h-4" /> View Status Page
          </Button>
        )}
      </div>

      {/* Status */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <OrderStatusBadge status={order.fulfillmentStatus} />
        {order.financialStatus && (
          <OrderStatusBadge status={order.financialStatus} />
        )}
      </div>

      {/* Tracking */}
      <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-6 mb-6">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#0B0F14] mb-4">
          <Truck className="w-4 h-4" /> Shipment Tracking
        </h2>
        {hasTracking ? (
          <div className="space-y-4">
            {fulfillments.map((fulfillment, fi) =>
              fulfillment.trackingInformation.map((track, ti) => (
                <div
                  key={`${fi}-${ti}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#E2E8F0] bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-[#64748B]" />
                    <div>
                      {track.company && (
                        <p className="text-sm font-semibold text-[#0B0F14]">
                          {track.company}
                        </p>
                      )}
                      {track.number && (
                        <p className="text-sm text-[#64748B] tabular-nums">
                          {track.number}
                        </p>
                      )}
                    </div>
                  </div>
                  {track.url && (
                    <a
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-bold text-[#082D4C] underline underline-offset-2 hover:text-[#0B0F14]"
                    >
                      Track <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <p className="text-sm text-[#64748B]">
            {order.fulfillmentStatus === "FULFILLED"
              ? "This order has been fulfilled. Tracking details are not available."
              : "No tracking available yet. You'll be notified when your order ships."}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-6 mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#0B0F14] mb-4">
          Items
        </h2>
        <ul className="space-y-4">
          {lineItems.map((item, i) => (
            <li key={i} className="flex gap-4">
              {item.image && (
                <Image
                  src={item.image.url}
                  alt={item.image.altText ?? item.title}
                  width={64}
                  height={64}
                  className="rounded object-cover aspect-square bg-[#F5F7FA]"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0B0F14]">{item.title}</p>
                <p className="text-sm text-[#64748B]">Qty: {item.quantity}</p>
              </div>
              {item.price && (
                <Price
                  amount={item.price.amount}
                  currencyCode={item.price.currencyCode}
                  className="text-sm font-bold text-[#0B0F14]"
                />
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Shipping address */}
        {order.shippingAddress && (
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0B0F14] mb-4">
              Shipping Address
            </h2>
            <address className="not-italic text-sm text-[#64748B] space-y-0.5">
              {order.shippingAddress.formatted.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </address>
          </div>
        )}

        {/* Totals */}
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#0B0F14] mb-4">
            Summary
          </h2>
          <div className="space-y-2 text-sm">
            {order.subtotal && (
              <div className="flex justify-between">
                <span className="text-[#64748B]">Subtotal</span>
                <Price
                  amount={order.subtotal.amount}
                  currencyCode={order.subtotal.currencyCode}
                  className="text-[#0B0F14]"
                />
              </div>
            )}
            {order.totalTax && (
              <div className="flex justify-between">
                <span className="text-[#64748B]">Tax</span>
                <Price
                  amount={order.totalTax.amount}
                  currencyCode={order.totalTax.currencyCode}
                  className="text-[#0B0F14]"
                />
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[#E2E8F0]">
              <span className="font-bold text-[#0B0F14]">Total</span>
              <Price
                amount={order.totalPrice.amount}
                currencyCode={order.totalPrice.currencyCode}
                className="font-bold text-[#0B0F14]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
