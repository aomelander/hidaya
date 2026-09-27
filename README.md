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

## 📖 What is Hidaya?

**Hidaya** is not just another Quran reader or keyword search tool. It is an open-source, digital waqf (charitable endowment) designed to **bridge the human condition directly to Quranic guidance**. 

Inspired by a Friday sermon in Gothenburg on placing the Quran at the center of daily life, Hidaya guides users through their immediate feelings, hard decisions, and existential questions with verified Uthmani script, classical exegesis (Tafsir), multi-language translations, and an actionable reflection framework:

$$\text{Mushaf} \longrightarrow \text{Human} \longrightarrow \text{Family} \longrightarrow \text{Society}$$

---

## ✨ Key Features

### 🌟 Daily North Star (Dagens Ledstjärna)
- A synchronized daily contemplation: 1 verified passage + historical context + 1 reflection question + 1 practical daily micro-action (*"Carry this with you today"*).
- Audio recitation by Mishary Rashid Alafasy.
- Previous/Next day browser for continuous reflection.

### 🧭 3 Core Entry Modes
1. **In This Moment** (*"Something is happening to me"*): Grief, burnout, workplace rage, acute stress, family friction.
2. **Big Questions** (*"I want to understand"*): Existential inquiry into the purpose of suffering, morality, death, and cosmic justice.
3. **Character & Growth** (*"Who do I want to become?"*): Moral cultivation of patience (Sabr), truthfulness (Sidq), humility (Tawadu'), and forgiveness ('Afw).

### 🕊️ "I Don't Know What I Need" Helper
- A compassionate, gentle stepping-stone for when you are overwhelmed or cannot find the right words.
- Clarifies your state of heart across 5 spiritual dimensions: **Comfort**, **Clarity**, **Patience**, **Perspective**, and **Direction**.

### 🏛️ Epistemological Transparency & Source Ladder
- **6-Level Source Ladder**: Clearly delineates the exact provenance of every word on screen:
  - *Level 1*: Original Verified Arabic (Uthmani Script)
  - *Level 2*: Attributed Human Translation
  - *Level 3*: Classical Tafsir (Ibn Kathir, Al-Sa'di, Al-Muyassar)
  - *Level 4*: Context & Asbab al-Nuzul (with "Before & After" Surrounding Verses)
  - *Level 5*: Hidaya Topic Mapping ("Why this verse?")
  - *Level 6*: "From Quran to Life" Reflection Prompts
- **Contextual Boundary Guard ("What this verse is NOT saying")**: Protects verses from de-contextualized abuse, isolating quotes, or misplaced personal guilt.
- **Surrounding Verses Preview**: Inspect preceding and following verses to understand the full organic flow of the Surah.

### 🌱 "From Quran to Life" 4-Step Action Cycle
1. **Understand** (*Vad säger versen?*): Linguistic and textual background.
2. **Reflect** (*Vad kan den betyda för mig?*): Heart examination in relation to your situation.
3. **Apply** (*Hur kan jag omsätta den i mitt liv?*): Practical personal action or behavioral boundary.
4. **Live & Carry** (*"One thing I will carry with me today"*): Sustained daily practice.

### 🌐 The 3 Human Spheres
- **Individual & Soul** (*Individ & Själ*): Inner tranquility, repentance, solitude, anxiety, and personal prayer.
- **Family & Home** (*Familj & Hem*): Honoring aging parents, marital mercy (*Mawaddah*), child-rearing, and kinship ties.
- **Society & Work** (*Samhälle & Arbetsliv*): Standing firm with equity (*Qist*), workplace ethics, commercial honesty, and community integrity.

### 👥 Halaqah Mode (Family & Group Sitting)
- A guided 5–10 minute group contemplation session for family dinners or study circles:
  - *Listen Together* (audio recitation) $\rightarrow$ *Read Aloud* (recite in turn) $\rightarrow$ *Circle Discussion* (3 real-life questions) $\rightarrow$ *Shared Commitment* (home promise for the week).

### 🔍 Deep Tadabbur: Arabic Linguistic Root Imagery
- Unveils the vivid physical desert imagery behind Quranic terminology (e.g. *Kadhama* = sealing a bulging water-skin; *Sharh* = surgical expansion of the constricted chest; *'Afw* = desert wind erasing footprints).

### 📱 Progressive Web App (PWA) & Offline Mode
- Installable on mobile and desktop devices with zero app-store friction.
- Service worker caching enables offline access to the Daily North Star, saved reflections, and local fixtures during travels or commutes.

### 📤 Multi-Format Export
- **Slide Decks (PPTX)**: Generate clean 3-slide presentations with one verse and the full 4-step reflection using `PptxGenJS`.
- **Printable Reflection (PDF)**: Formatted with all 4 steps for personal study or family circles.
- **Audio Streaming**: Crystal-clear recitation per verse.

### 🔒 Anonymous & Privacy-First
- Zero tracking or logging of private user narratives.
- Personal reflection journals stored securely in client-side storage.

---

## 🚀 Quick Start for Developers

```bash
# 1. Clone the repository
git clone https://github.com/aomelander/hidaya.git
cd hidaya

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for local mock mode)
cp .env.example .env

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view Hidaya.

### Database Seeding
To verify the full 114 Surah / 6,236 Ayah dataset across English, Swedish, and French:
```bash
npm run db:seed
```

---

## 📚 Documentation & Architecture

- **[CONTRIBUTING.md](./CONTRIBUTING.md)**: Onboarding guide for developers, scholars, translators, and designers.
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**: Deep dive into the 4-stage retrieval engine and data models.
- **[AGENTS.md](./AGENTS.md)**: Permanent boundaries for AI agents (zero hallucination, strict hierarchy, non-fatwa policy).
- **[docs/STATE.md](./docs/STATE.md)**: Milestone tracking and release history.

---

## 🤝 Community & Contributing

We warmly invite contributions from all backgrounds!
- **Translators**: Adding Spanish, German, Turkish, Urdu, etc.
- **Scholars & Students**: Expanding the Verse-Topic graph and classical citations.
- **Engineers**: pgvector optimizations, PWA offline sync, audio caching.

Please see our **[Contributing Guidelines](./CONTRIBUTING.md)** to get started.

---

## 📜 Ethical Disclaimer

> **Hidaya is a guide to Quranic sources, not a religious authority.**  
> It does not issue religious verdicts (fatwas) or definitive legal rulings. For personal legal, medical, or complex religious decisions, consult a qualified scholar or professional.

---

*Alhamdulillah. Built as a digital waqf for humanity.*
