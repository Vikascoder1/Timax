import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// Singleton instance
let supabaseClient: SupabaseClient | null = null

/**
 * Get or create the singleton Supabase client instance.
 * This ensures only one client exists throughout the app lifecycle.
 */
export function getSupabaseClient(): SupabaseClient {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient
  }

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
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
  const cleanUrl = supabaseUrl.trim().replace(/\/$/, "")

  // Validate URL format
  try {
    const url = new URL(cleanUrl)
    
    // Check if it's pointing to localhost (common mistake)
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      throw new Error(
        `❌ Invalid Supabase URL: "${cleanUrl}"\n` +
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
        `⚠️  Warning: Your Supabase URL "${cleanUrl}" doesn't look like a valid Supabase URL.\n` +
        `It should be something like: https://xxxxx.supabase.co`
      )
    }

    // Must be HTTPS (except for local development with custom setup)
    if (url.protocol !== "https:" && !url.hostname.includes("localhost")) {
      throw new Error(
        `Invalid Supabase URL protocol: "${cleanUrl}". Must use HTTPS (https://)`
      )
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("Invalid URL")) {
      throw new Error(
        `Invalid Supabase URL format: "${cleanUrl}". Must be a valid HTTP/HTTPS URL (e.g., https://xxxxx.supabase.co)`
      )
    }
    throw err
  }

  // Create the singleton client with optimized configuration
  supabaseClient = createBrowserClient(cleanUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      // Prevent multiple refresh attempts
      flowType: 'pkce',
    },
    global: {
      // Custom fetch that handles DNS errors gracefully
      fetch: async (url, options = {}) => {
        const urlString = typeof url === 'string' ? url : url.toString()
        const isTokenRefresh = urlString.includes('/auth/v1/token') && urlString.includes('grant_type=refresh_token')
        
        try {
          // Add timeout to prevent hanging
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          }).finally(() => {
            clearTimeout(timeoutId)
          })
          
          return response
        } catch (error: unknown) {
          // Check if it's a DNS/network error
          const errorMessage = (error as { message?: string })?.message || ""
          const errorName = (error as { name?: string })?.name || ""
          const errorCause = (error as { cause?: { code?: string; errno?: number } })?.cause
          
          const isDnsError = 
            errorMessage.includes("getaddrinfo") ||
            errorMessage.includes("EAI_AGAIN") ||
            errorMessage.includes("ERR_NAME_NOT_RESOLVED") ||
            errorMessage.includes("Failed to fetch") ||
            errorName === "TypeError" ||
            errorCause?.code === "EAI_AGAIN" ||
            errorCause?.errno === -3001
          
          if (isDnsError && isTokenRefresh) {
            // Log once per session to reduce spam
            if (!(window as any).__supabase_token_refresh_error_logged) {
              console.warn("⚠️ Cannot refresh auth token (DNS/Network issue). Auth features may be unavailable.")
              console.warn("💡 Check your internet connection and ensure Supabase is accessible.")
              ;(window as any).__supabase_token_refresh_error_logged = true
              
              // Clear the flag after 30 seconds to allow retry
              setTimeout(() => {
                delete (window as any).__supabase_token_refresh_error_logged
              }, 30000)
            }
          }
          
          throw error
        }
      },
    },
  })

  return supabaseClient
}

/**
 * @deprecated Use getSupabaseClient() instead for singleton pattern
 * Kept for backward compatibility
 */
export function createClient() {
  return getSupabaseClient()
}
