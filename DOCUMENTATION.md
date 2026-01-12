# THE TALK - Documentação Completa

**Versão:** 1.0.0  
**Última Atualização:** 11 de Janeiro de 2026  
**Repositório:** [github.com/sammagbo/the-talk](https://github.com/sammagbo/the-talk)  
**Deploy:** [the-talk.vercel.app](https://the-talk.vercel.app)

---

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estrutura do Projeto](#3-estrutura-do-projeto)
4. [Configuração e Instalação](#4-configuração-e-instalação)
5. [Arquitetura](#5-arquitetura)
6. [Páginas](#6-páginas)
7. [Componentes](#7-componentes)
8. [Hooks e Context](#8-hooks-e-context)
9. [Integrações](#9-integrações)
10. [Internacionalização](#10-internacionalização)
11. [PWA e Performance](#11-pwa-e-performance)
12. [SEO e Acessibilidade](#12-seo-e-acessibilidade)
13. [Testes](#13-testes)
14. [Deploy](#14-deploy)

---

## 1. Visão Geral

**THE TALK** é um website de podcast focado em moda e lifestyle, apresentado por Mijean Rochus. O site oferece:

- 🎧 Player de áudio integrado com Spotify
- 📺 Seção de vídeos (coulisses, interviews)
- 📝 Blog com artigos
- 🛒 Loja de produtos
- 👤 Sistema de autenticação de usuários
- 🔔 Notificações push
- 🌐 Suporte multilíngue (FR, EN, PT, ES)

---

## 2. Stack Tecnológico

### Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18.3.1 | UI Framework |
| React Router | 7.10.1 | Roteamento SPA |
| Vite | 7.2.4 | Build tool |
| TailwindCSS | 3.4.18 | Styling |
| Lucide React | 0.555.0 | Ícones |

### Backend/Serviços
| Serviço | Uso |
|---------|-----|
| Sanity.io | CMS para episódios e blog |
| Firebase | Auth e Cloud Messaging |
| Vercel | Hosting e Deploy |
| Stripe | Pagamentos |
| Sentry | Error tracking |

### DevDependencies
| Ferramenta | Uso |
|------------|-----|
| Vitest | Unit testing |
| Cypress | E2E testing |
| ESLint | Linting |
| PWA Plugin | Service Worker |

---

## 3. Estrutura do Projeto

```
the-talk/
├── public/
│   ├── favicon.png
│   ├── logo.png
│   └── apple-touch-icon.png
├── src/
│   ├── assets/
│   ├── components/        # 17 componentes
│   ├── context/           # AuthContext
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   ├── locales/           # i18n (fr, en, pt, es)
│   ├── pages/             # 7 páginas
│   ├── utils/             # Helper functions
│   ├── App.jsx            # Root component
│   ├── main.jsx           # Entry point
│   ├── firebase.js        # Firebase config
│   ├── sanity.js          # Sanity client
│   └── i18n.js            # i18n config
├── studio/                # Sanity Studio
├── cypress/               # E2E tests
├── index.html             # Static fallback + SEO
├── vite.config.js         # Build config
├── tailwind.config.js     # Tailwind config
└── package.json
```

---

## 4. Configuração e Instalação

### 4.1 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Sanity.io
- Projeto Firebase

### 4.2 Variáveis de Ambiente

```env
# .env
VITE_SANITY_PROJECT_ID=your_project_id
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key

VITE_GEMINI_API_KEY=your_gemini_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_key
```

### 4.3 Instalação

```bash
# Clone o repositório
git clone https://github.com/sammagbo/the-talk.git
cd the-talk

# Instale dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

### 4.4 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Verificar linting |
| `npm run test` | Executar testes |

---

## 5. Arquitetura

### 5.1 Fluxo de Dados

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Sanity    │────▶│    App.jsx   │────▶│   Pages     │
│   (CMS)     │     │  (fetch)     │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Components  │
                    └──────────────┘
```

### 5.2 Roteamento

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/episode/:id" element={<EpisodePage />} />
  <Route path="/blog" element={<BlogPage />} />
  <Route path="/blog/:slug" element={<BlogPost />} />
  <Route path="/store" element={<StorePage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/admin" element={<AdminPage />} />
</Routes>
```

### 5.3 Bundle Splitting

| Chunk | Conteúdo | Tamanho |
|-------|----------|---------|
| `vendor-react` | React, Router | 56 KB |
| `vendor-firebase` | Firebase SDK | 104 KB |
| `vendor-sanity` | Sanity Client | 30 KB |
| `vendor-i18n` | i18next | 18 KB |
| `index` | App code | 22 KB |

---

## 6. Páginas

### 6.1 Home.jsx

**Rota:** `/`

**Seções:**
- Hero com CTAs (Écouter, S'abonner)
- Quick Stats (Épisodes, Auditeurs, Rating)
- Featured Episode
- Continue Listening
- Vidéos Section
- Épisodes Audio Section
- Blog Preview
- About Section
- Contact Form
- AI Fashion Consultant

**Props:**
```typescript
interface HomeProps {
  items: Episode[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onPlay: (episode: Episode) => void;
}
```

---

### 6.2 EpisodePage.jsx

**Rota:** `/episode/:id`

**Features:**
- Player de áudio/vídeo
- Embed Spotify
- Seção de comentários
- Rating system
- Badges display
- Share buttons
- Episódios relacionados

---

### 6.3 BlogPage.jsx

**Rota:** `/blog`

**Features:**
- Lista de posts do Sanity
- LazyImage para thumbnails
- Formatação de datas
- Link para posts individuais

---

### 6.4 BlogPost.jsx

**Rota:** `/blog/:slug`

**Features:**
- Portable Text rendering
- SEO meta tags
- Share buttons
- Related posts

---

### 6.5 ProfilePage.jsx

**Rota:** `/profile`

**Features:**
- Dados do usuário
- Histórico de escuta
- Favoritos
- Badges conquistados
- Configurações

---

### 6.6 StorePage.jsx

**Rota:** `/store`

**Features:**
- Lista de produtos
- Integração Stripe
- Carrinho de compras

---

### 6.7 AdminPage.jsx

**Rota:** `/admin`

**Features:**
- Dashboard de analytics
- Gerenciamento de conteúdo
- Moderação de comentários
- Envio de notificações

---

## 7. Componentes

### 7.1 Navegação

| Componente | Descrição |
|------------|-----------|
| `Navbar.jsx` | Navegação principal com menu responsivo |
| `LanguageSwitcher.jsx` | Seletor de idioma |
| `ThemeToggle.jsx` | Toggle dark/light mode |

### 7.2 Player

| Componente | Descrição |
|------------|-----------|
| `Player.jsx` | Player de áudio fixo no footer |
| `LazySpotifyEmbed.jsx` | Embed Spotify com lazy loading |
| `ContinueListening.jsx` | Seção "Continue ouvindo" |

### 7.3 Mídia

| Componente | Descrição |
|------------|-----------|
| `LazyImage.jsx` | Imagens com srcset e lazy loading |

### 7.4 Interação

| Componente | Descrição |
|------------|-----------|
| `CommentsSection.jsx` | Sistema de comentários |
| `Rating.jsx` | Sistema de avaliação 5 estrelas |
| `PollComponent.jsx` | Enquetes interativas |
| `BadgesDisplay.jsx` | Exibição de badges |

### 7.5 UI Elements

| Componente | Descrição |
|------------|-----------|
| `Toast.jsx` | Notificações toast |
| `SubscribeModal.jsx` | Modal de newsletter |
| `ExitIntentPopup.jsx` | Popup de saída |
| `SponsorBanner.jsx` | Banner de patrocinadores |
| `OfflineAlert.jsx` | Alerta de modo offline |
| `ErrorBoundary.jsx` | Tratamento de erros |

---

## 8. Hooks e Context

### 8.1 AuthContext

```jsx
const { user, login, logout, loading } = useAuth();
```

**Funcionalidades:**
- Login com Firebase Auth
- Estado de autenticação
- Dados do usuário

### 8.2 usePushNotifications

```jsx
const { 
  permission, 
  requestPermission, 
  isSubscribed 
} = usePushNotifications();
```

**Funcionalidades:**
- Gerenciamento de permissões
- FCM token management
- Subscribe/unsubscribe

---

## 9. Integrações

### 9.1 Sanity CMS

**Schemas:**
- `episode` - Episódios do podcast
- `post` - Artigos do blog
- `product` - Produtos da loja
- `sponsor` - Patrocinadores

**Client:**
```javascript
// src/sanity.js
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION,
  useCdn: true
});

export const urlFor = (source) => imageUrlBuilder(client).image(source);
```

### 9.2 Firebase

**Serviços utilizados:**
- **Auth** - Autenticação de usuários
- **Cloud Messaging** - Push notifications

### 9.3 Gemini AI

**Uso:** AI Fashion Consultant na Home
- Recomendações de estilo personalizadas
- Respostas em francês

---

## 10. Internacionalização

### 10.1 Idiomas Suportados

| Código | Idioma |
|--------|--------|
| `fr` | Français (default) |
| `en` | English |
| `pt` | Português |
| `es` | Español |

### 10.2 Estrutura de Arquivos

```
src/locales/
├── fr.json
├── en.json
├── pt.json
└── es.json
```

### 10.3 Uso

```jsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<h1>{t('hero.title')}</h1>
```

---

## 11. PWA e Performance

### 11.1 Service Worker

Configurado via `vite-plugin-pwa`:
- Precaching de assets
- Offline support
- Background sync

### 11.2 Otimizações

| Otimização | Implementação |
|------------|---------------|
| Bundle Splitting | manualChunks no Vite |
| Lazy Loading | React.lazy() para páginas |
| Image Optimization | srcset + WebP |
| Preconnect | DNS prefetch para CDNs |
| Preload | LCP image preload |

### 11.3 Métricas

| Métrica | Target |
|---------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| TTI | < 3s (3G) |

---

## 12. SEO e Acessibilidade

### 12.1 Meta Tags

```jsx
<Helmet>
  <title>THE TALK | Podcast by Mijean Rochus</title>
  <meta name="description" content="..." />
  <meta property="og:title" content="..." />
  <meta property="og:image" content="..." />
  <meta name="twitter:card" content="summary_large_image" />
</Helmet>
```

### 12.2 JSON-LD Structured Data

- `WebSite`
- `Organization`
- `PodcastSeries`
- `PodcastEpisode`

### 12.3 Static Fallback

O `index.html` contém:
- Conteúdo visível sem JavaScript
- Links para plataformas de streaming
- Perfis de redes sociais
- Fallback noscript com episódio em destaque

### 12.4 Acessibilidade

- Aria labels em todos os links
- Semantic HTML
- Keyboard navigation
- Color contrast compliance

---

## 13. Testes

### 13.1 Unit Tests (Vitest)

```bash
npm run test
```

**Cobertura:**
- Componentes
- Hooks
- Utils

### 13.2 E2E Tests (Cypress)

```bash
npx cypress open
```

**Cenários:**
- Navegação
- Player de áudio
- Formulários
- Autenticação

---

## 14. Deploy

### 14.1 Vercel

**Configuração automática:**
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite

### 14.2 Variáveis de Ambiente

Configurar no dashboard do Vercel todas as variáveis do `.env`.

### 14.3 Domínio

- **Produção:** `the-talk.vercel.app`
- **Preview:** `the-talk-*.vercel.app`

---

## 📝 Changelog

### v1.8.0 (12/01/2026) - Audit Fixes & Quality Improvements

- ✅ **LanguageSwitcher Fix**: Adicionado `type=button`, `preventDefault`, `stopPropagation` para evitar redirecionamento externo.
- ✅ **Navbar Full i18n**: 10 chaves de tradução adicionadas (home, videos, blog, store, install, etc.).
- ✅ **Locale Files Updated**: Novas chaves nav.* em fr.json, en.json, pt.json.
- ✅ **Vitest Configuration**: Adicionado jsdom environment e setup file.
- ✅ **Tests Passing**: 1/1 teste passa com sucesso.
- ✅ **Sanity Image-URL**: Atualizado para usar `createImageUrlBuilder` (named export).
- ✅ **Dependencies**: Instalado @testing-library/jest-dom e jsdom.

### v1.7.1 (12/01/2026) - Media Logic Refinement

- ✅ **onPause Prop**: EpisodePage agora recebe callback `onPause` para pausar player de áudio.
- ✅ **Toggle UI**: Botões com emojis 🎧 Ouvir / 👁️ Assistir e traduções.
- ✅ **Coordinated Playback**: Clicar em "Assistir" pausa o player de áudio footer.
- ✅ **Play Button**: Clicar em "Play" força mediaMode para 'audio'.

### v1.7.0 (12/01/2026) - i18n Audit

- ✅ **Locale Files Updated**: Adicionadas 52 novas chaves de tradução em fr.json, en.json, pt.json.
- ✅ **Comments Section**: Todas as strings agora usam `t()` hook.
- ✅ **Poll Component**: Todas as strings agora usam `t()` hook.
- ✅ **Shorts Section**: Título e descrição agora traduzíveis.
- ✅ **Store Page**: Título, descrição, botões agora traduzíveis.
- ✅ **Profile Page**: Novas chaves para settings, achievements, liked episodes.

### v1.6.1 (12/01/2026) - Sanity Store Integration

- ✅ **Product Schema**: Novo schema `product.js` com title, price, image, description, stripePriceId.
- ✅ **Dynamic Products**: `StorePage.jsx` agora busca produtos do Sanity em vez de array hardcoded.
- ✅ **Stripe Integration**: `stripePriceId` é passado para a função de checkout.
- ✅ **Loading/Empty States**: Estados de carregamento e lista vazia implementados.

### v1.6.0 (12/01/2026) - Shorts Section

- ✅ **Sanity Schema**: Novo schema `short.js` com title, videoUrl, thumbnail, publishedAt.
- ✅ **Shorts Section**: Seção de vídeos curtos verticais (9:16) com scroll horizontal snap.
- ✅ **Hover Preview**: Vídeo reproduz automaticamente (muted) ao passar o mouse.
- ✅ **Full-Screen Modal**: Clique abre modal com player em tela cheia.
- ✅ **YouTube Shorts Support**: Suporte a URLs do YouTube Shorts.

### v1.5.1 (12/01/2026) - Watch vs Listen Toggle

- ✅ **Media Mode Toggle**: Novo toggle "Watch" / "Listen" acima da mídia no `EpisodePage`.
- ✅ **Smart Default**: Modo padrão é 'video' quando `videoUrl` existe, 'audio' caso contrário.
- ✅ **Toggle UI**: Botões estilizados com ícones (Video, Headphones) e cores distintas.
- ✅ **Conditional Display**: Toggle só aparece quando o episódio tem link de vídeo.

### v1.5.0 (12/01/2026) - Episode Video Support

- ✅ **Sanity Schema Update**: Novo campo `videoUrl` em `episode.js` para links do YouTube.
- ✅ **YouTube Embed**: `EpisodePage.jsx` agora exibe embed do YouTube quando `videoUrl` existe, caso contrário mostra a imagem de capa.
- ✅ **Responsive Player**: Iframe responsivo com aspect ratio 16:9 para vídeos.

### v1.4.1 (12/01/2026) - Video Carousel

- ✅ **Video Carousel**: Hero background agora alterna entre dois vídeos de moda (Pexels e Pixabay) com transição crossfade automática a cada 8 segundos.
- ✅ **Indicator Dots**: Dots indicadores na parte inferior para navegação manual entre vídeos.
- ✅ **Smooth Transitions**: Transições suaves com opacidade e animação de 1 segundo.

### v1.4.0 (11/01/2026) - Video Integration

- ✅ **Hero Video Background**: Substituição da imagem estática por vídeo de desfile (UHD) com autoplay.

### v1.3.1 (11/01/2026) - Layout Adjustments

- ✅ **Resize Featured Episode**: Card "En Vedette" redimensionado para layout vertical e compacto (`max-w-md`).

### v1.3.0 (11/01/2026) - Vogue Design Upgrade

**Inspirado por VOGUE Business**

- ✅ **Hybrid Typography**: Mistura de Sans (Industrial) e Serif (Editorial/Italic)
- ✅ **Highlighter Markers**: Destaque estilo "marca-texto" em palavras-chave
- ✅ **Pixel Glitch Decoration**: Elementos pixelados em cantos opostos

### v1.2.0 (11/01/2026) - EMMPO Upgrade

**Inspirado por EMMPO (emmpo.com)**

- ✅ **Bracket CTAs**: Botões com colchetes `[ÉCOUTER]`, `[S'ABONNER]`
- ✅ **Film Grain Overlay**: Textura granulada sutil no Hero
- ✅ **Edge Glow**: Brilho azul/roxo nas bordas
- ✅ **Pinned Corner Links**: `[NEW EPISODE]` e `[SUBSCRIBE]` fixos

### v1.1.0 (11/01/2026) - Design Upgrade

**Inspirado por DICH Fashion (dich-fashion.webflow.io)**

- ✅ **HUD Data Badges**: Badges técnicos nos cards (EP.XXX // DUR.XX:XX, VID.XXX // DUR.XX:XX)
- ✅ **Industrial Typography**: Hero com tracking 0.08em e uppercase
- ✅ **Full-Screen Menu**: Menu numerado (00. HOME, 01. VIDÉOS...) com indicadores HUD
- ✅ **Corner Indicators**: "MENU // NAVIGATION" e "THE_TALK.FM" no menu


### v1.0.0 (11/01/2026)

- ✅ Bundle splitting para performance
- ✅ Navbar component reutilizável
- ✅ Hero section aprimorado
- ✅ Featured Episode section
- ✅ Seções separadas (Vidéos vs Audio)
- ✅ Blog Preview section
- ✅ Static HTML fallback para SEO
- ✅ Streaming platform links
- ✅ Social media profiles


---

## 📞 Suporte

**Desenvolvedor:** Antigravity AI  
**Email:** contact@thetalk.fm  
**Instagram:** [@thetalk_podcast](https://instagram.com/thetalk_podcast)
