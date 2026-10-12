"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronDown,
  MoreVertical,
  Pause,
  Paperclip,
  Phone,
  Play,
  Send,
  Smile,
  Video,
} from "lucide-react";
import "./whatsapp.css";
import Image from 'next/image'

type ChatMessage =
  | { id: number; time: string; kind: "text"; text: string; sent?: boolean }
  | { id: number; time: string; kind: "photo"; src: string }
  | { id: number; time: string; kind: "audio"; src: string; duration: string };

type ScriptMessage =
  | { kind: "text"; text: string; delayMs: number }
  | { kind: "photo"; src: string; delayMs: number }
  | { kind: "audio"; src: string; duration: string; delayMs: number };

const bonusOptions = [
  { label: "450 fotos + 120 vídeos", name: "Bônus Essencial", amount: 19.9 },
  { label: "930 fotos + 420 vídeos", name: "Bônus Popular", amount: 29.9 },
  { label: "1350 fotos + 630 vídeos", name: "Bônus Completo", amount: 34.9 },
];

type PixStep = "idle" | "form" | "loading" | "pix" | "error";

function getLocalMessageTime() {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function AudioBubble({ src, duration }: { src: string; duration: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const progress = audioDuration ? (currentTime / audioDuration) * 100 : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) void audio.play().catch(() => {});
  }, []);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) await audio.play();
    else audio.pause();
  }

  function formatTime(seconds: number) {
    const safeSeconds = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
    return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
  }

  return (
    <div className="wa-voice">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrentTime(0); }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration)}
      />
      <button className="wa-play-button" type="button" onClick={togglePlayback} aria-label={playing ? "Pausar áudio" : "Reproduzir áudio"}>
        {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
      </button>
      <span className="wa-wave" aria-hidden="true">
        {Array.from({ length: 30 }, (_, index) => (
          <i key={index} className={(index / 30) * 100 <= progress ? "wa-wave-played" : ""} style={{ height: `${8 + ((index * 13) % 18)}px` }} />
        ))}
      </span>
      <small>{playing || currentTime > 0 ? formatTime(currentTime) : audioDuration ? formatTime(audioDuration) : duration}</small>
      <span className="wa-voice-avatar"><img src="/images/perfilModelo.jpg" alt="" /></span>
    </div>
  );
}

