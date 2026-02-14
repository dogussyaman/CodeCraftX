"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"

export function GlossarySearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const q = searchParams.get("q") ?? ""

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const value = (form.elements.namedItem("q") as HTMLInputElement)?.value?.trim() ?? ""
    const params = new URLSearchParams()
    if (value) params.set("q", value)
    startTransition(() => {
      router.push(value ? `/terimler?${params.toString()}` : "/terimler/a")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="glossary-q" className="sr-only">
          Terim ara
        </Label>
        <Input
          id="glossary-q"
          name="q"
          type="search"
          placeholder="Terim veya açıklama ara..."
          defaultValue={q}
          className="max-w-md"
        />
      </div>
      <Button type="submit" disabled={isPending} className="gap-2">
        <Search className="size-4" />
        Ara
      </Button>
    </form>
  )
}
