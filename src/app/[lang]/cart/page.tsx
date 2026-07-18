"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, Lock, ShieldCheck } from "lucide-react";
import {
  useCartStore,
  useCartLines,
  useCartTotal,
  useCheckoutUrl,
  useCartSavings,
} from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import Price from "@/components/Price";
import FreeShippingBar from "@/components/FreeShippingBar";
import CartSuggestions from "@/components/CartSuggestions";

export default function CartPage() {
  const { updateLine, removeLine, refreshCart, isLoading } = useCartStore();
  const lines = useCartLines();
  const total = useCartTotal();
  const checkoutUrl = useCheckoutUrl();
  const savings = useCartSavings();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-4xl md:text-5xl font-black text-[#0B0F14] uppercase tracking-tight mb-10">
        Your Cart
      </h1>

      {lines.length === 0 ? (
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-16 text-center flex flex-col items-center gap-4">
          <ShoppingBag className="w-14 h-14 text-[#E2E8F0]" />
          <p className="text-[#64748B]">Your cart is empty.</p>
          <Button
            render={<Link href="/products" />}
            nativeButton={false}
            className="bg-[#F9D20F] text-[#0B0F14] font-bold hover:bg-[#E7BF00] uppercase tracking-wide"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Line items */}
          <div className="lg:col-span-2 space-y-4">
            {lines.map((line) => {
              const image = line.merchandise.product.images.edges[0]?.node;
              return (
                <div
                  key={line.id}
                  className="flex gap-4 p-4 rounded-lg border border-[#E2E8F0] bg-[#F5F7FA]"
                >
                  {image && (
                    <Link
                      href={`/products/${line.merchandise.product.handle}`}
                      className="shrink-0"
                    >
                      <Image
                        src={image.url}
                        alt={image.altText ?? line.merchandise.product.title}
                        width={96}
                        height={96}
                        className="rounded object-cover aspect-square bg-[#F5F7FA]"
                      />
                    </Link>
                  )}

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${line.merchandise.product.handle}`}
                      className="text-base font-bold text-[#0B0F14] hover:text-[#F9D20F] transition-colors"
                    >
                      {line.merchandise.product.title}
                    </Link>
                    {line.merchandise.title !== "Default Title" && (
                      <p className="text-sm text-[#64748B] mt-0.5">
                        {line.merchandise.title}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-[#E2E8F0] rounded">
                        <button
                          disabled={isLoading || line.quantity <= 1}
                          onClick={() => updateLine(line.id, line.quantity - 1)}
                          className="p-2 text-[#64748B] hover:text-[#0B0F14] disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-[#0B0F14] font-medium">
                          {line.quantity}
                        </span>
                        <button
                          disabled={isLoading}
                          onClick={() => updateLine(line.id, line.quantity + 1)}
                          className="p-2 text-[#64748B] hover:text-[#0B0F14] disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <Price
                          amount={line.cost.totalAmount.amount}
                          currencyCode={line.cost.totalAmount.currencyCode}
                          className="font-bold text-[#0B0F14]"
                        />
                        <button
                          onClick={() => removeLine(line.id)}
                          disabled={isLoading}
                          className="text-[#64748B] hover:text-[#EF4444] transition-colors disabled:opacity-40"
                          aria-label="Remove item"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <CartSuggestions className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-5" />
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] p-6 space-y-4 sticky top-24">
              <h2 className="text-lg font-bold text-[#0B0F14] uppercase tracking-tight">
                Order Summary
              </h2>
              {savings.amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#16A34A] font-semibold">You save</span>
                  <span className="text-[#16A34A] font-bold tabular-nums">
                    {savings.currencyCode} {savings.amount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Subtotal</span>
                {total && (
                  <Price
                    amount={total.amount}
                    currencyCode={total.currencyCode}
                    className="font-bold text-[#0B0F14]"
                  />
                )}
              </div>
              <p className="text-xs text-[#64748B]">
                Shipping and taxes calculated at checkout.
              </p>
              <FreeShippingBar className="rounded-md border border-[#E2E8F0] bg-white p-3" />
              <Button
                render={<a href={checkoutUrl ?? "#"} />}
                nativeButton={false}
                disabled={!checkoutUrl || isLoading}
                className="w-full h-12 bg-[#F9D20F] text-[#0B0F14] font-bold hover:bg-[#E7BF00] uppercase tracking-wide"
              >
                {isLoading ? (
                  "Updating..."
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Secure Checkout
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" aria-hidden="true" />
                <span>Secure payments · Tamara · Visa · Mastercard · Apple Pay</span>
              </div>
              <Button
                variant="ghost"
                render={<Link href="/products" />}
                className="w-full text-[#64748B] hover:text-[#0B0F14]"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
