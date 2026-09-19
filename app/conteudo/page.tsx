"use client"

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react"
import LazyVideo from "@/components/lazy-video"
import "./conteudo.css"

type Post = {
    video: string
    style: {
        scale: string
        objectPosition: string
    }
}

const posts: Post[] = [
    { video: "/media/a1.mp4", style: { scale: "1", objectPosition: "50% 80%" } },
    { video: "/media/a2.mp4", style: { scale: "1", objectPosition: "50% 50%" } }
];




export default function PrivacyPage() {
    const [bioExpanded, setBioExpanded] = useState(false)
    const [popupActive, setPopupActive] = useState(false)
    const [promotionsOpen, setPromotionsOpen] = useState(true)
    const promoDate = useMemo(() => {
        const today = new Date()
        const dd = String(today.getDate()).padStart(2, "0")
        const mm = String(today.getMonth() + 1).padStart(2, "0")
        const yyyy = today.getFullYear()
        return `${dd}/${mm}/${yyyy}`
    }, [])

    // FAQ state
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    // PIX Modal states
    const [pixModalOpen, setPixModalOpen] = useState(false)
    const [pixStep, setPixStep] = useState<"form" | "loading" | "pix" | "success" | "error">("form")
    const [pixPlanLabel, setPixPlanLabel] = useState("")
    const [pixAmount, setPixAmount] = useState(0)
    const [pixFormName, setPixFormName] = useState("")
    const [pixFormEmail, setPixFormEmail] = useState("")
    const [pixFormNameError, setPixFormNameError] = useState("")
    const [pixFormEmailError, setPixFormEmailError] = useState("")
    const [pixCode, setPixCode] = useState("")
    const [pixQrUrl, setPixQrUrl] = useState("")
    const [pixTransactionId, setPixTransactionId] = useState("")
    const [pixTimer, setPixTimer] = useState("15:00")
    const [pixErrorMsg, setPixErrorMsg] = useState("")
    const pixCountdownRef = useRef<number | null>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (window.innerWidth <= 768) {
                setPopupActive(true)
            }
        }, 20000)

        return () => clearTimeout(timer)
    }, [])

    const abrirPixDireto = (planLabel: string, amount: number) => {
        setPixPlanLabel(planLabel)
        setPixAmount(amount)
        setPixFormName("")
        setPixFormEmail("")
        setPixFormNameError("")
        setPixFormEmailError("")
        setPixStep("form")
        setPixModalOpen(true)
    }

    const confirmarDadosEGerarPix = () => {
        let ok = true
        setPixFormNameError("")
        setPixFormEmailError("")

        if (!pixFormName || pixFormName.length < 3 || pixFormName.length > 100) {
            setPixFormNameError("Informe seu nome completo.")
            ok = false
        }

        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!pixFormEmail || !emailRe.test(pixFormEmail) || pixFormEmail.length > 255) {
            setPixFormEmailError("Informe um e-mail válido.")
            ok = false
        }

        if (!ok) return

        setPixStep("loading")
        setPixErrorMsg("")

        fetch("/api/pix/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: pixFormName.trim(),
                email: pixFormEmail.trim(),
                amount: pixAmount,
            }),
        })
            .then(async (response) => {
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || "Erro ao gerar PIX")
                }

                if (!data.copyPaste || (!data.qrCode && !data.qrCodeBase64)) {
                    throw new Error("Resposta inválida do gateway PIX")
                }

                setPixCode(data.copyPaste)
                setPixTransactionId(data.transactionId || "")
                setPixQrUrl(
                    data.qrCodeBase64
                        ? data.qrCodeBase64.startsWith("data:")
                            ? data.qrCodeBase64
                            : `data:image/png;base64,${data.qrCodeBase64}`
                        : data.qrCode
                )
                setPixStep("pix")

                let remaining = 15 * 60
                pixCountdownRef.current = window.setInterval(() => {
                    remaining--
                    const m = Math.floor(remaining / 60)
                    const s = remaining % 60
                    setPixTimer(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`)
                    if (remaining <= 0 && pixCountdownRef.current) {
                        window.clearInterval(pixCountdownRef.current)
                        pixCountdownRef.current = null
                    }
                }, 1000)
            })
            .catch((error) => {
                setPixErrorMsg(error instanceof Error ? error.message : "Erro ao gerar PIX")
                setPixStep("error")
            })
    }

    const copiarPix = () => {
        navigator.clipboard.writeText(pixCode)
    }

    useEffect(() => {
        if (!pixTransactionId || pixStep !== "pix") return

        const checkStatus = async () => {
            try {
                const response = await fetch(`/api/pix/status/${pixTransactionId}`)
                const data = await response.json()

                if (response.ok && data.isPaid) {
                    setPixStep("success")
                    window.clearInterval(interval)
                }
            } catch (error) {
                console.error("Erro ao verificar status do PIX:", error)
            }
        }

        const interval = window.setInterval(checkStatus, 5000)
        checkStatus()

        return () => {
            window.clearInterval(interval)
        }
    }, [pixTransactionId, pixStep])

    const fecharPixModal = () => {
        setPixModalOpen(false)
        setPixStep("form")
        setPixCode("")
        setPixQrUrl("")
        setPixTransactionId("")
        setPixTimer("15:00")
        setPixErrorMsg("")

        if (pixCountdownRef.current) {
            window.clearInterval(pixCountdownRef.current)
            pixCountdownRef.current = null
        }
    }

    const faqItems = [
        { q: "É sigiloso? Vai aparecer na fatura?", a: "Sim, é sigiloso. Cobrança discreta, sem nomes chamativos. Seus dados ficam criptografados." },
        { q: "Quando tenho acesso depois do pagamento?", a: "Imediato. Pagamento aprovado = liberação em até 10s e e-mail contendo o login de acesso." },
        { q: "Posso cancelar quando quiser? A assinatura renova?", a: "Sim. Você pode cancelar a renovação automática pela área do assinante a qualquer momento." },
        { q: "Tem reembolso?", a: "Sim. Reembolso de 7 dias sem burocracia. Se não curtir, devolvemos 100%." },
        { q: "Como funciona o \"contato no whatsapp\"?", a: "Basta clicar no ícone do whatsapp e começar a conversar." },
        { q: "Posso pedir conteúdo personalizado?", a: "Sim! Solicitações podem ser feitas no chat do produtor, com o conteúdo desejado." },
    ]

    return (
        <div className="privacy-container">
            {/* Header */}
            <header>
                <nav className="nav">
                    <div className="top-bar">
                        <div className="top-bar-content">
                            <div className="promo-badge">
                                ESSA PROMOÇÃO É VÁLIDA ATÉ {promoDate}
                            </div>
                        </div>
                    </div>

                    <div className="nav-container">
                        <div className="logo-wrapper">
                            <img src="/images/happy-hot-logo.svg" alt="Happy Hot" className="logo-svg" />
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <div className="container">
                    <div className="content-wrapper">
                        {/* Cover Section */}
                        <div className="cover-section">
                            <div className="cover-image">
                                <img src="/images/mel-santos/f30.webp" alt="imagem banner" className="banner" />
                                <div className="cover-stats">
                                    <span>📷 354</span>
                                    <span>🎥 148</span>
                                    <span>❤️ 20.2K</span>
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="profile-info">
                                <div className="avatar">
                                    <img src="/images/perfilModelo.jpg" alt="foto da modelo" />
                                </div>
                                <div className="profile-text">
                                    <div className="profile-name">
                                        Mel Santos
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18">
                                            <path fill="#4d0461" d="M190.6 71.4C203 47.9 227.7 32 256 32s53 15.9 65.4 39.4c3.6 6.8 11.5 10.1 18.8 7.8c25.4-7.8 54.1-1.6 74.1 18.4s26.2 48.7 18.4 74.1c-2.3 7.3 1 15.2 7.8 18.8C464.1 203 480 227.7 480 256s-15.9 53-39.4 65.4c-6.8 3.6-10.1 11.5-7.8 18.8c7.8 25.4 1.6 54.1-18.4 74.1s-48.7 26.2-74.1 18.4c-7.3-2.3-15.2 1-18.8 7.8C309 464.1 284.3 480 256 480s-53-15.9-65.4-39.4c-3.6-6.8-11.5-10.1-18.8-7.8c-25.4 7.8-54.1 1.6-74.1-18.4s-26.2-48.7-18.4-74.1c2.3-7.3-1-15.2-7.8-18.8C47.9 309 32 284.3 32 256s15.9-53 39.4-65.4c6.8-3.6 10.1-11.5 7.8-18.8c-7.8-25.4-1.6-54.1 18.4-74.1s48.7-26.2 74.1-18.4c7.3 2.3 15.2-1 18.8-7.8zM363.3 203.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L224 297.4l-52.7-52.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l64 64c6.2 6.2 16.4 6.2 22.6 0l128-128z" />
                                        </svg>
                                    </div>
                                    <div className="profile-handle">@melsantos</div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Bio */}
                        <div className="bio-section">
                            <div className="bio-container">
                                <p className={`bio-text ${bioExpanded ? 'expanded' : ''}`}>
                                    🔥 Mel Santos – Vazamento Exclusivo no Privacy 🔥{"\n"}
                                    Conteúdo premium liberado por um valor MUITO abaixo do habitual.{"\n"}
                                    Corpo escultural entregue sem filtros:{"\n"}
                                    💦 Boquetes profundos e molhados que vão até o limite{"\n"}
                                    🍑 Sentadas intensas, reboladas que hipnotizam{"\n"}
                                    🔞 Gemidos reais, orgasmos sem cortes, close-ups explícitos{"\n"}
                                    Material que era restrito aos assinantes mais fiéis… agora acessível por tempo limitado e por um preço que não vai se repetir.{"\n"}
                                    Não perca a chance de ver a Vivi se entregando de verdade.{"\n"}
                                    👉 Entre agora e garanta o seu antes que volte ao valor original.{"\n"}
                                    😈 Quantidade limitada • Acesso imediato • 100% sem censura
                                </p>
                                <button onClick={() => setBioExpanded(!bioExpanded)} className="bio-toggle">
                                    {bioExpanded ? 'Mostrar menos' : 'Mostrar mais'}
                                </button>
                            </div>

                            {/* Pricing Panel */}
                            <div className="pricing-panel">
                                <h3 className="pricing-title">Assinaturas</h3>
                                <div className="pricing-badges">
                                    <span className="badge-fire">VEJA TUDO AGORA 🔥</span>
                                    <span className="badge-promo">Promocional</span>
                                </div>

                                <button onClick={() => abrirPixDireto('+ Vendido', 19.90)} className="btn-primary">
                                    <span className="btn-label">+ Vendido</span>
                                    <span className="btn-price">R$ 19,90 →</span>
                                </button>

                                <div className="offer-badge">NÃO PERCA ESSA OFERTA!</div>

                                <div className="payment-info">
                                    <span>🔒 Pagamento 100% seguro</span>
                                    <span>•</span>
                                    <span>⚡ Acesso imediato</span>
                                </div>

                                {/* Promotions */}
                                <div className="promotions-section">
                                    <div onClick={() => setPromotionsOpen(!promotionsOpen)} className="promotions-header">
                                        <h4>Promoções</h4>
                                        <span className={`arrow ${promotionsOpen ? 'open' : ''}`}>⌄</span>
                                    </div>

                                    {promotionsOpen && (
                                        <>
                                            <button onClick={() => abrirPixDireto('Popular', 29.90)} className="btn-secondary popular">
                                                <span className="btn-secondary-left">
                                                    👑 <span>Popular</span>
                                                    <span className="badge-popular">Mais popular 🔥</span>
                                                </span>
                                                <span className="btn-secondary-price">R$ 29,90</span>
                                            </button>

                                            <button onClick={() => abrirPixDireto('Max', 34.90)} className="btn-secondary">
                                                <span className="btn-secondary-left">
                                                    <span>Max</span>
                                                    <span className="badge-offer">Melhor oferta</span>
                                                </span>
                                                <span className="btn-secondary-price">R$ 34,90</span>
                                            </button>

                                            <button onClick={() => abrirPixDireto('Exclusivo', 69.90)} className="btn-secondary">
                                                <span className="btn-secondary-left">
                                                    <span>Exclusivo</span>
                                                    <span className="badge-exclusive">Exclusivo</span>
                                                </span>
                                                <span className="btn-secondary-price">R$ 69,90</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Content Toggle */}
                            <div className="content-toggle">
                                <button className="toggle-btn"><span className="toggle-count">502</span> Posts</button>
                                <span className="toggle-dot">•</span>
                                <button className="toggle-btn active"><span className="toggle-count">148</span> Videos</button>
                                <span className="toggle-dot">•</span>
                                <button className="toggle-btn"><span className="toggle-count">354</span> Fotos</button>
                            </div>

                            {/* Feed Gallery */}
                            <section className="feed-gallery"
                                onClick={() => abrirPixDireto('+ Vendido', 19.90)} >
                                <div className="feed-grid">
                                    {posts.map((post, i) => (
                                        <article key={i} className="feed-card">
                                            <header className="feed-card-header">
                                                <div className="feed-avatar">
                                                    <img src="/images/perfilModelo.jpg" alt="foto da modelo" className="fotoModelo" loading="lazy" decoding="async" />
                                                </div>
                                                <div className="feed-user-info">
                                                    <div className="feed-username">Mel Santos</div>
                                                    <div className="feed-handle">@melsantos</div>
                                                </div>
                                            </header>
                                            <div className="feed-media">
                                                <LazyVideo
                                                    src={post.video}
                                                    className="feed-video"
                                                    wrapperStyle={{ position: "absolute", inset: 0 }}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        transform: `scale(${(post.style as any)?.scale ?? 1})`,
                                                        objectPosition: (post.style as any)?.objectPosition ?? "50% 50%",
                                                        objectFit: "cover",
                                                        filter: "blur(6px)",
                                                    }}
                                                    playsInline
                                                    muted
                                                    loop
                                                    autoPlay
                                                />

                                                <div className="feed-lock">🔒</div>
                                                <div className="feed-stats">
                                                    <span>❤️ {67.4 + i * 10}K</span>
                                                    <span>💬 {1.9 + i * 0.5}K</span>
                                                </div>
                                            </div>
                                            <footer className="feed-card-footer">
                                                <span>🤍</span>
                                                <span>💬</span>
                                                <span>🔖</span>
                                            </footer>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="faq-section">
                    <div className="faq-container">
                        <div className="faq-content">
                            <h2 className="faq-title">Perguntas Frequentes</h2>
                            <div className="faq-list">
                                {faqItems.map((item, index) => (
                                    <div key={index} className="faq-item">
                                        <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="faq-question">
                                            <span className="faq-icon">
                                                <span className="faq-icon-h" />
                                                <span className={`faq-icon-v ${openFaq === index ? 'hidden' : ''}`} />
                                            </span>
                                            {item.q}
                                        </button>
                                        <div className={`faq-answer ${openFaq === index ? 'open' : ''}`}>
                                            {item.a}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="footer-cta">
                    <button onClick={() => abrirPixDireto('+ Vendido', 19.90)} className="btn-primary">
                        <span className="btn-label">Veja tudo por apenas</span>
                        <span className="btn-price">R$ 19,90 →</span>
                    </button>
                </div>

                {/* Footer Links */}
                <p className="footer-links">
                    <a href="#">Termos de Uso</a>
                    <span>•</span>
                    <a href="#">Política de Privacidade</a>
                </p>
            </main>

            {/* Popup Overlay (Mobile) */}
            {popupActive && (
                <div onClick={(e) => e.target === e.currentTarget && setPopupActive(false)} className="popup-overlay">
                    <div className="popup-content">
                        <button onClick={() => setPopupActive(false)} className="popup-close">✕</button>
                        <div className="popup-cover">
                            <div className="cover-image">
                                <img src="/images/mel-santos/f30.webp" alt="imagem banner" className="banner" loading="lazy" decoding="async" />
                            </div>
                            <div className="popup-profile">
                                <div className="popup-avatar">
                                    <img src="/images/perfilModelo.jpg" alt="foto modelo" loading="lazy" decoding="async" />
                                </div>
                                <div className="popup-user">
                                    <div className="popup-name">
                                        Mel Santos
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18">
                                            <path fill="#4d0461" d="M190.6 71.4C203 47.9 227.7 32 256 32s53 15.9 65.4 39.4c3.6 6.8 11.5 10.1 18.8 7.8c25.4-7.8 54.1-1.6 74.1 18.4s26.2 48.7 18.4 74.1c-2.3 7.3 1 15.2 7.8 18.8C464.1 203 480 227.7 480 256s-15.9 53-39.4 65.4c-6.8 3.6-10.1 11.5-7.8 18.8c7.8 25.4 1.6 54.1-18.4 74.1s-48.7 26.2-74.1 18.4c-7.3-2.3-15.2 1-18.8 7.8C309 464.1 284.3 480 256 480s-53-15.9-65.4-39.4c-3.6-6.8-11.5-10.1-18.8-7.8c-25.4 7.8-54.1 1.6-74.1-18.4s-26.2-48.7-18.4-74.1c2.3-7.3-1-15.2-7.8-18.8C47.9 309 32 284.3 32 256s15.9-53 39.4-65.4c6.8-3.6 10.1-11.5 7.8-18.8c-7.8-25.4-1.6-54.1 18.4-74.1s48.7-26.2 74.1-18.4c7.3 2.3 15.2-1 18.8-7.8zM363.3 203.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L224 297.4l-52.7-52.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l64 64c6.2 6.2 16.4 6.2 22.6 0l128-128z" />
                                        </svg>
                                    </div>
                                    <div className="popup-handle">@melsantos</div>
                                </div>
                            </div>
                            <div className="popup-stats">
                                <span>📷 354</span>
                                <span>🎥 148</span>
                                <span>❤️ 20.2K</span>
                            </div>
                        </div>

                        <div className="popup-body">
                            <div className="popup-inner">
                                <h2 className="popup-title">ASSINE AGORA E OBTENHA ESTES BENEFÍCIOS</h2>
                            </div>

                            <div className="popup-inner">
                                {[
                                    'Acesso a todos conteúdos exclusivos',
                                    'Chat ao vivo com a Mel Santos',
                                    'Video chamada com a Mel Santos',
                                    'E muito mais...',
                                ].map((item, index) => (
                                    <div key={index} className="popup-benefit">
                                        <span className="popup-check">✓</span>
                                        <span>{item}</span>
                                    </div>
                                ))}

                                <div className="popup-surprise">
                                    <h3>Presente surpresa para os +50 primeiros assinantes!</h3>
                                </div>

                                <button
                                    onClick={() => {
                                        setPopupActive(false)
                                        abrirPixDireto('+ Vendido', 19.90)
                                    }}
                                    className="popup-cta"
                                >
                                    <span>Assine agora</span>
                                    <span>por R$ 19,90</span>
                                </button>

                                <div className="popup-security">
                                    <div className="popup-security-item">
                                        <span>🔒</span>
                                        <span>Pagamento 100% Seguro</span>
                                    </div>
                                    <div className="popup-security-item">
                                        <span>🛡️</span>
                                        <span>Dados Protegidos</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* PIX Modal */}
            {
                pixModalOpen && (
                    <div onClick={(e) => e.target === e.currentTarget && fecharPixModal()} className="pix-overlay">
                        <div className="pix-modal">
                            <div className="cover-image">
                                <img src="/images/mel-santos/f30.webp" alt="imagem banner" className="banner" loading="lazy" decoding="async" />
                            </div>
                            <div className="pix-header">
                                <div>
                                    <div className="pix-header-label">Pagamento via Pix</div>
                                    <div className="pix-header-amount">{pixPlanLabel} – R$ {pixAmount.toFixed(2).replace('.', ',')}</div>
                                </div>
                                <button onClick={fecharPixModal} className="pix-close">✕</button>
                            </div>

                            {pixStep === "form" && (
                                <div className="pix-form">
                                    <p className="pix-form-desc">Confirme seus dados para gerar o PIX 🔒</p>
                                    <div className="pix-field">
                                        <label>Nome completo</label>
                                        <input
                                            type="text"
                                            placeholder="Seu nome completo"
                                            maxLength={100}
                                            value={pixFormName}
                                            onChange={(e) => setPixFormName(e.target.value)}
                                            className={pixFormNameError ? 'error' : ''}
                                        />
                                        {pixFormNameError && <span className="pix-error">{pixFormNameError}</span>}
                                    </div>
                                    <div className="pix-field">
                                        <label>E-mail</label>
                                        <input
                                            type="email"
                                            placeholder="seu@email.com"
                                            maxLength={255}
                                            value={pixFormEmail}
                                            onChange={(e) => setPixFormEmail(e.target.value)}
                                            className={pixFormEmailError ? 'error' : ''}
                                        />
                                        {pixFormEmailError && <span className="pix-error">{pixFormEmailError}</span>}
                                    </div>
                                    <button onClick={confirmarDadosEGerarPix} className="pix-submit">Gerar PIX →</button>
                                    <p className="pix-disclaimer">🔒 Dados usados apenas para emissão do pagamento</p>
                                </div>
                            )}

                            {pixStep === "loading" && (
                                <div className="pix-loading">
                                    <div className="pix-spinner" />
                                    <p className="pix-loading-title">Gerando seu PIX...</p>
                                    <p className="pix-loading-sub">Aguarde um instante</p>
                                </div>
                            )}

                            {pixStep === "pix" && (
                                <div className="pix-content">
                                    <p className="pix-scan-label">Escaneie o QR Code para pagar</p>
                                    <div className="pix-qr-wrapper">
                                        <img src={pixQrUrl} alt="QR Code PIX" className="pix-qr" />
                                    </div>
                                    <div className="pix-code-box">
                                        <span className="pix-code">{pixCode}</span>
                                        <button onClick={copiarPix} className="pix-copy">📋 Copiar</button>
                                    </div>
                                    <div className="pix-waiting">
                                        <div className="pix-blink" />
                                        <span>Aguardando pagamento...</span>
                                    </div>
                                    <p className="pix-expiry">QR Code expira em <strong>{pixTimer}</strong></p>
                                </div>
                            )}

                            {pixStep === "success" && (
                                <div className="pix-success">
                                    <div className="pix-success-icon">🎉</div>
                                    <h3>Pagamento confirmado!</h3>
                                    <p>Seu acesso foi liberado. Verifique seu e-mail para o login.</p>
                                    <button onClick={fecharPixModal} className="pix-success-btn">Fechar</button>
                                </div>
                            )}

                            {pixStep === "error" && (
                                <div className="pix-error-state">
                                    <div className="pix-error-icon">⚠️</div>
                                    <p>{pixErrorMsg || 'Erro ao gerar PIX. Tente novamente.'}</p>
                                    <button onClick={fecharPixModal} className="pix-error-btn">Fechar</button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    )
}
