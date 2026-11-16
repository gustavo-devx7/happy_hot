import { notFound } from "next/navigation"
import { queryOne } from "@/lib/db"
import { ensureModelProfilesTable } from "@/lib/model-profiles"
import ModelGallery, { type ModelMedia } from "./model-gallery"

export const dynamic = "force-dynamic"

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await ensureModelProfilesTable()
  const model = await queryOne<{ name: string; handle: string; bio: string; media: ModelMedia[] }>(
    `SELECT name, handle, bio, media FROM model_profiles WHERE slug = $1 AND is_published = TRUE`,
    [slug]
  )
  if (!model) notFound()
  return <ModelGallery name={model.name} handle={model.handle} bio={model.bio} media={model.media ?? []} />
}
