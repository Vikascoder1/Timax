"use client"

import { ProductCard } from "@/components/product-card"
import type { Product } from "@/components/product-card"

interface ProductSectionProps {
  title: string
  subtitle: string
  products: Product[]
}

export function ProductSection({ title, subtitle, products }: ProductSectionProps) {
  return (
    <section className="px-4 md:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      <h2
        className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground text-balance"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {title}
      </h2>
      <p className="text-center text-muted-foreground mt-2 text-sm md:text-base italic max-w-2xl mx-auto">
        {subtitle}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mt-6 md:mt-8">
        {products.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
      </div>

      {/* <div className="flex justify-center mt-6">
        <a
          href="#"
          className="bg-foreground text-background text-sm font-medium px-8 py-3 rounded-full hover:bg-foreground/90 transition-colors"
        >
          View all
        </a>
      </div> */}
    </section>
  )
}
