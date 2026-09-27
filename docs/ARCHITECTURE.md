# Hidaya Technical Architecture

> **"From Mushaf to Human to Life"**  
> An architectural guide for engineers, researchers, and systems contributors.

---

## 1. High-Level System Architecture

```
                    ┌───────────────────────────────────────────────┐
                    │                   USER                        │
                    │   (Text Query / Voice Input / Quick Choices)  │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │            Intent & Needs Parser              │
                    │  (Detects Emotion, Life Domain, Core Need)    │
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
                    └───────────────────────┬───────────────────────┘
                                            │
                         ┌──────────────────┴──────────────────┐
                         ▼                                     ▼
                  [Screen & Audio]                    [Export Engine]
             (Mishary Alafasy stream)              (PPTX Deck / PDF Print)
```

---

## 2. The 4-Stage Cost & Reliability Engine

To ensure Hidaya operates as a permanent free service without high API costs or vendor lock-in, all queries follow a strict tiered funnel:

1. **Stage 1 — Direct Category Lookup (0 LLM Cost)**:
   - Evaluates whether the user clicked a structured category (e.g., *Anger at work*, *Bereavement*, *Decision making*).
   - Retrieves verified curated passages directly from the database or in-memory fixtures.

2. **Stage 2 — Reflection Cache (0 LLM Cost)**:
   - Generates a deterministic SHA-256 hash of `queryText + language`.
   - Checks the `cached_reflection` table in Supabase. Identical repeated queries return immediately with sub-50ms latency.

3. **Stage 3 — Semantic Vector Search (0 LLM Cost)**:
   - Uses `pgvector` embeddings (`match_verses` RPC) across verified Ayah translations.
   - Applies dynamic randomization within top scoring bands:
     `ORDER BY relevance_score DESC, RANDOM() LIMIT 3`
     ensuring repeat searches provide fresh, varied passages across the Quran.

4. **Stage 4 — Bounded AI Sourced Synthesis (Fallback Only)**:
   - Invoked only for novel, complex personal situation narratives.
   - Bounded by strict temperature (`0.2`) and TypeScript JSON schema.
   - AI is instructed **never** to generate Arabic text or issue religious rulings; it merely provides contextual relevance explanations and reflection prompts.

---

## 3. Database Schema (`PostgreSQL / Supabase`)

Defined in `src/lib/db/schema.sql`:

- `surah`: Metadata for all 114 chapters (number, Arabic name, English name, revelation place).
- `ayah`: All 6,236 verses in verified Uthmani script (`text_uthmani`) and searchable clean text (`text_clean`).
- `translation`: Verse translations keyed by `ayah_id` and `language_code` (`en`, `sv`, `fr`, etc.) with translator attribution.
- `tafsir`: Classical exegesis records (`scholar_name`, `work_title`, `text`, `language_code`).
- `topic`: Curated life situations, emotions, and moral character topics with hierarchical `life_domain` tags (`individual`, `family`, `society`, `work`).
- `ayah_topic`: Relational join table mapping verses to life topics with `relevance_score` weights.
- `cached_reflection`: Key-value cache (`query_hash` → `response_json`) to minimize redundant AI generation.

---

## 4. Privacy & Local-First Philosophy

- **Anonymous by Default**: Users are not required to create an account or sign in to seek guidance.
- **No Story Logging**: The backend API processes query text transiently for embedding and matching. It does not persist user narrative text to a relational user table.
- **Client-Side Reflection Storage**: Personal notes from the reflection drawer (*Understand*, *Reflect*, *Apply*) are stored locally in the browser's `localStorage` via `StorageService`.

---

## 5. Front-End Design Constitution

- **Aesthetic**: `Quiet + warm + modern + sacred`.
- **Colors**:
  - Background: Warm off-white (`#FAF8F5`) / Deep night green (`#07140F`).
  - Accents: Forest emerald (`#065F46`), deep amber/gold (`#D97706`).
- **Typography**:
  - Quran Arabic: Amiri Quran / Traditional Arabic font styling with line-height >= 2.4. Zero letter-spacing.
  - UI Font: Plus Jakarta Sans / Inter.
- **Accessibility**: High-contrast mode, Arabic font scaling slider (1.0x to 1.6x), full keyboard navigation, screen reader labels.

---

## 6. Deployment Pipeline

