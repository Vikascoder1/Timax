import * as brevo from "@getbrevo/brevo"

// Initialize Brevo API client with timeout configuration
let apiInstance: brevo.TransactionalEmailsApi | null = null

function getBrevoApiInstance() {
  if (!apiInstance) {
    const apiKey = process.env.BREVO_API_KEY
    if (!apiKey) {
      console.error("❌ BREVO_API_KEY is not set in environment variables!")
      return null
    }
    apiInstance = new brevo.TransactionalEmailsApi()
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      apiKey
    )
    
    // Configure default timeout for axios (used internally by Brevo SDK)
    // Note: This may not work if Brevo SDK doesn't expose axios config
    // But we'll handle timeouts in our retry logic instead
    console.log("✅ Brevo API client initialized")
  }
  return apiInstance
}

// Retry function for email sending with timeout handling
async function sendEmailWithRetry(
  api: brevo.TransactionalEmailsApi,
  email: brevo.SendSmtpEmail,
  maxRetries = 3
): Promise<{ response: unknown; body: unknown }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Attempt ${attempt}/${maxRetries} to send email...`)
      
      // Wrap API call with longer timeout (60 seconds)
      // Brevo API can be slow, especially with images in emails
      // Use configurable timeout from env or default to 60s
      const timeoutMs = Number.parseInt(process.env.BREVO_TIMEOUT_MS || "60000", 10)
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timeout after ${timeoutMs / 1000} seconds`))
        }, timeoutMs)
      })
      
      // Create email promise with error handling
      const emailPromise = api.sendTransacEmail(email).catch((err: unknown) => {
        // Log the error for debugging
        const errorDetails = err as { code?: string; message?: string; response?: unknown; cause?: { code?: string } }
        console.error(`📧 Brevo API call error:`, {
          code: errorDetails?.code || errorDetails?.cause?.code,
          message: errorDetails?.message,
          hasResponse: !!errorDetails?.response
        })
        throw err
      })
      
      const result = await Promise.race([emailPromise, timeoutPromise])
      console.log(`✅ Email sent successfully on attempt ${attempt}`)
      return result as { response: unknown; body: unknown }
    } catch (error: unknown) {
      const errorObj = error as { code?: string; message?: string; cause?: { code?: string } }
      const errorCode = errorObj?.code || errorObj?.cause?.code
      const errorMessage = errorObj?.message || ""
      
      // Check for retryable errors (network/connection issues)
      const isRetryableError = 
        errorCode === "ETIMEDOUT" ||
        errorCode === "ECONNRESET" ||
        errorCode === "ECONNREFUSED" ||
        errorCode === "ENOTFOUND" ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("socket hang up") ||
        errorMessage.includes("ECONNRESET") ||
        errorMessage === "Request timeout after 60 seconds"
      
      console.error(`❌ Attempt ${attempt} failed:`, errorMessage || errorCode)
      console.error(`📧 Error code:`, errorCode)
      
      if (isRetryableError && attempt < maxRetries) {
        const waitTime = attempt * 3000 // Exponential backoff: 3s, 6s, 9s
        console.log(`⏳ Retryable error detected (${errorCode}). Retrying in ${waitTime}ms...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        continue
      }
      
      // If not retryable or last attempt, throw immediately
      if (!isRetryableError || attempt === maxRetries) {
        throw error
      }
    }
  }
  throw new Error("All retry attempts failed")
}

export interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  orderDate: string
  items: Array<{
    name: string
    image?: string
    size: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  subtotal: number
  tax: number
  shippingCost: number
  totalAmount: number
  paymentMethod: string
  shippingAddress: {
    address: string
    city: string
    state: string
    pincode: string
    country: string
  }
}

export interface SignupEmailData {
  customerName: string
  customerEmail: string
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  console.log("📧 ===== SEND ORDER CONFIRMATION EMAIL CALLED =====")
  console.log("📧 Attempting to send order confirmation email to:", data.customerEmail)
  console.log("📧 Order number:", data.orderNumber)
  
  const api = getBrevoApiInstance()
  if (!api) {
    console.error("❌ BREVO_API_KEY not set. Email not sent.")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    
    const fromEmail = process.env.BREVO_FROM_EMAIL || "noreply@mscrafts.com"
    const fromName = process.env.BREVO_FROM_NAME || "MS CRAFTS"
    
    console.log("📧 Email configuration:", {
      from: `${fromName} <${fromEmail}>`,
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderNumber}`,
    })
    
    sendSmtpEmail.subject = `Order Confirmation - ${data.orderNumber}`
    sendSmtpEmail.htmlContent = generateOrderEmailHTML(data)
    sendSmtpEmail.sender = {
      name: fromName,
      email: fromEmail,
    }
    sendSmtpEmail.to = [{ email: data.customerEmail, name: data.customerName }]
    
    if (process.env.BREVO_REPLY_TO) {
      sendSmtpEmail.replyTo = { email: process.env.BREVO_REPLY_TO }
    }

    console.log("📤 Sending email via Brevo API with retry logic...")
    const result = await sendEmailWithRetry(api, sendSmtpEmail, 3)
    console.log("✅✅✅ Email sent successfully!")
    console.log("✅ Brevo response:", JSON.stringify(result.body, null, 2))
    console.log("📧 ===== EMAIL SENT SUCCESSFULLY =====")
    
    return { success: true, data: result }
  } catch (error: unknown) {
    console.error("❌❌❌ ERROR sending order confirmation email:")
    console.error("❌ Error object:", error)
    const brevoError = error as { response?: { body?: { message?: string; code?: string } } }
    const errorMessage = 
      brevoError?.response?.body?.message ||
      (error as { message?: string })?.message ||
      "Failed to send email"
    const errorCode = brevoError?.response?.body?.code
    
    console.error("❌ Error details:", {
      message: errorMessage,
      code: errorCode,
    })
    console.error("❌ Full error:", JSON.stringify(error, null, 2))
    console.log("📧 ===== EMAIL SEND FAILED =====")
    
    return { 
      success: false, 
      error: errorMessage,
      code: errorCode
    }
  }
}

