
# AGENTS.md — Permanent Rules for AI Developers (Codex, Antigravity, Gemini)

## Core Religious & Content Boundaries

1. NEVER invent, paraphrase, or hallucinate Quranic Arabic text or translations.
2. NEVER invent tafsir interpretations, scholar names, or Hadith citations.
3. ALWAYS maintain a strict 4-level content hierarchy in the UI:
   - Level 1: Original Verified Quranic Arabic (Uthmani script)
   - Level 2: Human Translations (Explicitly attributed)
   - Level 3: Classical Tafsir (Explicitly attributed to source works)
   - Level 4: AI Synthesis / Reflection Prompts (Clearly tagged as AI)
4. Hidaya is a guide to Quranic sources, NOT a religious authority.
5. NEVER issue fatwas, legal rulings, or definitive life judgments.
6. Do NOT log or store raw user situation narratives by default for privacy reasons.

## Stack & Architecture Rules

- Framework: Next.js (App Router), TypeScript, Tailwind CSS.
- Target Hosting: Cloudflare Pages / Workers.
- Database: PostgreSQL / Supabase with Row Level Security (RLS) and `pgvector`.
- State Tracking: Keep `docs/STATE.md` updated after every milestone.
- Validations: Every PR/commit must pass `npm run typecheck` and `npm run lint`.
