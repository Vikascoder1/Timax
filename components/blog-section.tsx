"use client"

export function BlogSection() {
  return (
    <section className="px-4 md:px-6 lg:px-8 py-8 md:py-12 bg-[#faf8f5]">
      <div className="max-w-4xl mx-auto">
        <h2
          className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground italic leading-snug"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {"Not Just Wall Clocks: These Are Pieces You'll Love"}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm md:text-base leading-relaxed italic">
          {"A wall without a clock feels unfinished. Like something is missing. It's not just about telling time anymore\u2014it's about style, vibe, and personality. This is why we have gathered a"}
        </p>

        <a
          href="#"
          className="inline-block mt-4 md:mt-6 border border-foreground text-foreground text-sm md:text-base font-medium px-5 py-2 rounded hover:bg-foreground hover:text-background transition-colors"
        >
          Read More
        </a>
      </div>
    </section>
  )
}
