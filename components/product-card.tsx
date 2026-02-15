"use client"

import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"

export interface Product {
  id?: string // Product ID for navigation
  image: string
  alt: string
  name: string
  rating: number
  reviewCount: number
  originalPrice: number
  salePrice: number
  discount: string
}

function GoldStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.3
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < fullStars
              ? "fill-[#f5a623] text-[#f5a623]"
              : i === fullStars && hasHalf
                ? "fill-[#f5a623]/50 text-[#f5a623]"
                : "text-[#f5a623]"
          }`}
        />
      ))}
    </div>
  )
}

function BlackStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < fullStars
              ? "fill-foreground text-foreground"
              : "text-muted-foreground/40"
          }`}
        />
      ))}
    </div>
  )
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.alt}
          fill
          className="object-cover"
        />
        {/* Sale Badge */}
        <span className="absolute top-3 left-3 bg-[#2a9d6e] text-[#ffffff] text-xs font-medium px-2.5 py-1 rounded">
          Sale
        </span>
      </div>

      {/* Details */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-foreground leading-tight line-clamp-2">
          {product.name}
        </h3>

        {/* Gold star rating */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <GoldStars rating={product.rating} />
          <span className="text-sm font-medium text-foreground">{product.rating}</span>
        </div>

        {/* Black star rating with review count */}
        <div className="flex items-center gap-1.5 mt-1">
          <BlackStars rating={product.rating} />
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Pricing */}
        <div className="mt-2">
          <span className="text-xs text-muted-foreground line-through">
            {"\u20B9 "}
            {product.originalPrice.toLocaleString("en-IN")}.00
          </span>
          <p className="text-base font-semibold text-foreground">
            {"From \u20B9 "}
            {product.salePrice.toLocaleString("en-IN")}.00
          </p>
          <span className="inline-block mt-1 bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-0.5 rounded">
            {product.discount}
          </span>
        </div>

        {/* Add to Cart */}
        <Link href={product.id ? `/product?id=${product.id}` : "/product"}>
          <button className="w-full mt-3 bg-foreground text-background text-sm font-medium py-2.5 rounded-full hover:bg-foreground/90 transition-colors">
            Add to Cart
          </button>
        </Link>
      </div>
    </div>
  )
}
