"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CircularProgress } from "@/components/ui/circular-progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Check, X, Sparkles } from "lucide-react"
import type { MatchDetails } from "./types"

interface MatchAnalysisCardProps {
  matchScore: number
  matchReason?: string
  matchDetails?: MatchDetails
}

export function MatchAnalysisCard({ matchScore, matchReason, matchDetails }: MatchAnalysisCardProps) {
  const [open, setOpen] = useState(false)

  const hasDetails = Boolean(
    matchDetails?.matching_skills?.length ||
      matchDetails?.missing_skills?.length ||
      matchDetails?.positive_factors?.length ||
      matchDetails?.negative_factors?.length,
  )

  const summaryBadge =
    matchScore >= 80 ? "success" : matchScore >= 60 ? "default" : matchScore >= 40 ? "warning" : "destructive"

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2 text-left transition-colors hover:bg-muted/40 dark:border-gray-600 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <CircularProgress value={matchScore} size={40} strokeWidth={4} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-primary" />
              <p className="text-sm font-medium text-foreground dark:text-gray-100">ATS Analiz Özeti</p>
              <Badge variant={summaryBadge} className="text-[10px]">
                %{matchScore}
              </Badge>
            </div>
            {matchReason ? <p className="mt-0.5 truncate text-xs text-muted-foreground dark:text-gray-400">{matchReason}</p> : null}
          </div>
          {hasDetails ? <ChevronDown className={`size-4 text-muted-foreground dark:text-gray-400 ${open ? "rotate-180" : ""}`} /> : null}
        </button>
      </CollapsibleTrigger>

      {hasDetails ? (
        <CollapsibleContent>
          <div className="space-y-2 px-2 pb-2 pt-3">
            {matchDetails?.matching_skills?.length ? (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs text-muted-foreground dark:text-gray-400">Eşleşen:</span>
                {matchDetails.matching_skills.slice(0, 6).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="h-5 border-emerald-500/30 bg-emerald-500/5 px-1.5 py-0 text-[10px] text-emerald-700 dark:text-emerald-400"
                  >
                    <Check className="size-2.5" />
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : null}
            {matchDetails?.missing_skills?.length ? (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs text-muted-foreground dark:text-gray-400">Eksik:</span>
                {matchDetails.missing_skills.slice(0, 6).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="h-5 border-rose-500/30 bg-rose-500/5 px-1.5 py-0 text-[10px] text-rose-700 dark:text-rose-400"
                  >
                    <X className="size-2.5" />
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </CollapsibleContent>
      ) : null}
    </Collapsible>
  )
}

