/** Mise en page des pages de texte (aide, mentions) : bandeau nuit, puis texte sur carte blanche bordée. */
export function ProsePage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <>
      <div className="bg-night-glow text-white">
        <div className="mx-auto w-full max-w-3xl px-5 pt-12 pb-20 sm:pt-16 sm:pb-24">
          <p className="inline-flex rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold text-sun">{eyebrow}</p>
          <h1 className="mt-4 text-[34px] leading-[1.08] font-extrabold text-balance sm:text-[44px]">{title}</h1>
          {intro && <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">{intro}</p>}
        </div>
      </div>
      <section className="mx-auto -mt-10 w-full max-w-3xl px-5 pb-16">
        <div className="space-y-6 rounded-2xl border border-ink/8 bg-white p-6 text-[15px] leading-relaxed text-ink/80 shadow-card sm:p-9 [&_h2]:mt-2 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
          {children}
        </div>
      </section>
    </>
  );
}
