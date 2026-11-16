import { query } from "@/lib/db"
import { ensureModelProfilesTable } from "@/lib/model-profiles"
import VitrineClient, { type Modelo } from "./vitrine-client"

export const dynamic = "force-dynamic"

export default async function PlataformaPage() {
  await ensureModelProfilesTable()
  const rows = await query<{
    id: number
    name: string
    slug: string
    handle: string
    cover_image: string
    photo_count: number
    video_count: number
  }>(`SELECT id, name, slug, handle, cover_image, photo_count, video_count
      FROM model_profiles WHERE is_published = TRUE ORDER BY created_at DESC`)

  const models: Modelo[] = [{
    id: -1,
    nome: "Mel Santos",
    slug: "@dix.mel_01",
    pasta: "/mel-santos",
    totalFotos: 9,
    totalVideos: 9,
    foto: "/images/mel-santos/f1.webp",
  }, ...rows.map((row) => ({
    id: row.id,
    nome: row.name,
    slug: row.handle || `/${row.slug}`,
    pasta: `/${row.slug}`,
    totalFotos: row.photo_count,
    totalVideos: row.video_count,
    foto: row.cover_image,
  }))]

  return <VitrineClient modelos={models} />
}
