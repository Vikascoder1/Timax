"use client"

import { useState } from "react"
import Image from "next/image"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"

const reviews = [
  {
    image: "/images/ocean.jpeg",
    name: "Customer",
    rating: 5,
    title: "Elegant design with l...",
    text: "The watches perfect and the packing is also good",
  },
  {
    image: "/images/green.jpeg",
    name: "Customer",
    rating: 5,
    title: "Beautiful craftsmanship",
    text: "Amazing quality and the colors are stunning in person",
  },
  {
    image: "/images/triangle.jpeg",
    name: "Customer",
    rating: 4,
    title: "Great wall clock",
    text: "Looks amazing on my living room wall, very happy with the purchase",
  },
]

export function ReviewsSection() {
  const [currentReview, setCurrentReview] = useState(0)

  const prev = () => setCurrentReview((p) => (p === 0 ? reviews.length - 1 : p - 1))
  const next = () => setCurrentReview((p) => (p === reviews.length - 1 ? 0 : p + 1))

  const review = reviews[currentReview]

  return (
    <section className="px-4 py-8">
      <h2
        className="text-2xl md:text-3xl font-bold text-center text-foreground text-balance"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Let customers speak for us
      </h2>
      <p className="text-center text-muted-foreground mt-1 text-sm">
        from 78 reviews
      </p>

      {/* Review Card Carousel */}
      <div className="mt-6 relative">
        {/* Thumbnail strip */}
        <div className="flex gap-2 mb-4 overflow-hidden justify-center">
          {reviews.map((r, i) => (
            <button
              key={i}
              onClick={() => setCurrentReview(i)}
              className={`relative w-16 h-16 rounded overflow-hidden flex-shrink-0 border-2 transition-colors ${
                i === currentReview ? "border-foreground" : "border-transparent"
              }`}
            >
              <Image src={r.image || "/placeholder.svg"} alt={r.name} fill className="object-cover" />
            </button>
          ))}
        </div>

        {/* Main review card */}
        <div className="bg-card border border-border rounded-lg p-6 text-center mx-auto max-w-xs">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
            <Image
              src={review.image || "/placeholder.svg"}
              alt={review.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < review.rating
                    ? "fill-[#f5a623] text-[#f5a623]"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <p className="text-sm font-semibold text-foreground">{review.name}</p>
          <p className="text-sm font-medium text-foreground mt-2">{review.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{review.text}</p>
        </div>

        {/* Navigation arrows */}
        <div className="flex justify-center gap-4 mt-4">
          <button onClick={prev} aria-label="Previous review" className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={next} aria-label="Next review" className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="flex justify-center mt-4">
          <a
            href="#"
            className="bg-foreground text-background text-sm font-medium px-8 py-3 rounded-full hover:bg-foreground/90 transition-colors"
          >
            Read more reviews
          </a>
        </div>
      </div>
    </section>
  )
}
