"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket } from "lucide-react"
import { CreateTicketForm } from "@/components/support/create-ticket-form"
import { useAuth } from "@/hooks/use-auth"

export function DestekTicketCard() {
  const { user, role, loading } = useAuth()
  const ticketsPageHref =
    role === "developer"
      ? "/dashboard/gelistirici/destek"
      : role === "hr"
        ? "/dashboard/ik/destek"
        : (role as string) === "company_admin"
          ? "/dashboard/company/destek"
          : undefined

  return (
    <section className="pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Ticket className="h-6 w-6 text-primary" />
                <CardTitle>Yeni destek talebi oluştur</CardTitle>
              </div>
              <CardDescription>
                Sorununuzu veya talebinizi yazın; en kısa sürede size dönüş yapacağız.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!loading && (
                <CreateTicketForm
                  user={user ? { id: user.id, email: user.email ?? undefined } : null}
                  ticketsPageHref={ticketsPageHref}
                />
              )}
              {loading && (
                <p className="text-sm text-muted-foreground">Yükleniyor...</p>
              )}
            </CardContent>
          </Card>
          {user && ticketsPageHref && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              <Link href={ticketsPageHref} className="text-primary hover:underline">
                Destek taleplerime git
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