export default function WhatsappPage() {
  // Ajuste delayMs em cada item para controlar o intervalo antes da mensagem aparecer.
  const initialScript = useMemo<ScriptMessage[]>(
    () => [
      {
        kind: "text",
        text: "Oie amor, que bom que você veio, minha DM está lotada, sabe como é né?",
        delayMs: 700,
      },
      {
        kind: "text",
        text: "O insta tá uma chatice, fica apagando meus posts odeio aquilo kkkk",
        delayMs: 1600,
      },
      {
        kind: "text",
        text: "Aí vim pro WhatsApp acho mais fácil... acabei de deitar na minha cama agorinha e tava gravando uns conteúdos bem... sem censura mesmo, até fiquei com vergonha agora🙈",
        delayMs: 3000,
      },
      {
        kind: "text",
        text: "Posso te mandar uma amostra grátis, quer ver meu amor?",
        delayMs: 3500,
      },
    ],
    [],
  );
  const sampleScript = useMemo<ScriptMessage[]>(
    () => [
      { kind: "photo", src: "/images/mel-santos/f13.webp", delayMs: 900 },
      { kind: "photo", src: "/images/mel-santos/f2.webp", delayMs: 1100 },
      { kind: "photo", src: "/images/mel-santos/f26.webp", delayMs: 1100 },
      {
        kind: "text",
        text: "Vou te mandar um áudio, mas escuta sozinho, me promete? Aumenta o volume kkk",
        delayMs: 1300,
      },
      { kind: "audio", src: "/audios/aud1.ogg", duration: "0:12", delayMs: 1000 },
      {
        kind: "text",
        text: "A vantagem daqui é que podemos falar o que quiser e posso te mandar o que não posto lá, o que acha?",
        delayMs: 55000,
      },
      { kind: "audio", src: "/audios/aud2.ogg", duration: "0:18", delayMs: 2000 },
      {
        kind: "text",
        text: "Fiquei até excitada agora kkkk, escolhe um dos meus bônus... separei exclusivamente para você",
        delayMs: 1500,
      },
    ],
    [],
  );
  const paymentScript = useMemo<ScriptMessage[]>(
    () => [
      {
        kind: "text",
        text: "Amor, você vai copiar esse código no seu banco, clica na opção “copia e cola”, você cola o código e só vir me ver",
        delayMs: 1200,
      },
      { kind: "text", text: "Copie o código abaixo:", delayMs: 1000 },
    ],
    [],
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stage, setStage] = useState<"sample" | "bonus" | "payment">("sample");
  const [initialDone, setInitialDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pixStep, setPixStep] = useState<PixStep>("idle");
  const [selectedBonus, setSelectedBonus] = useState<
    (typeof bonusOptions)[number] | null
  >(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const playbackRun = useRef(0);

  const delay = useCallback((milliseconds: number) => {
    return new Promise<void>((resolve) =>
      window.setTimeout(resolve, milliseconds),
    );
  }, []);

  const revealMessages = useCallback(
    async (script: ScriptMessage[], run: number) => {
      for (const item of script) {
        setIsTyping(true);
        await delay(item.delayMs);
        if (playbackRun.current !== run) return false;
        setIsTyping(false);
        const { delayMs: _delayMs, ...message } = item;
        setMessages((current) => [
          ...current,
          { ...message, id: nextId.current++, time: getLocalMessageTime() } as ChatMessage,
        ]);
      }
      return true;
    },
    [delay],
  );

  useEffect(() => {
    const run = ++playbackRun.current;
    void revealMessages(initialScript, run).then((completed) => {
      if (completed && playbackRun.current === run) setInitialDone(true);
    });
    return () => {
      if (playbackRun.current === run) playbackRun.current++;
    };
  }, [initialScript, revealMessages]);

  useEffect(() => {
    const element = messagesRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, pixStep, paid]);

  useEffect(() => {
    if (!transactionId || pixStep !== "pix") return;
    let active = true;
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/pix/status/${transactionId}`);
        const data = await response.json();
        if (active && response.ok && data.isPaid) setPaid(true);
      } catch (statusError) {
        console.error("Erro ao verificar status do PIX:", statusError);
      }
    };
    checkStatus();
    const interval = window.setInterval(checkStatus, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [transactionId, pixStep]);

  function addText(text: string, sent = false) {
    setMessages((current) => [
      ...current,
      { id: nextId.current++, kind: "text", text, sent, time: getLocalMessageTime() },
    ]);
  }

  async function chooseSample() {
    if (stage !== "sample" || !initialDone || busy) return;
    setBusy(true);
    const run = ++playbackRun.current;
    addText("Quero ver 👀", true);
    const completed = await revealMessages(sampleScript, run);
    if (completed && playbackRun.current === run) setStage("bonus");
    if (playbackRun.current === run) setBusy(false);
  }

  async function chooseBonus(option: (typeof bonusOptions)[number]) {
    if (stage !== "bonus" || busy) return;
    setBusy(true);
    const run = ++playbackRun.current;
    setSelectedBonus(option);
    addText(option.label, true);
    const completed = await revealMessages(paymentScript, run);
    if (completed && playbackRun.current === run) {
      setStage("payment");
      setPixStep("form");
    }
    if (playbackRun.current === run) setBusy(false);
  }

  async function createPix(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedBonus) return;
    setError("");
    setPixStep("loading");
    try {
      const response = await fetch("/api/pix/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          amount: selectedBonus.amount,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Não foi possível gerar o Pix.");
      if (!data.copyPaste)
        throw new Error(
          "O gateway não retornou o código Pix. Tente novamente.",
        );
      setPixCode(data.copyPaste);
      setTransactionId(data.transactionId || "");
      setPixStep("pix");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Erro ao gerar Pix.",
      );
      setPixStep("error");
    }
  }

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setError(
        "Não foi possível copiar automaticamente. Selecione e copie o código.",
      );
    }
  }

  return (
    <main className="whatsapp-page">
      <section className="wa-phone" aria-label="Conversa no WhatsApp">
        <div className="wa-chat-header">
          <button className="wa-back" aria-label="Voltar">
            <ArrowLeft size={21} />
          </button>
          <div className="wa-avatar">
            <Image
              src="/images/perfilModelo.jpg"
              alt="Melissa Santos"
              width={48}
              height={48}
            />
            <span className="wa-online" />
          </div>
          <div className="wa-contact">
            <strong>Melissa Santos</strong>
            <span className={isTyping ? "wa-typing" : ""}>
              {isTyping ? "digitando..." : "online agora"}
            </span>
          </div>
          <button aria-label="Videochamada">
            <Video size={21} />
          </button>
          <button aria-label="Ligar">
            <Phone size={19} />
          </button>
          <button aria-label="Mais opções">
            <MoreVertical size={20} />
          </button>
        </div>

        <div className="wa-messages" ref={messagesRef} aria-live="polite">
          <div className="wa-encryption">
            <span>🔒</span> As mensagens e ligações são protegidas com a
            criptografia de ponta a ponta. Toque para saber mais.
          </div>
          <div className="wa-date">HOJE</div>
          {messages.map((message) => (
            <div
              className={`wa-message ${message.kind === "photo" ? "wa-photo-message" : ""} ${message.kind === "audio" ? "wa-audio-message" : ""} ${message.kind === "text" && message.sent ? "wa-message-sent" : "wa-message-received"}`}
              key={message.id}
            >
              {message.kind === "text" && <span>{message.text}</span>}
              {message.kind === "photo" && (
                <img src={message.src} alt="Amostra de foto" />
              )}
              {message.kind === "audio" && (
                <div className="wa-voice">
                  <AudioBubble src={message.src} duration={message.duration} />
                  <audio controls preload="metadata" src={message.src} aria-label={`Audio de ${message.duration}`} />
                  <button type="button" aria-label="Reproduzir áudio">
                    ▶
                  </button>
                  <span className="wa-wave" aria-hidden="true">
                    {Array.from({ length: 30 }, (_, index) => (
                      <i
                        key={index}
                        style={{ height: `${8 + ((index * 13) % 18)}px` }}
                      />
                    ))}
                  </span>
                  <small>{message.duration}</small>
                  <span className="wa-voice-avatar">M</span>
                </div>
              )}
              <small>
                {message.time}
                {message.kind === "text" && message.sent && (
                  <CheckCheck size={15} />
                )}
              </small>
            </div>
          ))}

          {stage === "sample" && initialDone && !busy && (
            <div className="wa-choice-row">
              <button onClick={chooseSample}>NÃO QUERO... NÃO GOSTO</button>
              <button onClick={chooseSample}>LÓGICO MEU AMOR😍</button>
            </div>
          )}
          {stage === "bonus" && !busy && (
            <div className="wa-bonus-options">
              {bonusOptions.map((option) => (
                <button key={option.name} onClick={() => chooseBonus(option)}>
                  <span>{option.label}</span>
                  <small>{option.name}</small>
                </button>
              ))}
            </div>
          )}

          {pixStep === "form" && (
            <form className="wa-pix-form" onSubmit={createPix}>
              <strong>
                Gerar Pix
                {selectedBonus
                  ? ` · R$ ${selectedBonus.amount.toFixed(2).replace(".", ",")}`
                  : ""}
              </strong>
              <label>
                Nome completo
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  minLength={3}
                  maxLength={100}
                  required
                />
              </label>
              <label>
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  maxLength={255}
                  required
                />
              </label>
              <button type="submit">Gerar código Pix</button>
              <small>Seus dados são usados para criar o pagamento.</small>
            </form>
          )}
          {pixStep === "loading" && (
            <div className="wa-payment-status">
              <i className="wa-spinner" />
              Gerando seu Pix...
            </div>
          )}
          {pixStep === "error" && (
            <div className="wa-payment-status wa-payment-error">
              <span>{error}</span>
              <button onClick={() => setPixStep("form")}>
                Tentar novamente
              </button>
            </div>
          )}
          {pixStep === "pix" && (
            <div className="wa-pix-card">
              {paid ? (
                <strong>✅ Pagamento confirmado!</strong>
              ) : (
                <strong>
                  Pix copia e cola
                  {selectedBonus
                    ? ` · R$ ${selectedBonus.amount.toFixed(2).replace(".", ",")}`
                    : ""}
                </strong>
              )}
              <label htmlFor="wa-pix-code">Código Pix</label>
              <textarea id="wa-pix-code" value={pixCode} readOnly rows={3} />
              <button onClick={copyPix} type="button">
                <Check size={15} />
                {copied ? "Código copiado!" : "Copiar o código"}
              </button>
              {error && <small className="wa-copy-error">{error}</small>}
              {!paid && <small>Aguardando confirmação do pagamento…</small>}
            </div>
          )}
          <div className="wa-flow-hint">
            <span>✦</span>{" "}
            {stage === "sample"
              ? "Escolha uma opção para continuar"
              : stage === "bonus"
                ? "Escolha seu bônus"
                : "Pagamento seguro via Pix"}
          </div>
        </div>

        <form
          className="wa-composer"
          onSubmit={(event) => event.preventDefault()}
        >
          <button type="button" aria-label="Emojis">
            <Smile size={23} />
          </button>
          <input placeholder="Mensagem" aria-label="Mensagem" disabled />
          <button type="button" aria-label="Anexar arquivo">
            <Paperclip size={21} />
          </button>
          <button className="wa-send" type="button" aria-label="Mais opções">
            <ChevronDown size={21} />
          </button>
        </form>
        <div className="wa-home-indicator">
          <i />
        </div>
      </section>
    </main>
  );
}
