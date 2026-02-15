import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendOrderConfirmationEmail } from "@/lib/email"

type OrderItem = {
  order_id: string
  product_id: string
  product_name: string
  product_image: string
  size: string
  quantity: number
  unit_price: number
  total_price: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate required fields
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPincode,
      shippingCountry = "India",
      paymentMethod,
      items,
      subtotal,
      tax = 0,
      shippingCost = 0,
      totalAmount,
      specialInstructions,
      userId,
    } = body

    // Validation
    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !shippingAddress ||
      !shippingCity ||
      !shippingState ||
      !shippingPincode ||
      !paymentMethod ||
      !items ||
      items.length === 0 ||
      !totalAmount
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate payment method
    if (paymentMethod !== "cod" && paymentMethod !== "razorpay") {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumberResponse = await supabase.rpc("generate_order_number")
    const orderNumber =
      orderNumberResponse.data || `ORD-${Date.now().toString().slice(-10)}`

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId || null,
        order_number: orderNumber,
        status: paymentMethod === "cod" ? "confirmed" : "pending_payment",
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cod" ? "completed" : "pending",
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_state: shippingState,
        shipping_pincode: shippingPincode,
        shipping_country: shippingCountry,
        subtotal: subtotal,
        tax: tax,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        special_instructions: specialInstructions || null,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json(
        { error: "Failed to create order", details: orderError.message },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_image: item.image,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      // Rollback order if items fail
      await supabase.from("orders").delete().eq("id", order.id)
      return NextResponse.json(
        { error: "Failed to create order items", details: itemsError.message },
        { status: 500 }
      )
    }

    // Send confirmation email (only for COD, prepaid will send after payment)
    if (paymentMethod === "cod") {
      const emailData = {
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        orderDate: new Date(order.created_at).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        items: orderItems.map((item: OrderItem) => ({
          name: item.product_name,
          size: item.size,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          totalPrice: Number(item.total_price),
        })),
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        shippingCost: Number(order.shipping_cost),
        totalAmount: Number(order.total_amount),
        paymentMethod: order.payment_method,
        shippingAddress: {
          address: order.shipping_address,
          city: order.shipping_city,
          state: order.shipping_state,
          pincode: order.shipping_pincode,
          country: order.shipping_country,
        },
      }

      // Send email (don't fail if email fails)
      await sendOrderConfirmationEmail(emailData)
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          paymentMethod: order.payment_method,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error in create order API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

