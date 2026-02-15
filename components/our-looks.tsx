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
    <section className="px-4 py-8">
      <h2
        className="text-2xl md:text-3xl font-bold text-center text-foreground uppercase tracking-wider text-balance"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Our Looks
      </h2>

      <div className="flex flex-col gap-4 mt-6">
        {lookImages.map((image) => (
          <div key={image.alt} className="relative w-full aspect-[4/4] rounded-lg overflow-hidden">
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
