import { NextRequest, NextResponse } from "next/server"
import { queryOne } from "@/lib/db"
import { setCustomerSession } from "@/lib/auth-session"
import { ensureCustomerAccessGrantsTable } from "@/lib/customer-access-grants"
import { getCustomerAccessExpiresAt, getCustomerAccessWindowDays, isCustomerAccessExpired } from "@/lib/customer-access"

const TEST_EMAIL = "teste@gmail.com"

function getLoginErrorResponse(error: unknown) {
  if (!(error instanceof Error)) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }

  if (error.message.includes("NEON_URL")) {
    return NextResponse.json(
      { error: "Configuracao ausente no servidor.", code: "NEON_URL_MISSING" },
      { status: 500 }
    )
  }

  if (error.message.includes("NEON_URL_MISSING")) {
    return NextResponse.json(
      { error: "Configuracao ausente no servidor.", code: "NEON_URL_MISSING" },
      { status: 500 }
    )
  }

  if (error.message.includes("SESSION_SECRET")) {
    return NextResponse.json(
      { error: "Configuracao ausente no servidor.", code: "SESSION_SECRET_MISSING" },
      { status: 500 }
    )
  }

  if (error.message.toLowerCase().includes("fetch failed")) {
    return NextResponse.json(
      {
        error: "Nao foi possivel conectar ao banco de dados. Verifique a NEON_URL e se esta acessivel.",
        code: "DB_FETCH_FAILED",
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Digite um e-mail valido." }, { status: 400 })
    }

    if (email === TEST_EMAIL) {
      // Acesso de teste: nao exige pagamento. Validade de 1 ano a partir do login.
      const testExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      await setCustomerSession(email, testExpiresAt)
      return NextResponse.json({ ok: true })
    }

    await ensureCustomerAccessGrantsTable()
    const grant = await queryOne<{ email: string; expires_at: string }>(
      `SELECT email, expires_at FROM customer_access_grants WHERE email = $1 AND expires_at > CURRENT_TIMESTAMP`,
      [email],
    )
    if (grant) {
      await setCustomerSession(grant.email, new Date(grant.expires_at))
      return NextResponse.json({ ok: true })
    }

    const customer = await queryOne<{ email: string; status: string; created_at: string }>(
      `SELECT email, status, created_at FROM customers 
       WHERE email = $1 AND status = $2 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [email, "paid"]
    )

    if (!customer) {
      return NextResponse.json(
        { error: "Nao encontramos um pagamento aprovado para este e-mail." },
        { status: 403 }
      )
    }

    if (isCustomerAccessExpired(customer.created_at)) {
      return NextResponse.json(
        {
          error: `Seu acesso expirou apos ${getCustomerAccessWindowDays()} dias. Faca um novo pagamento para continuar.`,
          code: "ACCESS_EXPIRED",
        },
        { status: 403 }
      )
    }

    await setCustomerSession(customer.email, getCustomerAccessExpiresAt(customer.created_at))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erro no login:", error)
    return getLoginErrorResponse(error)
  }
}
