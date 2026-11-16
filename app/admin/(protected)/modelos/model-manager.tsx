"use client"

import { useState } from "react"
import type { ManagedModel } from "./page"

type FormModel = { name: string; slug: string; handle: string; coverImage: string; bio: string; photos: string; videos: string; isPublished: boolean }
const emptyForm: FormModel = { name: "", slug: "", handle: "", coverImage: "", bio: "", photos: "", videos: "", isPublished: true }

function modelToForm(model: ManagedModel): FormModel {
  const lines = (type: "foto" | "video") => model.media.filter((item) => item.type === type).map((item) => `${item.src}|${item.title}`).join("\n")
  return { name: model.name, slug: model.slug, handle: model.handle, coverImage: model.cover_image, bio: model.bio, photos: lines("foto"), videos: lines("video"), isPublished: model.is_published }
}

export default function ModelManager({ initialModels }: { initialModels: ManagedModel[] }) {
  const [models, setModels] = useState(initialModels)
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState<FormModel>(emptyForm)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  function update<K extends keyof FormModel>(key: K, value: FormModel[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      const response = await fetch(editing ? `/api/admin/modelos/${editing}` : "/api/admin/modelos", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar.")
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.")
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Excluir este cadastro? Os arquivos em public não serão apagados.")) return
    const response = await fetch(`/api/admin/modelos?id=${id}`, { method: "DELETE" })
    const result = await response.json()
    if (!response.ok) return setError(result.error || "Não foi possível excluir.")
    setModels((current) => current.filter((model) => model.id !== id))
  }

  const inputClass = "mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
  return (
    <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
      <section className="space-y-3">
        {models.map((model) => (
          <article key={model.id} className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={model.cover_image} alt="" className="h-16 w-14 rounded-md object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{model.name}</p>
              <p className="truncate text-xs text-[var(--muted-foreground)]">/{model.slug} · {model.photo_count} fotos · {model.video_count} vídeos · {model.is_published ? "publicada" : "oculta"}</p>
            </div>
            <button className="text-sm text-purple-500" onClick={() => { setEditing(model.id); setForm(modelToForm(model)); setError("") }}>Editar</button>
            <button className="text-sm text-red-500" onClick={() => void remove(model.id)}>Excluir</button>
          </article>
        ))}
        {!models.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-[var(--muted-foreground)]">Nenhuma modelo cadastrada.</p>}
      </section>

      <form onSubmit={save} className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{editing ? "Editar modelo" : "Nova modelo"}</h2>
          {editing && <button type="button" className="text-xs text-purple-500" onClick={() => { setEditing(null); setForm(emptyForm) }}>Cancelar edição</button>}
        </div>
        <label className="block text-sm">Nome<input required maxLength={120} className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} /></label>
        <label className="block text-sm">Slug da página<input required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="nome-da-modelo" className={inputClass} value={form.slug} onChange={(e) => update("slug", e.target.value.toLowerCase())} /></label>
        <label className="block text-sm">Usuário / identificador<input maxLength={120} className={inputClass} value={form.handle} onChange={(e) => update("handle", e.target.value)} /></label>
        <label className="block text-sm">Capa (caminho em public)<input required placeholder="/images/nome/capa.webp" className={inputClass} value={form.coverImage} onChange={(e) => update("coverImage", e.target.value)} /></label>
        <label className="block text-sm">Descrição<textarea maxLength={1000} rows={2} className={inputClass} value={form.bio} onChange={(e) => update("bio", e.target.value)} /></label>
        <label className="block text-sm">Fotos: um caminho por linha. Opcionalmente, use `| título`<textarea rows={4} placeholder={'/images/nome/foto1.webp|Ensaio\n/images/nome/foto2.webp'} className={inputClass} value={form.photos} onChange={(e) => update("photos", e.target.value)} /></label>
        <label className="block text-sm">Vídeos: um caminho por linha. Opcionalmente, use `| título`<textarea rows={4} placeholder={'/media/nome/video1.mp4|Bastidores'} className={inputClass} value={form.videos} onChange={(e) => update("videos", e.target.value)} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} /> Publicada na plataforma</label>
        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        <button disabled={saving} className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Salvando…" : editing ? "Salvar alterações" : "Cadastrar modelo"}</button>
      </form>
    </div>
  )
}
