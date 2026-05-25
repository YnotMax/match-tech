# 🗺️ MAPA DO CÓDIGO ATUAL: Referência Rápida

**Última Atualização:** 07 de Maio de 2026

> **PARA O AGENTE DE IA:** Consulte este arquivo quando precisar localizar
> rapidamente um arquivo, entender uma dependência, ou saber qual código
> reutilizar. Este é um SNAPSHOT do estado ATUAL (Neo-Brutalismo, pré-Fase 1).
>
> **LEMBRETE:** O design é Neo-Brutalismo (fundo claro, bordas grossas, neon).
> NÃO é dark mode.

---

## Estrutura de Diretórios

```
d:\estudos\Hackathon match tech\
├── .env.example              # Template de variáveis de ambiente
├── .gitignore
├── firebase-applet-config.json   # Config do Firebase (chaves reais)
├── firebase-blueprint.json       # Blueprint do projeto Firebase
├── firestore.rules               # Regras de segurança do Firestore
├── index.html                    # Entry point HTML (Vite)
├── metadata.json
├── package.json                  # Dependencies e scripts
├── server.ts                     # Express server + API routes (Gemini)
├── tsconfig.json
├── vercel.json                   # Config de deploy Vercel
├── vite.config.ts                # Vite + Tailwind v4 + PWA
├── docs/                         # Documentação do projeto
│   ├── CODEBASE_MAP.md
│   ├── FRONTEND_BLUEPRINT.md
│   ├── TODO_MATCH_TECH.md
│   ├── VISION_MATCH_TECH.md
│   └── hackathon_tech_floripa_2026_strategy.md
│
├── public/                       # Assets estáticos
│
├── src/
│   ├── main.tsx                  # React entry point (createRoot)
│   ├── App.tsx                   # Router + providers (Auth, ErrorBoundary)
│   ├── index.css                 # Design System NEO-BRUTALISTA (NÃO TOCAR)
│   │
│   ├── components/
│   │   ├── ErrorBoundary.tsx     # Error boundary genérico
│   │   └── ui/
│   │       ├── Button.tsx        # Botão Neo-Brutalista (accent-lime, pink, etc)
│   │       ├── Card.tsx          # Card Neo-Brutalista (lime, pink, yellow, cyan)
│   │       └── PostModal.tsx     # Modal de posts da timeline [REMOVER]
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx       # Google Auth state (onAuthStateChanged)
│   │
│   ├── layouts/
│   │   └── RootLayout.tsx        # Navbar Neo-Brutalista + Outlet
│   │
│   ├── lib/
│   │   ├── firebase.ts           # initializeApp, getAuth, getFirestore
│   │   ├── firebase-admin.ts     # Admin SDK (server-side Firestore)
│   │   ├── logger.ts             # Logger utility
│   │   └── utils.ts              # cn() utility (clsx + tailwind-merge)
│   │
│   ├── pages/
│   │   ├── Bunker.tsx            # Dashboard com countdown [REMOVER → Landing]
│   │   ├── Guilda.tsx            # Lista de membros [EVOLUIR → Discover]
│   │   ├── Logistica.tsx         # Dashboard logística [REMOVER]
│   │   ├── Onboarding.tsx        # Formulário de perfil [AJUSTAR scope]
│   │   └── Oraculo.tsx           # IA Strategy Matcher [EVOLUIR → Squad AI]
│   │
│   ├── services/
│   │   └── likesService.ts       # Toggle like, subscribe to likes
│   │
│   └── utils/
│       ├── timer.ts              # calculateTimeLeft() [REMOVER]
│       └── timer.test.ts         # Vitest tests [REMOVER]
│
├── README.md                     # Documentação pública (setup, stack, features)
└── docs/                         # Pasta com toda a documentação técnica
```

---

## Design System (NEO-BRUTALISMO — NÃO ALTERAR)

### Tokens CSS (`src/index.css`):
| Token | Valor | Uso |
|-------|-------|-----|
| `--font-sans` | Inter | Texto corrido |
| `--font-heading` | Space Grotesk / Archivo Black | Títulos (UPPERCASE) |
| `--color-neo-bg` | `#F4F4F0` | Fundo principal (off-white) |
| `--color-neo-bg-alt` | `#E5E5E5` | Fundo alternativo |
| `--color-neo-black` | `#000000` | Bordas, texto, sombras |
| `--color-neo-yellow` | `#FFC900` | Acento amarelo |
| `--color-neo-lime` | `#B8FF29` | Acento verde limão |
| `--color-neo-pink` | `#FF2E93` | Acento rosa choque |
| `--color-neo-cyan` | `#00E5FF` | Acento ciano |

### Classes Utilitárias:
| Classe | Efeito |
|--------|--------|
| `.neo-border` | `border: 3px solid #000` |
| `.neo-shadow` | `box-shadow: 6px 6px 0px 0px #000` + active afunda |
| `.neo-shadow-hover` | Hover: sombra cresce, active: afunda |
| `.slider-thumb-neo` | Slider quadrado Neo-Brutalista |

