import { NextRequest, NextResponse } from "next/server"
import { execute } from "@/lib/db"

// Webhook para receber notificaÃ§Ãµes da BuckPay
// Configure esta URL no painel da BuckPay ou via postbackUrl ao criar a transaÃ§Ã£o

interface BuckPayWebhookPayload {
  event: "transaction.created" | "transaction.processed"
  data: {
    id: string
    status: "pending" | "paid"
    payment_method: string
    total_amount: number
    pix_code?: string
    net_amount: number
    offer?: {
      name: string
      discount_price: number
      quantity: number
    }
    buyer?: {
      name: string
      email: string
      phone?: string
      document?: string
    }
    tracking?: {
      ref: string | null
      src: string | null
      sck: string | null
      utm: {
        source: string | null
        medium: string | null
        campaign: string | null
        id: string | null
        term: string | null
        content: string | null
      }
    }
    created_at: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: BuckPayWebhookPayload = await request.json()

    const { event, data } = body
    const transactionId = data.id
    const status = data.status

    // Evento: transaction.processed = PIX pago
    if (event === "transaction.processed" && status === "paid") {
      console.log(`PIX pago - TransaÃ§Ã£o: ${transactionId}`)
      console.log(`Comprador: ${data.buyer?.name} (${data.buyer?.email})`)
      console.log(`Valor: R$ ${(data.total_amount / 100).toFixed(2)}`)

      if (data.buyer?.email) {
        try {
          await execute(
            `INSERT INTO customers (email, name, transaction_id, status, amount_cents)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (transaction_id) DO UPDATE SET
             email = EXCLUDED.email, name = EXCLUDED.name, status = EXCLUDED.status,
             amount_cents = EXCLUDED.amount_cents, created_at = CURRENT_TIMESTAMP`,
            [data.buyer.email.trim().toLowerCase(), data.buyer.name ?? null, transactionId, status, data.total_amount]
          )
        } catch (error) {
          console.error("Erro ao salvar cliente no banco de dados:", error)
          return NextResponse.json({ error: "Falha ao salvar pagamento." }, { status: 500 })
        }
      } else {
        try {
          const updated = await execute(
            `UPDATE customers SET status = $1, amount_cents = $2, created_at = CURRENT_TIMESTAMP
             WHERE transaction_id = $3`,
            [status, data.total_amount, transactionId]
          )
          if (!updated) {
            console.error(`Pagamento sem e-mail e sem registro pendente: ${transactionId}`)
            return NextResponse.json({ error: "Cliente do pagamento não encontrado." }, { status: 500 })
          }
        } catch (error) {
          console.error("Erro ao atualizar pagamento no banco de dados:", error)
          return NextResponse.json({ error: "Falha ao salvar pagamento." }, { status: 500 })
        }
      }
    }

    // Evento: transaction.created = TransaÃ§Ã£o pendente
    if (event === "transaction.created" && status === "pending") {
      console.log(`TransaÃ§Ã£o criada (pendente): ${transactionId}`)
    }

    // Confirm receipt only after the paid transaction has been persisted.
    return NextResponse.json({
      received: true,
      event,
      transactionId,
      status,
    })
  } catch (error) {
    console.error("Erro no webhook:", error)
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 })
  }
}
