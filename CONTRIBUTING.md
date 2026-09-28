# Contributing to Hidaya (هداية)

> **"A guide to Quranic sources, not a religious authority."**  
> Welcome! We are building **Hidaya** as an open-source, digital waqf (charitable endowment) to help Muslims, seekers, and curious individuals discover authentic Quranic perspective for real situations in life.

Whether you are a software engineer, UI/UX designer, student of knowledge, scholar, translator, or accessibility advocate, your contributions are deeply valued.

---

## 📑 Table of Contents
1. [Foundational Editorial & Theological Principles](#1-foundational-editorial--theological-principles)
2. [Development Setup](#2-development-setup)
3. [Branching & Git Workflow](#3-branching--git-workflow)
4. [Commit Conventions](#4-commit-conventions)
5. [Ways to Contribute](#5-ways-to-contribute)
6. [Testing & Quality Verification](#6-testing--quality-verification)
7. [Submitting a Pull Request](#7-submitting-a-pull-request)
8. [Code Review & Merge Standards](#8-code-review--merge-standards)

---

## 1. Foundational Editorial & Theological Principles

Every contributor, pull request, and review must strictly honor these non-negotiable boundaries (codified in `AGENTS.md`):

### 1.1 Zero Hallucination of Quranic Arabic & Hadith
- The Arabic Quran text must **NEVER** be generated, modified, or paraphrased by an AI or human intuition.
- All Arabic script must match verified Medina Mushaf Uthmani text (e.g., Tanzil / King Fahd Glorious Qur'an Printing Complex).
- Never invent Hadith citations, scholar names, or historical revelation dates.

### 1.2 Strict 4-Level Content Hierarchy
Every visual component in Hidaya must preserve this explicit four-tier stratification:
- **Level 1**: Original Verified Quranic Arabic (Uthmani script)
- **Level 2**: Attributed Human Translations (e.g., Saheeh International, Knut Bernström, Muhammad Hamidullah)
- **Level 3**: Classical Tafsir (Attributed to authentic works: Ibn Kathir, Al-Sa'di, Al-Muyassar, etc.)
- **Level 4**: AI Synthesis / Reflection Prompts (Clearly tagged as AI / reflective contemplation)

### 1.3 Non-Fatwa Policy
- Hidaya helps users explore, understand, and reflect upon sacred texts.
- Hidaya must **never** issue legal rulings, verdicts (*"You must divorce"*), or fatwas.
- When queries touch complex medical, legal, or marital decisions, always provide gentle guidance to consult qualified scholars or licensed professionals.

### 1.4 Privacy-First & Local Storage
- Users often enter vulnerable life narratives (*"I feel broken by grief"*, *"My marriage is failing"*).
- Sensitive personal text is **never** logged to remote servers by default.
- Reflection notes are stored exclusively on the user's device (`localStorage`).

---

## 2. Development Setup

### 2.1 Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS)
- **npm**: `v9.x` or higher
- **Git**: Installed and configured

### 2.2 Local Installation
```bash
# 1. Fork the repository on GitHub, then clone your fork locally:
git clone https://github.com/<your-username>/hidaya.git
cd hidaya

# 2. Add the upstream repository as a remote:
git remote add upstream https://github.com/aomelander/hidaya.git

# 3. Install dependencies:
npm install

# 4. Set up environment variables:
cp .env.example .env

# 5. Start the local development server:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **💡 Zero-Config Local Mode**: Even without live Gemini or Supabase API keys, the application functions in offline/mock mode using curated in-memory fixtures.

---

## 3. Branching & Git Workflow

We use a feature-branch workflow. Always create branches from an updated `main` branch.

### 3.1 Branch Naming Conventions
Use descriptive, lower-case branch names prefixed with the category of change:

| Prefix | Description | Example |
| :--- | :--- | :--- |
| `feature/` | New user-facing feature or enhancement | `feature/spanish-translation` |
| `bugfix/` | Bug fixes or correction of errors | `bugfix/arabic-ligature-spacing` |
| `theology/` | Classical Tafsir, Asbab al-Nuzul, or text verification | `theology/saadi-surah-sharh` |
| `docs/` | Documentation additions or updates | `docs/retrieval-flowchart` |
| `refactor/` | Code structure improvements without behavior change | `refactor/modular-search-hooks` |
| `perf/` | Performance optimizations | `perf/audio-preload-optimization` |

```bash
# Fetch latest changes from upstream
git checkout main
git pull upstream main

# Create and switch to your feature branch
git checkout -b feature/your-feature-name
```

---

## 4. Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This ensures automated release changelogs and clear git history.

### Format:
```
<type>(<scope>): <short description in imperative mood>

[optional body providing context and reasoning]

[optional footer(s), e.g. Closes #123]
```

### Commit Types:
- `feat`: A new feature for users
- `fix`: A bug fix
- `theology`: Updates to Quranic verses, classical tafsir, or citations
- `docs`: Documentation changes only
- `style`: Formatting, missing semi-colons, Tailwind class ordering (no code change)
- `refactor`: Code refactoring that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates, build tooling

### Good Examples:
```bash
feat(audio): add playback rate control to hands-free continuous player
fix(i18n): correct Swedish translation for Surah Ash-Sharh (94:5)
theology(fixtures): add Al-Sa'di commentary for Surah Ali 'Imran (3:134)
docs(readme): add environment variable setup table
```

---

## 5. Ways to Contribute

### 5.1 Linguistic & Translation Expansion
We are actively expanding beyond English, Swedish, and French:
- **Target Languages**: Spanish, German, Turkish, Urdu, Bosnian, Indonesian, Arabic dialect guides.
- Add translations in `src/data/quranFixtures.ts` or add verified editions to `src/lib/db/seedFullQuran.ts`.
- Ensure translations are attributed to verified scholarly translators (e.g., King Fahd Complex, Muhammad Asad, Isa García).

### 5.2 Curating the Verse-Topic Knowledge Graph
Help expand the relational graph connecting human life situations to Quranic passages:
- Expand `QUICK_CHOICE_PILLS` and curated fixtures in `src/data/quranFixtures.ts`.
- Add **Contextual Boundary Guards (`notSaying`)** to prevent verses from being decontextualized or used for harmful self-blame.
- Identify **Linguistic Roots (`linguisticRoots`)** explaining the concrete desert imagery (e.g. *k-dh-m*, *sh-r-h*, *'Afw*).
- Formulate **Halaqah Prompts (`halaqahPrompts`)** for family study circles.

### 5.3 Frontend Engineering & Accessibility
- Maintain the *Quiet + warm + modern + sacred* aesthetic.
- Zero letter-spacing on Arabic script (prevents ligature breaks).
- Ensure WCAG 2.2 AA accessibility (high-contrast mode, keyboard navigation, screen reader ARIA labels).

---

## 6. Testing & Quality Verification

Before committing or opening a pull request, run the verification suite:

```bash
# 1. Typecheck: Verify strict TypeScript compilation with 0 errors
npm run typecheck

# 2. Lint: Check formatting and syntax
npm run lint

# 3. Build: Test production build
npm run build
```

---

## 7. Submitting a Pull Request

1. **Push your branch** to your GitHub fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request against the `main` branch of `aomelander/hidaya`.
3. Complete all sections of the **Pull Request Template**:
   - Describe the purpose and solution.
   - Confirm compliance with the **Religious & Theological Boundaries checklist**.
   - Confirm that `npm run typecheck` and `npm run lint` passed.
4. If modifying database schemas or retrieval architecture, update `docs/ARCHITECTURE.md` and `docs/STATE.md`.

---

## 8. Code Review & Merge Standards

- Every PR requires review by at least one maintainer.
- PRs touching Quranic Arabic, translations, or Tafsir citations require verification against verified digitized source copies.
- Keep PRs focused and atomic (avoid massive multi-purpose PRs).

---

*Thank you for contributing your time and talent to Hidaya. May this effort serve as a continuous benefit for all seekers of light.*
