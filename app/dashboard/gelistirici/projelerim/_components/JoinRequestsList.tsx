"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Check, X } from "lucide-react"
import { respondToJoinRequest } from "../actions"
import { toast } from "sonner"

interface JoinRequestRow {
  id: string
  project_id: string
  user_id: string
  message: string | null
  created_at: string
  projects: { title: string } | null
  profiles: { full_name: string | null } | null
}

interface JoinRequestsListProps {
  requests: JoinRequestRow[]
}

export function JoinRequestsList({ requests }: JoinRequestsListProps) {
  const router = useRouter()

  async function handleRespond(requestId: string, status: "approved" | "rejected") {
    const result = await respondToJoinRequest(requestId, status)
    if (result.ok) {
      toast.success(status === "approved" ? "İstek onaylandı" : "İstek reddedildi")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  if (!requests.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="size-5" />
          Katılma istekleri
        </CardTitle>
        <CardDescription>Projelerinize gelen katılma isteklerini onaylayın veya reddedin.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {requests.map((req) => (
            <li
              key={req.id}
              className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {req.profiles?.full_name ?? "Kullanıcı"} — {req.projects?.title ?? "Proje"}
                </p>
                {req.message && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{req.message}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(req.created_at).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="gap-1"
                  onClick={() => handleRespond(req.id, "approved")}
                >
                  <Check className="size-3.5" />
                  Onayla
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => handleRespond(req.id, "rejected")}
                >
                  <X className="size-3.5" />
                  Reddet
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
