import { NextRequest, NextResponse } from "next/server"
import { execute, query } from "@/lib/db"
import { getAdminSession } from "@/lib/admin-session"
import { ensureModelProfilesTable } from "@/lib/model-profiles"

type MediaItem = { type: "foto" | "video"; src: string; title: string }

function parseLines(value: unknown, type: MediaItem["type"]): MediaItem[] | null {
  if (typeof value !== "string") return null
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const items: MediaItem[] = []
  for (const line of lines) {
    const [src, ...titleParts] = line.split("|").map((part) => part.trim())
    if (!src || !src.startsWith("/") || src.includes("..") || src.startsWith("//")) return null
    items.push({ type, src, title: titleParts.join("|") || "Conteúdo exclusivo" })
  }
  return items
}

function parseModel(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : ""
  const handle = typeof body.handle === "string" ? body.handle.trim() : ""
  const coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() : ""
  const bio = typeof body.bio === "string" ? body.bio.trim() : ""
  const photos = parseLines(body.photos, "foto")
  const videos = parseLines(body.videos, "video")
  if (
    name.length < 2 || name.length > 120 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80 ||
    ["mel-santos", "outra-modelo"].includes(slug) ||
    handle.length > 120 || bio.length > 1000 ||
    !coverImage.startsWith("/") || coverImage.includes("..") || coverImage.startsWith("//") ||
    !photos || !videos || photos.length + videos.length > 300
  ) return null
  return {
    name, slug, handle, coverImage, bio, photos, videos,
    media: JSON.stringify([...photos, ...videos]),
    isPublished: body.isPublished !== false,
  }
}

export async function POST(request: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  await ensureModelProfilesTable()
  try {
    const parsed = parseModel(await request.json())
    if (!parsed) return NextResponse.json({ error: "Revise os dados e os caminhos das mídias." }, { status: 400 })
    const rows = await query<{ id: number }>(
      `INSERT INTO model_profiles (name, slug, handle, cover_image, photo_count, video_count, bio, media, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9) RETURNING id`,
      [parsed.name, parsed.slug, parsed.handle, parsed.coverImage, parsed.photos.length, parsed.videos.length, parsed.bio, parsed.media, parsed.isPublished]
    )
    return NextResponse.json({ id: rows[0]?.id }, { status: 201 })
  } catch (error) {
    console.error("Erro ao cadastrar modelo:", error)
    const isDuplicate = error instanceof Error && "code" in error && error.code === "23505"
    return NextResponse.json({ error: isDuplicate ? "Já existe uma modelo com esse slug." : "Não foi possível salvar a modelo." }, { status: isDuplicate ? 409 : 500 })
  }
}

export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  await ensureModelProfilesTable()
  const models = await query(`SELECT * FROM model_profiles ORDER BY created_at DESC`)
  return NextResponse.json(models)
}

export async function DELETE(request: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  await ensureModelProfilesTable()
  const id = Number(new URL(request.url).searchParams.get("id"))
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Modelo inválido." }, { status: 400 })
  const count = await execute(`DELETE FROM model_profiles WHERE id = $1`, [id])
  return count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Modelo não encontrada." }, { status: 404 })
}
