import { NextRequest, NextResponse } from "next/server"
import { sendSignupConfirmationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerEmail } = body

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Missing customer name or email" },
        { status: 400 }
      )
    }

    const result = await sendSignupConfirmationEmail({
      customerName,
      customerEmail,
    })

    if (!result.success) {
      console.error("Failed to send welcome email:", result.error)
      // Don't fail the request if email fails
      return NextResponse.json(
        { success: true, emailSent: false, error: result.error },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { success: true, emailSent: true },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error("Error in send welcome email API:", error)
    const errorMessage = (error as { message?: string })?.message || "Internal server error"
    // Don't fail the request if email fails
    return NextResponse.json(
      { success: true, emailSent: false, error: errorMessage },
      { status: 200 }
    )
  }
}

