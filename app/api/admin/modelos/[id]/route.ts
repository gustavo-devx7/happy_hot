import { NextRequest, NextResponse } from "next/server"
import { execute } from "@/lib/db"
import { getAdminSession } from "@/lib/admin-session"
import { ensureModelProfilesTable } from "@/lib/model-profiles"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  await ensureModelProfilesTable()
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Modelo inválida." }, { status: 400 })
  const body = await request.json() as Record<string, unknown>
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : ""
  const handle = typeof body.handle === "string" ? body.handle.trim() : ""
  const coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() : ""
  const bio = typeof body.bio === "string" ? body.bio.trim() : ""
  const photos = typeof body.photos === "string" ? body.photos.split(/\r?\n/).map((v) => v.trim()).filter(Boolean) : null
  const videos = typeof body.videos === "string" ? body.videos.split(/\r?\n/).map((v) => v.trim()).filter(Boolean) : null
  const parse = (lines: string[] | null, type: "foto" | "video") => {
    if (!lines || lines.some((line) => {
      const src = line.split("|")[0].trim()
      return !src.startsWith("/") || src.startsWith("//") || src.includes("..")
    })) return null
    return lines.map((line) => {
      const [src, ...title] = line.split("|").map((v) => v.trim())
      return { type, src, title: title.join("|") || "Conteúdo exclusivo" }
    })
  }
  const photoItems = parse(photos, "foto")
  const videoItems = parse(videos, "video")
  if (!name || name.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80 || ["mel-santos", "outra-modelo"].includes(slug) || handle.length > 120 || bio.length > 1000 || !coverImage.startsWith("/") || coverImage.startsWith("//") || coverImage.includes("..") || !photoItems || !videoItems || photoItems.length + videoItems.length > 300) {
    return NextResponse.json({ error: "Revise os dados e os caminhos das mídias." }, { status: 400 })
  }
  try {
    const count = await execute(
      `UPDATE model_profiles SET name=$1, slug=$2, handle=$3, cover_image=$4,
       photo_count=$5, video_count=$6, bio=$7, media=$8::jsonb,
       is_published=$9, updated_at=CURRENT_TIMESTAMP WHERE id=$10`,
      [name, slug, handle, coverImage, photoItems.length, videoItems.length, bio, JSON.stringify([...photoItems, ...videoItems]), body.isPublished !== false, id]
    )
    return count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Modelo não encontrada." }, { status: 404 })
  } catch (error) {
    const isDuplicate = error instanceof Error && "code" in error && error.code === "23505"
    return NextResponse.json({ error: isDuplicate ? "Já existe uma modelo com esse slug." : "Não foi possível atualizar a modelo." }, { status: isDuplicate ? 409 : 500 })
  }
}
