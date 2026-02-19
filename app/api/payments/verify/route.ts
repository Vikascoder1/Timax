import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@/lib/supabase/server"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { convertToStorageUrl } from "@/lib/supabase-storage"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body as {
      orderId?: string
      razorpay_order_id?: string
      razorpay_payment_id?: string
      razorpay_signature?: string
    }

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 }
      )
    }

    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay secret not configured" },
        { status: 500 }
      )
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      console.error("Razorpay signature mismatch", {
        expectedSignature,
        receivedSignature: razorpay_signature,
      })
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Fetch order to confirm it exists
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Fetch full order details for email
    const { data: fullOrder, error: fullOrderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order.id)
      .single()

    if (fullOrderError || !fullOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Update order as paid
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "completed",
        status: "confirmed",
        razorpay_order_id,
        razorpay_payment_id,
        payment_signature: razorpay_signature,
      })
      .eq("id", order.id)

    if (updateError) {
      console.error("Error updating order after payment:", updateError)
      return NextResponse.json(
        { error: "Failed to update order after payment" },
        { status: 500 }
      )
    }

    // Send confirmation email after successful payment
    const { data: orderItemsData } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id)

    const emailData = {
      orderNumber: fullOrder.order_number,
      customerName: fullOrder.customer_name,
      customerEmail: fullOrder.customer_email,
      orderDate: new Date(fullOrder.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      items: await Promise.all(
        (orderItemsData || []).map(async (item: {
          product_name: string
          product_image: string
          size: string
          quantity: number
          unit_price: number
          total_price: number
        }) => ({
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
      subtotal: Number(fullOrder.subtotal),
      tax: Number(fullOrder.tax),
      shippingCost: Number(fullOrder.shipping_cost),
      totalAmount: Number(fullOrder.total_amount),
      paymentMethod: fullOrder.payment_method,
      shippingAddress: {
        address: fullOrder.shipping_address,
        city: fullOrder.shipping_city,
        state: fullOrder.shipping_state,
        pincode: fullOrder.shipping_pincode,
        country: fullOrder.shipping_country,
      },
    }

    // Send email (don't fail if email fails)
    const emailResult = await sendOrderConfirmationEmail(emailData)
    if (!emailResult.success) {
      console.error("Failed to send order confirmation email after payment:", emailResult.error)
    } else {
      console.log("Order confirmation email sent successfully to:", fullOrder.customer_email)
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.order_number,
        },
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error("Error verifying Razorpay payment:", error)
    return NextResponse.json(
      { error: "Failed to verify payment", details: (error as { message?: string })?.message || "Unknown error" },
      { status: 500 }
    )
  }
}





