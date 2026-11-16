"use server"

import { redirect } from "next/navigation"
import { clearAdminSession, isValidAdminPassword, setAdminSession } from "@/lib/admin-session"
import { execute } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { ensureCustomerAccessGrantsTable } from "@/lib/customer-access-grants"

export async function addAdminClient(input: { name: string; email: string; days: number }) {
  const { getAdminSession } = await import("@/lib/admin-session")
  if (!(await getAdminSession())) return { error: "Sessão administrativa expirada." }

  const name = input.name.trim().slice(0, 255)
  const email = input.email.trim().toLowerCase()
  const days = Number(input.days)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Digite um e-mail válido." }
  if (![7, 30, 90, 365].includes(days)) return { error: "Escolha uma duração válida." }

  await ensureCustomerAccessGrantsTable()
  await execute(
    `INSERT INTO customer_access_grants (email, name, expires_at, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP + ($3 * INTERVAL '1 day'), CURRENT_TIMESTAMP)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, expires_at = EXCLUDED.expires_at, updated_at = CURRENT_TIMESTAMP`,
    [email, name || null, days],
  )
  revalidatePath("/admin")
  return { success: `Acesso liberado para ${email} por ${days} dias.` }
}

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "")

  if (!isValidAdminPassword(password)) {
    redirect("/admin/login?error=1")
  }

  await setAdminSession()
  redirect("/admin")
}

export async function logoutAdmin() {
  await clearAdminSession()
  redirect("/admin/login")
}
