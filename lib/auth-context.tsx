"use client"

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: { full_name?: string; phone?: string }) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Use refs to ensure singleton client and prevent multiple listeners
  const supabaseRef = useRef<ReturnType<typeof getSupabaseClient> | null>(null)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const isInitializedRef = useRef(false)

  // Initialize Supabase client as singleton (only once)
  if (!supabaseRef.current) {
  try {
      supabaseRef.current = getSupabaseClient()
  } catch (err) {
    // Supabase not configured - auth will be disabled
    console.warn("Supabase not configured. Authentication features will be disabled.")
    console.warn("Please set up environment variables. See SETUP_SUPABASE.md for instructions.")
    setLoading(false)
    }
  }

  // Initialize auth state and set up listener (only once)
  useEffect(() => {
    const supabase = supabaseRef.current
    
    if (!supabase) {
      setLoading(false)
      return
    }

    // Prevent multiple initializations
    if (isInitializedRef.current) {
      return
    }
    isInitializedRef.current = true

    let isMounted = true

    // Get initial session with error handling and timeout
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        if (isMounted) {
          console.warn("⏱️ Session check timed out - proceeding without session")
          setLoading(false)
        }
        resolve()
      }, 10000) // 10 second timeout
    })

    Promise.race([sessionPromise, timeoutPromise])
      .then((result) => {
        if (!isMounted) return
        
        // Check if result is from getSession (has data property)
        if (result && typeof result === 'object' && 'data' in result) {
          const sessionResult = result as { data: { session: Session | null }, error: any }
          const { data: { session }, error } = sessionResult
          if (error) {
            // Only log non-network errors
            const errorMessage = error?.message || ""
            if (!errorMessage.includes("fetch") && !errorMessage.includes("network") && !errorMessage.includes("getaddrinfo") && !errorMessage.includes("EAI_AGAIN")) {
              console.warn("⚠️ Error getting session:", error)
            }
          }
      setSession(session)
      setUser(session?.user ?? null)
        }
        setLoading(false)
      })
      .catch((error) => {
        if (!isMounted) return
        
        // Suppress DNS/network errors
        const errorMessage = (error as { message?: string })?.message || ""
        if (!errorMessage.includes("getaddrinfo") && !errorMessage.includes("EAI_AGAIN") && !errorMessage.includes("ERR_NAME_NOT_RESOLVED")) {
          console.error("❌ Failed to get session:", error)
        }
      setLoading(false)
    })

    // Set up auth state change listener (only once)
    // This listener handles token refresh automatically
    try {
    const {
        data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return
        
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
      subscriptionRef.current = authSubscription
    } catch (error) {
      console.warn("⚠️ Could not set up auth state listener:", error)
    }

    return () => {
      isMounted = false
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
      isInitializedRef.current = false
    }
  }, []) // Empty dependency array - only run once

  const signUp = async (email: string, password: string, fullName?: string) => {
    const supabase = supabaseRef.current
    if (!supabase) {
      return { error: { message: "Supabase not configured. Please set up environment variables." } }
    }

    try {
      console.log("🔐 Starting signup process...")
      
      // Log Supabase URL for debugging (without exposing full key)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        console.log("🔗 Connecting to Supabase:", supabaseUrl.replace(/\/$/, ""))
      } else {
        console.error("❌ NEXT_PUBLIC_SUPABASE_URL is not set!")
        return { error: { message: "Supabase URL is not configured. Please check your environment variables." } }
      }

      const signUpPromise = supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
        },
      },
    })

      // Use a longer timeout and better error handling
      const timeoutId = setTimeout(() => {
        console.error("⏱️ Signup request timed out after 45 seconds")
      }, 45000)

      const result = await signUpPromise
      clearTimeout(timeoutId)

      const { data, error } = result

      if (error) {
        console.error("❌ Signup error from Supabase:", error)
        console.error("❌ Error details:", JSON.stringify(error, null, 2))
        // Check for specific error types
        if (error.message?.includes("fetch") || error.message?.includes("network")) {
          return { error: { message: "Network error: Unable to connect to Supabase. Please check your internet connection and try again." } }
        }
        if (error.message?.includes("timeout") || error.message?.includes("aborted")) {
          return { error: { message: "Connection timeout: The request took too long. Please check your internet connection and try again." } }
        }
      }

      if (data?.user) {
        console.log("✅ Signup successful")
        console.log("📧 User email:", data.user.email)
        console.log("📧 User email confirmed:", data.user.email_confirmed_at ? "Yes" : "No")
        console.log("📧 User ID:", data.user.id)
        console.log("📧 Session:", data.session ? "Created" : "Not created (email confirmation required)")
        
        // Check if email confirmation is required
        if (!data.user.email_confirmed_at && !data.session) {
          console.log("📧 Email confirmation required - Supabase should send confirmation email")
          console.log("⚠️ If email not received, check Supabase Dashboard:")
          console.log("   1. Authentication → Settings → Email Auth")
          console.log("   2. Make sure 'Enable email confirmations' is ON")
          console.log("   3. Check SMTP settings are configured")
        }
        
      setUser(data.user)
      setSession(data.session)
    }

    return { error }
    } catch (error: unknown) {
      console.error("❌ Unexpected signup error:", error)
      
      // Handle different error types
      if (error instanceof Error) {
        if (error.name === "AbortError" || error.message?.includes("aborted")) {
          return { error: { message: "Request was cancelled. Please try again." } }
        }
        if (error.message?.includes("fetch") || error.message?.includes("network") || error.message?.includes("Failed to fetch")) {
          return { error: { message: "Network error: Unable to connect to Supabase. Please check your internet connection and ensure Supabase is accessible." } }
        }
        if (error.message?.includes("timeout")) {
          return { error: { message: "Connection timeout: The request took too long. Please check your internet connection and try again." } }
        }
      }
      
      const errorMessage = (error as { message?: string })?.message || "An error occurred during signup. Please try again."
      return { error: { message: errorMessage } }
    }
  }

  const signIn = async (email: string, password: string) => {
    const supabase = supabaseRef.current
    if (!supabase) {
      return { error: { message: "Supabase not configured. Please set up environment variables." } }
    }

    try {
      console.log("🔐 Starting signin process...")
      
      // Log Supabase URL for debugging (without exposing full key)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        console.log("🔗 Connecting to Supabase:", supabaseUrl.replace(/\/$/, ""))
      } else {
        console.error("❌ NEXT_PUBLIC_SUPABASE_URL is not set!")
        return { error: { message: "Supabase URL is not configured. Please check your environment variables." } }
      }

      const signInPromise = supabase.auth.signInWithPassword({
      email,
      password,
    })

      // Use a timeout logger (but don't cancel the request)
      const timeoutId = setTimeout(() => {
        console.error("⏱️ Signin request timed out after 45 seconds")
      }, 45000)

      const result = await signInPromise
      clearTimeout(timeoutId)

      const { data, error } = result

      if (error) {
        console.error("❌ Signin error from Supabase:", error)
        // Check for specific error types
        if (error.message?.includes("fetch") || error.message?.includes("network")) {
          return { error: { message: "Network error: Unable to connect to Supabase. Please check your internet connection and try again." } }
        }
        if (error.message?.includes("timeout") || error.message?.includes("aborted")) {
          return { error: { message: "Connection timeout: The request took too long. Please check your internet connection and try again." } }
        }
      }

      if (data?.user) {
        console.log("✅ Signin successful")
      setUser(data.user)
      setSession(data.session)
    }

    return { error }
    } catch (error: unknown) {
      console.error("❌ Unexpected signin error:", error)
      
      // Handle different error types
      if (error instanceof Error) {
        if (error.name === "AbortError" || error.message?.includes("aborted")) {
          return { error: { message: "Request was cancelled. Please try again." } }
        }
        if (error.message?.includes("fetch") || error.message?.includes("network") || error.message?.includes("Failed to fetch")) {
          return { error: { message: "Network error: Unable to connect to Supabase. Please check your internet connection and ensure Supabase is accessible." } }
        }
        if (error.message?.includes("timeout")) {
          return { error: { message: "Connection timeout: The request took too long. Please check your internet connection and try again." } }
        }
      }
      
      const errorMessage = (error as { message?: string })?.message || "An error occurred during sign in. Please try again."
      return { error: { message: errorMessage } }
    }
  }

  const signOut = async () => {
    const supabase = supabaseRef.current
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const updateProfile = async (updates: { full_name?: string; phone?: string }) => {
    const supabase = supabaseRef.current
    if (!supabase || !user) {
      return { error: { message: "Supabase not configured or no user logged in" } }
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)

    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

