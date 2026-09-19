"use client"

import { FormEvent, useState } from "react"
import { redirectWithParams } from "../lib/redirect"

export function LoginForm() {

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Digite o mesmo e-mail usado no pagamento.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403 && data.code === "ACCESS_EXPIRED") {
          redirectWithParams(`/conteudo?renew=1&email=${encodeURIComponent(normalizedEmail)}`)
          return
        }

        throw new Error(data.error || "Não foi possível entrar.")
      }

      redirectWithParams("/plataforma")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
      <div />
      <div className="mt-6 flex w-full flex-col items-center gap-6">
        <label
          htmlFor="email"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
        >
          E-mail usado no pagamento
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="exemplo@gmail.com"
          className="h-12 w-[85%] rounded-xl border border-neutral-300 bg-white pl-40 text-sm text-neutral-900 outline-none 
                    transition focus:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white "
          disabled={isLoading}
        />
      </div>

      {error && <p className="-mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="mb-6 h-12 w-[85%] rounded-xl bg-purple-500 px-4 text-sm font-semibold text-white transition hover:bg-purple-600 disabled:opacity-60"
      >
        {isLoading ? "Entrando..." : "Acessar plataforma"}
      </button>
      <div />
    </form>
  )
}