---

## Dependências Chave (package.json)

| Pacote | Versão | Uso | Status |
|--------|--------|-----|--------|
| `react` | ^19 | UI Framework | ✅ Manter |
| `react-dom` | ^19 | React DOM renderer | ✅ Manter |
| `react-router-dom` | ^7 | SPA routing | ✅ Manter |
| `firebase` | ^12 | Auth + Firestore client | ✅ Manter |
| `firebase-admin` | ^13 | Server-side Firestore | ✅ Manter |
| `@google/genai` | ^1 | Gemini AI SDK | ✅ Manter |
| `express` | ^4 | API server | ✅ Manter |
| `vite` | ^6 | Build system | ✅ Manter |
| `tailwindcss` | ^4 | CSS framework | ✅ Manter |
| `@tailwindcss/vite` | ^4 | Tailwind Vite plugin | ✅ Manter |
| `motion` | ^12 | Animations (motion/react) | ✅ Manter |
| `recharts` | ^3 | Charts (RadarChart) | ✅ Manter |
| `lucide-react` | Latest | Icons | ✅ Manter |
| `clsx` | ^2 | Class name utility | ✅ Manter |
| `tailwind-merge` | ^3 | Tailwind class merging | ✅ Manter |
| `dotenv` | ^17 | Env vars | ✅ Manter |
| `tsx` | ^4 | TypeScript execution | ✅ Manter |

---

## Firestore Collections (Estado Atual)

### `members` (será renomeada para `profiles`)
- **Document ID:** Firebase Auth UID
- **Fields:**
  - `userId` (string) — Auth UID
  - `guildId` (string) — Hardcoded "TECH_FLORIPA_2026" [SERÁ REMOVIDO]
  - `name` (string)
  - `photoURL` (string | null)
  - `github` (string)
  - `linkedin` (string)
  - `primaryRole` (string)
  - `secondaryRoles` (string[])
  - `skills` (map): `{ frontend, backend, ux_ui, dados, hardware_android, vibe_coding }`
  - `canvas` (map): `{ loves: string[], comfort: string[], veto: string[] }`
  - `roast` (string | null) — IA analysis
  - `roastBrutal` (string | null) — Brutal analysis
  - `roastMild` (string | null) — Mild analysis
  - `createdAt` (Timestamp)
  - `updatedAt` (Timestamp)

### `posts` (sistema de likes)
- **Document ID:** post ID
- **Fields:** `postId`, `likesCount`, `updatedAt`
- **Subcollection:** `likes/{userId}` → `{ userId, createdAt }`

---

## API Routes (server.ts)

| Method | Path | Input | Output | Status |
|--------|------|-------|--------|--------|
| GET | `/api/health` | — | `{ status: "ok" }` | ✅ Ativo |
| POST | `/api/roast` | `{ memberId, memberData, persona }` | `{ roast: string }` | ✅ Manter |
| POST | `/api/oraculo/match` | `{ challengeDesc, members }` | `{ seguro, inovacao, surpresa }` | ✅ Manter |

---

## Lógica Reutilizável (Funções-Chave)

### De `Onboarding.tsx`:
- `TAG_CATEGORIES` — Array de categorias de tags com cores (linhas 58-95).
- `ROLES_LIST` — Array de roles disponíveis (linhas 97-101).
- `setTagSentiment(tag, sentiment)` — Lógica de exclusão mútua (linhas 210-224).
- `toggleRole(role)` — Lógica de primary/secondary role (linhas 196-208).
- `handleSubmit()` — Save para Firestore com normalização de links (linhas 234-288).
- `OnboardingAvatar` — Componente com fallback chain de fotos (linhas 12-56).

### De `Guilda.tsx`:
- `Avatar` component — Fallback chain similar ao Onboarding (linhas 11-48).
- `getRadarData(skills)` — Transforma skills map em array pro Recharts (linhas 90-100).
- `getGithubUrl(val)` / `getLinkedinUrl(val)` — Normaliza URLs sociais (linhas 102-118).
- `executeRoast(member, persona)` — Chama API de IA com loading states (linhas 120-183).
- Firestore query com `onSnapshot` para real-time updates (linhas 60-78).

### De `Oraculo.tsx`:
- `handleAnalyze()` — Chama API do Gemini para matchmaking estratégico (linhas 29-64).
- UI de resultados com 3 cards de estratégia (linhas 116-196).

---

## Setup Rápido (Referência)

```bash
# 1. Clonar
git clone https://github.com/YnotMax/match-tec.git
cd match-tec

# 2. Instalar
npm install

# 3. Configurar .env
cp .env.example .env
# Editar .env e adicionar GEMINI_API_KEY

# 4. Rodar
npm run dev
# → http://localhost:3000
```

**Firebase:** Config já incluída em `firebase-applet-config.json`. Para projeto próprio, veja instruções detalhadas no `README.md`.

---

*Este mapa é o GPS do código. Use-o para não se perder.*
