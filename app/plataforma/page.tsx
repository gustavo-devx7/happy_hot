"use client";

import { useState } from "react";
import { redirectWithParams } from "../../lib/redirect";

// =============================================
// TIPOS
// =============================================
interface Modelo {
    id: number;
    nome: string;
    slug: string;
    pasta: string;
    totalFotos: number;
    totalVideos: number;
    foto: string | null; // null = placeholder até você adicionar
}

// =============================================
// DADOS — adicione suas modelos aqui
// =============================================
const modelos: Modelo[] = [
    {
        id: 1,
        nome: "Mel Santos",
        slug: "@dix.mel_01",
        pasta: "/mel-santos",
        totalFotos: 9,
        totalVideos: 9,
        foto: 'images/mel-santos/f1.webp', 
    },

];

// =============================================
// ÍCONES
// =============================================
const IconSearch = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const IconUser = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const IconPhoto = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

const IconVideo = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
);

const IconArrow = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);

// =============================================
// CARD MODELO
// =============================================
function CardModelo({ modelo }: { modelo: Modelo }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                borderRadius: "16px",
                overflow: "hidden",
                background: "#161b26",
                border: `1px solid ${hovered ? "#77019a" : "#1f2937"}`,
                boxShadow: hovered
                    ? "0 8px 24px rgba(119, 1, 154, 0.25)"
                    : "0 2px 10px rgba(0,0,0,0.35)",
                transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
                transform: hovered ? "translateY(-4px)" : "translateY(0)",
                cursor: "pointer",
                width: "180px",
            }}
        >
            {/* Foto da modelo */}
            <div
                style={{
                    position: "relative",
                    height: "220px",
                    background: "#0d1117",
                    overflow: "hidden",
                }}
            >
                {modelo.foto ? (
                    <img
                        src={modelo.foto}
                        alt={modelo.nome}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            transform: hovered ? "scale(1.04)" : "scale(1)",
                            transition: "transform 0.4s ease",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            background:
                                "linear-gradient(160deg, #0d1117 0%, #161b26 100%)",
                            border: "2px dashed #1f2937",
                        }}
                    >
                        <div
                            style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "50%",
                                background: "#1f2937",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#374151",
                            }}
                        >
                            <IconUser />
                        </div>

                        <span
                            style={{
                                color: "#374151",
                                fontSize: "11px",
                                fontWeight: 600,
                                letterSpacing: "0.05em",
                            }}
                        >
                            FOTO EM BREVE
                        </span>
                    </div>
                )}

                {/* Gradiente */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "60px",
                        background:
                            "linear-gradient(to top, rgba(10,15,26,0.95), transparent)",
                        pointerEvents: "none",
                    }}
                />
            </div>

            {/* Conteúdo cards das modelos*/}
            <div style={{
                padding: "10px",
                justifyContent: "center"
            }}>
                <h3
                    style={{
                        margin: "0 0 3px",
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#f9fafb",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.2,
                    }}
                >
                    {modelo.nome}
                </h3>

                <p
                    style={{
                        margin: "0 0 8px",
                        fontSize: "11px",
                        color: "#77019a",
                        fontWeight: 600,
                    }}
                >
                    {modelo.slug}
                </p>

                {/* Stats */}
                <div
                    style={{
                        display: "flex",
                        gap: "6px",
                        marginBottom: "8px",
                        flexWrap: "wrap",
                    }}
                >
                    <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                            fontSize: "10px",
                            color: "#6b7280",
                            fontWeight: 600,
                        }}
                    >
                        <IconPhoto /> {modelo.totalFotos}+ fotos
                    </span>

                    <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                            fontSize: "10px",
                            color: "#6b7280",
                            fontWeight: 600,
                        }}
                    >
                        <IconVideo /> {modelo.totalVideos}+ vídeos
                    </span>
                </div>

                {/* Botão */}
                <button
                    style={{
                        width: "100%",
                        background: hovered
                            ? "linear-gradient(135deg, #77019a, #4d0461)"
                            : "#1f2937",
                        color: hovered ? "#fff" : "#9ca3af",
                        border: "none",
                        borderRadius: "8px",
                        padding: "7px",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        transition: "all 0.2s",
                        letterSpacing: "0.03em",
                    }}
                    onClick={() => redirectWithParams("/plataforma" + modelo.pasta)}
                >
                    VER CONTEÚDO <IconArrow />
                </button>
            </div>
        </div>
    )
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function Vitrine() {
    const [busca, setBusca] = useState("");

    const filtradas = modelos.filter(m =>
        m.nome.toLowerCase().includes(busca.toLowerCase()) ||
        m.slug.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0a0f1a",
            fontFamily: "'Sora', sans-serif",
            color: "#f9fafb",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: #4b5563; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #77019a; border-radius: 99px; }
        input:focus { outline: none; }
      `}</style>

            {/* ── BARRA DE BUSCA (topo) ── */}
            <div style={{
                position: "sticky", top: 0, zIndex: 100,
                background: "rgba(10,15,26,0.95)",
                backdropFilter: "blur(16px)",
                borderBottom: "1px solid #1f2937",
                padding: "14px 32px",
                display: "flex", alignItems: "center", gap: "16px",
            }}>
                <div style={{
                    width: "132px", height: "42px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                }}>
                    <img src="/images/happy-hot-logo.svg" alt="Happy Hot" style={{ width: "100%", height: "100%" }} />
                </div>

                {/* Input busca */}
                <div style={{
                    flex: 1,
                    position: "relative",
                    display: "flex", alignItems: "center",
                }}>
                    <span style={{ position: "absolute", left: "16px", color: "#4b5563" }}>
                        <IconSearch />
                    </span>
                    <input
                        type="text"
                        placeholder="Pesquisar modelo..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        style={{
                            width: "100%",
                            background: "#111827",
                            border: "1px solid #1f2937",
                            borderRadius: "12px",
                            padding: "12px 16px 12px 48px",
                            fontSize: "15px",
                            color: "#f9fafb",
                            transition: "border-color 0.2s",
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = "#77019a")}
                        onBlur={e => (e.currentTarget.style.borderColor = "#1f2937")}
                    />
                </div>

                {/* Ícone usuário */}
                <button style={{
                    background: "#111827",
                    border: "1px solid #1f2937",
                    borderRadius: "12px",
                    width: "46px", height: "46px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#9ca3af",
                    transition: "border-color 0.2s, color 0.2s",
                    flexShrink: 0,
                }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#77019a";
                        (e.currentTarget as HTMLButtonElement).style.color = "#77019a";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#1f2937";
                        (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
                    }}
                >
                    <IconUser />
                </button>
            </div>

            {/* ── BANNER ── */}
            <div style={{
                margin: "24px 32px",
                borderRadius: "20px",
                overflow: "hidden",
                position: "relative",
                height: "70px",
                background: "linear-gradient(135deg, #4d0461 0%, #77019a 40%, #3e014f 100%)",
                display: "flex", alignItems: "center",
                cursor: "pointer"
            }}>
                {/* Detalhes decorativos */}
                <div style={{
                    position: "absolute", right: "-40px", top: "-40px",
                    width: "260px", height: "260px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.07)",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", left: "30%", bottom: "-60px",
                    width: "180px", height: "180px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)",
                    pointerEvents: "none",
                }} />



                <div style={{ padding: "0 48px", position: "relative", zIndex: 1 }}>
                    <p style={{
                        fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em",
                        color: "rgba(255,255,255,0.6)", marginBottom: "8px", marginTop: "20px", textTransform: "uppercase",
                    }}>
                        Conteúdo exclusivo
                    </p>
                    {/* ↓↓↓ TEXTO DO BANNER — edite como quiser ↓↓↓ */}
                    <h2 style={{
                        fontSize: "clamp(12px, 4vw, 42px)",
                        fontWeight: 900,
                        color: "#ffffff",
                        letterSpacing: "-0.03em",
                        lineHeight: 1.1,
                        marginBottom: "16px",
                        textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                    }}>
                        Conheça nossas<br />modelos exclusivas
                    </h2>
                </div>
            </div>

            {/* ── VITRINE ── */}
            <div style={{ padding: "0 32px 48px" }}>
                {/* Cabeçalho seção */}
                <div style={{
                    display: "flex", alignItems: "baseline", justifyContent: "space-between",
                    marginBottom: "24px",
                }}>
                    <div>
                        <h2 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>
                            Nossas Modelos
                        </h2>
                        <p style={{ fontSize: "13px", color: "#4b5563", fontWeight: 600 }}>
                            {filtradas.length} {filtradas.length === 1 ? "modelo disponível" : "modelos disponíveis"}
                        </p>
                    </div>
                    {busca && (
                        <button onClick={() => setBusca("")} style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#77019a", fontSize: "13px", fontWeight: 700,
                        }}>
                            Limpar busca ×
                        </button>
                    )}
                </div>

                {/* Grid */}
                {filtradas.length > 0 ? (
                    <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "20px",
                        justifyContent: "center",
                    }}>
                        {filtradas.map(m => <CardModelo key={m.id} modelo={m} />)}
                    </div>
                ) : (
                    <div style={{
                        textAlign: "center", padding: "80px 20px", color: "#4b5563",
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                        <p style={{ fontWeight: 700, fontSize: "16px" }}>Nenhuma modelo encontrada</p>
                        <p style={{ fontSize: "13px", marginTop: "6px" }}>Tente outro nome</p>
                    </div>
                )}
            </div>
        </div>
    );
}