"use client"

import { useState, useEffect } from "react"
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
    const router = useRouter()
    const supabase = createClient()

    // Tüm yetenekleri getir
    useEffect(() => {
        async function fetchSkills() {
            const { data, error } = await supabase.from("skills").select("*").order("name")
            if (data) setAvailableSkills(data)
        }
        fetchSkills()
    }, [])

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
        } catch (error: any) {
            console.error("Skill add error:", error)
            toast.error("Yetenek eklenirken hata oluştu")
        } finally {
            setLoading(false)
            setOpen(false)
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
                    <Command>
                        <CommandInput placeholder="Yetenek ara..." />
                        <CommandList>
                            <CommandEmpty>Yetenek bulunamadı.</CommandEmpty>
                            <CommandGroup>
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
