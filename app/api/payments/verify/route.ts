import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@/lib/supabase/server"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { convertToStorageUrl } from "@/lib/supabase-storage"
import { createShiprocketOrder } from "@/lib/shiprocket"

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
      discount: Number(fullOrder.discount || 0),
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
    console.log("📧 ===== PREPARING TO SEND ORDER CONFIRMATION EMAIL AFTER PAYMENT =====")
    console.log("📧 Order number:", emailData.orderNumber)
    console.log("📧 Customer email:", emailData.customerEmail)
    console.log("📧 Items count:", emailData.items.length)
    
    const emailResult = await sendOrderConfirmationEmail(emailData)
    if (!emailResult.success) {
      const errorMsg = `❌❌❌ FAILED TO SEND ORDER EMAIL AFTER PAYMENT ❌❌❌`
      console.error(errorMsg)
      console.error("❌ Failed to send order confirmation email after payment:", emailResult.error)
      if ((emailResult as { code?: string }).code) {
        console.error("❌ Brevo error code:", (emailResult as { code?: string }).code)
      }
      console.error("❌ Full email result:", JSON.stringify(emailResult, null, 2))
    } else {
      const successMsg = `✅✅✅ Order confirmation email sent successfully after payment! ✅✅✅`
      console.log(successMsg)
      console.log("✅ Order confirmation email sent to:", fullOrder.customer_email)
      if ((emailResult as { messageId?: string }).messageId) {
        console.log("✅ Email messageId:", (emailResult as { messageId?: string }).messageId)
      }
    }

    // Send prepaid order to Shiprocket (mirrors COD flow logging & behavior)
    const shiprocketStartMsg = `📦📦📦 ATTEMPTING TO PUSH PREPAID ORDER ${fullOrder.order_number} TO SHIPROCKET 📦📦📦\n`
    console.log(shiprocketStartMsg)
    process.stdout.write(shiprocketStartMsg)

    try {
      process.stdout.write(`🚨🚨🚨 CALLING createShiprocketOrder FOR PREPAID ORDER NOW 🚨🚨🚨\n`)

      const shiprocketPromise = createShiprocketOrder({
        orderId: fullOrder.order_number,
        orderDate: new Date(fullOrder.created_at),
        paymentMethod: "prepaid",
        subtotal: Number(fullOrder.subtotal),
        totalAmount: Number(fullOrder.total_amount),
        shippingCost: Number(fullOrder.shipping_cost),
        customerName: fullOrder.customer_name,
        customerEmail: fullOrder.customer_email,
        customerPhone: fullOrder.customer_phone,
        shippingAddress: fullOrder.shipping_address,
        shippingCity: fullOrder.shipping_city,
        shippingState: fullOrder.shipping_state,
        shippingPincode: fullOrder.shipping_pincode,
        shippingCountry: fullOrder.shipping_country,
        items: (orderItemsData || []).map((item: any) => ({
          name: item.product_name,
          productId: item.product_id,
          sku: item.product_id, // We use product_id as SKU if sku unavailable
          quantity: item.quantity,
          price: Number(item.unit_price),
        })),
      })

      process.stdout.write(`🚨🚨🚨 createShiprocketOrder (PREPAID) CALLED, WAITING FOR RESULT 🚨🚨🚨\n`)

      shiprocketPromise
        .then((res) => {
          const resultLog = `✅✅✅ SHIPROCKET RESULT FOR PREPAID ORDER ${fullOrder.order_number} ✅✅✅\n`
          console.log(resultLog)
          process.stdout.write(resultLog)

          if (res.success) {
            const successMsg = `✅✅✅ Shiprocket order created successfully for PREPAID order ${fullOrder.order_number} ✅✅✅\n`
            console.log(successMsg)
            process.stdout.write(successMsg)
            console.log(`   Shiprocket Order ID: ${res.data?.order_id || res.data?.id || "N/A"}`)
            process.stdout.write(
              `   Shiprocket Order ID: ${res.data?.order_id || res.data?.id || "N/A"}\n`
            )
          } else {
            const errorMsg = `❌❌❌ Failed to push PREPAID order ${fullOrder.order_number} to Shiprocket ❌❌❌\n`
            console.error(errorMsg)
            process.stdout.write(errorMsg)
            console.error(`   Error:`, res.error)
            console.error(`   Error details:`, res.errorDetails || res.responseData)
            if (res.error instanceof Error) {
              console.error(`   Error message: ${res.error.message}`)
              console.error(`   Error stack: ${res.error.stack}`)
              process.stdout.write(`   Error message: ${res.error.message}\n`)
            }
          }
        })
        .catch((err) => {
          const catchMsg = `❌❌❌ EXCEPTION IN SHIPROCKET PROMISE FOR PREPAID ORDER ${fullOrder.order_number} ❌❌❌\n`
          console.error(catchMsg)
          process.stdout.write(catchMsg)
          console.error(`   Exception:`, err)
          console.error(`   Exception type:`, err?.constructor?.name || typeof err)
          console.error(`   Exception message:`, err?.message || String(err))
          process.stdout.write(`   Exception message: ${err?.message || String(err)}\n`)
        })
    } catch (err) {
      const syncErrorMsg = `❌❌❌ SYNCHRONOUS ERROR CALLING SHIPROCKET FOR PREPAID ORDER ${fullOrder.order_number} ❌❌❌\n`
      console.error(syncErrorMsg)
      process.stdout.write(syncErrorMsg)
      console.error(`   Sync error:`, err)
      process.stdout.write(`   Sync error: ${String(err)}\n`)
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





