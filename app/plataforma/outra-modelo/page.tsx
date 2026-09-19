"use client";

import { useState } from "react";

// =============================================
// TIPOS
// =============================================
type MediaType = "foto" | "video";

interface MediaItem {
  id: number;
  type: MediaType;
  thumbnail: string;
  title: string;
  creator: string;
  likes: number;
  duration?: string;
}

// =============================================
// DADOS DE EXEMPLO — substitua pela sua API
// =============================================
const mockMedia: MediaItem[] = [
  { id: 1, type: "foto", thumbnail: "https://picsum.photos/seed/a1/400/500", title: "Ensaio Exclusivo", creator: "Valentina", likes: 284 },
  { id: 2, type: "video", thumbnail: "https://picsum.photos/seed/b2/400/500", title: "Behind the Scenes", creator: "Isabela", likes: 519, duration: "4:32" },
  { id: 3, type: "foto", thumbnail: "https://picsum.photos/seed/c3/400/500", title: "Sessão Noturna", creator: "Luna", likes: 731 },
  { id: 4, type: "video", thumbnail: "https://picsum.photos/seed/d4/400/500", title: "Vídeo Premium", creator: "Sophia", likes: 1023, duration: "12:10" },
  { id: 5, type: "foto", thumbnail: "https://picsum.photos/seed/e5/400/500", title: "Arte & Beleza", creator: "Camila", likes: 447 },
  { id: 6, type: "video", thumbnail: "https://picsum.photos/seed/f6/400/500", title: "Especial VIP", creator: "Mariana", likes: 892, duration: "8:55" },
  { id: 7, type: "foto", thumbnail: "https://picsum.photos/seed/g7/400/500", title: "Novo Álbum", creator: "Valentina", likes: 315 },
  { id: 8, type: "foto", thumbnail: "https://picsum.photos/seed/h8/400/500", title: "Coleção Verão", creator: "Luna", likes: 608 },
  { id: 9, type: "video", thumbnail: "https://picsum.photos/seed/i9/400/500", title: "Exclusivo Assinantes", creator: "Isabela", likes: 1247, duration: "20:00" },
];

