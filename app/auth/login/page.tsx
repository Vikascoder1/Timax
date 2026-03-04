"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setLoading(true)

    // Basic client-side validation for better UX
    const nextFieldErrors: typeof fieldErrors = {}
    const trimmedEmail = email.trim()

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!trimmedEmail) {
      nextFieldErrors.email = "Email is required."
    } else if (!emailPattern.test(trimmedEmail)) {
      nextFieldErrors.email = "Please enter a valid email address."
    }

    if (!password) {
      nextFieldErrors.password = "Password is required."
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setError("Please fix the highlighted fields and try again.")
      setLoading(false)
      return
    }

    try {
      const { error } = await signIn(trimmedEmail, password)

      if (error) {
        if (error.message?.includes("timeout")) {
          setError(
            "Connection timeout. Please check your internet connection and try again. If the problem persists, your Supabase instance might be experiencing issues."
          )
        } else {
          // Most common case: wrong email/password
          setError("Email or password is incorrect. Please try again.")
          setFieldErrors((prev) => ({
            ...prev,
            email: prev.email || "Check that your email is correct.",
            password: prev.password || "Check that your password is correct.",
          }))
        }
        setLoading(false)
      } else {
        setLoading(false)
        router.push("/")
        router.refresh()
      }
    } catch (err: unknown) {
      // Catch any unexpected errors
      console.error("Unexpected login error:", err)
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-10 items-stretch">
        {/* Brand / Story panel */}
        <div className="hidden md:flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-8 py-8 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-3xl tracking-wide">
                <span className="font-light text-slate-100">MS</span>
                <span className="font-bold text-teal-400">CRAFTS</span>
              </span>
            </Link>
            <div className="hidden md:inline-flex items-center gap-2 rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1 text-xs text-slate-300">
              <ShoppingBag className="h-3 w-3 text-teal-300" />
              <span>Handcrafted decor, shipped pan‑India</span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-slate-50">
              Welcome back to your craft space
            </h1>
            <p className="text-sm text-slate-300 max-w-md">
              Sign in to track your orders, manage your details and enjoy a
              smoother checkout the next time you shop with us.
            </p>

            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <div className="flex items-start gap-2">
                <span className="mt-[2px] h-5 w-5 rounded-full bg-teal-500/10 text-teal-300 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>See all your past and current orders in one place.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-[2px] h-5 w-5 rounded-full bg-teal-500/10 text-teal-300 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>Save your address for one‑click checkout.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-[2px] h-5 w-5 rounded-full bg-teal-500/10 text-teal-300 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>Get important email updates about your shipments.</span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            Just here to place an order?{" "}
            <Link href="/checkout" className="text-teal-300 underline-offset-2 hover:underline">
              Continue as guest
            </Link>
            .
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
              Sign in
            </h1>
            <p className="text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-teal-300 hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl px-6 py-7 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="hidden md:block mb-4">
              <h1 className="text-2xl font-semibold text-slate-50">
                Sign in to your account
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Enter your details to access your orders and account settings.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-100 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

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
                {/* {fieldErrors.email && (
                  <p className="text-xs text-red-400">{fieldErrors.email}</p>
                )} */}
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className={`bg-slate-900/60 text-slate-100 placeholder:text-slate-500 ${
                    fieldErrors.password ? "border-red-500/70 focus-visible:ring-red-500" : "border-slate-700"
                  }`}
                />
                {/* {fieldErrors.password && (
                  <p className="text-xs text-red-400">{fieldErrors.password}</p>
                )} */}
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-teal-300 hover:underline">
                Sign up
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

