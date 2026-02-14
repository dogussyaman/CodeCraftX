export function ProjectsHero() {
    return (
        <section className="relative pt-24 pb-14 md:pt-28 md:pb-18 overflow-hidden">
            <div className="absolute top-20 left-10 size-96 bg-secondary/10 rounded-full blur-[120px]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
                        Topluluk <span className="gradient-text">Projeleri</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 text-pretty">
                        Topluluğumuzun geliştirdiği açık kaynak projeler ve boilerplate&apos;ler
                    </p>
                </div>
            </div>
        </section>
    )
}

