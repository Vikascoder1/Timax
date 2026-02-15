"use client"

import { useState } from "react"
import { AnnouncementBar } from "@/components/announcement-bar"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { HeroBanner } from "@/components/hero-banner"
import { ShopByCollection } from "@/components/shop-by-collection"
import { RatingBadge } from "@/components/rating-badge"
import { WhatsappButton } from "@/components/whatsapp-button"
import { ProductSection } from "@/components/product-section"
import { TrustBadges } from "@/components/trust-badges"
import { OurLooks } from "@/components/our-looks"
import { AboutSection } from "@/components/about-section"
import { ReviewsSection } from "@/components/reviews-section"
import { BlogSection } from "@/components/blog-section"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { products } from "@/lib/products"
import type { Product } from "@/components/product-card"

// Convert products to ProductCard format
function toProductCardFormat(product: typeof products.ocean): Product {
  return {
    id: product.id,
    image: product.images[0], // Use first image as thumbnail
    alt: product.alt,
    name: product.name.length > 35 ? product.name.substring(0, 35) + "..." : product.name,
    rating: product.rating,
    reviewCount: product.reviewCount,
    originalPrice: product.originalPrice,
    salePrice: product.salePrice,
    discount: product.discount,
  }
}

const newArrivals = [
  toProductCardFormat(products.ocean),
  toProductCardFormat(products.green),
  toProductCardFormat(products.triangle),
]

const bestSellers = [
  toProductCardFormat(products.ocean),
  toProductCardFormat(products.green),
]

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Header */}
      <Header
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main>
        <HeroBanner />
        <ProductSection
          title="New Arrivals"
          subtitle="Step into Style - Exclusive Creations, Designed Just for You."
          products={newArrivals}
        />
        <ProductSection
          title="Best Seller"
          subtitle="Step into Style - Exclusive Creations, Designed Just for You."
          products={bestSellers}
        />
        <TrustBadges />
        <OurLooks />
        <AboutSection />
        <ReviewsSection />
        <BlogSection />
        <FaqSection />
      </main>

      <Footer />

      {/* Fixed elements */}
      <RatingBadge />
      <WhatsappButton />
    </div>
  )
}
