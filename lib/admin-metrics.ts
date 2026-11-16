import { isCustomerAccessExpired } from "@/lib/customer-access"

export interface CustomerPaymentRow {
  amount_cents: number | null
  created_at: string | null
  email: string | null
  name: string | null
  status: string | null
  transaction_id: string | null
}

export interface AdminClientRow {
  accessStatus: "ativo" | "expirado" | "pendente"
  email: string
  firstPaymentAt: string | null
  lastPaymentAt: string | null
  latestStatus: string
  name: string | null
  paymentCount: number
  segment: "novo" | "recorrente"
  totalPaidCents: number
  transactions: string[]
  manualAccess?: boolean
}

export interface AdminDashboardData {
  clients: AdminClientRow[]
  summary: {
    newCustomerRevenueCents: number
    newCustomersCount: number
    recurringCustomerRevenueCents: number
    recurringCustomersCount: number
    totalCustomersCount: number
    totalPaidPaymentsCount: number
    totalRevenueCents: number
  }
}

function getNormalizedStatus(status: string | null | undefined) {
  return typeof status === "string" && status.trim() ? status.trim().toLowerCase() : "unknown"
}

export function buildAdminDashboardData(rows: CustomerPaymentRow[]): AdminDashboardData {
  const grouped = new Map<string, CustomerPaymentRow[]>()

  for (const row of rows) {
    const email = row.email?.trim().toLowerCase()

    if (!email) {
      continue
    }

    const existing = grouped.get(email)
    if (existing) {
      existing.push(row)
    } else {
      grouped.set(email, [row])
    }
  }

  let newCustomerRevenueCents = 0
  let recurringCustomerRevenueCents = 0
  let totalRevenueCents = 0
  let newCustomersCount = 0
  let recurringCustomersCount = 0
  let totalPaidPaymentsCount = 0

  const clients: AdminClientRow[] = []

  for (const [email, customerRows] of grouped.entries()) {
    const sortedRows = [...customerRows].sort((a, b) => {
      const aTime = new Date(a.created_at ?? 0).getTime()
      const bTime = new Date(b.created_at ?? 0).getTime()
      return aTime - bTime
    })

    const paidRows = sortedRows.filter((row) => getNormalizedStatus(row.status) === "paid")

    if (paidRows.length === 0) {
      continue
    }

    const paidAmounts = paidRows.map((row) => row.amount_cents ?? 0)
    const totalPaidCents = paidAmounts.reduce((sum, value) => sum + value, 0)
    const firstPaidRow = paidRows[0]
    const lastPaidRow = paidRows[paidRows.length - 1]
    const latestRow = sortedRows[sortedRows.length - 1]

    totalPaidPaymentsCount += paidRows.length
    totalRevenueCents += totalPaidCents
    newCustomerRevenueCents += paidAmounts[0] ?? 0

    if (paidRows.length === 1) {
      newCustomersCount += 1
    } else {
      recurringCustomersCount += 1
      recurringCustomerRevenueCents += paidAmounts.slice(1).reduce((sum, value) => sum + value, 0)
    }

    clients.push({
      accessStatus:
        getNormalizedStatus(latestRow.status) !== "paid"
          ? "pendente"
          : isCustomerAccessExpired(lastPaidRow.created_at ?? new Date().toISOString())
            ? "expirado"
            : "ativo",
      email,
      firstPaymentAt: firstPaidRow.created_at,
      lastPaymentAt: lastPaidRow.created_at,
      latestStatus: getNormalizedStatus(latestRow.status),
      name: latestRow.name?.trim() || firstPaidRow.name?.trim() || null,
      paymentCount: paidRows.length,
      segment: paidRows.length > 1 ? "recorrente" : "novo",
      totalPaidCents,
      transactions: paidRows.map((row) => row.transaction_id).filter((value): value is string => Boolean(value)),
    })
  }

  clients.sort((a, b) => {
    if (b.totalPaidCents !== a.totalPaidCents) {
      return b.totalPaidCents - a.totalPaidCents
    }

    return a.email.localeCompare(b.email)
  })

  return {
    clients,
    summary: {
      newCustomerRevenueCents,
      newCustomersCount,
      recurringCustomerRevenueCents,
      recurringCustomersCount,
      totalCustomersCount: clients.length,
      totalPaidPaymentsCount,
      totalRevenueCents,
    },
  }
}
