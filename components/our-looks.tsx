"use client"

import Image from "next/image"

const lookImages = [
  {
    src: "/images/3wall.WEBP",
    alt: "Three luxury wall clocks displayed on a wall with home decor",
  },
  {
    src: "/images/ocean.jpeg",
    alt: "Large resin art wall clock with home decor",
  },
]

export function OurLooks() {
  return (
    <section className="px-4 md:px-6 lg:px-8 py-8 md:py-12 max-w-7xl mx-auto">
      <h2
        className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground uppercase tracking-wider text-balance"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Our Looks
      </h2>

      <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mt-6 md:mt-8">
        {lookImages.map((image) => (
          <div
            key={image.alt}
            className="group relative w-full aspect-[4/4] rounded-lg overflow-hidden"
          >
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              fill
              className="object-cover transform transition-transform duration-500 ease-out group-hover:scale-110"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
