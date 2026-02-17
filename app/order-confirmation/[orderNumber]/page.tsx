"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, Package, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Order {
  id: string
  order_number: string
  status: string
  payment_method: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_pincode: string
  shipping_country: string
  subtotal: number
  tax: number
  shipping_cost: number
  total_amount: number
  created_at: string
}

interface OrderItem {
  id: string
  product_name: string
  product_image: string
  size: string
  quantity: number
  unit_price: number
  total_price: number
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const orderNumber = params.orderNumber as string
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderNumber) {
      loadOrder()
    }
  }, [orderNumber])

  const loadOrder = async () => {
    try {
      const supabase = createClient()
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .single()

      if (orderError) throw orderError

      if (!orderData) {
        setError("Order not found")
        setLoading(false)
        return
      }

      setOrder(orderData as Order)

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderData.id)

      if (itemsError) throw itemsError
      setOrderItems((itemsData as OrderItem[]) || [])
    } catch (err: any) {
      console.error("Error loading order:", err)
      setError(err.message || "Failed to load order")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "The order you're looking for doesn't exist."}</p>
          <Link
            href="/"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const paymentMethodText =
    order.payment_method === "cod"
      ? "Cash on Delivery"
      : "Prepaid Payment (Razorpay)"

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We've sent a confirmation email to{" "}
            <span className="font-semibold">{order.customer_email}</span>
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-xl font-bold">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-semibold">
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    {item.product_image && (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Size: {item.size} × Quantity: {item.quantity}
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      ₹{Number(item.total_price).toLocaleString("en-IN")}.00
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-border pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{Number(order.subtotal).toLocaleString("en-IN")}.00</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹{Number(order.tax).toLocaleString("en-IN")}.00</span>
                </div>
              )}
              {order.shipping_cost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>₹{Number(order.shipping_cost).toLocaleString("en-IN")}.00</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-teal-600">
                  ₹{Number(order.total_amount).toLocaleString("en-IN")}.00
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-teal-600" />
              <h3 className="font-semibold">Shipping Address</h3>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{order.customer_name}</p>
              <p>{order.shipping_address}</p>
              <p>
                {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}
              </p>
              <p>{order.shipping_country}</p>
            </div>
          </div>

          {/* Payment & Contact */}
          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-teal-600" />
              <h3 className="font-semibold">Payment & Contact</h3>
            </div>
            <div className="text-sm space-y-3">
              <div>
                <p className="text-muted-foreground">Payment Method</p>
                <p className="font-medium">{paymentMethodText}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer_phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer_email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-2">Estimated Delivery</h3>
          <p className="text-sm text-muted-foreground">
            Your order will be delivered within 5-7 business days. We'll send you a tracking
            number once your order ships.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 text-center bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className="flex-1 text-center border-2 border-foreground hover:bg-muted py-3 rounded-lg font-semibold transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  )
}




