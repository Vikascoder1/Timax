"use client"

const announcements = [
  "Winter Sale — Up to 50% off Shop Now",
  "Cozy Season Deals | Flat 50% off Shop Now",
  "Free Shipping on Orders Above ₹999",
]

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-xs md:text-sm">
      <p>
        {"❄️ "}
        {announcements[0].replace("Shop Now", "")}
        <a href="#" className="underline font-semibold">
          Shop Now
        </a>
      </p>
    </div>
  )
}
