"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AnnouncementBar } from "@/components/announcement-bar"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { RatingBadge } from "@/components/rating-badge"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Footer } from "@/components/footer"
import { User, LogOut, Package, MapPin } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      loadProfile()
    }
  }, [user, authLoading, router])

  const loadProfile = async () => {
    if (!user) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error("Error loading profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Account
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <button
              onClick={handleLogout}
              className="hover:text-foreground underline transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className="mb-8 pb-8 border-b border-border">
          <h2 className="text-xl font-semibold mb-4">Order history</h2>
          <div className="bg-muted rounded-lg p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Account details</h2>
          
          <div className="space-y-4">
            {/* Email */}
            <div className="border border-border rounded-lg p-4">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Email
              </label>
              <p className="text-foreground">{user.email}</p>
            </div>

            {/* Full Name */}
            {profile?.full_name && (
              <div className="border border-border rounded-lg p-4">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  Full Name
                </label>
                <p className="text-foreground">{profile.full_name}</p>
              </div>
            )}

            {/* Phone */}
            {profile?.phone && (
              <div className="border border-border rounded-lg p-4">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  Phone
                </label>
                <p className="text-foreground">{profile.phone}</p>
              </div>
            )}

            {/* Addresses */}
            {/* <Link
              href="/account/addresses"
              className="block border border-border rounded-lg p-4 hover:bg-muted transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">View addresses</span>
                </div>
                <span className="text-sm text-muted-foreground">(0)</span>
              </div>
            </Link> */}
          </div>
        </div>
      </main>

      <Footer />
      <RatingBadge />
      <WhatsappButton />
    </div>
  )
}



