import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { getCustomerSession } from "@/lib/auth-session"
import styles from "./login-page.module.css"

export const dynamic = "force-dynamic"

export default async function EntrarPage() {
  const session = await getCustomerSession()
  if (session) redirect("/plataforma")

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.intro}>
          <img className={styles.logo} src="/images/happy-hot-logo.svg" alt="Happy Hot" />
          <div className={styles.introCopy}>
            <span className={styles.eyebrow}>Acesso liberado por e-mail</span>
            <h1>Seu acesso começa com o e-mail da compra.</h1>
            <p>Após a confirmação do Pix, entre usando o mesmo e-mail informado no pagamento. O acesso fica disponível durante o período contratado.</p>
          </div>
          <p className={styles.accessNote}>Área exclusiva para clientes com pagamento aprovado.</p>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formContent}>
            <h2>Entrar na plataforma</h2>
            <p>Use exatamente o mesmo e-mail informado na hora do Pix.</p>
            <div className={styles.formCard}>
              <LoginForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
