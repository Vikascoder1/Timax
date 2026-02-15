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
    <section className="px-4 py-8">
      <h2
        className="text-2xl md:text-3xl font-bold text-center text-foreground text-balance"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {title}
      </h2>
      <p className="text-center text-muted-foreground mt-2 text-sm italic">
        {subtitle}
      </p>

      <div className="grid grid-cols-2 gap-3 mt-6">
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
