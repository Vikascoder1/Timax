import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error(
      "Missing Supabase environment variables. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. See SETUP_SUPABASE.md or QUICK_START.md for instructions."
    )
    console.error("❌ Supabase Configuration Error:", error.message)
    console.error("📝 Quick fix: Create .env.local file in project root with your Supabase credentials")
    throw error
  }

  // Remove trailing slash if present
  supabaseUrl = supabaseUrl.trim().replace(/\/$/, "")

  // Validate URL format and check for common mistakes
  try {
    const url = new URL(supabaseUrl)
    
    // Check if it's pointing to localhost (common mistake)
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      throw new Error(
        `❌ Invalid Supabase URL: "${supabaseUrl}"\n` +
        `You're using localhost, but you need your actual Supabase project URL!\n\n` +
        `To get your correct URL:\n` +
        `1. Go to https://supabase.com/dashboard\n` +
        `2. Select your project\n` +
        `3. Go to Settings → API\n` +
        `4. Copy the "Project URL" (looks like: https://xxxxx.supabase.co)\n` +
        `5. Update your .env.local file with the correct URL\n\n` +
        `Your URL should start with "https://" and end with ".supabase.co"`
      )
    }

    // Check if it's a valid Supabase URL
    if (!url.hostname.includes("supabase.co") && !url.hostname.includes("supabase.in")) {
      console.warn(
        `⚠️  Warning: Your Supabase URL "${supabaseUrl}" doesn't look like a valid Supabase URL.\n` +
        `It should be something like: https://xxxxx.supabase.co`
      )
    }

    // Must be HTTPS (except for local development with custom setup)
    if (url.protocol !== "https:" && !url.hostname.includes("localhost")) {
      throw new Error(
        `Invalid Supabase URL protocol: "${supabaseUrl}". Must use HTTPS (https://)`
      )
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("Invalid URL")) {
      throw new Error(
        `Invalid Supabase URL format: "${supabaseUrl}". Must be a valid HTTP/HTTPS URL (e.g., https://xxxxx.supabase.co)`
      )
    }
    throw err
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

