import { redirect } from "next/navigation"
import { loginAdmin } from "@/app/admin/actions"
import { getAdminSession } from "@/lib/admin-session"

export const dynamic = "force-dynamic"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const session = await getAdminSession()
  if (session) redirect("/admin")

  const { error: rawError } = await searchParams
  const error = Array.isArray(rawError) ? rawError[0] : rawError

  return (
    <main
      className="min-h-screen px-6 py-10"
      style={{
        background:
          "radial-gradient(circle at top, rgba(69, 25, 96, 0.20) 0%, transparent 36%), linear-gradient(180deg, #0e0811 0%, #180f1c 48%, var(--background) 48.1%, var(--background) 100%)",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <section
          className="grid w-full overflow-hidden rounded-[28px] lg:grid-cols-[1.1fr_0.9fr]"
          style={{
            background: "var(--card)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 28px 80px rgba(0,0,0,0.14)",
          }}
        >
          {/* ── left panel ── */}
          <div
            className="hidden flex-col justify-between p-10 text-white lg:flex"
            style={{ background: "#160d1a" }}
          >
            <div className="space-y-6">
              <img src="/images/happy-hot-logo.svg" alt="Happy Hot Admin" className="h-12 w-48 object-contain object-left" />
              <div className="space-y-2.5">
                <h1 className="max-w-sm text-3xl font-normal leading-tight tracking-tight">
                  Visão completa de clientes, receita e recorrência.
                </h1>
                <p className="max-w-md text-sm leading-6 text-purple-50/60">
                  Entradas consolidadas por e-mail, com primeiro e último pagamento, faturamento total e status de acesso.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-purple-50/65">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                Receita separada entre novo cliente e recorrência.
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                Aba dedicada para leitura rápida e tabela completa dos clientes.
              </div>
            </div>
          </div>

          {/* ── right panel ── */}
          <div
            className="flex items-center p-7 sm:p-10"
            style={{ background: "var(--secondary)" }}
          >
            <div className="mx-auto w-full max-w-md space-y-8">
              <div className="space-y-2.5">
                <span
                  className="inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]"
                  style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
                >
                  Acesso restrito
                </span>
                <h2
                  className="text-3xl font-normal tracking-tight"
                  style={{ color: "var(--foreground)" }}
                >
                  Painel administrativo
                </h2>
                <p className="text-sm leading-6" style={{ color: "var(--muted-foreground)" }}>
                  Entre com a senha do painel para abrir os dados completos da operação.
                </p>
              </div>

              <form action={loginAdmin} className="space-y-4">
                <label className="block space-y-2">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    Senha
                  </span>
                  <input
                    required
                    name="password"
                    type="password"
                    placeholder="Digite a senha do admin"
                    className="h-12 w-full rounded-2xl border px-4 text-base outline-none transition focus:ring-2"
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </label>

                {error && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Senha inválida. Tente novamente.
                  </p>
                )}

                <button
                  type="submit"
                  className="h-12 w-full rounded-2xl bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700 active:scale-[0.98]"
                >
                  Entrar no painel
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
