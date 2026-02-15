"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface CartItem {
  id: string
  productId: string
  name: string
  image: string
  price: number
  size: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  getTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "timax-cart"

// Load cart from localStorage
function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save cart to localStorage
function saveCartToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore storage errors
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedItems = loadCartFromStorage()
    setItems(savedItems)
    setIsInitialized(true)
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isInitialized) {
      saveCartToStorage(items)
    }
  }, [items, isInitialized])

  const addItem = (item: Omit<CartItem, "id">) => {
    // Check if item with same productId and size already exists
    const existingItem = items.find(
      (i) => i.productId === item.productId && i.size === item.size
    )

    if (existingItem) {
      // Update quantity if item exists
      setItems(
        items.map((i) =>
          i.id === existingItem.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      )
    } else {
      // Add new item
      const newItem: CartItem = {
        ...item,
        id: `${item.productId}-${item.size}-${Date.now()}`,
      }
      setItems([...items, newItem])
    }
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems(
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

