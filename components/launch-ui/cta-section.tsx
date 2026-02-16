"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Section, SectionContent } from "./section"
import { cn } from "@/lib/utils"

export interface CTASectionProps {
  title?: string
  buttonText?: string
  buttonHref?: string
  className?: string
}

export function CTASection({
  title = "Hemen başlayın",
  buttonText = "Ücretsiz Başlayın",
  buttonHref = "/auth/kayit",
  className,
}: CTASectionProps) {
  return (
    <Section className={cn("border-t border-border", className)}>
      <SectionContent>
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 h-12 text-base font-medium gap-2"
          >
            <Link href={buttonHref}>
              {buttonText}
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </div>
      </SectionContent>
    </Section>
  )
}
