import { execute } from "@/lib/db"

let tableReady: Promise<void> | null = null

export function ensureCustomerAccessGrantsTable() {
  if (!tableReady) {
    tableReady = execute(`
      CREATE TABLE IF NOT EXISTS customer_access_grants (
        email VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        expires_at TIMESTAMP NOT NULL,
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
