import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Check if an error is a DNS resolution error (should NOT be retried)
 */
function isDnsError(error: unknown): boolean {
  const errorMessage = (error as { message?: string })?.message || ""
  const errorCode = (error as { code?: string })?.code || ""
  const errorCause = (error as { cause?: { code?: string; errno?: number; syscall?: string } })?.cause
  
  return (
    errorMessage.includes("getaddrinfo") ||
    errorMessage.includes("EAI_AGAIN") ||
    errorMessage.includes("ERR_NAME_NOT_RESOLVED") ||
    errorCode === "EAI_AGAIN" ||
    errorCause?.code === "EAI_AGAIN" ||
    errorCause?.errno === -3001 ||
    errorCause?.syscall === "getaddrinfo"
  )
}

/**
 * Check if an error is retryable (network issues that might resolve)
 */
function isRetryableError(error: unknown): boolean {
  // DNS errors should NEVER be retried - they won't succeed
  if (isDnsError(error)) {
    return false
  }
  
  const errorMessage = (error as { message?: string })?.message || ""
  const errorCode = (error as { code?: string })?.code || ""
  const errorCause = (error as { cause?: { code?: string } })?.cause
  
  // Only retry on transient network errors, not DNS failures
  return (
    errorMessage.includes("ETIMEDOUT") ||
    errorMessage.includes("ECONNRESET") ||
    errorMessage.includes("ECONNREFUSED") ||
    errorMessage.includes("timeout") ||
    errorCode === "UND_ERR_CONNECT_TIMEOUT" ||
    errorCause?.code === "UND_ERR_CONNECT_TIMEOUT"
  )
}

// Helper function to retry Supabase operations with exponential backoff
// IMPORTANT: Does NOT retry on DNS errors - they will never succeed
export async function retrySupabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 2000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation()
      
      // If result has error property (Supabase response), check if it's a connection error
      if (result && typeof result === 'object' && 'error' in result) {
        const supabaseError = (result as { error?: unknown }).error
        if (supabaseError) {
          const errorMessage = (supabaseError as { message?: string })?.message || ""
          
          // Check if it's a DNS error in the response
          if (isDnsError(supabaseError)) {
            console.error("❌ DNS resolution failed - cannot reach Supabase. Check your network connection and Supabase URL.")
            throw supabaseError
          }
          
          // Only retry on retryable errors
          if (isRetryableError(supabaseError) && attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt - 1)
            console.log(`⚠️ Supabase connection error (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`, errorMessage)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
        }
      }
      
      return result
    } catch (error: unknown) {
      lastError = error
      
      // DNS errors should NEVER be retried - fail immediately
      if (isDnsError(error)) {
        const errorCause = (error as { cause?: { hostname?: string } })?.cause
        const hostname = errorCause?.hostname || "Supabase"
        console.error(`❌ DNS ERROR: Cannot resolve ${hostname}. This is a network/DNS issue, not a retryable error.`)
        console.error(`💡 Check:`)
        console.error(`   1. Your internet connection`)
        console.error(`   2. Supabase URL is correct: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
        console.error(`   3. DNS servers are working`)
        console.error(`   4. Firewall/proxy is not blocking Supabase`)
        throw error
      }
      
      // Check if it's a retryable error
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error
      }
      
      // Exponential backoff: 2s, 4s, 8s
      const delay = baseDelay * Math.pow(2, attempt - 1)
      const errorMessage = (error as { message?: string })?.message || ""
      console.log(`⚠️ Supabase operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`, errorMessage)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      // Increase timeout for Supabase operations
      global: {
        fetch: (url, options = {}) => {
          // Set a longer timeout (30 seconds instead of default 10s)
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000)
          
          return fetch(url, {
            ...options,
            signal: controller.signal,
          }).finally(() => {
            clearTimeout(timeoutId)
          })
        },
      },
    }
  )
}

