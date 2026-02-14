import { Badge } from "@/components/ui/badge"

interface DeveloperHeaderProps {
    fullName: string | null
}

export function DeveloperHeader({ fullName }: DeveloperHeaderProps) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 p-6 sm:p-10 md:p-12">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 size-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 size-64 bg-primary/10 rounded-full blur-3xl opacity-50" />

            <div className="relative z-10 max-w-2xl">
                <Badge variant="outline" className="mb-4 bg-background/50 backdrop-blur-sm border-primary/20 text-primary">
                    Geliştirici Paneli
                </Badge>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
                    Merhaba, <span className="text-primary">{fullName || "Geliştirici"}</span> 👋
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    Kariyer hedeflerine ulaşmak için doğru yerdesin. İş başvurularını yönet, eşleşmelerini incele ve
                    profilini güçlendir.
                </p>
            </div>
        </div>
    )
}

