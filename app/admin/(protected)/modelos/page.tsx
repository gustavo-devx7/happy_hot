import Link from "next/link"
import { query } from "@/lib/db"
import { ensureModelProfilesTable } from "@/lib/model-profiles"
import ModelManager from "./model-manager"

export const dynamic = "force-dynamic"

export type ManagedModel = {
  id: number
  name: string
  slug: string
  handle: string
  cover_image: string
  photo_count: number
  video_count: number
  bio: string
  media: { type: "foto" | "video"; src: string; title: string }[]
  is_published: boolean
}

export default async function AdminModelsPage() {
  await ensureModelProfilesTable()
  const models = await query<ManagedModel>(`SELECT * FROM model_profiles ORDER BY created_at DESC`)
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm text-purple-500">← Voltar ao painel</Link>
        <h1 className="mt-5 text-3xl font-semibold">Modelos</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Cadastre perfis e caminhos de arquivos já publicados em `public`.</p>
        <ModelManager initialModels={models} />
      </div>
    </main>
  )
}
