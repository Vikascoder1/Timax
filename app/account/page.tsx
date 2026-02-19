"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AnnouncementBar } from "@/components/announcement-bar"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { RatingBadge } from "@/components/rating-badge"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Footer } from "@/components/footer"
import { User, Package, Calendar, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

interface OrderItem {
  id: string
  product_name: string
  product_image: string
  size: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: string
  order_number: string
  status: string
  payment_method: string
  payment_status: string
  total_amount: number
  created_at: string
  items: OrderItem[]
}

export default function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<{ full_name?: string; phone?: string } | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      loadProfile()
      loadOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router])

  const loadProfile = async () => {
    if (!user) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error("Error loading profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/orders/my-orders")
      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }
      const result = await response.json()
      if (result.success) {
        setOrders(result.orders || [])
      }
    } catch (err) {
      console.error("Error loading orders:", err)
    } finally {
      setOrdersLoading(false)
    }
  }

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === "confirmed" && paymentStatus === "completed") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="h-3 w-3" />
          Confirmed
        </span>
      )
    }
    if (status === "pending_payment") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="h-3 w-3" />
          Pending Payment
        </span>
      )
    }
    if (status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <XCircle className="h-3 w-3" />
          Cancelled
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        <Clock className="h-3 w-3" />
        {status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatPaymentMethod = (method: string) => {
    return method === "cod" ? "Cash on Delivery" : "Razorpay"
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Account
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <button
              onClick={handleLogout}
              className="hover:text-foreground underline transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className="mb-8 pb-8 border-b border-border">
          <h2 className="text-xl font-semibold mb-4">Order history</h2>
          
          {(() => {
            if (ordersLoading) {
              return (
                <div className="bg-muted rounded-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading orders...</p>
                </div>
              )
            }
            if (orders.length === 0) {
              return (
                <div className="bg-muted rounded-lg p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
                  <Link
                    href="/"
                    className="inline-block mt-4 text-sm text-primary hover:underline"
                  >
                    Start shopping →
                  </Link>
                </div>
              )
            }
            return (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="bg-muted p-4 border-b border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">Order {order.order_number}</h3>
                          {getStatusBadge(order.status, order.payment_status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            {formatPaymentMethod(order.payment_method)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          ₹{Number(order.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <Link
                          href={`/order-confirmation/${order.order_number}`}
                          className="text-sm text-primary hover:underline mt-1 inline-block"
                        >
                          View details →
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 pb-3 border-b border-border last:border-0 last:pb-0"
                        >
                          <div className="relative w-16 h-16 shrink-0 bg-muted rounded-lg overflow-hidden">
                            {item.product_image ? (
                              <Image
                                src={(() => {
                                  if (item.product_image.startsWith("http")) {
                                    return item.product_image
                                  }
                                  if (item.product_image.startsWith("/images/")) {
                                    return item.product_image
                                  }
                                  return `/images/${item.product_image}`
                                })()}
                                alt={item.product_name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Size: {item.size} × Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">
                              ₹{Number(item.total_price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )
          })()}
        </div>

        {/* Account Details */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Account details</h2>
          
          <div className="space-y-4">
            {/* Email */}
            <div className="border border-border rounded-lg p-4">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Email
              </div>
              <p className="text-foreground">{user.email}</p>
            </div>

            {/* Full Name */}
            {profile?.full_name && (
              <div className="border border-border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Full Name
                </div>
                <p className="text-foreground">{profile.full_name}</p>
              </div>
            )}

            {/* Phone */}
            {profile?.phone && (
              <div className="border border-border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Phone
                </div>
                <p className="text-foreground">{profile.phone}</p>
              </div>
            )}

            {/* Addresses */}
            {/* <Link
              href="/account/addresses"
              className="block border border-border rounded-lg p-4 hover:bg-muted transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">View addresses</span>
                </div>
                <span className="text-sm text-muted-foreground">(0)</span>
              </div>
            </Link> */}
          </div>
        </div>
      </main>

      <Footer />
      <RatingBadge />
      <WhatsappButton />
    </div>
  )
}





