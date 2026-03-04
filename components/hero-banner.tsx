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
      <div className="relative w-full aspect-[5/5] overflow-hidden rounded-b-3xl bg-black">
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
              className="object-cover opacity-95"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Text Overlay */}
        {/* <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <p
            className="text-sm md:text-base text-teal-100/90 italic font-light"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {slides[currentSlide].subline1}
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-wide text-white">
            {slides[currentSlide].heading}
          </h1>
          <p
            className="mt-1 text-sm md:text-lg text-slate-100/90 italic font-light"
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