- **Host**: Cloudflare Workers via Vinext.
- **Edge Routing**: Global distribution with low latency.
- **Build Output**: Static assets placed in Cloudflare Pages / KV, server functions run in Workers runtime with near-zero cold starts.

---

## 7. Epistemological Architecture & Source Transparency

Inspired by the Gothenburg sermon on establishing trust and contextual integrity (*"Vad är Quranens text och vad är vår moderna förklaring?"*), Hidaya implements strict separation across 6 distinct levels:

### The 6-Level Source Ladder
1. **Level 1 — Original Quranic Arabic (Uthmani Script)**: Immutable divine revelation matching the Medina Mushaf (Tanzil project). Never generated or paraphrased by AI.
2. **Level 2 — Attributed Human Translation**: Explicitly credited scholarly translations (*Saheeh International*, *Knut Bernström*, *Muhammad Hamidullah*).
3. **Level 3 — Classical Tafsir (Exegesis)**: Verified historical commentary citing author and century (*Ibn Kathir*, *Al-Sa'di*, *Al-Muyassar*). Never generalized into a vague *"Islam says"*.
4. **Level 4 — Sacred Context & Asbab al-Nuzul**: Historical revelation circumstances, Meccan/Medinan classification, and surrounding verses (*Before & After*).
5. **Level 5 — Hidaya Topic Mapping (Relevance)**: Structured mapping explaining why this passage addresses the user's specific situation, emotion, and underlying spiritual need.
6. **Level 6 — "From Quran to Life" Reflection Framework**: Bounded, human-centered reflection and daily micro-actions.

### Contextual Boundary Guard ("What this verse is NOT saying")
To prevent verses from being stripped of their textual and historical context or used for harmful self-blame, every passage includes an explicit boundary guard explaining what the passage does *not* mean (e.g. restraining anger in conflict does not mean accepting abuse or surrendering legal rights).

### "From Quran to Life" 4-Step Action Cycle
1. **Understand** (*Vad säger versen?*): Linguistic and context analysis.
2. **Reflect** (*Vad kan den betyda för mig?*): Heart and situation check.
3. **Apply** (*Hur kan jag omsätta den i mitt liv?*): Actionable boundary or behavioral shift.
4. **Live & Carry** (*Hur kan detta synas i mitt sätt att leva?*): The core commitment (*"One thing I will carry with me today"*).

---

## 8. Relational Spheres, Halaqah Circles & Deep Tadabbur

### The 3 Human Spheres
The Gothenburg sermon emphasizes that Quranic guidance does not isolate the individual in a vacuum; it spans the concentric circles of human existence:
- **Individual & Soul**: Inner tranquility, managing acute anxiety, personal prayer, gratitude, and sincerity.
- **Family & Home**: Honoring aging parents, marital compassion (*Mawaddah wa Rahmah*), patient child-rearing, and upholding ties of kinship (*Silat ar-Rahim*).
- **Society & Work**: Commercial integrity, equity in testimony (*Qist*), whistleblowing on corruption, fair dealing, and defusing workplace friction.

### Halaqah Mode (Family & Group Study Circles)
Digital applications often encourage solitary isolation. Halaqah Mode flips this by offering a 5–10 minute guided sitting for family dinners, youth halaqahs, or friends:
1. **Listen Together**: Shared audio recitation to bring stillness into the room.
2. **Read Aloud**: Side-by-side Arabic with attributed translation.
3. **Circle Discussion**: 3 authentic discussion questions tailored for group sharing.
4. **Shared Commitment**: A concrete weekly promise the household or group agrees to adopt.

### Deep Tadabbur: Arabic Linguistic Root Imagery
Unveils the physical, concrete desert metaphors embedded in classical Arabic roots:
- *k-dh-m* (كظم): Tying a bulging leather water-skin tightly shut with cord so not a drop spills; used for deliberate self-mastery when fury boils.
- *sh-r-h* (شرح): Surgically cutting open and expanding something tightly constricted or suffocated.
- *h-s-n* (إحسان): Exceeding mere legal equality to offer unsolicited moral beauty.

### Progressive Web App (PWA) & Offline Cache
- Service Worker (`/public/sw.js`) provides offline caching for app shell, Daily North Star, and verified local fixtures.
- Installable on desktop and mobile (`manifest.json`) with standalone display mode.

