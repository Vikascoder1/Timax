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
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
  }>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setLoading(true)

    // Basic client-side validation for better UX
    const nextFieldErrors: typeof fieldErrors = {}
    const trimmedFullName = fullName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedFullName || trimmedFullName.length < 2) {
      nextFieldErrors.fullName = "Please enter your full name."
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!trimmedEmail) {
      nextFieldErrors.email = "Email is required."
    } else if (!emailPattern.test(trimmedEmail)) {
      nextFieldErrors.email = "Please enter a valid email address."
    }

    if (!password || password.length < 6) {
      nextFieldErrors.password = "Password must be at least 6 characters."
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setError("Please fix the highlighted fields and try again.")
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(trimmedEmail, password, trimmedFullName)

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
          setError("Please enter a valid email address.")
          setFieldErrors((prev) => ({
            ...prev,
            email: "Please enter a valid email address.",
          }))
        } else if (error.message?.includes("Password")) {
          setError(
            error.message || "Password requirements not met. Please check and try again.",
          )
          setFieldErrors((prev) => ({
            ...prev,
            password:
              error.message || "Password requirements not met. Please check and try again.",
          }))
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
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl tracking-wide">
                <span className="font-light text-slate-100">MS</span>
                <span className="font-bold text-teal-400">CRAFTS</span>
              </span>
            </Link>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 shadow-2xl shadow-teal-900/20 rounded-2xl px-6 py-8 backdrop-blur">
            <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-teal-400"
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
            <h2 className="text-2xl font-semibold text-slate-50 text-center mb-1">
              Account created
            </h2>
            <p className="text-sm text-slate-300 text-center">
              We’ve sent a verification link to{" "}
              <span className="font-medium text-teal-300">{email}</span>.
            </p>
            <p className="text-xs text-slate-400 mt-4 text-center">
              If you don&apos;t see the email:
            </p>
            <ul className="text-xs text-slate-400 mt-2 list-disc list-inside space-y-1">
              <li>Check your spam or promotions folder</li>
              <li>Wait a couple of minutes for it to arrive</li>
              <li>Make sure email confirmations are enabled in Supabase</li>
            </ul>
            <p className="text-sm text-slate-400 mt-6 text-center">
              Redirecting you to login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-10 items-stretch">
        {/* Brand / Benefits panel */}
        <div className="hidden md:flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-8 py-8 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur">
          <Link href="/" className="inline-block mb-6">
            <span className="text-3xl tracking-wide">
              <span className="font-light text-slate-100">MS</span>
              <span className="font-bold text-teal-400">CRAFTS</span>
            </span>
          </Link>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-slate-50">
              Create your MS HandCrafts account
            </h1>
            <p className="text-sm text-slate-300 max-w-md">
              Save your details, track your handcrafted orders, and get faster
              checkout on your next purchase.
            </p>

            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <div className="flex items-start gap-2">
                <span className="mt-[2px] h-5 w-5 rounded-full bg-teal-500/10 text-teal-300 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>Track all your orders in one place.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-[2px] h-5 w-5 rounded-full bg-teal-500/10 text-teal-300 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>Quick re‑orders for your favourite designs.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-[2px] h-5 w-5 rounded-full bg-teal-500/10 text-teal-300 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>Get shipping updates on your registered email.</span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            You can also{" "}
            <Link href="/checkout" className="text-teal-300 underline-offset-2 hover:underline">
              continue as a guest
            </Link>{" "}
            and create an account later.
          </p>
        </div>

        {/* Form card */}
        <div className="max-w-md mx-auto md:mx-0">
          <div className="md:hidden mb-6 text-center">
            <Link href="/" className="inline-block mb-3">
              <span className="text-2xl tracking-wide">
                <span className="font-light text-slate-100">MS</span>
                <span className="font-bold text-teal-400">CRAFTS</span>
              </span>
            </Link>
            <h1 className="text-2xl font-semibold text-slate-50 mb-1">
              Create account
            </h1>
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-teal-300 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl px-6 py-7 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="hidden md:block mb-4">
              <h1 className="text-2xl font-semibold text-slate-50">
                Create account
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                It takes less than a minute. We only ask for what we need.
              </p>
            </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-100 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-slate-200">
                  Full name
                </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
                  className={`bg-slate-900/60 text-slate-100 placeholder:text-slate-500 ${
                    fieldErrors.fullName ? "border-red-500/70 focus-visible:ring-red-500" : "border-slate-700"
                  }`}
            />
                {fieldErrors.fullName && (
                  <p className="text-xs text-red-400">{fieldErrors.fullName}</p>
                )}
          </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
            <Input
              id="email"
              type="email"
                  placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
                  className={`bg-slate-900/60 text-slate-100 placeholder:text-slate-500 ${
                    fieldErrors.email ? "border-red-500/70 focus-visible:ring-red-500" : "border-slate-700"
                  }`}
            />
                {fieldErrors.email && (
                  <p className="text-xs text-red-400">{fieldErrors.email}</p>
                )}
          </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-200">
                    Password
                  </Label>
                </div>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
                  className={`bg-slate-900/60 text-slate-100 placeholder:text-slate-500 ${
                    fieldErrors.password ? "border-red-500/70 focus-visible:ring-red-500" : "border-slate-700"
                  }`}
            />
                <p className="text-xs text-slate-500">
                  Use at least 6 characters. For best security, combine letters and
                  numbers.
            </p>
                {fieldErrors.password && (
                  <p className="text-xs text-red-400">{fieldErrors.password}</p>
                )}
          </div>

              <Button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold"
                disabled={loading}
              >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-teal-300 hover:underline">
                Sign in
              </Link>
            </div>

            <div className="mt-4 text-center">
          <Link
                href="/"
                className="text-xs text-slate-500 hover:text-slate-300"
          >
            Continue as guest
          </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

