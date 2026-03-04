"use client"

const announcements = [
  "Winter Sale — Up to 50% off Shop Now",
  "Cozy Season Deals | Flat 50% off Shop Now",
  "Free Shipping on Orders Above ₹999",
]

export function AnnouncementBar() {
  return (
    <div className="bg-teal-50 text-teal-900 text-center py-2.5 px-4 text-xs md:text-sm border-b border-teal-100">
      <p className="inline-flex flex-wrap items-center justify-center gap-1">
        <span className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          New Collection Offer
        </span>
        <span className="hidden xs:inline text-teal-900">
          • Handcrafted wall clocks • Silent sweep movement • Premium finish
        </span>
        <a
          href="#"
          className="ml-1 inline-flex items-center rounded-full bg-teal-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-teal-500 transition-colors"
        >
          Shop Now
        </a>
      </p>
    </div>
  )
}
