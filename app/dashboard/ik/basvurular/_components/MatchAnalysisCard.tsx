"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CircularProgress } from "@/components/ui/circular-progress"
import { CheckCircle2, AlertCircle, Check, X, Plus, Minus, Sparkles, GraduationCap, Briefcase, ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"

interface MatchDetails {
    matching_skills?: string[]
    missing_skills?: string[]
    missing_optional?: string[]
    positive_factors?: string[]
    negative_factors?: string[]
    experience_analysis?: {
        candidate_years: number
        required_level: string
        candidate_level: string
        level_match: boolean
        note: string
    } | null
    education_match?: {
        relevant: boolean
        degree_level: string
        field_relevance: string
    } | null
}

interface MatchAnalysisCardProps {
    matchScore: number
    matchReason?: string
    matchDetails?: MatchDetails
}

export function MatchAnalysisCard({ matchScore, matchReason, matchDetails }: MatchAnalysisCardProps) {
    const [isOpen, setIsOpen] = useState(false)

    const hasExpandableDetails = matchDetails && (
        matchDetails.positive_factors?.length ||
        matchDetails.negative_factors?.length ||
        matchDetails.matching_skills?.length ||
        matchDetails.missing_skills?.length ||
        matchDetails.experience_analysis ||
        matchDetails.education_match
    )

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            {/* Compact summary header - always visible */}
            <CollapsibleTrigger asChild>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors select-none">
                    <CircularProgress value={matchScore} size={40} strokeWidth={4} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-3.5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium truncate">AI Analiz</span>
                            <Badge
                                variant={
                                    matchScore >= 80 ? "success"
                                        : matchScore >= 60 ? "default"
                                            : matchScore >= 40 ? "warning"
                                                : "destructive"
                                }
                                className="text-xs px-1.5 py-0"
                            >
                                {matchScore >= 80 ? "Yüksek" : matchScore >= 60 ? "Orta" : matchScore >= 40 ? "Düşük" : "Çok Düşük"}
                            </Badge>
                        </div>
                        {matchReason && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{matchReason}</p>
                        )}
                    </div>
                    {hasExpandableDetails && (
                        <ChevronDown className={`size-4 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                    )}
                </div>
            </CollapsibleTrigger>

            {/* Expandable details */}
            {hasExpandableDetails && (
                <CollapsibleContent>
                    <div className="space-y-3 pt-2 pl-2 pr-2 pb-2">
                        {/* Positive & Negative Factors - side by side compact */}
                        {(matchDetails?.positive_factors?.length || matchDetails?.negative_factors?.length) ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {matchDetails.positive_factors && matchDetails.positive_factors.length > 0 && (
                                    <div className="p-2 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                                        <h4 className="flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                                            <CheckCircle2 className="size-3" />
                                            Güçlü Yönler
                                        </h4>
                                        <ul className="space-y-0.5">
                                            {matchDetails.positive_factors.map((factor, idx) => (
                                                <li key={idx} className="flex items-start gap-1.5 text-xs text-green-600 dark:text-green-300">
                                                    <Plus className="size-2.5 mt-0.5 flex-shrink-0" />
                                                    <span>{factor}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {matchDetails.negative_factors && matchDetails.negative_factors.length > 0 && (
                                    <div className="p-2 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                                        <h4 className="flex items-center gap-1.5 text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
                                            <AlertCircle className="size-3" />
                                            Dikkat
                                        </h4>
                                        <ul className="space-y-0.5">
                                            {matchDetails.negative_factors.map((factor, idx) => (
                                                <li key={idx} className="flex items-start gap-1.5 text-xs text-orange-600 dark:text-orange-300">
                                                    <Minus className="size-2.5 mt-0.5 flex-shrink-0" />
                                                    <span>{factor}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {/* Skills - compact inline */}
                        {(matchDetails?.matching_skills?.length || matchDetails?.missing_skills?.length) ? (
                            <div className="space-y-1.5">
                                {matchDetails.matching_skills && matchDetails.matching_skills.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1">
                                        <span className="text-xs text-muted-foreground mr-1">Eşleşen:</span>
                                        {matchDetails.matching_skills.slice(0, 6).map((skill, idx) => (
                                            <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300">
                                                <Check className="size-2.5 mr-0.5" />{skill}
                                            </Badge>
                                        ))}
                                        {matchDetails.matching_skills.length > 6 && (
                                            <span className="text-[10px] text-muted-foreground">+{matchDetails.matching_skills.length - 6}</span>
                                        )}
                                    </div>
                                )}

                                {matchDetails.missing_skills && matchDetails.missing_skills.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1">
                                        <span className="text-xs text-muted-foreground mr-1">Eksik:</span>
                                        {matchDetails.missing_skills.slice(0, 6).map((skill, idx) => (
                                            <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300">
                                                <X className="size-2.5 mr-0.5" />{skill}
                                            </Badge>
                                        ))}
                                        {matchDetails.missing_skills.length > 6 && (
                                            <span className="text-[10px] text-muted-foreground">+{matchDetails.missing_skills.length - 6}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {/* Experience & Education - compact inline */}
                        {(matchDetails?.experience_analysis || matchDetails?.education_match) && (
                            <div className="flex flex-wrap gap-2 text-xs">
                                {matchDetails.experience_analysis && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300">
                                        <Briefcase className="size-3" />
                                        <span>{matchDetails.experience_analysis.candidate_level} ({matchDetails.experience_analysis.candidate_years} yıl)</span>
                                        <span className="text-blue-400">→</span>
                                        <span>{matchDetails.experience_analysis.required_level}</span>
                                    </div>
                                )}
                                {matchDetails.education_match && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300">
                                        <GraduationCap className="size-3" />
                                        <span>{matchDetails.education_match.degree_level}</span>
                                        <span>•</span>
                                        <span>{matchDetails.education_match.field_relevance}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CollapsibleContent>
            )}
        </Collapsible>
    )
}