export async function sendSignupConfirmationEmail(data: SignupEmailData) {
  console.log("📧 Attempting to send signup confirmation email to:", data.customerEmail)
  
  const api = getBrevoApiInstance()
  if (!api) {
    console.error("❌ BREVO_API_KEY not set. Email not sent.")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    
    sendSmtpEmail.subject = "Welcome to MS CRAFTS - Your Account is Ready! 🎉"
    sendSmtpEmail.htmlContent = generateSignupEmailHTML(data)
    sendSmtpEmail.sender = {
      name: process.env.BREVO_FROM_NAME || "MS CRAFTS",
      email: process.env.BREVO_FROM_EMAIL || "noreply@mscrafts.com",
    }
    sendSmtpEmail.to = [{ email: data.customerEmail, name: data.customerName }]
    
    if (process.env.BREVO_REPLY_TO) {
      sendSmtpEmail.replyTo = { email: process.env.BREVO_REPLY_TO }
    }

    console.log("📤 Sending welcome email via Brevo with retry logic...")
    const result = await sendEmailWithRetry(api, sendSmtpEmail, 3)
    console.log("✅ Welcome email sent successfully. Response:", JSON.stringify(result.body, null, 2))
    
    return { success: true, data: result }
  } catch (error: unknown) {
    console.error("❌ Error sending signup confirmation email:", error)
    const brevoError = error as { response?: { body?: { message?: string; code?: string } } }
    const errorMessage = 
      brevoError?.response?.body?.message ||
      (error as { message?: string })?.message ||
      "Failed to send email"
    const errorCode = brevoError?.response?.body?.code
    
    console.error("Error details:", {
      message: errorMessage,
      code: errorCode,
      fullError: JSON.stringify(error, null, 2)
    })
    
    return { 
      success: false, 
      error: errorMessage,
      code: errorCode
    }
  }
}

