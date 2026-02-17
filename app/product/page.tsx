"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react"
import { AnnouncementBar } from "@/components/announcement-bar"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { RatingBadge } from "@/components/rating-badge"
import { WhatsappButton } from "@/components/whatsapp-button"
import { ReviewsSection } from "@/components/reviews-section"
import { AboutSection } from "@/components/about-section"
import { Footer } from "@/components/footer"
import { getProductById, getRelatedProducts } from "@/lib/products"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { CartSheet } from "@/components/cart-sheet"

function ProductPageContent() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("id") || "ocean" // Default to ocean if no ID
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState("12 Inch")
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { addItem } = useCart()
  const router = useRouter()

  const product = getProductById(productId)
  const relatedProducts = product ? getRelatedProducts(productId) : []

  // Reset image index when product changes
  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0)
    }
  }, [productId, product])

  // Default to ocean product if product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link href="/" className="text-primary hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="px-4 py-3 text-sm border-b border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">
              Home
            </Link>
            <span>/</span>
            <Link href="/" className="text-primary hover:underline">
              Home page
            </Link>
            <span>/</span>
            <span className="text-foreground">
              {product.name}
            </span>
          </div>
        </nav>

        {/* Product Section */}
        <div className="px-4 py-6 md:flex md:gap-6 lg:gap-8">
          {/* Image Gallery */}
          <div className="md:flex-1 mb-6 md:mb-0">
            {/* Main Image */}
            <div className="relative bg-muted rounded-lg overflow-hidden mb-4">
              <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <img
                  src={images[currentImageIndex]}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute top-4 left-4 bg-background/80 backdrop-blur p-2 rounded-full">
                🔍
              </button>
              {/* Navigation arrows */}
              <button
                onClick={() =>
                  setCurrentImageIndex(
                    (prev) => (prev - 1 + images.length) % images.length
                  )
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur p-2 rounded-full hover:bg-background"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) => (prev + 1) % images.length)
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur p-2 rounded-full hover:bg-background"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Thumbnail carousel */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    idx === currentImageIndex
                      ? "border-primary"
                      : "border-border"
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="md:flex-1">
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-orange-500">
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm font-semibold">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold mb-6">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold">
                  ₹ {product.salePrice.toLocaleString("en-IN")}.00
                </span>
                <span className="line-through text-muted-foreground">
                  ₹ {product.originalPrice.toLocaleString("en-IN")}.00
                </span>
              </div>
              {product.discount && (
                <div className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                  {product.discount}
                </div>
              )}
              <p className="text-sm text-green-600 font-semibold">
                You save ₹ {(product.originalPrice - product.salePrice).toLocaleString("en-IN")}.00 today.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Taxes included. Shipping calculated at checkout.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary">✨</span>
                <span className="text-green-700 font-semibold">
                  Hand-Poured Resin Art
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary">🛡️</span>
                <span className="text-green-700 font-semibold">
                  Gold Bezel Craftsmanship
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary">💧</span>
                <span className="text-green-700 font-semibold">
                  Silent Sweep Movement
                </span>
              </div>
            </div>

            {/* Limited stock */}
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold text-red-600">
                  Limited stock Last chance to get this item,{" "}
                </span>
                <span className="text-red-600">don&apos;t miss out!</span>
              </p>
            </div>

            {/* Size selector */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Size</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {["12 Inch", "15 Inch", "18 Inch", "27 Inch"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 rounded-full border-2 transition-all ${
                      selectedSize === size
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Quantity ({quantity} in cart)</h3>
              <div className="flex items-center gap-4 bg-muted rounded-lg w-fit p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-background rounded"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-background rounded"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  addItem({
                    productId: product.id,
                    name: product.name,
                    image: product.images[0],
                    price: product.salePrice,
                    size: selectedSize,
                    quantity: quantity,
                  })
                  setCartOpen(true)
                }}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                
                Add to cart
              </button>
              <button
                onClick={() => {
                  addItem({
                    productId: product.id,
                    name: product.name,
                    image: product.images[0],
                    price: product.salePrice,
                    size: selectedSize,
                    quantity: quantity,
                  })
                  router.push("/checkout")
                }}
                className="w-full border-2 border-foreground hover:bg-muted py-3 rounded-lg font-semibold transition-colors"
              >
                Buy it now
              </button>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/50"
                  />
                ))}
              </div>
              <span>
                Trusted by <span className="font-semibold">40Lakh+</span> Verified
                Customers
              </span>
            </div>
          </div>
        </div>

        {/* Product Details - Specs & Features */}
        <div className="px-4 py-8 border-t border-border">
          {/* Specs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 pb-8 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Brand</p>
              <p className="font-semibold">Custom Craft</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Colour</p>
              <p className="font-semibold">Dark Green, White, Gold</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Display Type</p>
              <p className="font-semibold">Analog</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Style</p>
              <p className="font-semibold">Classic</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Special Feature</p>
              <p className="font-semibold">Silent Clock</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Power Source</p>
              <p className="font-semibold">Battery Powered</p>
            </div>
          </div>

          {/* Expandable Sections */}
          <ProductDetailsAccordion />
        </div>

        {/* Artisan Techniques */}
        <div className="px-4 py-8 border-t border-border">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 italic">
            4 Artisan Techniques / Masterpiece of Time & Energy
          </h2>
          <div className="rounded-lg overflow-hidden mb-8">
            <img
              src="/images/wallClock.WEBP"
              alt="Artisan techniques showcase"
              className="w-full h-full object-cover"
            />
          </div>
          <ArtisanTechniques />
        </div>

        {/* Related Products */}
        <div className="px-4 py-8 border-t border-border">
          <h2 className="text-2xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/product?id=${relatedProduct.id}`}
                className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="bg-muted h-64 relative">
                  <img
                    src={relatedProduct.images[0]}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-teal-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    Sale
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    CustomCraft
                  </p>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {relatedProduct.name.length > 40
                      ? relatedProduct.name.substring(0, 40) + "..."
                      : relatedProduct.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xs text-orange-500">
                        ★
                      </span>
                    ))}
                    <span className="text-xs ml-1">{relatedProduct.reviewCount} review{relatedProduct.reviewCount !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="space-y-1 mb-4">
                    <p className="line-through text-xs text-muted-foreground">
                      ₹ {relatedProduct.originalPrice.toLocaleString("en-IN")}.00
                    </p>
                    <p className="font-bold">₹ {relatedProduct.salePrice.toLocaleString("en-IN")}.00</p>
                    {relatedProduct.discount && (
                      <div className="inline-block bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                        {relatedProduct.discount}
                      </div>
                    )}
                  </div>
                  <button className="w-full bg-black text-white py-2 rounded-lg font-semibold text-sm hover:bg-black/90 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Impact Section */}
        <div className="mt-8 bg-gradient-to-b from-black/80 to-black/60 text-white py-12 px-4">
          <div className="max-w-2xl mx-auto text-center space-y-12">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-teal-400 mb-3">
                No. 1
              </h3>
              <p className="font-semibold mb-3">Premium Finish</p>
              <p className="text-sm text-gray-300">
                Using high-grade, non-yellowing resin and real gold pigments for a
                luxury shine that lasts a lifetime.
              </p>
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-teal-400 mb-3">
                100%
              </h3>
              <p className="font-semibold mb-3">Handcrafted Unique</p>
              <p className="text-sm text-gray-300">
                Every piece is hand-poured, ensuring a unique energy signature. No
                two clocks are ever exactly the same.
              </p>
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-teal-400 mb-3">
                5,000+
              </h3>
              <p className="font-semibold mb-3">Homes Energized</p>
              <p className="text-sm text-gray-300">
                Transforming spaces across India with art that blends luxury, time,
                and peaceful vibrations.
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection />

        {/* About Section */}
        <AboutSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Fixed elements */}
      <RatingBadge />
      <WhatsappButton />

      {/* Cart Sheet */}
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  )
}

function ProductDetailsAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const sections = [
    {
      title: "Product Description",
      content:
        "This exquisite handcrafted wall clock combines artisan techniques with modern aesthetics. Each piece features premium resin artistry with authentic gold accents.",
    },
    {
      title: "More Information",
      content:
        "Perfect for living rooms, offices, and bedrooms. The silent sweep movement ensures no ticking sounds, making it ideal for peaceful environments.",
    },
    {
      title: "Handling Instruction",
      content:
        "Dust gently with a soft, dry cloth. Avoid moisture and direct sunlight. Battery replacement: Remove backing and replace with new battery.",
    },
    {
      title: "Materials",
      content:
        "Premium hand-poured resin, real gold plating, precision quartz movement, wood backing.",
    },
  ]

  return (
    <div className="space-y-3">
      {sections.map((section, idx) => (
        <div
          key={idx}
          className="border border-border rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
          >
            <h3 className="font-semibold">{section.title}</h3>
            <span className="text-muted-foreground">
              {openIndex === idx ? "−" : "+"}
            </span>
          </button>
          {openIndex === idx && (
            <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ArtisanTechniques() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const techniques = [
    {
      title: "Hand-Poured Resin Art",
      description:
        "Each clock is crafted using multi-layered resin to create deep, ocean-like textures.",
      features: ["Realistic Wave Depth", "Ultra-Gloss Premium Finish"],
    },
    {
      title: "Gold Bezel Craftsmanship",
      description:
        "Polished by hand to add a luxury contrast and elevate any décor space.",
      features: ["Rich Gold Shine", "Premium Metal Detailing"],
    },
    {
      title: "Silent Sweep Movement",
      description:
        "High-quality, no-ticking mechanism for peaceful and uninterrupted environments.",
      features: ["Zero Noise Operation", "Smooth Analog Movement"],
    },
    {
      title: "Protective Resin Coating",
      description:
        "Durable, scratch-resistant, and long-lasting glossy protection.",
      features: ["Fade & Scratch Resistant", "Maintains Shine for Years"],
    },
  ]

  return (
    <div className="space-y-3">
      {techniques.map((tech, idx) => (
        <div key={idx} className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
          >
            <h3 className="font-semibold">{tech.title}</h3>
            <span className="text-muted-foreground">
              {openIndex === idx ? "−" : "+"}
            </span>
          </button>
          {openIndex === idx && (
            <div className="px-4 pb-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">
                {tech.description}
              </p>
              <div className="space-y-2">
                {tech.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-teal-600 text-sm">✨</span>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function ProductPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    }>
      <ProductPageContent />
    </Suspense>
  )
}
