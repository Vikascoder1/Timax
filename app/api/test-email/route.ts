import { NextRequest, NextResponse } from "next/server"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  console.log("🧪 TEST EMAIL ENDPOINT CALLED")
  
  try {
    const testEmail = request.nextUrl.searchParams.get("email") || "test@example.com"
    
    console.log("🧪 Testing email to:", testEmail)
    
    const result = await sendOrderConfirmationEmail({
      orderNumber: "TEST-001",
      customerName: "Test Customer",
      customerEmail: testEmail,
      orderDate: new Date().toLocaleDateString("en-IN"),
      items: [
        {
          name: "Test Product",
          image: "http://localhost:3000/images/ocean.jpeg",
          size: "Medium",
          quantity: 1,
          unitPrice: 20,
          totalPrice: 20,
        },
      ],
      subtotal: 20,
      tax: 0,
      shippingCost: 0,
      totalAmount: 20,
      paymentMethod: "cod",
      shippingAddress: {
        address: "123 Test St",
        city: "Test City",
        state: "Test State",
        pincode: "123456",
        country: "India",
      },
    })
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? "Test email sent!" : "Test email failed",
      error: result.error,
    })
  } catch (error: unknown) {
    console.error("🧪 Test email error:", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as { message?: string })?.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}

