"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function ThemePageFaq({
  faqs,
  sectionId,
}: {
  faqs: { question: string; answer: string }[]
  sectionId: string
}) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((f, i) => (
        <AccordionItem
          key={`${sectionId}-${i}`}
          value={`${sectionId}-${i}`}
          className="border-b border-border last:border-b-0"
        >
          <AccordionTrigger className="text-left text-sm font-semibold text-foreground sm:text-base">
            {f.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
            {f.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
