# Contributing to Hidaya (هداية)

> **"A guide to Quranic sources, not a religious authority."**  
> Welcome! We are building **Hidaya** as an open-source, digital waqf (charitable endowment) to help Muslims, non-Muslims, and seekers discover authentic Quranic wisdom for the exact situations they face in life.

Thank you for your interest in contributing. Whether you are a software engineer, designer, student of knowledge, scholar, translator, or accessibility advocate, your contributions are deeply valued.

---

## 🌟 Foundational Editorial & Theological Principles

Every contributor, pull request, and review must strictly honor these core boundaries:

1. **Zero Hallucination of Quranic Text & Hadith**:
   - The Arabic Quran text must **NEVER** be generated, modified, or paraphrased by an AI.
   - Text must strictly come from verified sources matching the Medina Mushaf Uthmani script (e.g., Tanzil / King Fahd Glorious Qur'an Printing Complex).
   - Never invent or synthesize Hadith or scholarly opinions.

2. **Strict 4-Level Content Hierarchy**:
   Every visual representation in Hidaya must preserve clear stratification:
   - **Level 1**: Original Verified Quranic Arabic (Uthmani script)
   - **Level 2**: Human Translations (Explicitly attributed, e.g., Saheeh International, Knut Bernström, Muhammad Hamidullah)
   - **Level 3**: Classical Tafsir (Explicitly attributed to authentic source works: Ibn Kathir, Al-Sa'di, Al-Muyassar, etc.)
   - **Level 4**: AI Synthesis / Reflection Prompts (Clearly tagged as AI / reflective contemplation)

3. **Hidaya is a Guide to Sources, NOT an Imam or Fatwa Authority**:
   - The app helps users explore, understand, and reflect.
   - The app must **never** issue legal rulings, definitive life verdicts (*"You must divorce"*), or fatwas.
   - When encountering sensitive medical, legal, or marital decisions, always provide gentle guidance to consult qualified scholars or professionals.

4. **Privacy-First & Anonymous by Default**:
   - Users often enter vulnerable life situations (*"I feel overwhelmed by grief"*, *"My marriage is strained"*).
   - Sensitive personal narratives must **never** be logged to remote servers or third-party telemetry by default.
   - User reflections are stored locally in the browser (`localStorage`) unless explicitly backed up by the user.

5. **Digital Waqf & Inclusivity**:
   - Free for everyone, forever. No subscription walls, no ads inside the Quran contemplation space.
   - Designed to warmly welcome both Muslims and curious non-Muslims seeking to understand the Quran in context.

---

## 🛠️ Tech Stack Overview

- **Framework**: Next.js (App Router) on [Vinext](https://github.com/cloudflare/vinext)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS (following the *Quiet + warm + modern + sacred* design constitution)
- **Database & Retrieval**: PostgreSQL / Supabase with `pgvector` for semantic search
- **Serverless / Hosting**: Cloudflare Workers
- **AI Synthesis**: Google Gemini 2.5 Flash (bounded with strict JSON schemas and low temperature)
- **Export Engine**: `pptxgenjs` (slide decks) and native print stylesheet (PDF)

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v20 or v22 LTS
- **Package Manager**: `npm` (standard)

### Installation
```bash
# 1. Clone your fork
git clone https://github.com/aomelander/hidaya.git
cd hidaya

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Fill in your GEMINI_API_KEY, SUPABASE_URL, and SUPABASE_ANON_KEY (optional for local mock mode)

# 4. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Seeding the Complete Quran Dataset
Hidaya includes an automated seeder that ingests all 114 Surahs and 6,236 Ayahs across Arabic, English, Swedish, and French:

```bash
# Run database seeder (dry-run mode validates data feeds if Supabase is unconfigured)
npm run db:seed
```

### Verification & Quality Checks
Before submitting any pull request, ensure:
```bash
# TypeScript compiler type check
npm run typecheck

# Lint check
npm run lint

# Production build check
npm run build
```

---

## 🤝 Ways to Contribute

### 1. Linguistic & Translation Contributions
We currently support **English** (Saheeh International), **Swedish** (Knut Bernström), and **French** (Muhammad Hamidullah).
- We are looking to add: **Spanish**, **German**, **Turkish**, **Urdu**, **Bosnian**, and **Indonesian**.
- Add translations in `src/data/quranFixtures.ts` or add new verified editions to `src/lib/db/seedFullQuran.ts`.

### 2. Verse-Topic Graph & Classical Exegesis Curation
The heart of Hidaya is the structured knowledge graph connecting human situations to Quranic passages:
- Expand `QUICK_CHOICE_PILLS` and curated fixtures in `src/data/quranFixtures.ts`.
- Add Asbab al-Nuzul (contexts of revelation) and verified classical citations from Ibn Kathir, Al-Tabari, Al-Qurtubi, and Al-Sa'di.
- Ensure every citation lists the scholar's name, book title, and century.
- **Contextual Boundary Guards (`notSaying`)**: Add clear boundaries for verses that are frequently taken out of context or misapplied to prevent harmful self-blame.
- **Surrounding Verses (`surroundingVerses`)**: Provide preceding and succeeding verses to maintain textual flow.
- **Life Spheres (`lifeSphere`)**: Classify passages by their primary domain: `individual` (soul/prayer/anxiety), `family` (parents/marriage/children), or `society` (workplace ethics/justice/commerce).
- **Linguistic Roots (`linguisticRoots`)**: Identify the 3-letter Arabic root (`k-dh-m`, `sh-r-h`, `h-s-n`) and explain the concrete historical desert imagery.
- **Halaqah Prompts (`halaqahPrompts`)**: Craft 3 discussion questions and 1 weekly group commitment suitable for families and study circles.

### 3. "From Quran to Life" Reflection Framework
Help craft authentic reflection prompts following the 4-step cycle:
1. **Understand**: What does the passage say in linguistic and historical context?
2. **Reflect**: What does this touch in my situation today?
3. **Apply**: How can I translate this into an actionable personal change?
4. **Carry / Live**: *"One small thing I will carry with me today."*

### 4. UI/UX & Accessibility (WCAG 2.2)
- Follow the *Quiet + warm + modern + sacred* palette: warm off-white, dark emerald tones, gold/amber accents, ample whitespace.
- Zero letter-spacing on Quranic Arabic (preserving ligature readability).
- High-contrast mode, dark mode, keyboard navigation, and screen reader labels.

---

## 📋 Pull Request Checklist

When submitting a PR, please ensure:
- [ ] Code passes `npm run lint` and `npm run typecheck` with **0 errors**.
- [ ] No hallucinated Quranic Arabic or paraphrased Hadith.
- [ ] Every translation or tafsir entry includes source attribution.
- [ ] Documentation is updated in `docs/` if modifying database schemas or retrieval logic.
- [ ] Keep PRs focused and modular for swift review.

---

*May this work serve as a continuous benefit and authentic guide for all who seek light and tranquility in their lives.*
