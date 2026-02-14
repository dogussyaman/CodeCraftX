"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, CheckCircle2, LogIn } from "lucide-react"
import { JobApplyModal } from "@/components/job-apply-modal"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface JobApplyButtonProps {
  jobId: string
  jobTitle: string
  label: string
  hasApplied?: boolean
  isAuthenticated?: boolean
}

export function JobApplyButton({ jobId, jobTitle, label, hasApplied = false, isAuthenticated = false }: JobApplyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (hasApplied) {
    return (
      <Button size="lg" variant="success" className="gap-2 cursor-default" disabled>
        <CheckCircle2 className="size-4" />
        Başvuruldu
      </Button>
    )
  }

  if (!isAuthenticated) {
    return (
      <Button size="lg" className="gap-2" asChild>
        <Link href="/auth/giris">
          <LogIn className="size-4" />
          Giriş Yap ve Başvur
        </Link>
      </Button>
    )
  }

  return (
    <>
      <Button size="lg" className="gap-2" onClick={() => setIsModalOpen(true)}>
        <Send className="size-4" />
        {label}
      </Button>

      <JobApplyModal
        jobId={jobId}
        jobTitle={jobTitle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

