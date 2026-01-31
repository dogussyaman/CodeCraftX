export function DestekHero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute top-20 right-10 size-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-10 left-10 size-96 bg-secondary/10 rounded-full blur-[120px]" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            <span className="gradient-text">Destek</span> Merkezi
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Size yardımcı olmak için buradayız. Sorularınızın cevaplarını bulun veya bizimle iletişime geçin.
          </p>
        </div>
      </div>
    </section>
  )
}
