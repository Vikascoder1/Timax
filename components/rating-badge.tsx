"use client"

import { Star } from "lucide-react"

export function RatingBadge() {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-background border border-border rounded-l-lg shadow-md flex flex-col items-center py-2 px-1.5">
      <Star className="h-4 w-4 fill-primary text-primary" />
      <Star className="h-4 w-4 fill-primary text-primary" />
      <Star className="h-4 w-4 fill-primary text-primary" />
      <Star className="h-4 w-4 fill-primary text-primary" />
      <Star className="h-4 w-4 text-primary" />
      <span className="text-xs font-semibold mt-1 text-foreground">4.5</span>
    </div>
  )
}