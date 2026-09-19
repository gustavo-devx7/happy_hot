import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { getCustomerSession } from "@/lib/auth-session"

export default async function EntrarPage() {
  const session = await getCustomerSession()

  if (session) {
    redirect("/plataforma")
  }

  return (
      <div className="mx-auto flex h-[100%] items-center justify-center">
        <section className="grid w-full overflow-hidden border border-black/5 bg-white shadow-2xl dark:border-white/10 dark:bg-neutral-900 md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative md:block">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <p className="text-sm uppercase tracking-[0.18em] text-white/70">Acesso liberado por e-mail</p>
              <h1 className="mt-3 text-4xl font-semibold">Entre com o e-mail usado no seu pagamento.</h1>
              <p className="mt-4 max-w-md text-sm text-white/80">
                Se o pagamento semanal já foi confirmado e ainda está dentro dos 7 dias, a plataforma reconhece o seu e-mail e libera a área privada.
              </p>
            </div>
          </div>

          <div className="min-h-screen flex justify-center bg-white dark:bg-black">
            <div className="flex h-[70vh] w-[90%] max-w-md flex-col justify-center gap-8 px-6 py-1 text-center">
              <div>
                <h2 className="text-3xl font-semibold leading-loose text-neutral-950 dark:text-white">
                  Login
                </h2>

                <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
                  Use exatamente o mesmo e-mail informado na hora do Pix semanal.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-white/10
                               dark:bg-white/[0.03]">
                <LoginForm />
              </div>
            </div>
          </div>
        </section>
      </div>
  )
}
