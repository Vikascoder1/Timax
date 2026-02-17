import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@/lib/supabase/server"

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
  } catch (error: any) {
    console.error("Error verifying Razorpay payment:", error)
    return NextResponse.json(
      { error: "Failed to verify payment", details: error.message },
      { status: 500 }
    )
  }
}



