import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { convertToStorageUrl } from "@/lib/supabase-storage"

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
  // Log immediately - even before try/catch - use process.stdout for guaranteed output
  const logMessage = `🛒🛒🛒 ORDER API ROUTE HIT - STARTING 🛒🛒🛒 ${new Date().toISOString()}`
  console.log(logMessage)
  process.stdout.write(logMessage + "\n")
  
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const bodyLog = {
      paymentMethod: body.paymentMethod,
      customerEmail: body.customerEmail,
      itemsCount: body.items?.length,
    }
    console.log("📦 Request body received:", bodyLog)
    process.stdout.write(`📦 Request body: ${JSON.stringify(bodyLog)}\n`)

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
    
    console.log("✅ Payment method:", paymentMethod)

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
      product_image: item.image || "",
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
      // Get full order with items for email
      const { data: orderItemsData } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id)

      const emailData = {
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        orderDate: new Date(order.created_at).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        items: await Promise.all(
          (orderItemsData || []).map(async (item: OrderItem) => ({
            name: item.product_name,
            image: item.product_image
              ? await convertToStorageUrl(item.product_image)
              : undefined,
            size: item.size,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            totalPrice: Number(item.total_price),
          }))
        ),
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

      // Send email - DO NOT AWAIT, send in background
      sendOrderConfirmationEmail(emailData).then((result) => {
        if (result.success) {
          console.log("✅ Order confirmation email sent to:", emailData.customerEmail)
        } else {
          console.error("❌ Failed to send order email:", result.error)
        }
      }).catch((err) => {
        console.error("❌ Email error:", err)
      })
    }

    console.log("✅ Order created successfully. Order number:", order.order_number)
    console.log("🛒 ===== ORDER CREATION COMPLETE =====")
    
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
  } catch (error: unknown) {
    console.error("❌❌❌ ERROR IN ORDER CREATION API ❌❌❌")
    console.error("Error:", error)
    console.error("Error type:", typeof error)
    console.error("Error message:", (error as { message?: string })?.message)
    const errorMessage = (error as { message?: string })?.message || "Internal server error"
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    )
  }
}
