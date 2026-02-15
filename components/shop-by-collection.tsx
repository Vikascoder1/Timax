"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"

const collections = [
  {
    image: "/images/collection-broken-art.jpg",
    alt: "Broken art geode wall clock",
    label: "Broken Art Clock",
  },
  {
    image: "/images/collection-black-blue.jpg",
    alt: "Black and blue wall clocks",
    label: "Black & Blue Clocks",
  },
  {
    image: "/images/collection-best-sellers.jpg",
    alt: "Best selling wall clocks",
    label: "Our Best Sellers",
  },
  {
    image: "/images/collection-triangle.jpg",
    alt: "Triangle shaped wall clocks",
    label: "Triangle Clocks",
  },
]

export function ShopByCollection() {
  return (
    <section className="px-4 py-8">
      <h2
        className="text-2xl md:text-3xl font-bold text-center text-foreground text-balance"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Shop By Collection
      </h2>
      <p className="text-center text-muted-foreground mt-2 text-sm">
        Find the Perfect Wall clocks for Every Occasion
      </p>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {collections.map((collection) => (
          <a
            key={collection.label}
            href="#"
            className="flex flex-col group"
          >
            {/* Pennant/Banner shape container */}
            <div className="relative w-full overflow-hidden">
              {/* Top ribbon bar */}
              <div className="w-full h-2 bg-[#8B1A4A]" />
              <div className="relative aspect-[3/4] bg-muted">
                <Image
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {/* Bottom pennant triangle cut */}
              <div className="relative w-full h-6">
                <div className="absolute inset-0 bg-background" />
                <svg
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  className="absolute top-0 left-0 w-full h-full"
                >
                  <polygon points="0,0 100,0 50,20" fill="hsl(var(--muted))" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-foreground mt-1 flex items-center gap-1">
              {collection.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </a>
        ))}
      </div>
    </section>
  )
}
