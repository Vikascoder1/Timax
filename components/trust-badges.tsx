"use client"

import { Shield, Battery, HandCoins, MapPin } from "lucide-react"

const badges = [
  {
    icon: Shield,
    label: "BUY WITH MS HandCrafts TRUST",
  },
  {
    icon: Battery,
    label: "FREE BATTERY REPLACEMENT",
  },
  {
    icon: HandCoins,
    label: "EARN MS HandCrafts POINTS",
  },
  {
    icon: MapPin,
    label: "TRACK YOUR ORDER",
  },
]

export function TrustBadges() {
  return (
    <section className="px-4 md:px-6 lg:px-8 py-8 md:py-12 bg-muted/40">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
        {badges.map((badge) => (
          <div key={badge.label} className="flex flex-col items-center text-center">
            <div className="mb-2 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700 shadow-sm">
              <badge.icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.5} />
            </div>
            <p className="text-xs md:text-sm font-semibold text-foreground uppercase tracking-wide leading-tight">
              {badge.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
