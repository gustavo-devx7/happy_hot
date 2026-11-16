"use client"

import { FormEvent, useState } from "react"
import { redirectWithParams } from "../lib/redirect"
import styles from "@/app/entrar/login-form.module.css"

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
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="email">E-mail usado no pagamento</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="exemplo@gmail.com"
          autoComplete="email"
          className={styles.input}
          disabled={isLoading}
        />
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className={styles.button}
      >
        {isLoading ? "Entrando..." : "Acessar plataforma"}
      </button>
    </form>
  )
}
