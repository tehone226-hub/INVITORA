/** Mise en page des pages de texte (aide, mentions). */
export function ProsePage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-12 sm:py-16">
      <p className="text-xs font-bold tracking-[0.12em] text-terracotta uppercase">{eyebrow}</p>
      <h1 className="mt-2 text-[32px] leading-tight font-semibold sm:text-4xl">{title}</h1>
      {intro && <p className="mt-3 text-[16px] leading-relaxed text-ink/65">{intro}</p>}
      <div className="mt-8 space-y-6 rounded-[28px] border border-ink/5 bg-white p-6 text-[15px] leading-relaxed text-ink/80 shadow-card sm:p-9 [&_h2]:mt-2 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
