"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { logoutAdmin } from "@/app/admin/actions"
import { AdminDashboard } from "@/app/admin/(protected)/admin-dashboard"
import type { AdminDashboardData } from "@/lib/admin-metrics"

// ─── ThemeToggle ──────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Alternar tema"
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] tracking-wide text-white/75 transition hover:bg-white/14"
    >
      <span
        className="relative inline-block h-[18px] w-8 flex-shrink-0 rounded-full transition-colors duration-300"
        style={{ background: isDark ? "#2b1e30" : "rgba(255,255,255,0.2)" }}
      >
        <span
          className="absolute top-[2px] h-3.5 w-3.5 rounded-full transition-all duration-300"
          style={{
            left: isDark ? "calc(100% - 18px)" : "2px",
            background: isDark ? "#951ec9" : "#fff",
          }}
        />
      </span>
      {isDark ? "Modo claro" : "Modo escuro"}
    </button>
  )
}

// ─── AdminPageClient ──────────────────────────────────────────────────────────

export function AdminPageClient({
  dashboardData,
  loadError,
}: {
  dashboardData: AdminDashboardData
  loadError: string | null
}) {
  return (
    <main
      className="mainPageCliente"
      style={{ background: "var(--background)" }}
    >
      {/* ── wrapper centralizado ── */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">

          {/* ── header card ── */}
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #180f1b 0%, #161018 100%)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            }}
          >
            {/* glow decorativo */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(149, 30, 201, 0.12) 0%, transparent 70%)",
              }}
            />

            {/* ── topbar: badge + controles ── */}
            <div className="relative flex items-center justify-between border-b border-white/[0.07] px-6 py-3 sm:px-8">
              <img src="/images/happy-hot-logo.svg" alt="Happy Hot Admin" className="h-8 w-36 object-contain object-left" />

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <form action={logoutAdmin}>
                  <button
                    type="submit"
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-white/10 bg-white/6 px-4 text-xs font-medium text-white/80 transition hover:bg-white/12 hover:text-white"
                  >
                    Sair
                  </button>
                </form>
              </div>
            </div>

            {/* ── headline ── */}
            <div className="relative px-6 py-7 sm:px-8">
              <h1 className="text-2xl font-light tracking-tight text-white sm:text-[1.75rem] sm:leading-snug">
                Receita, clientes e recorrência em um único painel.
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-white/45">
                Dados agregados por e-mail · leitura rápida da base · status de acesso · histórico de pagamentos.
              </p>
            </div>
          </div>

          {/* ── error banner ── */}
          {loadError && (
            <div
              className="rounded-2xl border border-amber-300/40 px-6 py-5"
              style={{ background: "var(--muted)" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500">
                Falha ao carregar dados
              </p>
              <h2 className="mt-1 text-lg font-normal" style={{ color: "var(--foreground)" }}>
                O painel abriu, mas a base não respondeu.
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {loadError}
              </p>
            </div>
          )}

          {/* ── dashboard ── */}
          <AdminDashboard data={dashboardData} />

        </div>
      </div>
    </main>
  )
}
