"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Skill {
    id: string
    name: string
    category: string
}

interface UserSkill {
    id: string
    skill_id: string
    proficiency_level?: string
    skills: Skill
}

interface SkillSelectorProps {
    userId: string
    initialSkills: UserSkill[]
}

export function SkillSelector({ userId, initialSkills }: SkillSelectorProps) {
    const [open, setOpen] = useState(false)
    const [availableSkills, setAvailableSkills] = useState<Skill[]>([])
    const [userSkills, setUserSkills] = useState<UserSkill[]>(initialSkills)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function fetchSkills() {
            const { data } = await supabase.from("skills").select("*").order("name")
            if (data) setAvailableSkills(data)
        }
        fetchSkills()
    }, [])

    const exactMatchExists = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return true
        return availableSkills.some((s) => s.name.toLowerCase() === q)
    }, [search, availableSkills])

    async function addSkill(skill: Skill) {
        if (userSkills.some(us => us.skill_id === skill.id)) {
            toast.info("Bu yetenek zaten ekli")
            return
        }

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("developer_skills")
                .insert({
                    developer_id: userId,
                    skill_id: skill.id
                })
                .select(`
          *,
          skills:skill_id (
            name,
            category
          )
        `)
                .single()

            if (error) throw error

            if (data) {
                setUserSkills([...userSkills, data])
                toast.success(`${skill.name} eklendi`)
                router.refresh()
            }
        } catch (error: unknown) {
            console.error("Skill add error:", error)
            toast.error("Yetenek eklenirken hata oluştu")
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    async function createAndAddSkill(name: string) {
        const trimmed = name.trim()
        if (!trimmed) return

        if (userSkills.some(us => us.skills?.name?.toLowerCase() === trimmed.toLowerCase())) {
            toast.info("Bu yetenek zaten ekli")
            return
        }

        try {
            setLoading(true)
            const res = await fetch("/api/profile/apply-cv-skills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skill_names: [trimmed] }),
            })
            const data = await res.json().catch(() => ({}))

            if (res.ok && data.count > 0) {
                toast.success(`${trimmed} eklendi`)

                const { data: refreshed } = await supabase
                    .from("developer_skills")
                    .select("*, skills:skill_id (name, category)")
                    .eq("developer_id", userId)
                if (refreshed) setUserSkills(refreshed)

                const { data: allSkills } = await supabase.from("skills").select("*").order("name")
                if (allSkills) setAvailableSkills(allSkills)

                router.refresh()
            } else {
                toast.error(data.error || "Yetenek eklenemedi")
            }
        } catch {
            toast.error("Yetenek eklenirken hata oluştu")
        } finally {
            setLoading(false)
            setOpen(false)
            setSearch("")
        }
    }

    async function removeSkill(id: string) {
        try {
            const { error } = await supabase
                .from("developer_skills")
                .delete()
                .eq("id", id)

            if (error) throw error

            setUserSkills(userSkills.filter(us => us.id !== id))
            toast.success("Yetenek kaldırıldı")
            router.refresh()
        } catch (error) {
            console.error("Skill remove error:", error)
            toast.error("Yetenek kaldırılırken hata oluştu")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 min-h-[40px] p-4 border rounded-lg bg-card/50">
                {userSkills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Henüz yetenek eklenmemiş.</p>
                ) : (
                    userSkills.map((us) => (
                        <Badge key={us.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 group">
                            {us.skills?.name}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-white transition-all"
                                onClick={() => removeSkill(us.id)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))
                )}
            </div>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                        {loading ? "Ekleniyor..." : "Yetenek Ekle..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                    <Command shouldFilter>
                        <CommandInput placeholder="Yetenek ara veya yeni yaz..." value={search} onValueChange={setSearch} />
                        <CommandList>
                            <CommandEmpty>
                                {search.trim() ? (
                                    <button
                                        type="button"
                                        className="w-full flex items-center gap-2 px-2 py-2 text-sm cursor-pointer hover:bg-accent rounded-sm"
                                        onClick={() => createAndAddSkill(search)}
                                        disabled={loading}
                                    >
                                        <Plus className="h-4 w-4 text-primary" />
                                        <span>&quot;{search.trim()}&quot; yeni yetenek olarak ekle</span>
                                    </button>
                                ) : (
                                    "Yetenek bulunamadı."
                                )}
                            </CommandEmpty>
                            <CommandGroup>
                                {!exactMatchExists && search.trim() && (
                                    <CommandItem
                                        value={`__create__${search.trim()}`}
                                        onSelect={() => createAndAddSkill(search)}
                                        disabled={loading}
                                    >
                                        <Plus className="mr-2 h-4 w-4 text-primary" />
                                        &quot;{search.trim()}&quot; yeni yetenek olarak ekle
                                    </CommandItem>
                                )}
                                {availableSkills.map((skill) => {
                                    const isSelected = userSkills.some(us => us.skill_id === skill.id)
                                    return (
                                        <CommandItem
                                            key={skill.id}
                                            value={skill.name}
                                            onSelect={() => addSkill(skill)}
                                            disabled={isSelected || loading}
                                            className={cn(isSelected && "opacity-50 cursor-not-allowed")}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {skill.name}
                                            <span className="ml-auto text-xs text-muted-foreground capitalize">{skill.category}</span>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
