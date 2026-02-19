import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { razorpay } from "@/lib/razorpay"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { orderId } = body as { orderId?: string }

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
    }

    // Fetch order to get amount and order_number
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, total_amount, payment_method, payment_status")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("Error fetching order for Razorpay:", orderError)
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    if (order.payment_method !== "razorpay") {
      return NextResponse.json(
        { error: "Order is not set for Razorpay payment" },
        { status: 400 }
      )
    }

    if (order.payment_status === "completed") {
      return NextResponse.json(
        { error: "Order is already paid" },
        { status: 400 }
      )
    }

    const amountInPaise = Math.round(Number(order.total_amount) * 100)

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.order_number,
      notes: {
        orderId: order.id,
      },
    })

    // Persist Razorpay order id on our order record
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        razorpay_order_id: razorpayOrder.id,
      })
      .eq("id", order.id)

    if (updateError) {
      console.error("Failed to save Razorpay order id:", updateError)
      // We still return success so that payment can proceed, but log for debugging
    }

    return NextResponse.json(
      {
        success: true,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error)

    // Try to surface helpful info from Razorpay SDK error shape
    const statusCode = error?.statusCode
    const razorpayErrorCode = error?.error?.code
    const razorpayErrorDescription = error?.error?.description

    return NextResponse.json(
      {
        error: "Failed to create Razorpay order",
        details: error.message,
        statusCode,
        razorpayErrorCode,
        razorpayErrorDescription,
      },
      { status: 500 }
    )
  }
}



