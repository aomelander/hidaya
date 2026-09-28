# Hidaya (هداية)
### *Quran Guidance for Your Moment: From Mushaf to Human to Life*

[![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Deployed-F38020?logo=cloudflare)](https://workers.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

> *"The Quran is a guidance for humanity, with clear proofs of guidance and as a criterion between right and wrong."*  
> — Surah Al-Baqarah (2:185)

---

## 📖 1. Project Overview

**Hidaya** is an open-source, digital waqf (charitable endowment) designed to **bridge the human condition directly to Quranic guidance**. 

Inspired by a Friday sermon in Gothenburg on placing the Quran at the center of daily human struggles, Hidaya guides users through their immediate feelings, critical life decisions, and existential questions with verified Medina Uthmani script, classical exegesis (Tafsir), multi-language human translations, and an actionable reflection framework:

$$\text{Mushaf (Source)} \longrightarrow \text{Individual (Soul)} \longrightarrow \text{Family (Home)} \longrightarrow \text{Society (Work \& Justice)}$$

### Core Theological Boundaries (AGENTS.md)
1. **Zero Hallucination**: AI models never generate, modify, or paraphrase Quranic Arabic text or Hadith citations.
2. **Strict 4-Level Content Hierarchy**: Every screen preserves immutable boundaries:
   - **Level 1**: Original Verified Quranic Arabic (Uthmani script)
   - **Level 2**: Attributed Human Translations (Saheeh, Bernström, Hamidullah)
   - **Level 3**: Classical Tafsir (Ibn Kathir, Al-Sa'di, Al-Muyassar)
   - **Level 4**: AI Synthesis / Reflection Prompts (Clearly tagged as AI / contemplation)
3. **Non-Fatwa Policy**: Hidaya is an educational guide to Quranic sources, **not a religious authority**. It never issues legal rulings or personal life commands.
4. **Local-First Privacy**: Personal reflection journals and situation narratives are stored client-side in the browser and never logged to remote databases.

---

## ✨ 2. Key Features

- **Daily North Star (Dagens Ledstjärna)**: Synchronized daily contemplation pairing 1 verified passage with historical context, a heart-reflection question, and a practical daily micro-action.
- **3 Core Entry Modes**:
  1. *In This Moment*: Acute stress, burnout, grief, workplace anger, loneliness.
  2. *Big Questions*: Suffering, cosmic justice, morality, purpose of existence.
  3. *Character & Growth*: Cultivating patience (*Sabr*), truthfulness (*Sidq*), humility (*Tawadu'*), and forgiveness (*'Afw*).
- **"I Don't Know What I Need" Compass**: Guided stepping-stone across 5 spiritual states of heart for users who feel overwhelmed.
- **The 3 Human Spheres**: Concentric categorization across **Individual & Soul**, **Family & Home**, and **Society & Work**.
- **Continuous Hands-Free Audio Player**: Murattal audio streams across 4 master reciters (Mishary Alafasy, Abdul Basit, Al-Husary, Saad Al-Ghamdi) with optional translation voiceover for walks and commutes.
- **Halaqah Circle Mode**: Guided 5–10 minute family or study group sitting (Listen $\rightarrow$ Read Aloud $\rightarrow$ Circle Discussion $\rightarrow$ Home Commitment).
- **Deep Tadabbur Linguistic Roots**: Unveils the concrete desert metaphors behind Arabic terminology (e.g., *k-dh-m* = tying a bulging water-skin shut; *sh-r-h* = surgical expansion of a constricted chest).
- **Multi-Format Export**: One-click slide decks (PowerPoint PPTX via `PptxGenJS`), printable PDF study sheets, and shareable visual social cards.
- **Scholar Editorial Console**: Theological review matrix verifying mapping confidence, Usul al-Din checklist, and reviewer attributions.

---

## 🏛️ 3. Architecture & Directory Tree

### The 4-Stage Cost & Reliability Engine

```
                      ┌───────────────────────────────────────────────┐
                      │                     USER                      │
                      │   (Text Query / Voice Input / Quick Choices)  │
                      └───────────────────────┬───────────────────────┘
                                              │
                        ┌─────────────────────┴─────────────────────┐
                        ▼                                           ▼
            [Stage 1: Direct Category Match]             [Stage 2: Deterministic Cache]
             (ayah_topic / curated graph)                  (SHA-256 queryHash lookup)
                        │                                           │
                        └─────────────────────┬─────────────────────┘
                                              │ (If cache miss & no direct match)
                                              ▼
                                [Stage 3: Semantic Retrieval]
                                  (pgvector cosine similarity
                                      / tokenized scoring)
                                              │
                                              ▼
                                [Stage 4: Sourced Synthesis]
                                  (Gemini 2.5 Flash Bounded LLM
                                   JSON Schema: 0 Hallucinations)
                                              │
                                              ▼
                      ┌───────────────────────────────────────────────┐
                      │              4-Level Presentation             │
                      ├───────────────────────────────────────────────┤
                      │ Level 1: Verified Uthmani Arabic Script       │
                      │ Level 2: Human Translations (EN / SV / FR)    │
                      │ Level 3: Classical Tafsir (Ibn Kathir, Sa'di) │
                      │ Level 4: "From Quran to Life" Reflection      │
                      └───────────────────────────────────────────────┘
```

### Modular Project Directory Tree

```
hidaya/
├── .github/                         # GitHub collaboration & CI/CD templates
│   ├── ISSUE_TEMPLATE/              # Structured bug, feature & translation templates
│   ├── workflows/ci.yml             # Automated Typecheck, Lint & Build pipeline
│   └── pull_request_template.md     # Mandatory theological & quality checklist
├── docs/                            # Deep architectural & milestone documentation
│   ├── ARCHITECTURE.md              # Technical architecture & retrieval flow
│   └── STATE.md                     # Milestone tracking & deployment status
├── public/                          # Static assets, PWA manifest & Service Worker
│   ├── manifest.json                # PWA configuration
│   └── sw.js                        # Offline caching service worker
├── src/
│   ├── app/                         # Next.js App Router entry points
│   │   ├── api/                     # Serverless API endpoints
│   │   │   ├── guidance/route.ts    # 4-stage retrieval engine endpoint
│   │   │   ├── health/route.ts      # Health check and environment probe
│   │   │   └── test-gemini/route.ts # Gemini integration verification
│   │   ├── globals.css              # Global styles and Tailwind v4 imports
│   │   ├── layout.tsx               # Root HTML shell and metadata
│   │   └── page.tsx                 # Modular orchestrator page
│   ├── components/                  # Single-responsibility UI components
│   │   ├── AudioPlayer.tsx          # Single verse audio player with speed controls
│   │   ├── BookmarksModal.tsx       # Saved verses and reflections drawer
│   │   ├── ContinuousSessionAudioPlayer.tsx # Hands-free multi-verse player
│   │   ├── DailyNorthStar.tsx       # Daily contemplation widget
│   │   ├── EntryModeTabs.tsx        # 3 guidance modes selector
│   │   ├── GuidanceSearchBar.tsx    # Search input with voice recognition
│   │   ├── QuickChoicePills.tsx     # Filterable contemplation pill buttons
│   │   ├── GuidanceContextBanner.tsx # Semantic mapping analysis display
│   │   ├── OffTopicBanner.tsx       # Courteous off-topic fallback banner
│   │   ├── VerseCard.tsx            # 4-level stratified passage card
│   │   ├── SourceLadder.tsx         # 6-level epistemological provenance ladder
│   │   ├── LinguisticRoots.tsx      # Desert imagery root analysis
│   │   ├── HalaqahModal.tsx         # Guided family/circle study session
│   │   ├── EditorialConsoleModal.tsx# Theological audit & review matrix
│   │   ├── Footer.tsx               # Sacred scripture footer
│   │   └── ...                      # Additional modal dialogs
│   ├── config/
│   │   └── appConfig.ts             # Central constants, defaults, and storage keys
│   ├── data/                        # Verified fixtures and master registries
│   │   ├── dailyNorthStar.ts        # Rotating daily contemplation dataset
│   │   ├── editorialReviews.ts      # Scholar audit reviews dataset
│   │   ├── licenseRegistry.ts       # Content licensing compliance matrix
│   │   └── quranFixtures.ts         # Verified passages across en/sv/fr
│   ├── hooks/                       # Custom React hooks
│   │   ├── useGuidanceSearch.ts     # Search, filter, and session state management
│   │   └── useSpeechRecognition.ts  # Web Speech API wrapper with fallback
│   ├── lib/
│   │   ├── db/                      # Database client and retrieval logic
│   │   │   ├── retrievalService.ts  # Categorical, vector & cached retrieval
│   │   │   ├── schema.sql           # PostgreSQL schema with pgvector
│   │   │   └── seedFullQuran.ts     # 114 Surah seeder script
│   │   ├── export/pptxExporter.ts   # PowerPoint presentation generator
│   │   └── storage/journalStorage.ts# Backup and restore utilities
│   ├── services/                    # Business service modules
│   │   ├── audioReciters.ts         # Murattal audio stream catalog
│   │   ├── exportService.ts         # PPTX and PDF print orchestrator
│   │   ├── guidanceService.ts       # API caller and client-side fallback matcher
│   │   └── storage.ts               # LocalStorage wrapper
│   └── types.ts                     # Core TypeScript interfaces & enums
├── .env.example                     # Fully documented environment template
├── .gitignore                       # Clean Git exclusion rules
├── AGENTS.md                        # Permanent rules for AI developers & reviewers
├── CONTRIBUTING.md                  # Contributor onboarding & workflow guide
├── package.json                     # Project scripts and dependencies
├── tsconfig.json                    # Strict TypeScript configuration
└── wrangler.jsonc                   # Cloudflare Workers configuration
```

---

## 💻 4. Prerequisites

Before setting up Hidaya locally, ensure you have:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v9.x` or higher (bundled with Node.js)
- **Git**: Installed and configured on your machine

---

## 🚀 5. Quickstart Guide

Follow these steps to get a local development instance running:

```bash
# 1. Clone the repository
git clone https://github.com/aomelander/hidaya.git
cd hidaya

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **💡 Zero-Config Fallback**: You do **not** need live Gemini or Supabase API keys to explore and develop. Hidaya defaults automatically to its verified local fixtures when environment keys are omitted.

---

## 🔑 6. Environment Variables

Create a `.env` file in the project root. Refer to `.env.example` for details:

| Variable | Description | Required? | Default / Fallback |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key for Stage 4 bounded synthesis | Optional | In-memory verified fixtures |
| `SUPABASE_URL` | Supabase / PostgreSQL instance URL with `pgvector` | Optional | In-memory verified fixtures |
| `SUPABASE_ANON_KEY` | Public client API key for Supabase | Optional | In-memory mock client |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin role key (used for database seeding) | Optional | Dry-run validation |
| `NODE_ENV` | Application environment (`development` / `production`) | Optional | `development` |
| `PORT` | Local dev server port | Optional | `3000` |

---

## 🧪 7. Running Tests & Quality Checks

Every commit and pull request must pass the standard validation pipeline:

```bash
# 1. TypeScript compiler strict type checking
npm run typecheck

# 2. Lint validation
npm run lint

# 3. Production build compilation
npm run build

# 4. Optional: Run full Quran database seeder (dry-run mode validates data feeds)
npm run db:seed
```

---

## 🤝 8. Contribution Guidelines

Contributions are warmly welcomed from developers, scholars, translators, and designers.

### Workflow Summary:
1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Follow Conventional Commits**:
   - `feat: add Spanish translation support`
   - `fix: correct typo in Swedish translation for Ayah 2:155`
   - `docs: update retrieval engine flowchart`
3. **Strict Boundaries**: Ensure no AI-generated Arabic text or uncredited tafsir citations.
4. **Run Checks**: Verify `npm run typecheck` and `npm run lint` pass with 0 errors.
5. **Open a Pull Request**: Fill out the pull request checklist.

For detailed guidelines, see **[CONTRIBUTING.md](./CONTRIBUTING.md)** and **[AGENTS.md](./AGENTS.md)**.

---

## 📜 Ethical Disclaimer

> **Hidaya is an educational guide to Quranic sources, not a religious authority or fatwa service.**  
> It does not issue religious verdicts or personal legal decrees. For complex personal legal, medical, or spiritual verdicts, consult a qualified scholar.

---

*Alhamdulillah. Built as an open-source digital waqf for humanity.*
