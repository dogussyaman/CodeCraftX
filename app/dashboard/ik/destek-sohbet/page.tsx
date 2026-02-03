import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { ChatPanel } from "@/components/chat/chat-panel"

export default async function IKDestekSohbetPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/giris")

  return (
    <div className="container mx-auto flex max-w-6xl flex-1 flex-col min-h-0 px-4 py-6 animate-in fade-in duration-300">
      <div className="flex shrink-0 items-center gap-2">
        <MessageCircle className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Canlı Destek Sohbeti</h1>
      </div>
      <p className="mb-2 shrink-0 text-sm text-muted-foreground">
        Destek ekibimizle anlık sohbet edebilirsiniz. Mesajlarınız canlı iletilir.
      </p>
      {/* Sabit max yükseklik: chat alanı büyümez, scroll container içinde kayar (gelistirici ile aynı yapı) */}
      <div className="flex min-h-[320px] max-h-[calc(100vh-8rem)] flex-1 flex-col overflow-hidden">
        <ChatPanel userId={user.id} />
      </div>
    </div>
  )
}
