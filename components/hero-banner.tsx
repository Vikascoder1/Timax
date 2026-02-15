"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"

const slides = [
  {
    image: "/images/Firstt.WEBP",
    alt: "Luxury marble and gold wall clock with silent movement",
    heading: "SILENT MOVEMENT",
    subline1: "Luxury finishes,",
    subline2: "Beauty that tells time",
  },
  {
    image: "/images/First.WEBP",
    alt: "Stylish custom-made clocks for every home",
    heading: "Stylish",
    subline1: "Redefine Your Walls",
    subline2: "Custom-Made Clocks for Every Home",
  },
  {
    image: "/images/Third.WEBP",
    alt: "Handcrafted designer wall clocks",
    heading: "HANDCRAFTED",
    subline1: "Artisan Collection,",
    subline2: "Timeless elegance for your walls",
  },
]

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [])

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide])

  return (
    <section className="relative w-full">
      <div className="relative w-full aspect-[4/5] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              currentSlide === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Text Overlay */}
        {/* <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#1a1a1a]/80 via-[#1a1a1a]/40 to-transparent">
          <p
            className="text-[#f5f5f5] text-lg italic font-light"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {slides[currentSlide].subline1}
          </p>
          <h1 className="text-[#f5f5f5] text-3xl font-bold tracking-wide">
            {slides[currentSlide].heading}
          </h1>
          <p
            className="text-[#f5f5f5] text-xl italic font-light"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {slides[currentSlide].subline2}
          </p>
        </div> */}
      </div>

      {/* Carousel Dots */}
      <div className="flex items-center justify-center gap-2 py-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`rounded-full transition-all ${
              currentSlide === index
                ? "w-2.5 h-2.5 bg-foreground"
                : "w-2 h-2 bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
