import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Ticket } from "lucide-react"
import { MyTicketsList } from "@/components/support/my-tickets-list"

export async function DashboardSupportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/giris")

  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("id, subject, type, status, priority, created_at, description, resolution_no, resolved_at, attachment_urls")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="h-6 w-6" />
          Destek Taleplerim
        </h1>
        <p className="text-destructive">Talepler yüklenemedi: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Ticket className="h-6 w-6" />
        Destek Taleplerim
      </h1>
      <p className="text-muted-foreground text-sm">
        Açtığınız destek taleplerini buradan takip edebilirsiniz.
      </p>
      <MyTicketsList tickets={tickets ?? []} />
    </div>
  )
}
