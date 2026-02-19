"use client"

import { useState } from "react"
import { Menu, Search, ShoppingBag, X, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { CartSheet } from "@/components/cart-sheet"
import Link from "next/link"

interface HeaderProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const { user, loading } = useAuth()
  const { getItemCount } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const itemCount = getItemCount()

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-background border-b border-border">
        <button
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          className="p-1"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>

        <div className="flex-1 flex justify-center">
          <Link href="/" className="text-lg tracking-wide">
            <span className="font-light">MS</span>
            <span className="font-bold text-teal-500">CRAFTS</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button aria-label="Search" className="p-1">
            <Search className="h-5 w-5 text-foreground" />
          </button>
          {!loading && (
            <Link
              href={user ? "/account" : "/auth/login"}
              aria-label={user ? "Account" : "Log in"}
              className="p-1"
            >
              <User className="h-5 w-5 text-foreground" />
            </Link>
          )}
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Cart"
            className="p-1 relative"
          >
            <ShoppingBag className="h-5 w-5 text-foreground" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>
        </div>
      </header>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  )
}
