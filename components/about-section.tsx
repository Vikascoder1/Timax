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
    <section className="px-4 md:px-6 lg:px-8 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="md:grid md:grid-cols-2 md:gap-8 lg:gap-12 md:items-center">
        <div>
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground"
            style={{ fontFamily: "Georgia, serif" }}
          >
            About Us
          </h2>
          <p className="text-muted-foreground mt-3 text-sm md:text-base lg:text-lg leading-relaxed max-w-xl">
            At MS HandCraft, we believe that every resin creation is a work of art,
            meticulously crafted to reflect your individual style and preferences.
          </p>

          <a
            href="#"
            className="inline-block mt-6 border border-foreground text-foreground text-sm md:text-base font-medium px-6 py-2.5 rounded hover:bg-foreground hover:text-background transition-colors"
          >
            Read More
          </a>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mt-8 md:mt-0">
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
      </div>
    </section>
  )
}
