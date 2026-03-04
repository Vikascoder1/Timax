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
  pricesBySize: {
    "12 Inch": number
    "15 Inch": number
    "18 Inch": number
    "27 Inch": number
  }
}

export const products: Record<string, Product> = {
  ocean: {
    id: "ocean",
    name: "Shiny Ocean With Gold Bezel Resin Wall Clock",
    alt: "Shiny Ocean With Gold Bezel Resin Wall Clock",
    rating: 4.5,
    reviewCount: 27,
    // Base price shown on listing (use 12 inch as representative)
    // originalPrice is always double the base sale price
    originalPrice: 20,
    salePrice: 10,
    discount: "",
    images: [
      "/images/ocean.jpeg",
      "/images/ocean2.jpeg",
      "/images/ocean3.jpeg",
      "/images/ocean4.jpeg",
    ],
    type: "ocean",
    pricesBySize: {
      "12 Inch": 10,
      "15 Inch": 2999,
      "18 Inch": 3599,
      "27 Inch": 6499,
    },
  },
  green: {
    id: "green",
    name: "Jungle Green The luxury ResinArt Resin Clock",
    alt: "Jungle Green The luxury ResinArt Resin Clock",
    rating: 4.6,
    reviewCount: 12,
    // Base price shown on listing (use 12 inch as representative)
    originalPrice: 4998,
    salePrice: 2499,
    discount: "",
    images: [
      "/images/green.jpeg",
      "/images/green2.jpeg",
      "/images/green3.jpeg",
      "/images/green4.jpeg",
    ],
    type: "green",
    pricesBySize: {
      "12 Inch": 2499,
      "15 Inch": 2899,
      "18 Inch": 3499,
      "27 Inch": 6399,
    },
  },
  triangle: {
    id: "triangle",
    name: "Shiny Triangle Green With Golden Roman Wall Clock",
    alt: "Shiny Triangle Green With Golden Roman Wall Clock",
    rating: 5,
    reviewCount: 2,
    // Base price shown on listing (use 12 inch as representative)
    // originalPrice is always double the base sale price
    originalPrice: 5198,
    salePrice: 2599,
    discount: "",
    images: [
      "/images/triangle.jpeg",
      "/images/triangle2.jpeg",
      "/images/triangle3.jpeg",
      "/images/triangle4.jpeg",
    ],
    type: "triangle",
    pricesBySize: {
      "12 Inch": 2599,
      "15 Inch": 2999,
      "18 Inch": 3599,
      "27 Inch": 6499,
    },
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

// Get price for a specific size
export function getPriceBySize(product: Product, size: string): number {
  const sizePrice = product.pricesBySize[size as keyof typeof product.pricesBySize]
  return sizePrice ?? product.salePrice
}

