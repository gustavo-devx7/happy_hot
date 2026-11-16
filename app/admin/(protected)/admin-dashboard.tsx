"use client"

import { useState, useMemo, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { addAdminClient } from "@/app/admin/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AdminDashboardData } from "@/lib/admin-metrics"

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100)
}

function formatDate(value: string | null) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

function paymentStatusLabel(status: string) {
  switch (status) {
    case "paid":    return "Pago"
    case "pending": return "Pendente"
    default:        return status
  }
}

function accessStatusLabel(status: "ativo" | "expirado" | "pendente") {
  switch (status) {
    case "ativo":    return "Ativo"
    case "expirado": return "Expirado"
    default:         return "Pendente"
  }
}

function StatusPill({ status }: { status: "ativo" | "expirado" | "pendente" }) {
  const styles: Record<string, string> = {
    ativo:    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900",
    expirado: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900",
    pendente: "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${styles[status] ?? styles.pendente}`}
    >
      {accessStatusLabel(status)}
    </span>
  )
}

// ─── MetricCard ───────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string
  value: string
  sub: string
  accent?: boolean
}) {
  if (accent) {
    return (
      <article
        className="min-h-[148px] rounded-[20px] p-6 sm:p-7"
        style={{
          background: "linear-gradient(135deg, #180f1b, #161018)",
          boxShadow: "0 16px 48px rgba(24, 15, 27, 0.25)",
          padding: "24px",
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-purple-300">
          {label}
        </p>
        <h3 className="mt-3 text-[28px] font-normal leading-none tracking-tight text-white">
          {value}
        </h3>
        <p className="mt-2 text-sm text-purple-100/60">{sub}</p>
      </article>
    )
  }

  return (
    <article
      className="min-h-[148px] rounded-[20px] border p-6 sm:p-7"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        color: "var(--card-foreground)",
        padding: "24px",
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--muted-foreground)" }}
      >
        {label}
      </p>
      <h3
        className="mt-3 text-[28px] font-normal leading-none tracking-tight"
        style={{ color: "var(--foreground)" }}
      >
        {value}
      </h3>
      <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
        {sub}
      </p>
    </article>
  )
}

// ─── BarRow ───────────────────────────────────────────────────────────────────

function BarRow({
  label,
  count,
  pct,
  variant,
}: {
  label: string
  count: number
  pct: number
  variant: "green" | "dark"
}) {
  return (
    <div className="space-y-1.5">
      <div
        className="flex items-center justify-between text-sm"
        style={{ color: "var(--muted-foreground)" }}
      >
        <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{label}</span>
        <span>{count}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full"
        style={{ background: "var(--muted)" }}
      >
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: variant === "green" ? "#951ec9" : "var(--foreground)",
          }}
        />
      </div>
    </div>
  )
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  const router = useRouter()
  const { clients, summary } = data
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"" | "ativo" | "expirado" | "pendente">("")
  const [grantMessage, setGrantMessage] = useState("")
  const [grantPending, setGrantPending] = useState(false)

  async function handleAddClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    setGrantPending(true)
    setGrantMessage("")
    const form = new FormData(formElement)
    try {
      const result = await addAdminClient({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        days: Number(form.get("days") ?? 30),
      })
      setGrantMessage(result.error ?? result.success ?? "Não foi possível salvar.")
      if (result.success) {
        formElement.reset()
        router.refresh()
      }
    } catch {
      setGrantMessage("Não foi possível salvar o acesso. Verifique a conexão com o banco.")
    } finally {
      setGrantPending(false)
    }
  }

  const filteredClients = useMemo(() => {
    const q = search.toLowerCase()
    return clients.filter((c) => {
      const matchSearch =
        !q ||
        (c.name ?? "").toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      const matchStatus = !statusFilter || c.accessStatus === statusFilter
      return matchSearch && matchStatus
    })
  }, [clients, search, statusFilter])

  const newPct =
    summary.totalCustomersCount === 0
      ? 0
      : (summary.newCustomersCount / summary.totalCustomersCount) * 100

  const recurringPct =
    summary.totalCustomersCount === 0
      ? 0
      : (summary.recurringCustomersCount / summary.totalCustomersCount) * 100

  const avgTicket =
    summary.totalCustomersCount === 0
      ? 0
      : Math.round(summary.totalRevenueCents / summary.totalCustomersCount)

  const avgPayments =
    summary.totalCustomersCount === 0
      ? "0,0"
      : (summary.totalPaidPaymentsCount / summary.totalCustomersCount)
          .toFixed(1)
          .replace(".", ",")

  return (
    <Tabs defaultValue="visao-geral" className="gap-6">
      {/* ── nav ── */}
      <TabsList
        className="h-auto w-fit gap-3 rounded-none bg-transparent p-0"
      >
        <TabsTrigger
          value="visao-geral"
          className="flex-none rounded-xl border px-6 py-2.5 text-sm font-medium transition-colors data-[state=active]:border-[#180f1b] data-[state=active]:bg-[#180f1b] data-[state=active]:text-white"
          style={{ color: "var(--muted-foreground)" }}
        >
          Visão geral
        </TabsTrigger>
        <TabsTrigger
          value="clientes"
          className="flex-none rounded-xl border px-6 py-2.5 text-sm font-medium transition-colors data-[state=active]:border-[#180f1b] data-[state=active]:bg-[#180f1b] data-[state=active]:text-white"
          style={{ color: "var(--muted-foreground)" }}
        >
          Clientes
        </TabsTrigger>
      </TabsList>

      {/* ── visão geral ── */}
      <TabsContent value="visao-geral" className="space-y-6">
        {/* metric cards */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Faturamento novo"
            value={formatCurrency(summary.newCustomerRevenueCents)}
            sub={`${summary.newCustomersCount} clientes novos`}
          />
          <MetricCard
            label="Faturamento recorrente"
            value={formatCurrency(summary.recurringCustomerRevenueCents)}
            sub={`${summary.recurringCustomersCount} clientes recorrentes`}
          />
          <MetricCard
            label="Faturamento total"
            value={formatCurrency(summary.totalRevenueCents)}
            sub={`${summary.totalPaidPaymentsCount} pagamentos aprovados`}
            accent
          />
          <MetricCard
            label="Clientes"
            value={String(summary.totalCustomersCount)}
            sub={`${summary.newCustomersCount} novos · ${summary.recurringCustomersCount} recorrentes`}
          />
        </div>

        {/* distribution + quick read */}
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
          <article
            className="min-h-[220px] space-y-6 rounded-[24px] border p-6 sm:p-7"
            style={{ background: "var(--card)", borderColor: "var(--border)", padding: "24px" }}
          >
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: "var(--muted-foreground)" }}
              >
                Base de clientes
              </p>
              <h3
                className="mt-1 text-xl font-normal"
                style={{ color: "var(--foreground)" }}
              >
                Distribuição da operação
              </h3>
            </div>
            <div className="space-y-6">
              <BarRow label="Novos" count={summary.newCustomersCount} pct={newPct} variant="green" />
              <BarRow label="Recorrentes" count={summary.recurringCustomersCount} pct={recurringPct} variant="dark" />
            </div>
          </article>

          <article
            className="space-y-4 rounded-[24px] border p-6 sm:p-7"
            style={{ background: "var(--secondary)", borderColor: "var(--border)", padding: "24px" }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--muted-foreground)" }}
            >
              Leitura rápida
            </p>
            {/* quick stat cards */}
            {[
              { label: "Ticket por cliente", value: formatCurrency(avgTicket) },
              { label: "Média de pagamentos", value: avgPayments },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl border p-4"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {label}
                </p>
                <p
                  className="mt-1 text-2xl font-normal tracking-tight"
                  style={{ color: "var(--foreground)" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </article>
        </div>
      </TabsContent>

      {/* ── clientes ── */}
      <TabsContent value="clientes">
        <section
          className="overflow-hidden rounded-[24px] border"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* header */}
          <div
            className="border-b px-5 py-5 sm:px-6"
            style={{ borderColor: "var(--border)" }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--muted-foreground)" }}
            >
              Clientes
            </p>
            <h3
              className="mt-1 text-xl font-normal"
              style={{ color: "var(--foreground)" }}
            >
              Tabela consolidada por e-mail
            </h3>
          </div>

          <form
            onSubmit={handleAddClient}
            className="grid gap-3 border-b px-5 py-5 sm:grid-cols-[1fr_1.3fr_150px_auto] sm:items-end sm:px-6"
            style={{ borderColor: "var(--border)" }}
          >
            <label className="grid gap-1.5 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              Nome
              <input name="name" placeholder="Nome do cliente" className="h-10 rounded-xl border px-3 text-sm font-normal outline-none" style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }} />
            </label>
            <label className="grid gap-1.5 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              E-mail de acesso
              <input name="email" type="email" required placeholder="cliente@email.com" className="h-10 rounded-xl border px-3 text-sm font-normal outline-none" style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }} />
            </label>
            <label className="grid gap-1.5 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              Validade
              <select name="days" defaultValue="30" className="h-10 rounded-xl border px-3 text-sm font-normal outline-none" style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                <option value="7">7 dias</option><option value="30">30 dias</option><option value="90">90 dias</option><option value="365">1 ano</option>
              </select>
            </label>
            <button type="submit" disabled={grantPending} className="h-10 rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-60">
              {grantPending ? "Salvando…" : "Liberar acesso"}
            </button>
            {grantMessage && <p role="status" className="text-sm sm:col-span-4" style={{ color: "var(--muted-foreground)" }}>{grantMessage}</p>}
          </form>

          {/* search + filter */}
          <div
            className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:px-6"
            style={{ borderColor: "var(--border)" }}
          >
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-xl border px-3 text-sm outline-none transition focus:ring-2"
              style={{
                background: "var(--muted)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
                // @ts-ignore
                "--tw-ring-color": "var(--ring)",
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="h-10 rounded-xl border px-3 text-sm outline-none sm:min-w-44"
              style={{
                background: "var(--muted)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="expirado">Expirado</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>

          {/* table */}
          <div className="overflow-x-auto">
            <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow style={{ background: "var(--muted)" }}>
                <TableHead className="px-6" style={{ color: "var(--muted-foreground)" }}>Cliente</TableHead>
                <TableHead style={{ color: "var(--muted-foreground)" }}>Email</TableHead>
                <TableHead style={{ color: "var(--muted-foreground)" }}>Status</TableHead>
                <TableHead style={{ color: "var(--muted-foreground)" }}>Tipo</TableHead>
                <TableHead className="text-right" style={{ color: "var(--muted-foreground)" }}>Total pago</TableHead>
                <TableHead className="text-right" style={{ color: "var(--muted-foreground)" }}>Pagamentos</TableHead>
                <TableHead style={{ color: "var(--muted-foreground)" }}>Primeiro</TableHead>
                <TableHead style={{ color: "var(--muted-foreground)" }}>Último</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow
                    key={client.email}
                    className="transition-colors"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <TableCell className="px-6 py-4">
                      <span
                        className="block text-sm font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        {client.name || "Sem nome"}
                      </span>
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        Pagamento: {paymentStatusLabel(client.latestStatus)}
                      </span>
                    </TableCell>
                    <TableCell
                      className="text-sm"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {client.email}
                    </TableCell>
                    <TableCell>
                      <StatusPill status={client.accessStatus} />
                    </TableCell>
                    <TableCell
                      className="text-sm capitalize"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {client.segment}
                    </TableCell>
                    <TableCell
                      className="text-right text-sm font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      {formatCurrency(client.totalPaidCents)}
                    </TableCell>
                    <TableCell
                      className="text-right text-sm"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {client.paymentCount}
                    </TableCell>
                    <TableCell
                      className="text-sm"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {formatDate(client.firstPaymentAt)}
                    </TableCell>
                    <TableCell
                      className="text-sm"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {formatDate(client.lastPaymentAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            </Table>
          </div>
        </section>
      </TabsContent>
    </Tabs>
  )
}
