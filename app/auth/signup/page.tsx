"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (password.length < 6) {
        setError("Password must be at least 6 characters")
        setLoading(false)
        return
      }

      const { error } = await signUp(email, password, fullName)

      if (error) {
        // Check if it's a configuration error
        if (error.message?.includes("Supabase not configured") || error.message?.includes("Missing Supabase")) {
          setError(
            "Supabase is not configured. Please set up your environment variables. See SETUP_SUPABASE.md for instructions."
          )
        } else if (error.message?.includes("404") || error.message?.includes("Not Found")) {
          setError(
            "Supabase URL is not configured correctly. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL is set to your Supabase project URL."
          )
        } else if (error.message?.includes("timeout") || error.message?.includes("Connection timeout")) {
          setError(
            "Connection timeout. Please check your internet connection and try again. If the problem persists, your Supabase instance might be experiencing issues."
          )
        } else if (error.message?.includes("Network error")) {
          setError(
            "Network error: Unable to connect to Supabase. Please check your internet connection and ensure Supabase is accessible."
          )
        } else if (error.message?.includes("User already registered")) {
          setError(
            "An account with this email already exists. Please try logging in instead."
          )
        } else if (error.message?.includes("Invalid email")) {
          setError(
            "Please enter a valid email address."
          )
        } else if (error.message?.includes("Password")) {
          setError(
            error.message || "Password requirements not met. Please check and try again."
          )
        } else {
          setError(error.message || "An error occurred. Please try again.")
        }
        setLoading(false)
      } else {
        // Signup successful - Supabase should send confirmation email
        // Note: If confirmation email is not received, check:
        // 1. Supabase Dashboard → Authentication → Settings → Enable "Email confirmations"
        // 2. Supabase Dashboard → Settings → Auth → Configure SMTP (use Brevo SMTP)
        // 3. Check spam folder
        setSuccess(true)
        setLoading(false)
        // Redirect to login page after a brief delay
        setTimeout(() => {
          router.push("/auth/login")
          router.refresh()
        }, 2000)
      }
    } catch (err: unknown) {
      // Catch any unexpected errors
      console.error("Unexpected signup error:", err)
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Account created!</h2>
            <p className="text-muted-foreground">
              Please check your email to verify your account.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              We've sent a confirmation email to <strong>{email}</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              If you don't see the email:
            </p>
            <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside space-y-1">
              <li>Check your spam/junk folder</li>
              <li>Wait a few minutes for the email to arrive</li>
              <li>Make sure email confirmation is enabled in Supabase</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl tracking-wide">
              <span className="font-light text-foreground">MS</span>
              <span className="font-bold text-teal-500">CRAFTS</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Create account</h1>
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters long
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        {/* Continue as Guest */}
        <div className="mt-6 text-center">
          <Link
            href="/checkout"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Continue as guest
          </Link>
        </div>
      </div>
    </div>
  )
}

