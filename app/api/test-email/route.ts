import { NextRequest, NextResponse } from "next/server"
import { sendSignupConfirmationEmail, sendOrderConfirmationEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get("email")
  const type = searchParams.get("type") || "signup"

  if (!email) {
    return NextResponse.json(
      { error: "Email parameter is required. Use ?email=your@email.com" },
      { status: 400 }
    )
  }

  try {
    let result

    if (type === "order") {
      // Test order confirmation email
      result = await sendOrderConfirmationEmail({
        orderNumber: "TEST-ORDER-001",
        customerName: "Test User",
        customerEmail: email,
        orderDate: new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        items: [
          {
            name: "Test Product",
            size: "Medium",
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
          },
        ],
        subtotal: 100,
        tax: 0,
        shippingCost: 0,
        totalAmount: 100,
        paymentMethod: "cod",
        shippingAddress: {
          address: "123 Test Street",
          city: "Test City",
          state: "Test State",
          pincode: "123456",
          country: "India",
        },
      })
    } else {
      // Test signup confirmation email
      result = await sendSignupConfirmationEmail({
        customerName: "Test User",
        customerEmail: email,
      })
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test ${type} email sent successfully!`,
        messageId: (result as { messageId?: string }).messageId,
        data: result.data,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send email",
          code: (result as { code?: string }).code,
        },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    const errorMessage = (error as { message?: string })?.message || "Internal server error"
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
