import { AdminPageClient } from "@/app/admin/(protected)/admin-page-client"
import { buildAdminDashboardData } from "@/lib/admin-metrics"
import { query } from "@/lib/db"
import { ensureCustomerAccessGrantsTable } from "@/lib/customer-access-grants"

export const dynamic = "force-dynamic"

function getAdminLoadErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Não foi possível carregar os clientes no momento."
  }
  if (error.message.includes("NEON_URL")) {
    return "A variável NEON_URL não está configurada no servidor."
  }
  if (
    error.message.toLowerCase().includes("fetch failed") ||
    error.message.toLowerCase().includes("connect")
  ) {
    return "A conexão com o banco de dados falhou. Verifique a URL e se o ambiente tem acesso à internet."
  }
  return `Não foi possível carregar os clientes: ${error.message}`
}

export default async function AdminPage() {
  let loadError: string | null = null
  let dashboardData = buildAdminDashboardData([])

  try {
    const customers = await query<{
      email: string
      name: string | null
      status: string
      amount_cents: number
      transaction_id: string
      created_at: string
    }>(
      `SELECT email, name, status, amount_cents, transaction_id, created_at
       FROM customers
       ORDER BY created_at ASC`,
    )
    dashboardData = buildAdminDashboardData(customers ?? [])
    await ensureCustomerAccessGrantsTable()
    const grants = await query<{ email: string; name: string | null; expires_at: string }>(
      `SELECT email, name, expires_at FROM customer_access_grants ORDER BY created_at DESC`,
    )
    for (const grant of grants) {
      const existing = dashboardData.clients.find((client) => client.email === grant.email.toLowerCase())
      const isActive = new Date(grant.expires_at).getTime() > Date.now()
      if (existing) {
        if (isActive) existing.accessStatus = "ativo"
        existing.manualAccess = true
      } else {
        dashboardData.clients.push({
          accessStatus: isActive ? "ativo" : "expirado",
          email: grant.email.toLowerCase(), firstPaymentAt: null, lastPaymentAt: null,
          latestStatus: "acesso manual", name: grant.name, paymentCount: 0,
          segment: "novo", totalPaidCents: 0, transactions: [], manualAccess: true,
        })
      }
    }
    dashboardData.clients.sort((a, b) => a.email.localeCompare(b.email))
  } catch (error) {
    loadError = getAdminLoadErrorMessage(error)
  }

  return <AdminPageClient dashboardData={dashboardData} loadError={loadError} />
}
