"use client"

import { useState } from "react"
import { AnnouncementBar } from "@/components/announcement-bar"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { RatingBadge } from "@/components/rating-badge"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Footer } from "@/components/footer"

export default function TrackOrderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Track Your Order
          </h1>
          <p className="text-muted-foreground">
            Enter your order number to track your order status.
          </p>
        </div>

        <div className="bg-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Track order page coming soon...</p>
        </div>
      </main>

      <Footer />
      <RatingBadge />
      <WhatsappButton />
    </div>
  )
}

