"use client"

import Image from "next/image"

const galleryImages = [
  {
    src: "/images/green.jpeg",
    alt: "Luxury teal wall clock close up",
  },
  {
    src: "/images/ocean.jpeg",
    alt: "Geode agate wall clock",
  },
]

export function AboutSection() {
  return (
    <section className="px-4 py-8">
      <h2
        className="text-2xl md:text-3xl font-bold text-foreground"
        style={{ fontFamily: "Georgia, serif" }}
      >
        About Us
      </h2>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
        At MS HandCraft, we believe that every resin creation is a work of art,
        meticulously crafted to reflect your individual style and preferences.
      </p>

      <a
        href="#"
        className="inline-block mt-6 border border-foreground text-foreground text-sm font-medium px-6 py-2.5 rounded hover:bg-foreground hover:text-background transition-colors"
      >
        Read More
      </a>

      {/* Gallery */}
      <div className="grid grid-cols-2 gap-3 mt-8">
        {galleryImages.map((image) => (
          <div key={image.alt} className="relative aspect-square rounded-lg overflow-hidden">
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
