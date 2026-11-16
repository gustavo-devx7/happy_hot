import { execute } from "@/lib/db"

let tableReady: Promise<void> | null = null

export function ensureModelProfilesTable() {
  if (!tableReady) {
    tableReady = execute(`
      CREATE TABLE IF NOT EXISTS model_profiles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        slug VARCHAR(80) NOT NULL UNIQUE,
        handle VARCHAR(120) NOT NULL DEFAULT '',
        cover_image TEXT NOT NULL,
        photo_count INTEGER NOT NULL DEFAULT 0,
        video_count INTEGER NOT NULL DEFAULT 0,
        bio TEXT NOT NULL DEFAULT '',
        media JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `).then(() => undefined).catch((error) => {
      tableReady = null
      throw error
    })
  }
  return tableReady
}
