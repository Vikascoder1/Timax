"use client"

import { Shield, Battery, HandCoins, MapPin } from "lucide-react"

const badges = [
  {
    icon: Shield,
    label: "BUY WITH MS CRAFTS TRUST",
  },
  {
    icon: Battery,
    label: "FREE BATTERY REPLACEMENT",
  },
  {
    icon: HandCoins,
    label: "EARN MS CRAFTS POINTS",
  },
  {
    icon: MapPin,
    label: "TRACK YOUR ORDER",
  },
]

export function TrustBadges() {
  return (
    <section className="px-4 py-8">
      <div className="grid grid-cols-2 gap-6">
        {badges.map((badge) => (
          <div key={badge.label} className="flex flex-col items-center text-center">
            <badge.icon className="h-10 w-10 text-[#2abfbf] mb-2" strokeWidth={1.5} />
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide leading-tight">
              {badge.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
