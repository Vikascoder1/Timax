import { createClient } from "@/lib/supabase/server"

/**
 * Get public URL for a product image from Supabase Storage
 * @param imagePath - Path to image in storage (e.g., "ocean.jpeg" or "products/ocean.jpeg")
 * @returns Full public URL to the image
 */
export async function getProductImageUrl(imagePath: string): Promise<string> {
  const supabase = await createClient()
  
  // If already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath
  }
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath
  
  // Get public URL from Supabase Storage
  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(cleanPath)
  
  return data.publicUrl
}

/**
 * Convert local image path to Supabase Storage URL
 * @param localPath - Local path like "/images/ocean.jpeg"
 * @returns Supabase Storage public URL
 */
export async function convertToStorageUrl(localPath: string): Promise<string> {
  if (!localPath) return ""
  
  // If already a full URL, return as is
  if (localPath.startsWith("http://") || localPath.startsWith("https://")) {
    return localPath
  }
  
  // Extract filename from local path
  const filename = localPath.replace("/images/", "")
  
  // Get Supabase Storage URL
  return getProductImageUrl(`products/${filename}`)
}

