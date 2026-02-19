"use client"

import { useState } from "react"
import { ArrowRight, User, X, Search, ShoppingBag } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { CartSheet } from "@/components/cart-sheet"
import Link from "next/link"

function AuthLink() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <User className="h-5 w-5" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  return (
    <Link
      href={user ? "/account" : "/auth/login"}
      className="flex items-center gap-3 text-foreground hover:text-foreground/80 transition-colors"
    >
      <User className="h-5 w-5" />
      <span className="text-sm">{user ? "Account" : "Log in"}</span>
    </Link>
  )
}

function CartButton() {
  const { getItemCount } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const itemCount = getItemCount()

  return (
    <>
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
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  )
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { label: "Home", href: "/", hasArrow: false },
  // { label: "collection", href: "/collection", hasArrow: true },
  // { label: "Catalog", href: "/catalog", hasArrow: false },
  { label: "Contact", href: "/contact", hasArrow: false },
  { label: "Track Your Order", href: "/track-order", hasArrow: false },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel - full screen on mobile */}
      <aside
        className={`fixed top-0 left-0 h-full w-full md:max-w-sm bg-background z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigation menu"
        role="dialog"
        aria-modal="true"
      >
        {/* Sidebar Announcement Bar */}
        <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-xs">
          <p>
            {"Cozy Season Deals | Flat 50% off "}
            <a href="#" className="underline font-semibold">
              Shop Now
            </a>
          </p>
        </div>

        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button onClick={onClose} aria-label="Close menu" className="p-1">
            <X className="h-6 w-6 text-foreground" />
          </button>

          <div className="flex-1 flex justify-center">
            <a href="/" className="text-lg tracking-wide">
              <span className="font-light">MS</span>
              <span className="font-bold">CRAFTS</span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button aria-label="Search" className="p-1">
              <Search className="h-5 w-5 text-foreground" />
            </button>
            <CartButton />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1">
            <ul>
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="flex items-center justify-between px-6 py-4 text-foreground hover:bg-muted transition-colors border-b border-border"
                  >
                    <span className="text-base">{item.label}</span>
                    {item.hasArrow && (
                      <ArrowRight className="h-4 w-4 text-foreground" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom section */}
          <div className="border-t border-border px-6 py-4">
            <AuthLink />

            <div className="flex items-center gap-4 mt-4">
              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="text-foreground hover:text-foreground/70 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="text-foreground hover:text-foreground/70 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
