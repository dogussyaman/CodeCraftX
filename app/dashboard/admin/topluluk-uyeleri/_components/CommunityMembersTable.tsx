"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type MemberRow = {
  id: string
  user_id: string
  joined_at: string
  profiles: { id: string; full_name: string | null; email: string | null; avatar_url: string | null } | null
}

export function CommunityMembersTable({ members }: { members: MemberRow[] }) {
  if (members.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Henüz topluluk üyesi yok.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Üye</TableHead>
          <TableHead>E-posta</TableHead>
          <TableHead>Katılım tarihi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => {
          const name = m.profiles?.full_name ?? "—"
          const email = m.profiles?.email ?? "—"
          const initials = name !== "—" ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"
          const joined = new Date(m.joined_at).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
          return (
            <TableRow key={m.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={m.profiles?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{email}</TableCell>
              <TableCell className="text-muted-foreground">{joined}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
