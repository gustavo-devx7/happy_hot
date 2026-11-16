"use client"

import Link from "next/link"

export type ModelMedia = { type: "foto" | "video"; src: string; title: string }

export default function ModelGallery({
  name,
  handle,
  bio,
  media,
}: {
  name: string
  handle: string
  bio: string
  media: ModelMedia[]
}) {
  return (
    <main className="min-h-screen bg-[#0a0f1a] px-5 py-10 text-white sm:px-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/plataforma" className="text-sm text-purple-300 hover:text-white">← Todas as modelos</Link>
        <header className="py-8">
          <p className="text-sm text-purple-300">{handle}</p>
          <h1 className="mt-2 text-3xl font-bold">{name}</h1>
          {bio && <p className="mt-3 max-w-2xl text-white/65">{bio}</p>}
          <p className="mt-3 text-sm text-white/45">{media.length} conteúdos</p>
        </header>
        {media.length ? (
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((item, index) => (
              <article key={`${item.src}-${index}`} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                {item.type === "video" ? (
                  <video src={item.src} controls preload="metadata" className="aspect-[3/4] w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.src} alt={item.title || name} className="aspect-[3/4] w-full object-cover" loading="lazy" />
                )}
                <p className="p-3 text-sm text-white/70">{item.title}</p>
              </article>
            ))}
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/50">
            O conteúdo desta modelo será publicado em breve.
          </div>
        )}
      </div>
    </main>
  )
}
