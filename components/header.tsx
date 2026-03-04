"use client"

import { useState, useRef, useEffect } from "react"
import { Menu, Search, ShoppingBag, X, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { CartSheet } from "@/components/cart-sheet"
import { Input } from "@/components/ui/input"
import { getAllProducts } from "@/lib/products"
import Link from "next/link"

interface HeaderProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const { user, loading } = useAuth()
  const { getItemCount } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const searchContainerRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  const itemCount = getItemCount()

  const allProducts = getAllProducts()
  const searchResults = searchQuery.trim()
    ? allProducts.filter((product) => {
        const q = searchQuery.toLowerCase()
        return (
          product.name.toLowerCase().includes(q) ||
          product.type.toLowerCase().includes(q)
        )
      })
    : allProducts

  const handleSearchToggle = () => {
    setSearchOpen((prev) => !prev)
    // Slight delay so the input exists in DOM before focusing
    setTimeout(() => {
      if (!searchOpen && searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, 10)
  }

  const handleNavigateToProduct = (productId: string) => {
    setSearchOpen(false)
    setSearchQuery("")
    router.push(`/product?id=${productId}`)
  }

  const handleSearchSubmit = () => {
    if (searchResults.length > 0) {
      handleNavigateToProduct(searchResults[0].id)
    }
  }

  // Close search dropdown when clicking outside
  useEffect(() => {
    if (!searchOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [searchOpen])

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
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-lg tracking-wide"
          >
            <span className="px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-100 text-sm font-semibold border border-slate-700">
              MS
            </span>
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300">
              HandCrafts
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={searchContainerRef}>
            <button
              aria-label="Search"
              className="p-1"
              onClick={handleSearchToggle}
            >
              <Search className="h-5 w-5 text-foreground" />
            </button>
            {searchOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-background border border-border rounded-lg shadow-lg p-3 z-40">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search watches (Ocean, Green, Triangle...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSearchSubmit()
                    } else if (e.key === "Escape") {
                      setSearchOpen(false)
                    }
                  }}
                  className="h-9 text-sm"
                />
                <div className="mt-2 max-h-60 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-1 py-1.5">
                      No matching watches found.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {searchResults.map((product) => (
                        <li key={product.id}>
                          <button
                            type="button"
                            onClick={() => handleNavigateToProduct(product.id)}
                            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted text-sm"
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Starts at ₹
                              {product.pricesBySize["12 Inch"].toLocaleString(
                                "en-IN",
                              )}
                              .00
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
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
