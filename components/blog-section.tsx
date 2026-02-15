"use client"

export function BlogSection() {
  return (
    <section className="px-4 py-8 bg-[#faf8f5]">
      <h2
        className="text-xl md:text-2xl font-bold text-foreground italic leading-snug"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {"Not Just Wall Clocks: These Are Pieces You'll Love"}
      </h2>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed italic">
        {"A wall without a clock feels unfinished. Like something is missing. It's not just about telling time anymore\u2014it's about style, vibe, and personality. This is why we have gathered a"}
      </p>

      <a
        href="#"
        className="inline-block mt-4 border border-foreground text-foreground text-sm font-medium px-5 py-2 rounded hover:bg-foreground hover:text-background transition-colors"
      >
        Read More
      </a>
    </section>
  )
}
