"use client"

import Link from "next/link"
import { Truck, Banknote, Award, RotateCcw } from "lucide-react"

const footerBadges = [
  { icon: Truck, label: "Free Shipping" },
  { icon: Banknote, label: "cash on delivery" },
  { icon: Award, label: "Premium Quality" },
  { icon: RotateCcw, label: "same Day Return" },
]

export function Footer() {
  return (
    <footer>
      {/* Footer Trust Badges */}
      <div className="bg-[#2d2d2d] px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {footerBadges.map((badge) => (
            <div key={badge.label} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#3d3d3d] flex items-center justify-center mb-2">
                <badge.icon className="h-7 w-7 text-[#2abfbf]" strokeWidth={1.5} />
              </div>
              <p className="text-xs text-[#e0e0e0]">{badge.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="bg-[#1a1a1a] px-4 md:px-6 lg:px-8 py-8 md:py-12 border-t border-[#3d3d3d]">
        <div className="text-center max-w-6xl mx-auto">
          <Link href="/" className="text-2xl md:text-3xl tracking-wider">
            <span className="font-light text-[#e0e0e0]">MS</span>
            <span className="font-bold text-[#2abfbf]">CRAFTS</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
