export interface Product {
  id: string
  name: string
  alt: string
  rating: number
  reviewCount: number
  originalPrice: number
  salePrice: number
  discount: string
  images: string[] // Array of 4 images for slideshow
  type: "ocean" | "green" | "triangle"
}

export const products: Record<string, Product> = {
  ocean: {
    id: "ocean",
    name: "Shiny Ocean With Gold Bezel Resin Wall Clock",
    alt: "Shiny Ocean With Gold Bezel Resin Wall Clock",
    rating: 4.5,
    reviewCount: 27,
    originalPrice: 5198,
    salePrice: 2599,
    discount: "50% OFF",
    images: [
      "/images/ocean.jpeg",
      "/images/ocean2.jpeg",
      "/images/ocean3.jpeg",
      "/images/ocean4.jpeg",
    ],
    type: "ocean",
  },
  green: {
    id: "green",
    name: "Jungle Green The luxury ResinArt Resin Clock",
    alt: "Jungle Green The luxury ResinArt Resin Clock",
    rating: 4.6,
    reviewCount: 12,
    originalPrice: 4998,
    salePrice: 2499,
    discount: "50% OFF",
    images: [
      "/images/green.jpeg",
      "/images/green2.jpeg",
      "/images/green3.jpeg",
      "/images/green4.jpeg",
    ],
    type: "green",
  },
  triangle: {
    id: "triangle",
    name: "Shiny Triangle Green With Golden Roman Wall Clock",
    alt: "Shiny Triangle Green With Golden Roman Wall Clock",
    rating: 5.0,
    reviewCount: 2,
    originalPrice: 5498,
    salePrice: 2749,
    discount: "50% OFF",
    images: [
      "/images/triangle.jpeg",
      "/images/triangle2.jpeg",
      "/images/triangle3.jpeg",
      "/images/triangle4.jpeg",
    ],
    type: "triangle",
  },
}

// Helper function to get product by ID
export function getProductById(id: string): Product | undefined {
  return products[id]
}

// Get all products as array
export function getAllProducts(): Product[] {
  return Object.values(products)
}

// Get related products (excluding current product)
export function getRelatedProducts(currentProductId: string): Product[] {
  return getAllProducts().filter((p) => p.id !== currentProductId)
}

