import { redirect } from "next/navigation"
import { loginAdmin } from "@/app/admin/actions"
import { getAdminSession } from "@/lib/admin-session"
import styles from "./admin-login.module.css"

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
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.intro}>
          <div>
            <img src="/images/happy-hot-logo.svg" alt="Happy Hot Admin" className={styles.logo} />
            <h1>Visão completa de clientes, receita e recorrência.</h1>
            <p>Entradas consolidadas por e-mail, com primeiro e último pagamento, faturamento total e status de acesso.</p>
          </div>
          <div className={styles.features}>
            <p>Receita separada entre novo cliente e recorrência.</p>
            <p>Clientes, pagamentos e modelos em um único painel.</p>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formContent}>
            <span className={styles.eyebrow}>Acesso restrito</span>
            <h2>Painel administrativo</h2>
            <p className={styles.description}>Entre com a senha do painel para abrir os dados completos da operação.</p>

            <form action={loginAdmin} className={styles.form}>
              <label htmlFor="admin-password">Senha</label>
              <input
                id="admin-password"
                required
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Digite a senha do admin"
              />
              {error && <p className={styles.error} role="alert">Senha inválida. Tente novamente.</p>}
              <button type="submit" className={styles.submit}>Entrar no painel</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
