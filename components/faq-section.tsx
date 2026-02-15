"use client"

import { useState } from "react"
import { ChevronUp } from "lucide-react"

const faqs = [
  {
    question: "1. Can I customize any clock on your site?",
    answer:
      "All Items are Custom Made specially on order, not readymade",
  },
  {
    question: "2. How long does delivery take?",
    answer:
      "It usually takes 8 to 11 working days across India. Custom orders might take a day or two extra.",
  },
  {
    question: "3. Do you ship internationally?",
    answer:
      "We're currently shipping across India only, but international shipping is coming soon!",
  },
  {
    question: "4. What kind of wall clock is best for the living room?",
    answer:
      "Depends on your vibe\u2014minimal, rustic, or statement. We have so many options for every style.",
  },
  {
    question: "5. Can I return a custom wall clock?",
    answer:
      "Since it's made just for you, returns aren't available on custom designs, unless there's a quality issue.\n\nSame day check warranty Available, make unboxing video if any manufacturing/damage occurs we make replacement\n\nMachine Warranty 1 Year",
  },
]

export function FaqSection() {
  const [openItems, setOpenItems] = useState<number[]>([0])

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  return (
    <section className="px-4 py-8">
      <h2
        className="text-2xl md:text-3xl font-bold text-foreground"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {"FAQ's"}
      </h2>

      <div className="mt-6 divide-y divide-border border-t border-border">
        {faqs.map((faq, index) => (
          <div key={index} className="py-4">
            <button
              onClick={() => toggleItem(index)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-semibold text-foreground pr-4">
                {faq.question}
              </span>
              <ChevronUp
                className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${
                  openItems.includes(index) ? "" : "rotate-180"
                }`}
              />
            </button>
            {openItems.includes(index) && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed whitespace-pre-line">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
