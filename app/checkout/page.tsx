"use client"

import { useState, useEffect } from "react"
import { ShoppingBag, ChevronDown, Search, Tag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Chandigarh",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
]

export default function CheckoutPage() {
  const { items, getTotal, removeItem } = useCart()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false)
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [showDiscountInput, setShowDiscountInput] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    saveInfo: false,
    newsOffers: false,
    country: "India",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "Chandigarh",
    pinCode: "",
    phone: "",
    saveAddress: false,
    textOffers: false,
  })

  const total = getTotal()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Populate email from user if logged in
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData((prev) => ({ ...prev, email: user.email || "" }))
    }
  }, [user?.email])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePlaceOrder = async () => {
    setError(null)
    setIsSubmitting(true)

    // Get email from user or form
    const customerEmail = user?.email || formData.email

    // Validate form with specific error messages
    if (!customerEmail) {
      setError("Please enter your email address")
      setIsSubmitting(false)
      return
    }

    if (!formData.firstName) {
      setError("Please enter your first name")
      setIsSubmitting(false)
      return
    }

    if (!formData.lastName) {
      setError("Please enter your last name")
      setIsSubmitting(false)
      return
    }

    if (!formData.address || !formData.city || !formData.state || !formData.pinCode) {
      setError("Please fill in complete shipping address")
      setIsSubmitting(false)
      return
    }

    if (!formData.phone) {
      setError("Please enter your phone number")
      setIsSubmitting(false)
      return
    }

    if (items.length === 0) {
      setError("Your cart is empty")
      setIsSubmitting(false)
      return
    }

    try {
      const orderData = {
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: customerEmail,
        customerPhone: formData.phone,
        shippingAddress: `${formData.address}${formData.apartment ? `, ${formData.apartment}` : ""}`,
        shippingCity: formData.city,
        shippingState: formData.state,
        shippingPincode: formData.pinCode,
        shippingCountry: formData.country,
        paymentMethod: paymentMethod,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: total,
        tax: 0,
        shippingCost: 0,
        totalAmount: total,
        specialInstructions: null,
        userId: user?.id || null,
      }

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create order")
      }

      // Clear cart
      items.forEach((item) => removeItem(item.id))

      // Redirect to order confirmation
      router.push(`/order-confirmation/${result.order.orderNumber}`)
    } catch (err: any) {
      console.error("Error placing order:", err)
      setError(err.message || "Failed to place order. Please try again.")
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link href="/" className="text-primary hover:underline">
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg tracking-wide">
            <span className="font-light text-foreground">CUSTOM</span>
            <span className="font-bold text-teal-500">CRAFTS</span>
          </Link>
          <button aria-label="Cart" className="p-1">
            <ShoppingBag className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:flex lg:gap-8">
        {/* Main Content */}
        <div className="lg:flex-1 lg:max-w-2xl">
          {/* Order Summary - Collapsible */}
          <div className="border-b border-border py-4 lg:hidden">
          <button
            onClick={() => setOrderSummaryOpen(!orderSummaryOpen)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-primary">
              <span className="font-medium">Order summary</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  orderSummaryOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            <span className="font-bold text-lg">
              ₹ {total.toLocaleString("en-IN")}.00
            </span>
          </button>

          {orderSummaryOpen && (
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Size: {item.size} × {item.quantity}
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      ₹ {(item.price * item.quantity).toLocaleString("en-IN")}
                      .00
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="border-b border-border py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Contact</h2>
            {!user ? (
              <Link href="/auth/login" className="text-primary text-sm hover:underline">
                Sign in
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="Email or mobile phone number"
            value={user?.email || formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={!!user}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:cursor-not-allowed"
          />
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="newsOffers"
              checked={formData.newsOffers}
              onChange={(e) => handleInputChange("newsOffers", e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-ring"
            />
            <label htmlFor="newsOffers" className="text-sm text-muted-foreground">
              Email me with news and offers
            </label>
          </div>
        </div>

        {/* Delivery Section */}
        <div className="border-b border-border py-6">
          <h2 className="text-lg font-bold mb-4">Delivery</h2>

          {/* Country */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Country/Region
            </label>
            <div className="relative">
              <select
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-ring bg-background font-semibold"
              >
                <option value="India">India</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Address */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Apartment */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Apartment, suite, etc."
              value={formData.apartment}
              onChange={(e) => handleInputChange("apartment", e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* City, State, PIN */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <div className="relative">
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-ring bg-background font-semibold"
                >
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <input
                type="text"
                placeholder="PIN code"
                value={formData.pinCode}
                onChange={(e) => handleInputChange("pinCode", e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-border flex items-center justify-center text-xs text-muted-foreground hover:bg-muted"
                title="Help"
              >
                ?
              </button>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="saveAddress"
                checked={formData.saveAddress}
                onChange={(e) => handleInputChange("saveAddress", e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-ring"
              />
              <label htmlFor="saveAddress" className="text-sm text-muted-foreground">
                Save this information for next time
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="textOffers"
                checked={formData.textOffers}
                onChange={(e) => handleInputChange("textOffers", e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-ring"
              />
              <label htmlFor="textOffers" className="text-sm text-muted-foreground">
                Text me with news and offers
              </label>
            </div>
          </div>
        </div>

        {/* Shipping Method */}
        <div className="border-b border-border py-6">
          <h2 className="text-lg font-bold mb-4">Shipping method</h2>
          <div className="bg-muted px-4 py-3 rounded-lg text-sm text-muted-foreground">
            Enter your shipping address to view available shipping methods.
          </div>
        </div>

        {/* Payment Section */}
        <div className="border-b border-border py-6">
          <h2 className="text-xl font-bold mb-2">Payment</h2>
          <p className="text-sm text-muted-foreground mb-6">
            All transactions are secure and encrypted.
          </p>

          <div className="space-y-3">
            {/* PhonePe Option */}
            <div
              className={`border-2 rounded-lg p-4 transition-all ${
                paymentMethod === "phonepe"
                  ? "border-teal-500 bg-teal-50/50"
                  : "border-border bg-background"
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="phonepe"
                  checked={paymentMethod === "phonepe"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-4 h-4 text-teal-600 border-2 border-gray-300 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  style={{
                    accentColor: paymentMethod === "phonepe" ? "#14b8a6" : undefined,
                  }}
                />
                <div className="flex-1">
                  <div className="font-semibold text-base mb-3">
                    PhonePe Payment Gateway (UPI, Cards & NetBanking)
                  </div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-xs font-bold text-teal-700">UPI</span>
                    <span className="inline-flex items-center justify-center px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-[10px] font-bold text-blue-700 leading-tight">
                      VISA
                    </span>
                    <span className="inline-flex items-center justify-center px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-md text-[10px] font-bold text-orange-700 leading-tight">
                      MC
                    </span>
                    <span className="inline-flex items-center justify-center px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-md text-[10px] font-bold text-gray-600 leading-tight">
                      +4
                    </span>
                  </div>
                  {paymentMethod === "phonepe" && (
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll be redirected to PhonePe Payment Gateway (UPI,
                      Cards & NetBanking) to complete your purchase.
                    </p>
                  )}
                </div>
              </label>
            </div>

            {/* COD Option */}
            <div
              className={`border-2 rounded-lg p-4 transition-all ${
                paymentMethod === "cod"
                  ? "border-teal-500 bg-teal-50/50"
                  : "border-border bg-background"
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-4 h-4 text-teal-600 border-2 border-gray-300 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  style={{
                    accentColor: paymentMethod === "cod" ? "#14b8a6" : undefined,
                  }}
                />
                <div className="font-semibold text-base">
                  Cash on Delivery (COD)
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="border-b border-border py-6">
          <h2 className="text-lg font-bold mb-4">Billing address</h2>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="billing"
                checked={billingSameAsShipping}
                onChange={() => setBillingSameAsShipping(true)}
                className="mt-1 w-4 h-4 text-primary border-border focus:ring-2 focus:ring-ring"
              />
              <span className="font-medium">Same as shipping address</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="billing"
                checked={!billingSameAsShipping}
                onChange={() => setBillingSameAsShipping(false)}
                className="mt-1 w-4 h-4 text-primary border-border focus:ring-2 focus:ring-ring"
              />
              <span className="font-medium">Use a different billing address</span>
            </label>
          </div>
        </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="mt-8 lg:mt-0 lg:w-96 lg:flex-shrink-0">
          <div className="lg:sticky lg:top-6">
          <div className="space-y-4">
            {/* Discount */}
            <div>
              {!showDiscountInput ? (
                <button
                  onClick={() => setShowDiscountInput(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Tag className="h-4 w-4" />
                  <span className="text-sm font-medium">Add discount</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Discount code"
                    className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={() => setShowDiscountInput(false)}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Order Items Summary */}
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Size: {item.size} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold">Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">INR</span>
                  <span className="font-bold text-lg">
                    ₹ {total.toLocaleString("en-IN")}.00
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
              <p className="text-xs text-muted-foreground">
                Including ₹0.00 in taxes
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Pay Now / Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {isSubmitting
                ? "Processing..."
                : paymentMethod === "cod"
                  ? "Place Order"
                  : "Pay now"}
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center">
            <Link href="#" className="hover:underline">
              Refund policy
            </Link>
            <Link href="#" className="hover:underline">
              Shipping
            </Link>
            <Link href="#" className="hover:underline">
              Privacy policy
            </Link>
            <Link href="#" className="hover:underline">
              Terms of service
            </Link>
            <Link href="#" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

