"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, ChevronDown, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-context"
import Image from "next/image"
import Link from "next/link"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, removeItem, updateQuantity, getTotal } = useCart()
  const [instructionsOpen, setInstructionsOpen] = useState(false)

  const total = getTotal()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 [&>button]:hidden">
        <SheetHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between">
          <SheetTitle className="text-left">Your cart</SheetTitle>
          <SheetClose className="p-1 hover:bg-muted rounded transition-colors">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-12">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Link
                href="/"
                onClick={() => onOpenChange(false)}
                className="text-primary hover:underline"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <div className="px-6 py-4">
              {/* Column Headers */}
              <div className="flex justify-between items-center mb-4 text-sm font-medium text-muted-foreground">
                <span>PRODUCT</span>
                <span>TOTAL</span>
              </div>

              {/* Cart Items */}
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        ₹ {item.price.toLocaleString("en-IN")}.00
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Size: {item.size}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 border border-border rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1.5 hover:bg-muted transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1.5 hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 hover:bg-muted rounded transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        ₹ {(item.price * item.quantity).toLocaleString("en-IN")}
                        .00
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-4 space-y-4">
            {/* Order Special Instructions */}
            <div className="border-b border-border pb-4">
              <button
                onClick={() => setInstructionsOpen(!instructionsOpen)}
                className="w-full flex items-center justify-between text-sm"
              >
                <span>Order special instructions</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    instructionsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {instructionsOpen && (
                <textarea
                  placeholder="Add special instructions for your order..."
                  className="w-full mt-3 p-3 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              )}
            </div>

            {/* Estimated Total */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Estimated total</span>
                <span className="font-bold text-lg">
                  ₹ {total.toLocaleString("en-IN")}.00
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Taxes included. Discounts and{" "}
                <span className="underline">shipping</span> calculated at
                checkout.
              </p>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={() => onOpenChange(false)}
              className="block w-full bg-foreground text-background py-3 rounded-lg font-semibold hover:bg-foreground/90 transition-colors text-center"
            >
              Check out
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

