# Happy Hot

Plataforma Next.js com vitrine de conteúdo, pagamento via PIX, registro do pagamento no banco e área privada protegida por sessão.

## Visão Geral

O projeto foi pensado para este fluxo:

1. O usuário acessa a landing.
2. Escolhe uma oferta e gera um PIX.
3. O pagamento é criado via API.
4. O webhook confirma o pagamento.
5. O gateway entrega a comunicação do pagamento.
6. O login valida o e-mail pago no Supabase.
7. A área `/plataforma` é liberada apenas para usuários com sessão válida.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Neon/PostgreSQL

## Rotas Principais

- `/` - entrada inicial
- `/conteudo` - página pública de conteúdo/vitrine
- `/entrar` - login por e-mail
- `/plataforma` - área privada protegida
- `/plataforma/mel-santos` - página interna de modelo

## APIs

- `/api/auth/login` - cria sessão do cliente
- `/api/auth/logout` - encerra sessão
- `/api/pix/create` - cria cobrança PIX
- `/api/pix/status/[transactionId]` - consulta status do pagamento
- `/api/pix/webhook` - recebe confirmação do gateway

## Identidade Visual

O tema do projeto usa **roxo escuro** como cor principal (antes era verde). A troca cobriu:

- Variáveis de tema em `app/globals.css` (`--primary`, `--ring`, `--accent`, `--sidebar-*`, etc.)
- Escala de cores customizada em `app/pages/pages.css` (`--verde-*` foi renomeada para `--roxo-*`, indo de `--roxo-50` a `--roxo-900`)
- Todas as cores hardcoded (hex e `rgba(...)`) em `app/plataforma`, `app/conteudo`, `app/admin` e `components/login-form.tsx`
- Classes Tailwind `emerald-*` trocadas por `purple-*`

Se precisar ajustar o tom, mexa em `--roxo-escuro` / `--roxo-claro` (`app/globals.css`) e na escala `--roxo-50..900` (`app/pages/pages.css`).

## Carregamento Lazy de Mídia

Fotos e vídeos só são baixados quando estão prestes a entrar na tela:

- `<img>` usa o atributo nativo `loading="lazy"` (com `decoding="async"`), exceto as imagens acima da dobra (banner inicial de confirmação de idade, avatar principal do perfil), que carregam de imediato para não atrasar o primeiro carregamento.
- `<video>` **não tem suporte confiável a `loading="lazy"`** em todos os navegadores, então foi criado o componente `components/lazy-video.tsx`. Ele usa `IntersectionObserver` e só monta a tag `<video>` (e portanto só inicia o download do arquivo) quando o elemento está a ~200px de entrar na viewport. Antes disso, renderiza um placeholder leve no lugar.
- Usado hoje em: feed de posts (`app/conteudo/page.tsx`) e grid de mídia da página da modelo (`app/plataforma/mel-santos/page.tsx`).

## Favicon

Adicionado `app/icon.png` e `app/apple-icon.png` (convenção de metadata do Next.js App Router, detectados automaticamente sem precisar configurar nada em `layout.tsx`). Foram gerados a partir do logo `mh_white.png` enviado, que é só o traçado branco sem fundo — por isso ficava invisível como favicon (ícone branco sobre fundo branco do navegador). Foi adicionado um fundo roxo escuro com cantos arredondados para o ícone ficar visível em qualquer tema do navegador.



Crie um `.env` (já incluído como modelo no projeto) e preencha os valores:

```env
NEON_URL=postgresql://usuario:senha@host.neon.tech/database?sslmode=require
SESSION_SECRET=

BUCKPAY_API_URL=https://...
BUCKPAY_API_KEY=sua-chave-da-buckpay
BUCKPAY_USER_AGENT=HappyHot/1.0

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Em produção, configure as mesmas variáveis no painel da Vercel. O `SESSION_SECRET` deve ser um valor aleatório longo e o `NEXT_PUBLIC_APP_URL` deve apontar para o domínio público final.

## Rodando Localmente

```bash
npm install
npm run dev
```

App local:

```text
http://localhost:3000
```

## Checks

```bash
npm run lint
npm run build
```

## Deploy

O deploy principal está pensado para Vercel.

Antes de publicar, confirme:

- `NEXT_PUBLIC_APP_URL` com o domínio final
- webhook do gateway apontando para `/api/pix/webhook`
- variáveis do Neon/PostgreSQL e da BuckPay configuradas
- gateway de pagamento configurado

## Observações

- A área `/plataforma` exige sessão válida.
- O login libera acesso com base no e-mail com pagamento confirmado.
- Existem páginas e componentes ainda com conteúdo visual específico da operação atual. Se o branding mudar, revise textos, rotas internas e referências visuais.
