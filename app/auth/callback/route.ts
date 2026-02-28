import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    // If email was just confirmed, send welcome email
    if (data?.user && data?.session) {
      const user = data.user
      const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
      const email = user.email || ""
      
      // Send welcome email in background (don't block redirect)
      if (email) {
        fetch(`${requestUrl.origin}/api/auth/send-welcome-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName: fullName,
            customerEmail: email,
          }),
        })
        .then(async (response) => {
          const data = await response.json()
          if (data.success && data.emailSent) {
            console.log("✅ Welcome email sent successfully after email confirmation")
          } else {
            console.error("❌ Failed to send welcome email:", data.error || "Unknown error")
            if (data.code) {
              console.error("❌ Brevo error code:", data.code)
            }
          }
        })
        .catch((err) => {
          console.error("❌ Error calling welcome email API:", err)
        })
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}

