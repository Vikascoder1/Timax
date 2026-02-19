"use client"

import { useState } from "react"
import { AnnouncementBar } from "@/components/announcement-bar"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { RatingBadge } from "@/components/rating-badge"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Footer } from "@/components/footer"

export default function ContactPage() {
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
            Contact Us
          </h1>
          <p className="text-muted-foreground">
            Get in touch with us for any questions or support.
            If you are facing any issue while ordering, or for any other query contact us:- msart99960@gmail.com Or Only whatsapp 93061 47671
          </p>
        </div>

      </main>

      <Footer />
      <RatingBadge />
      <WhatsappButton />
    </div>
  )
}

