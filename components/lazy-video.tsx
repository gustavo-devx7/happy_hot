"use client"

import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react"

interface LazyVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
    src: string
    /** Distância antes do vídeo entrar na tela em que o carregamento já começa (default: 200px) */
    rootMargin?: string
    /** Estilo/props do wrapper que fica no lugar do vídeo antes dele ser carregado */
    wrapperStyle?: React.CSSProperties
    wrapperClassName?: string
}

/**
 * Só monta a tag <video> (e portanto só baixa o arquivo) quando o elemento
 * está prestes a entrar na viewport. Antes disso, renderiza um placeholder
 * leve no lugar, evitando carregar mídia que o usuário talvez nunca veja.
 */
export default function LazyVideo({
    src,
    rootMargin = "200px",
    wrapperStyle,
    wrapperClassName,
    style,
    ...videoProps
}: LazyVideoProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [shouldLoad, setShouldLoad] = useState(false)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        // Fallback para navegadores sem suporte a IntersectionObserver
        if (typeof IntersectionObserver === "undefined") {
            setShouldLoad(true)
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShouldLoad(true)
                        observer.disconnect()
                    }
                })
            },
            { rootMargin, threshold: 0.01 }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [rootMargin])

    useEffect(() => {
        if (!shouldLoad) return

        const video = videoRef.current
        if (!video) return

        if (video.muted === false) {
            video.muted = true
        }

        video.playsInline = true
        video.autoplay = true

        video.play().catch(() => {
            // Alguns navegadores bloqueiam autoplay até o usuário interagir.
            // Em seguida, o vídeo continua carregando e fica pronto para reprodução.
        })
    }, [shouldLoad, src])

    return (
        <div
            ref={containerRef}
            style={{ width: "100%", height: "100%", ...wrapperStyle }}
            className={wrapperClassName}
        >
            {shouldLoad ? (
                <video
                    ref={videoRef}
                    src={src}
                    preload="auto"
                    playsInline
                    muted
                    autoPlay
                    loop
                    style={style}
                    {...videoProps}
                />
            ) : (
                <div style={{ width: "100%", height: "100%", background: "#0d1117", ...style }} />
            )}
        </div>
    )
}
