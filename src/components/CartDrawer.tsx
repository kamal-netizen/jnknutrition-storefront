"use client";

import { X, Minus, Plus, ShoppingBag, Lock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, useCartLines, useCartTotal, useCheckoutUrl, useCartSavings } from "@/lib/store/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Price from "@/components/Price";
import FreeShippingBar from "@/components/FreeShippingBar";
import CartSuggestions from "@/components/CartSuggestions";

export default function CartDrawer() {
  const { isOpen, closeCart, updateLine, removeLine, isLoading } = useCartStore();
  const lines = useCartLines();
  const total = useCartTotal();
  const checkoutUrl = useCheckoutUrl();
  const savings = useCartSavings();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="bg-white border-l border-[#E2E8F0] w-full sm:max-w-md flex flex-col p-0"
      >
        <SheetHeader className="px-6 py-5 border-b border-[#E2E8F0]">
          <SheetTitle className="text-[#0B0F14] font-bold text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#F9D20F]" />
            Your Cart
            {lines.length > 0 && (
              <span className="ml-auto text-sm font-normal text-[#64748B]">
                {lines.length} {lines.length === 1 ? "item" : "items"}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {lines.length > 0 && (
          <FreeShippingBar className="px-6 py-4 border-b border-[#E2E8F0]" />
        )}

        {/* Lines */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag className="w-12 h-12 text-[#E2E8F0]" />
              <p className="text-[#64748B] text-sm">Your cart is empty.</p>
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/products" />}
                nativeButton={false}
                onClick={closeCart}
                className="border-[#F9D20F] text-[#F9D20F] hover:bg-[#F9D20F] hover:text-[#0B0F14]"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <ul className="space-y-5">
              {lines.map((line) => {
                const image =
                  line.merchandise.product.images.edges[0]?.node ?? null;
                return (
                  <li
                    key={line.id}
                    className="flex gap-4 pb-5 border-b border-[#E2E8F0] last:border-0"
                  >
                    {/* Image */}
                    {image && (
                      <Link
                        href={`/products/${line.merchandise.product.handle}`}
                        onClick={closeCart}
                        className="shrink-0"
                      >
                        <Image
                          src={image.url}
                          alt={image.altText ?? line.merchandise.product.title}
                          width={72}
                          height={72}
                          className="rounded-lg object-cover aspect-square bg-[#FAFBFC] border border-[#E2E8F0]"
                        />
                      </Link>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${line.merchandise.product.handle}`}
                        onClick={closeCart}
                        className="text-sm font-semibold text-[#0B0F14] hover:text-[#F9D20F] transition-colors line-clamp-2"
                      >
                        {line.merchandise.product.title}
                      </Link>
                      {line.merchandise.title !== "Default Title" && (
                          <p className="text-xs text-[#64748B] mt-0.5">
                          {line.merchandise.title}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {/* Qty controls */}
                        <div className="flex items-center gap-2 border border-[#E2E8F0] rounded-lg">
                          <button
                            disabled={isLoading || line.quantity <= 1}
                            onClick={() =>
                              updateLine(line.id, line.quantity - 1)
                            }
                            className="p-1.5 text-[#64748B] hover:text-[#0B0F14] disabled:opacity-40 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium text-[#0B0F14] w-5 text-center">
                            {line.quantity}
                          </span>
                          <button
                            disabled={isLoading}
                            onClick={() =>
                              updateLine(line.id, line.quantity + 1)
                            }
                            className="p-1.5 text-[#64748B] hover:text-[#0B0F14] disabled:opacity-40 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <Price
                          amount={line.cost.totalAmount.amount}
                          currencyCode={line.cost.totalAmount.currencyCode}
                          className="text-sm font-bold text-[#0B0F14]"
                        />
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeLine(line.id)}
                      disabled={isLoading}
                      className="shrink-0 text-[#64748B] hover:text-[#EF4444] transition-colors disabled:opacity-40"
                      aria-label="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {lines.length > 0 && (
            <CartSuggestions
              className="mt-6 pt-5 border-t border-[#E2E8F0]"
              onNavigate={closeCart}
            />
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <div className="px-6 py-5 border-t border-[#E2E8F0] space-y-4">
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
            <Button
              render={<a href={checkoutUrl ?? "#"} />}
              nativeButton={false}
              disabled={!checkoutUrl || isLoading}
              className="w-full h-13 bg-[#F9D20F] text-[#0B0F14] text-sm font-bold hover:bg-[#E7BF00] uppercase tracking-wide shadow-card"
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
              size="sm"
              render={<Link href="/cart" />}
              nativeButton={false}
              onClick={closeCart}
              className="w-full text-[#64748B] hover:text-[#0B0F14]"
            >
              View Full Cart
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
