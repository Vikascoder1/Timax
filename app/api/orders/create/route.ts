import { NextRequest, NextResponse } from "next/server"
import { createClient, retrySupabaseOperation } from "@/lib/supabase/server"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { convertToStorageUrl } from "@/lib/supabase-storage"
import { createShiprocketOrder } from "@/lib/shiprocket"

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
      discount = 0,
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
    process.stdout.write(`🔍🔍🔍 VALIDATING PAYMENT METHOD 🔍🔍🔍\n`)
    process.stdout.write(`🔍 Payment method received: "${paymentMethod}"\n`)
    process.stdout.write(`🔍 Payment method type: ${typeof paymentMethod}\n`)
    
    if (paymentMethod !== "cod" && paymentMethod !== "razorpay") {
      const invalidPaymentMsg = `❌❌❌ INVALID PAYMENT METHOD: ${paymentMethod} ❌❌❌\n`
      console.error(invalidPaymentMsg)
      process.stdout.write(invalidPaymentMsg)
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      )
    }
    
    process.stdout.write(`✅ Payment method validation passed: ${paymentMethod}\n`)

    // Generate order number with retry
    const orderNumberResponse = await retrySupabaseOperation(async () => {
      return await supabase.rpc("generate_order_number")
    })
    const orderNumber =
      orderNumberResponse.data || `ORD-${Date.now().toString().slice(-10)}`

    // Create order with retry
    const orderResult = await retrySupabaseOperation(async () => {
      return await supabase
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
          discount: discount || 0,
          tax: tax,
          shipping_cost: shippingCost,
          total_amount: totalAmount,
          special_instructions: specialInstructions || null,
        })
        .select()
        .single()
    })

    const order = orderResult.data
    const orderError = orderResult.error

    if (orderError) {
      const errorMsg = `❌❌❌ ERROR CREATING ORDER ❌❌❌\n`
      console.error(errorMsg)
      process.stdout.write(errorMsg)
      console.error("Error creating order:", orderError)
      process.stdout.write(`Error: ${JSON.stringify(orderError)}\n`)
      return NextResponse.json(
        { error: "Failed to create order", details: orderError.message },
        { status: 500 }
      )
    }

    if (!order) {
      const noOrderMsg = `❌❌❌ NO ORDER DATA RETURNED ❌❌❌\n`
      console.error(noOrderMsg)
      process.stdout.write(noOrderMsg)
      return NextResponse.json(
        { error: "Failed to create order - no data returned" },
        { status: 500 }
      )
    }

    // Log successful order creation
    const orderCreatedMsg = `✅✅✅ ORDER CREATED SUCCESSFULLY ✅✅✅\n`
    console.log(orderCreatedMsg)
    process.stdout.write(orderCreatedMsg)
    process.stdout.write(`📊 Order ID: ${order.id}\n`)
    process.stdout.write(`📊 Order Number: ${order.order_number}\n`)
    process.stdout.write(`📊 Payment Method from order: ${order.payment_method}\n`)
    process.stdout.write(`📊 Payment Method variable: ${paymentMethod}\n`)

    // Create order items with retry
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

    const itemsResult = await retrySupabaseOperation(async () => {
      return await supabase
        .from("order_items")
        .insert(orderItems)
    })

    if (itemsResult.error) {
      console.error("Error creating order items:", itemsResult.error)
      process.stdout.write(`❌❌❌ ERROR CREATING ORDER ITEMS ❌❌❌\n`)
      // Rollback order if items fail
      await retrySupabaseOperation(async () => {
        return await supabase.from("orders").delete().eq("id", order.id)
      }).catch((err) => {
        console.error("Failed to rollback order:", err)
      })
      return NextResponse.json(
        { error: "Failed to create order items", details: itemsResult.error.message },
        { status: 500 }
      )
    }

    // Log that order items were created successfully
    const itemsCreatedMsg = `✅✅✅ ORDER ITEMS CREATED SUCCESSFULLY ✅✅✅\n`
    console.log(itemsCreatedMsg)
    process.stdout.write(itemsCreatedMsg)
    process.stdout.write(`📊 Order ID: ${order.id}\n`)
    process.stdout.write(`📊 Order Number: ${order.order_number}\n`)
    process.stdout.write(`📊 Payment Method: ${paymentMethod}\n`)
    process.stdout.write(`📊 About to check if paymentMethod === "cod"\n`)

    // Send confirmation email (only for COD, prepaid will send after payment)
    const codCheckMsg = `💳 Payment method check: ${paymentMethod} (COD check: ${paymentMethod === "cod"})\n`
    console.log(codCheckMsg)
    process.stdout.write(codCheckMsg)
    process.stdout.write(`💳💳💳 PAYMENT METHOD: ${paymentMethod} 💳💳💳\n`)
    
    if (paymentMethod === "cod") {
      process.stdout.write(`🚨🚨🚨 ENTERING COD BLOCK - WILL SEND EMAIL AND SHIPROCKET 🚨🚨🚨\n`)
      console.log(`🚨🚨🚨 ENTERING COD BLOCK - WILL SEND EMAIL AND SHIPROCKET 🚨🚨🚨`)
      const codMsg = `✅✅✅ PROCESSING COD ORDER - WILL SEND TO SHIPROCKET ✅✅✅\n`
      console.log(codMsg)
      process.stdout.write(codMsg)
      // Get full order with items for email with retry
      const orderItemsResult = await retrySupabaseOperation(async () => {
        return await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id)
      })
      const orderItemsData = orderItemsResult.data

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
      const emailPrepMsg = `📧 ===== PREPARING TO SEND ORDER CONFIRMATION EMAIL =====\n`
      console.log(emailPrepMsg)
      process.stdout.write(emailPrepMsg)
      console.log("📧 Order number:", emailData.orderNumber)
      console.log("📧 Customer email:", emailData.customerEmail)
      console.log("📧 Items count:", emailData.items.length)
      process.stdout.write(`📧 Order number: ${emailData.orderNumber}\n`)
      process.stdout.write(`📧 Customer email: ${emailData.customerEmail}\n`)
      process.stdout.write(`📧 Items count: ${emailData.items.length}\n`)
      process.stdout.write(`📧 Preparing to send order confirmation email to: ${emailData.customerEmail}\n`)
      process.stdout.write(`🚨🚨🚨 CALLING sendOrderConfirmationEmail NOW 🚨🚨🚨\n`)
      process.stdout.write(`🚨🚨🚨 EMAIL FUNCTION CALL STARTING 🚨🚨🚨\n`)
      
      // Call email function and log immediately
      const emailPromise = sendOrderConfirmationEmail(emailData)
      process.stdout.write(`🚨🚨🚨 EMAIL FUNCTION CALLED, WAITING FOR RESULT 🚨🚨🚨\n`)
      
      emailPromise
        .then((result) => {
          if (result.success) {
            const successMsg = `✅✅✅ Order confirmation email sent successfully! ✅✅✅`
            console.log(successMsg)
            console.log("✅ Order confirmation email sent to:", emailData.customerEmail)
            console.log("✅ Email messageId:", (result as { messageId?: string }).messageId)
            process.stdout.write(successMsg + "\n")
            process.stdout.write(`✅ Order confirmation email sent to: ${emailData.customerEmail}\n`)
            if ((result as { messageId?: string }).messageId) {
              process.stdout.write(`✅ Email messageId: ${(result as { messageId?: string }).messageId}\n`)
            }
          } else {
            const errorMsg = `❌❌❌ FAILED TO SEND ORDER EMAIL ❌❌❌`
            console.error(errorMsg)
            console.error("❌ Failed to send order email:", result.error || 'Unknown error')
            process.stdout.write(errorMsg + "\n")
            process.stdout.write(`❌ Failed to send order email: ${result.error || 'Unknown error'}\n`)
            if ((result as { code?: string }).code) {
              console.error("❌ Brevo error code:", (result as { code?: string }).code)
              process.stdout.write(`❌ Brevo error code: ${(result as { code?: string }).code}\n`)
            }
            // Log full error details
            console.error("❌ Full email result:", JSON.stringify(result, null, 2))
            process.stdout.write(`❌ Full email result: ${JSON.stringify(result, null, 2)}\n`)
          }
        })
        .catch((err) => {
          const errorMsg = `❌❌❌ EXCEPTION SENDING ORDER EMAIL ❌❌❌`
          console.error(errorMsg)
          console.error("❌ Email error:", err)
          process.stdout.write(errorMsg + "\n")
          process.stdout.write(`❌ Email error: ${err instanceof Error ? err.message : String(err)}\n`)
          if (err instanceof Error && err.stack) {
            console.error("❌ Error stack:", err.stack)
            process.stdout.write(`❌ Error stack: ${err.stack}\n`)
          }
        })

      // Send to Shiprocket - DO NOT AWAIT, send in background
      // Use process.stdout to ensure logs are visible
      const shiprocketLog = `📦📦📦 ATTEMPTING TO PUSH COD ORDER ${order.order_number} TO SHIPROCKET 📦📦📦\n`
      console.log(shiprocketLog)
      process.stdout.write(shiprocketLog)
      process.stdout.write(`🚨🚨🚨 CALLING createShiprocketOrder NOW 🚨🚨🚨\n`)
      
      // Wrap in try-catch to ensure we catch any synchronous errors
      try {
        process.stdout.write(`🚨🚨🚨 INSIDE TRY BLOCK FOR SHIPROCKET 🚨🚨🚨\n`)
        process.stdout.write(`🚨🚨🚨 ABOUT TO CALL createShiprocketOrder FUNCTION 🚨🚨🚨\n`)
        
        const shiprocketPromise = createShiprocketOrder({
          orderId: order.order_number,
          orderDate: new Date(order.created_at),
          paymentMethod: "cod",
          subtotal: order.subtotal,
          totalAmount: order.total_amount,
          shippingCost: order.shipping_cost,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          customerPhone: order.customer_phone,
          shippingAddress: order.shipping_address,
          shippingCity: order.shipping_city,
          shippingState: order.shipping_state,
          shippingPincode: order.shipping_pincode,
          shippingCountry: order.shipping_country,
          items: items.map((item: any) => ({
            name: item.name,
            productId: item.productId,
            sku: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        })
        
        process.stdout.write(`🚨🚨🚨 createShiprocketOrder FUNCTION CALLED, WAITING FOR RESULT 🚨🚨🚨\n`)
        
        shiprocketPromise
          .then(res => {
            const successLog = `✅✅✅ SHIPROCKET RESULT FOR COD ORDER ${order.order_number} ✅✅✅\n`
            console.log(successLog)
            process.stdout.write(successLog)
            
            if (res.success) {
              const successMsg = `✅✅✅ Shiprocket order created successfully for COD order ${order.order_number} ✅✅✅\n`
              console.log(successMsg)
              process.stdout.write(successMsg)
              console.log(`   Shiprocket Order ID: ${res.data?.order_id || res.data?.id || 'N/A'}`)
              process.stdout.write(`   Shiprocket Order ID: ${res.data?.order_id || res.data?.id || 'N/A'}\n`)
            } else {
              const errorMsg = `❌❌❌ Failed to push order ${order.order_number} to Shiprocket ❌❌❌\n`
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
          .catch(err => {
            const catchMsg = `❌❌❌ EXCEPTION IN SHIPROCKET PROMISE FOR ORDER ${order.order_number} ❌❌❌\n`
            console.error(catchMsg)
            process.stdout.write(catchMsg)
            console.error(`   Exception:`, err)
            console.error(`   Exception type:`, err?.constructor?.name || typeof err)
            console.error(`   Exception message:`, err?.message || String(err))
            process.stdout.write(`   Exception message: ${err?.message || String(err)}\n`)
          })
      } catch (syncError) {
        const syncErrorMsg = `❌❌❌ SYNCHRONOUS ERROR CALLING SHIPROCKET FOR ORDER ${order.order_number} ❌❌❌\n`
        console.error(syncErrorMsg)
        process.stdout.write(syncErrorMsg)
        console.error(`   Sync error:`, syncError)
        process.stdout.write(`   Sync error: ${String(syncError)}\n`)
      }
    }

    const orderCompleteMsg = `✅ Order created successfully. Order number: ${order.order_number}\n`
    console.log(orderCompleteMsg)
    process.stdout.write(orderCompleteMsg)
    process.stdout.write(`🛒 ===== ORDER CREATION COMPLETE =====\n`)
    console.log("🛒 ===== ORDER CREATION COMPLETE =====")
    
    // Log final status
    process.stdout.write(`📊 FINAL STATUS: Order ${order.order_number} created, paymentMethod=${paymentMethod}\n`)
    if (paymentMethod === "cod") {
      process.stdout.write(`📊 EMAIL AND SHIPROCKET CALLS INITIATED (check logs above)\n`)
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
  } catch (error: unknown) {
    console.error("❌❌❌ ERROR IN ORDER CREATION API ❌❌❌")
    console.error("Error:", error)
    console.error("Error type:", typeof error)
    
    const errorMessage = (error as { message?: string })?.message || ""
    const errorCause = (error as { cause?: { code?: string; errno?: number; hostname?: string } })?.cause
    
    // Check if it's a DNS error
    const isDnsError = 
      errorMessage.includes("getaddrinfo") ||
      errorMessage.includes("EAI_AGAIN") ||
      errorMessage.includes("ERR_NAME_NOT_RESOLVED") ||
      errorCause?.code === "EAI_AGAIN" ||
      errorCause?.errno === -3001
    
    if (isDnsError) {
      const hostname = errorCause?.hostname || "Supabase"
      console.error(`❌ DNS ERROR: Cannot resolve ${hostname}`)
      console.error("💡 This is a network/DNS issue. Order cannot be created without database connection.")
      return NextResponse.json(
        { 
          error: "Database connection failed", 
          details: `Cannot connect to Supabase. Please check your network connection and try again.`,
          isNetworkError: true
        },
        { status: 503 } // Service Unavailable
      )
    }
    
    console.error("Error message:", errorMessage)
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage || "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
