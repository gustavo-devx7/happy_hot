import { NextRequest, NextResponse } from "next/server"
import { execute } from "@/lib/db"

// Configuração da API BuckPay
const BUCKPAY_API_URL = process.env.BUCKPAY_API_URL
const BUCKPAY_API_KEY = process.env.BUCKPAY_API_KEY
const BUCKPAY_USER_AGENT = process.env.BUCKPAY_USER_AGENT

interface CreatePixRequest {
  name: string
  email: string
  amount: number
}

interface BuckPayCreateResponse {
  id?: string
  message?: string
  error?: string | { message?: string }
  pix?: {
    qrcode_base64?: string
    code?: string
  }
  data?: {
    id?: string
    pix?: {
      qrcode_base64?: string
      code?: string
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!BUCKPAY_API_URL || !BUCKPAY_API_KEY || !BUCKPAY_USER_AGENT) {
      return NextResponse.json(
        { error: "Credenciais da API não configuradas. Configure BUCKPAY_API_URL, BUCKPAY_API_KEY e BUCKPAY_USER_AGENT." },
        { status: 500 }
      )
    }

    const body: CreatePixRequest = await request.json()

    const name = typeof body.name === "string" ? body.name.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const amount = Number(body.amount)

    if (!name || !email || !Number.isFinite(amount)) {
      return NextResponse.json(
        { error: "Dados incompletos. Informe nome, email e valor." },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || name.length > 255 || email.length > 255) {
      return NextResponse.json({ error: "Nome ou e-mail inválido." }, { status: 400 })
    }

    if (amount < 6 || amount > 3000) {
      return NextResponse.json(
        { error: "O valor do pagamento deve estar entre R$ 6,00 e R$ 3.000,00." },
        { status: 400 }
      )
    }

    const externalId = `pix_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`
    const response = await fetch(`${BUCKPAY_API_URL}/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${BUCKPAY_API_KEY}`,
        "User-Agent": BUCKPAY_USER_AGENT,
      },
      body: JSON.stringify({
        external_id: externalId,
        payment_method: "pix",
        amount: Math.round(amount * 100),
        buyer: {
          name,
          email,
        },
        postbackUrl: process.env.NEXT_PUBLIC_APP_URL 
          ? `${process.env.NEXT_PUBLIC_APP_URL}/api/pix/webhook`
          : undefined,
      }),
    })

    const contentType = response.headers.get("content-type") || ""
    const text = await response.text()

    let data: BuckPayCreateResponse | null = null
    if (contentType.includes("application/json")) {
      data = JSON.parse(text)
    } else {
      console.error("Resposta BuckPay não-JSON:", {
        status: response.status,
        contentType,
        body: text.slice(0, 1000),
      })
    }

    if (!response.ok) {
      const errorMessage =
        (data?.message || (typeof data?.error === "object" && data.error ? data.error.message : null) || (typeof data?.error === "string" ? data.error : null)) ||
        `Erro ao criar transação PIX (status ${response.status})`

      return NextResponse.json(
        { error: errorMessage, debug: contentType.includes("application/json") ? data : text },
        { status: response.status === 200 ? 502 : response.status }
      )
    }

    // Mapeia a resposta da BuckPay para o formato esperado pelo frontend
    const payload = data ?? {}
    const pixData = payload.data?.pix || payload.pix
    const transactionId = payload.data?.id || payload.id
    if (!transactionId || !pixData?.code) {
      return NextResponse.json({ error: "Resposta inválida do gateway PIX." }, { status: 502 })
    }

    // Persist pending transactions so the status endpoint can poll immediately,
    // even before the gateway delivers its webhook.
    await execute(
      `INSERT INTO customers (email, name, transaction_id, status, amount_cents)
       VALUES ($1, $2, $3, 'pending', $4)
       ON CONFLICT (transaction_id) DO NOTHING`,
      [email, name, transactionId, Math.round(amount * 100)]
    )

    return NextResponse.json({
      transactionId,
      qrCodeBase64: pixData?.qrcode_base64 || "",
      copyPaste: pixData?.code || "",
      amount,
    })

  } catch (error) {
    console.error("Erro interno:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
