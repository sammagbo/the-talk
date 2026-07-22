# THE TALK

![THE TALK](https://www.thetalkfashion.com/og-image.png)

**Plataforma de mídia editorial — moda, lifestyle e cultura**
Por Mijean Rochus & Gleid

[![Live](https://img.shields.io/badge/LIVE-thetalkfashion.com-000000?style=for-the-badge)](https://www.thetalkfashion.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)](https://vite.dev)
[![Sanity](https://img.shields.io/badge/CMS-Sanity-F03E2F?style=for-the-badge&logo=sanity)](https://sanity.io)

---

## Organização do repositório

| Pasta | Papel | Estado |
|---|---|---|
| `/src` | Site React/Vite histórico | Produção atual |
| `/apps/web` | Nova experiência Next.js/TypeScript | Pré-produção técnica em curso |
| `/studio` | Back-office editorial Sanity | Fonte de verdade do conteúdo |
| `/api` | Funções serverless históricas | Mantidas durante a transição |
| `/docs` | Arquitetura, decisões e plano de migração | Documentação ativa |

O site histórico (`/src`) permanece intacto durante a migração. A troca para `apps/web` só ocorrerá após validação editorial, configuração da Vercel e conferência das URLs. Detalhes em [`docs/architecture.md`](docs/architecture.md).

---

## Sobre

THE TALK é uma plataforma de mídia **video-first**: conversas em vídeo, conteúdo curto vertical
e artigos editoriais sobre moda, imagem pessoal, fotografia, bastidores e cultura. Os vídeos
principais são publicados no **YouTube** e exibidos no site via player incorporado; o conteúdo
editorial é gerido no **Sanity**.

> **Estado atual:** o projeto está em reestruturação rumo ao MVP video-first. O backend social
> (Supabase) está **pausado** por decisão de produto — recursos de comunidade não estão ativos.
> Veja o roadmap de fases na documentação interna.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 18, Vite 7, React Router 7 |
| **Estilo** | TailwindCSS 3, Lucide Icons |
| **Animação** | GSAP, Lenis |
| **CMS** | Sanity (Studio v4) |
| **Vídeo** | YouTube (embed) |
| **Newsletter** | Mailchimp (via Vercel Serverless) |
| **i18n** | i18next — FR (primário), EN, PT |
| **PWA** | vite-plugin-pwa (Workbox) |
| **Observabilidade** | Sentry, Vercel Speed Insights |
| **Hospedagem** | Vercel |

> Supabase (Auth/Postgres) e Stripe permanecem no projeto como infraestrutura **dormente**,
> reservada para fases futuras (comunidade e loja). Não são necessários para rodar o site.

---

## Requisitos

- Node.js 24 LTS
- npm 11+
- Conta Sanity (para conteúdo)

## Instalação

```bash
git clone https://github.com/sammagbo/the-talk.git
cd the-talk
npm install
cp .env.example .env   # preencha as variáveis do Sanity
npm run dev            # http://localhost:5173
```

### Variáveis de ambiente (mínimo para rodar)

```env
# Sanity (obrigatório)
VITE_SANITY_PROJECT_ID=your-project-id
VITE_SANITY_DATASET=production
```

Consulte `.env.example` para as variáveis opcionais (newsletter, observabilidade).

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Build de produção em `/dist` |
| `npm run preview` | Pré-visualiza o build |
| `npm run lint` | ESLint |
| `npm run test` | Testes unitários (Vitest) |

O CMS fica em `studio/` e roda separadamente:

```bash
cd studio
npm install
npm run dev     # Sanity Studio
```

A nova aplicação (`apps/web`) e os controles de qualidade têm seus próprios comandos:

```bash
npm run modern:check     # lint, checagem TypeScript, testes e build de apps/web
npm run studio:check     # validação do Sanity Studio
npm run content:audit    # auditoria do conteúdo público
```

O relatório de referência e a ordem de correção estão em
[`docs/content-audit.md`](docs/content-audit.md); o controle de pré-produção após um build
está em [`docs/preproduction.md`](docs/preproduction.md).

---

## Estrutura

```
the-talk/
├── src/                # Site React/Vite histórico (produção atual)
│   ├── components/     # Componentes React
│   ├── pages/          # Páginas (Home, Episodes, Episode, Blog, About)
│   ├── hooks/          # Hooks customizados
│   ├── locales/        # Traduções (fr, en, pt)
│   ├── sanity.js       # Cliente Sanity
│   └── App.jsx         # App e rotas
├── apps/web/           # Nova aplicação Next.js/TypeScript (pré-produção)
├── studio/             # Sanity Studio (CMS)
├── api/                # Vercel Serverless (newsletter, OG dinâmico)
├── docs/               # Arquitetura, auditoria e plano de migração
└── public/             # Assets estáticos
```

---

## Publicação

O Sanity é a única fonte de verdade. Um episódio ou artigo precisa de um endereço (`slug`),
um estado editorial e, para publicação programada, uma data. O frontend aceita tanto os
documentos históricos quanto os novos campos, permitindo uma migração progressiva sem
duplicação de conteúdo. O workflow editorial completo está em [`docs/architecture.md`](docs/architecture.md).

---

## Deploy

Deploy contínuo na **Vercel** a cada push. Configure as variáveis de ambiente no painel do
projeto. Build manual: `npm run build` (saída em `/dist`).

---

## Licença

MIT © Mijean Rochus & Gleid

**Feito no Rio de Janeiro**

[Website](https://www.thetalkfashion.com) · [YouTube](https://www.youtube.com/@thetalkpodcastbygleidandmijean)
