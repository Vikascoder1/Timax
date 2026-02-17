import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  orderDate: string
  items: Array<{
    name: string
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

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not set. Email not sent.")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "CustomCrafts <onboarding@resend.dev>",
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html: generateOrderEmailHTML(data),
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: emailData }
  } catch (error: any) {
    console.error("Error sending email:", error)
    return { success: false, error: error.message }
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
    <h1 style="margin: 0;">CustomCrafts</h1>
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
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Item</th>
            <th style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Size</th>
            <th style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Qty</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${data.items
            .map(
              (item) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.size}</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">₹${item.totalPrice.toLocaleString("en-IN")}.00</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
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
      If you have any questions, please contact us at support@customcrafts.com
    </p>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
      Thank you for choosing CustomCrafts!
    </p>
  </div>
</body>
</html>
  `
}