function generateOrderEmailHTML(data: OrderEmailData): string {
  const paymentMethodText =
    data.paymentMethod === "cod"
      ? "Cash on Delivery"
      : "Prepaid Payment (Razorpay)"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #14b8a6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">MS CRAFTS</h1>
    <p style="margin: 10px 0 0 0;">Order Confirmation</p>
  </div>
  
  <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Dear ${data.customerName},
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for your order! We've received your order and will begin processing it shortly.
    </p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #14b8a6;">
      <h2 style="margin-top: 0; color: #14b8a6;">Order Details</h2>
      <p style="margin: 5px 0;"><strong>Order Number:</strong> ${data.orderNumber}</p>
      <p style="margin: 5px 0;"><strong>Order Date:</strong> ${data.orderDate}</p>
      <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethodText}</p>
    </div>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #14b8a6;">Order Items</h3>
      ${data.items
        .map(
          (item) => `
        <div style="display: flex; gap: 15px; padding: 15px; border-bottom: 1px solid #e5e7eb; align-items: center;">
          ${item.image 
            ? `<div style="flex-shrink: 0;">
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;" />
              </div>`
            : ""
          }
          <div style="flex: 1;">
            <p style="margin: 0 0 5px 0; font-weight: 600; color: #333;">${item.name}</p>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              Size: ${item.size} × Quantity: ${item.quantity}
            </p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 600; color: #14b8a6;">
              ₹${item.totalPrice.toLocaleString("en-IN")}.00
            </p>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #14b8a6;">Shipping Address</h3>
      <p style="margin: 5px 0;">${data.shippingAddress.address}</p>
      <p style="margin: 5px 0;">${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.pincode}</p>
      <p style="margin: 5px 0;">${data.shippingAddress.country}</p>
    </div>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: right;">
      <p style="margin: 5px 0;">Subtotal: ₹${data.subtotal.toLocaleString("en-IN")}.00</p>
      ${data.tax > 0 ? `<p style="margin: 5px 0;">Tax: ₹${data.tax.toLocaleString("en-IN")}.00</p>` : ""}
      ${data.shippingCost > 0 ? `<p style="margin: 5px 0;">Shipping: ₹${data.shippingCost.toLocaleString("en-IN")}.00</p>` : ""}
      <p style="margin: 10px 0; font-size: 18px; font-weight: bold; color: #14b8a6; border-top: 2px solid #e5e7eb; padding-top: 10px;">
        Total: ₹${data.totalAmount.toLocaleString("en-IN")}.00
      </p>
    </div>
    
    <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 14px;">
        <strong>Estimated Delivery:</strong> 5-7 business days
      </p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">
        We'll send you a tracking number once your order ships.
      </p>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      If you have any questions, please contact us at support@mscrafts.com
    </p>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
      Thank you for choosing MS CRAFTS!
    </p>
  </div>
</body>
</html>
  `
}

function generateSignupEmailHTML(data: SignupEmailData): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to MS CRAFTS - Account Created Successfully!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #14b8a6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">MS CRAFTS</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Welcome to Our Family!</p>
  </div>
  
  <div style="background-color: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 80px; height: 80px; background-color: #14b8a6; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
        ✓
      </div>
      <h2 style="margin: 0; color: #14b8a6; font-size: 24px;">Account Created Successfully!</h2>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px; color: #333;">
      Dear <strong>${data.customerName}</strong>,
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px; color: #555;">
      Thank you for joining MS CRAFTS! We're absolutely thrilled to have you as part of our community of craft enthusiasts and art lovers.
    </p>
    
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #14b8a6;">
      <h3 style="margin-top: 0; color: #14b8a6; font-size: 18px;">✨ What You Can Do Now:</h3>
      <ul style="margin: 10px 0; padding-left: 20px; color: #555;">
        <li style="margin-bottom: 8px;"><strong>Browse</strong> our exclusive collection of handcrafted wall clocks and home decor</li>
        <li style="margin-bottom: 8px;"><strong>Save</strong> your favorite items to your wishlist for later</li>
        <li style="margin-bottom: 8px;"><strong>Track</strong> your orders in real-time from placement to delivery</li>
        <li style="margin-bottom: 8px;"><strong>Enjoy</strong> special member-only discounts and early access to new products</li>
        <li style="margin-bottom: 8px;"><strong>Manage</strong> your account settings and shipping addresses</li>
      </ul>
    </div>
    
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 2px solid #f59e0b;">
      <div style="text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #92400e;">
          🎁 Special Welcome Offer!
        </p>
        <p style="margin: 0 0 15px 0; font-size: 16px; color: #78350f;">
          Get <strong style="font-size: 20px; color: #d97706;">10% OFF</strong> your first order!
        </p>
        <div style="background-color: white; padding: 12px; border-radius: 6px; display: inline-block; margin: 10px 0;">
          <p style="margin: 0; font-size: 14px; color: #78350f; font-weight: 600;">Use Code:</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #d97706; letter-spacing: 2px;">WELCOME10</p>
        </div>
        <p style="margin: 15px 0 0 0; font-size: 12px; color: #92400e;">
          Valid for first order only. Terms and conditions apply.
        </p>
      </div>
    </div>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${siteUrl}" 
         style="display: inline-block; background-color: #14b8a6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(20, 184, 166, 0.3); transition: all 0.3s;">
        🛍️ Start Shopping Now
      </a>
    </div>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 30px;">
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
        <strong>Need Help?</strong>
      </p>
      <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
        📧 Email: <a href="mailto:support@mscrafts.com" style="color: #14b8a6; text-decoration: none;">support@mscrafts.com</a>
      </p>
      <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
        🌐 Website: <a href="${siteUrl}" style="color: #14b8a6; text-decoration: none;">${siteUrl}</a>
      </p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="font-size: 14px; color: #6b7280; margin: 0;">
        Happy Shopping! 🎉
      </p>
      <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">
        Warm regards,<br>
        <strong style="color: #14b8a6;">The MS CRAFTS Team</strong>
      </p>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">This is an automated email. Please do not reply to this message.</p>
    <p style="margin: 10px 0 0 0;">© ${new Date().getFullYear()} MS CRAFTS. All rights reserved.</p>
  </div>
</body>
</html>
  `
}