// =============================================
// ÍCONES SVG INLINE
// =============================================
const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const IconHeart = ({ filled }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconPlay = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

const IconList = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// =============================================
// COMPONENTE CARD
// =============================================
function MediaCard({ item, dark }: { item: MediaItem; dark: boolean }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        background: dark ? "#111827" : "#ffffff",
        border: `1px solid ${dark ? "#1f2937" : "#e5e7eb"}`,
        boxShadow: dark
          ? "0 4px 24px rgba(0,0,0,0.4)"
          : "0 4px 24px rgba(0,0,0,0.07)",
        transition: "transform 0.22s cubic-bezier(.4,0,.2,1), box-shadow 0.22s",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = dark
          ? "0 12px 36px rgba(119, 1, 154, 0.25)"
          : "0 12px 36px rgba(77, 4, 97, 0.15)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = dark
          ? "0 4px 24px rgba(0,0,0,0.4)"
          : "0 4px 24px rgba(0,0,0,0.07)";
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden", background: "#0d1117" }}>
        <img
          src={item.thumbnail}
          alt={item.title}
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
          onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)")}
          onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
        />

        {/* Badge tipo */}
        <div style={{
          position: "absolute", top: "10px", left: "10px",
          background: item.type === "video" ? "rgba(119, 1, 154, 0.92)" : "rgba(77, 4, 97, 0.88)",
          color: "#fff",
          fontSize: "10px",
          fontWeight: 800,
          letterSpacing: "0.1em",
          padding: "4px 10px",
          borderRadius: "20px",
          backdropFilter: "blur(4px)",
        }}>
          {item.type === "video" ? "▶ VÍDEO" : "📷 FOTO"}
        </div>

        {/* Duração */}
        {item.type === "video" && item.duration && (
          <div style={{
            position: "absolute", bottom: "10px", right: "10px",
            background: "rgba(0,0,0,0.72)",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: "8px",
            backdropFilter: "blur(4px)",
          }}>
            {item.duration}
          </div>
        )}

        {/* Ícone play para vídeos */}
        {item.type === "video" && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.2s",
          }}
            className="play-overlay"
            onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.opacity = "1")}
            onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.opacity = "0")}
          >
            <div style={{
              background: "rgba(119, 1, 154, 0.88)",
              borderRadius: "50%",
              width: "60px", height: "60px",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
              color: "#fff",
            }}>
              <IconPlay />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px" }}>
        <p style={{
          margin: "0 0 4px",
          fontWeight: 700,
          fontSize: "14px",
          color: dark ? "#f9fafb" : "#111827",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {item.title}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontSize: "12px",
            color: "#77019a",
            fontWeight: 600,
          }}>
            @{item.creator}
          </span>
          <button
            onClick={handleLike}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              background: "none", border: "none", cursor: "pointer",
              color: liked ? "#77019a" : (dark ? "#6b7280" : "#9ca3af"),
              fontSize: "12px", fontWeight: 600,
              transition: "color 0.15s, transform 0.15s",
              padding: 0,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1.15)")}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1)")}
          >
            <IconHeart filled={liked} />
            {likeCount.toLocaleString("pt-BR")}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function Plataforma() {
  const [dark, setDark] = useState(true);
  const [filter, setFilter] = useState<"todos" | "foto" | "video">("todos");
  const [search, setSearch] = useState("");
  const [grid, setGrid] = useState<"grade" | "lista">("grade");

  const filtered = mockMedia.filter(m => {
    const matchType = filter === "todos" || m.type === filter;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.creator.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // ---- estilos base ----
  const bg = dark ? "#0a0f1a" : "#f3f4f6";
  const surface = dark ? "#111827" : "#ffffff";
  const textPrimary = dark ? "#f9fafb" : "#111827";
  const textMuted = dark ? "#6b7280" : "#9ca3af";
  const borderColor = dark ? "#1f2937" : "#e5e7eb";

  return (
    <div style={{
      minHeight: "100vh",
      background: bg,
      fontFamily: "'Sora', 'Nunito', sans-serif",
      color: textPrimary,
      transition: "background 0.3s, color 0.3s",
    }}>
      {/* Importar fonte */}
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #77019a; border-radius: 99px; }
      .play-overlay:hover { opacity: 1 !important; }
    `}</style>

      {/* ── NAVBAR ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: dark ? "#120f13" : "#f3f4f6",
        borderBottom: `1px solid ${borderColor}`,
        padding: "0 32px",
        height: "68px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "16px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          minWidth: "160px", height: "42px",
        }}>
          <img src="/images/happy-hot-logo.svg" alt="Happy Hot" style={{ width: "160px", height: "42px" }} />
        </div>

        {/* Busca */}
        <div style={{
          flex: 1, maxWidth: "420px",
          position: "relative", display: "flex", alignItems: "center",
        }}>
          <span style={{ position: "absolute", left: "14px", color: textMuted }}>
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Buscar por título ou criadora..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: dark ? "#1f2937" : "#ffffff",
              border: `1px solid ${borderColor}`,
              borderRadius: "24px",
              padding: "10px 16px 10px 42px",
              fontSize: "14px",
              color: textPrimary,
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "#77019a")}
            onBlur={e => (e.currentTarget.style.borderColor = borderColor)}
          />
        </div>

        {/* Controles direita */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Toggle visualização */}
          <div style={{
            display: "flex", background: dark ? "#1f2937" : "#e5e7eb",
            borderRadius: "10px", padding: "3px",
          }}>
            {(["grade", "lista"] as const).map(v => (
              <button key={v} onClick={() => setGrid(v)} style={{
                background: grid === v ? "#77019a" : "transparent",
                border: "none", cursor: "pointer",
                color: grid === v ? "#fff" : textMuted,
                borderRadius: "8px",
                padding: "6px 10px",
                transition: "all 0.15s",
                display: "flex", alignItems: "center",
              }}>
                {v === "grade" ? <IconGrid /> : <IconList />}
              </button>
            ))}
          </div>

          {/* Toggle dark/light */}
          <button
            onClick={() => setDark(!dark)}
            style={{
              background: dark ? "#1f2937" : "#e5e7eb",
              border: "none", borderRadius: "10px",
              padding: "9px 12px",
              cursor: "pointer",
              color: dark ? "#f9fafb" : "#374151",
              display: "flex", alignItems: "center",
              transition: "background 0.2s, transform 0.15s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)")}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1)")}
            title={dark ? "Modo claro" : "Modo escuro"}
          >
            {dark ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <div style={{
        background: "linear-gradient(135deg, #4d0461 0%, #77019a 50%, #3e014f 100%)",
        padding: "40px 32px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Detalhe decorativo */}
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "240px", height: "240px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "50%",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-40px", left: "-40px",
          width: "180px", height: "180px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "50%",
          pointerEvents: "none",
        }} />
        <h1 style={{
          fontSize: "clamp(22px, 4vw, 38px)",
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "-0.03em",
          marginBottom: "10px",
        }}>
          Conteúdo Exclusivo
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "15px", maxWidth: "500px", margin: "0 auto" }}>
          Fotos e vídeos das suas criadoras favoritas, disponíveis para você.
        </p>
      </div>

      {/* ── FILTROS ── */}
      <div style={{
        padding: "24px 32px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {(["todos", "foto", "video"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f
                  ? "linear-gradient(135deg, #77019a, #4d0461)"
                  : (dark ? "#1f2937" : "#e5e7eb"),
                color: filter === f ? "#fff" : textMuted,
                border: "none", borderRadius: "20px",
                padding: "8px 20px",
                fontSize: "13px", fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.04em",
                transition: "all 0.18s",
                boxShadow: filter === f ? "0 4px 14px rgba(119, 1, 154, 0.4)" : "none",
              }}
            >
              {f === "todos" ? "Todos" : f === "foto" ? "📷 Fotos" : "▶ Vídeos"}
            </button>
          ))}
        </div>
        <span style={{ fontSize: "13px", color: textMuted, fontWeight: 600 }}>
          {filtered.length} {filtered.length === 1 ? "item" : "itens"}
        </span>
      </div>

      {/* ── GRID ── */}
      <main style={{
        padding: "24px 32px 48px",
        display: "grid",
        gridTemplateColumns: grid === "grade"
          ? "repeat(auto-fill, minmax(220px, 1fr))"
          : "1fr",
        gap: grid === "grade" ? "20px" : "12px",
      }}>
        {filtered.length > 0 ? (
          filtered.map(item => (
            <MediaCard key={item.id} item={item} dark={dark} />
          ))
        ) : (
          <div style={{
            gridColumn: "1 / -1",
            textAlign: "center",
            padding: "80px 20px",
            color: textMuted,
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <p style={{ fontSize: "16px", fontWeight: 600 }}>Nenhum conteúdo encontrado</p>
            <p style={{ fontSize: "13px", marginTop: "6px" }}>Tente outro termo de busca ou filtro</p>
          </div>
        )}
      </main>

      {/* ── RODAPÉ ── */}
      <footer style={{
        borderTop: `1px solid ${borderColor}`,
        padding: "24px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <img src="/images/happy-hot-logo.svg" alt="Happy Hot" style={{ width: "115px", height: "28px" }} />
        <span style={{ fontSize: "12px", color: textMuted }}>
          © {new Date().getFullYear()} · Todos os direitos reservados
        </span>
      </footer>
    </div>
  );
}
