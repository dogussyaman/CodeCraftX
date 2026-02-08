"use client"

import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface CvDownloadLinkProps {
  href: string
  fileName: string
  developerId: string
  applicationId: string
  jobTitle: string
}

export function CvDownloadLink({ href, fileName, developerId, applicationId, jobTitle }: CvDownloadLinkProps) {
  const supabase = createClient()

  const handleClick = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("notifications").insert({
        recipient_id: developerId,
        actor_id: user.id,
        type: "cv_downloaded",
        title: "CV'niz indirildi",
        body: `${jobTitle} pozisyonu için CV'niz indirildi.`,
        href: "/dashboard/gelistirici/basvurular",
        data: {
          application_id: applicationId,
          job_title: jobTitle,
        },
      })

      if (error) {
        console.error("CV download notification error:", error)
      }
    } catch (err) {
      console.error(err)
      toast.error("CV indirimi bildirimi gönderilemedi")
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="text-primary hover:underline"
    >
      {fileName}
    </a>
  )
}
