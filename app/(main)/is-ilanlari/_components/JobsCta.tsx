import Link from "next/link"
import { Button } from "@/components/ui/button"

export function JobsCta() {
    return (
        <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">İlan Vermek İster misiniz?</h2>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8">
                        Binlerce yetenekli yazılımcıya ulaşın ve ekibinizi büyütün
                    </p>
                    <Button size="lg" asChild>
                        <Link href="/auth/kayit">İK Olarak Kayıt Ol</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}

