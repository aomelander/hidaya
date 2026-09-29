# Mobile Experience Redesign & Server-Side Swedish Voice Synthesis

Transform Hidaya into an uncluttered, mobile-first Quranic companion by introducing progressive disclosure with collapsible settings sheets, highlighting the Daily North Star on launch, and resolving Swedish audio pronunciation issues with server-side AI voice synthesis.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices have been confirmed based on your requirements and design preferences:

- **Confirmed Decision 1 (Mobile Screen Simplification)**: Clean, guided interface that eliminates on-screen setting clutter. Advanced controls (session depth, explanation depth, sphere filters, font scaling) are moved into an ergonomic collapsible bottom sheet ("Customization & Preferences").
- **Confirmed Decision 2 (Swedish Audio Synthesis)**: Replace browser-only text-to-speech with a dedicated server-side AI voice endpoint (`/api/tts`) using `gemini-3.8-flash-lite-tts`, ensuring authentic, native Swedish pronunciation without English phoneme butchering.
- **Confirmed Decision 3 (Mobile Starting Focus)**: The Daily North Star verse is featured directly on launch as the primary contemplative focal anchor, followed by a calm guidance portal ("What brings you here today?").

---

## 1. Overview & Core Concept

- **What It Does**: Hidaya provides a serene, focused mobile experience for discovering and contemplating verified Quranic verses. Users are immediately greeted by today's North Star verse and a clean search/voice portal. All secondary options and configuration toggles are discreetly tucked away into an accessible bottom sheet.
- **Target Audience / Persona**: Mobile users seeking fast spiritual solace, non-Arabic speakers seeking authentic translations and classical tafsir, and Swedish speakers who need natural spoken reflections.
- **Key Value**: Replaces an overwhelming desktop-style control panel with a quiet, sacred, thumb-friendly mobile app where Quranic Arabic is central, Swedish audio sounds authentic, and navigation takes one tap.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Launch & Contemplation**:
   - The user opens the app on mobile and immediately sees a tranquil top bar (`Hidaya`) and the **Daily North Star** card featuring the Arabic ayah, translation, and daily practical reflection prompt.
   - Quick one-tap action: "Listen to North Star" or "Reflect on this passage".
2. **Guidance Discovery**:
   - Below the North Star, a clean card poses: *"What brings you here today?"* with a calm search input and 3 quick action buttons: **Speak**, **Choose feeling**, and **Explore**.
   - No row upon row of pills, sliders, and checkboxes crowding the viewport.
3. **Collapsible Customization Sheet**:
   - A subtle floating trigger button (`Preferences & Depth`) or top bar action opens an ergonomic bottom sheet containing:
     - Explanation Depth (Simple, Context, Tafsir, Study)
     - Session Duration (2m, 10m, 30m, 60m)
     - Life Spheres filter
     - Arabic typography scaling and transliteration toggle
4. **Natural Audio Listening**:
   - Tapping "Listen" plays authentic Arabic recitation followed by crystal-clear, natural Swedish spoken translation produced by the server-side AI voice engine.

### Visual Identity & Theme

- **Aesthetic Direction**: *Quiet + Warm + Sacred*. Off-white canvas, deep emerald green accents, muted warm gold highlights, and generous whitespace.
- **Color Palette**:
  - Light mode: Canvas `bg-stone-50`, cards `bg-white`, border `border-stone-200/80`, accent `text-emerald-800` & `bg-emerald-700`.
  - Dark mode: Canvas `bg-stone-950`, cards `bg-stone-900`, border `border-stone-800`, accent `text-emerald-400`.
- **Typography**:
  - Quranic Arabic: Traditional Uthmani script (`Amiri`, `Scheherazade New`) with zero letter-spacing.
  - Headings: `Cinzel` serif for dignified editorial presence.
  - Body & UI: `Plus Jakarta Sans` for clean, mobile readability.
- **Thumb Zone Ergonomics**:
  - All interactive elements adhere to $\ge 44\text{px}$ touch targets.
  - Primary bottom sheet trigger and audio controls placed in the lower 40% thumb zone.
  - Fixed mobile top bar capped under 56px height.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Collapsible Bottom Sheet vs. Multi-Tab Screen Split
- *Chosen Approach*: Progressive disclosure via a slide-up bottom sheet (`rounded-t-3xl`) for all secondary customization.
- *Why*: Keeps the main reading viewport uncluttered and distraction-free while keeping all depth/duration tools one tap away.
- *Alternatives Considered*: Multi-tab layout (forces users to switch contexts to adjust settings).

### Decision 2: Server-Side AI Voice (`gemini-3.8-flash-lite-tts`) vs. Client SpeechSynthesis
- *Chosen Approach*: Server-side `/api/tts` endpoint generating 24kHz WAV audio via `gemini-3.8-flash-lite-tts` for Swedish translations, with local Web Speech API as offline fallback.
- *Why*: Browsers frequently lack native Swedish TTS voices, causing them to read Swedish words using English pronunciation rules ("läsa" pronounced with English phonetics). The AI voice produces authentic Swedish tone, cadence, and inflection.
- *Alternatives Considered*: Enforcing device-only Swedish voices (completely fails on devices without Swedish language pack installed).

### Decision 3: Daily North Star Hero Anchor
- *Chosen Approach*: Place Daily North Star at the top of the mobile viewport, followed by the guidance query field.
- *Why*: Provides immediate spiritual value upon opening the app without requiring any user input, matching the sermon inspiration from the Gothenburg mosque.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│                   Mobile Client View                   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Mobile Header (Brand Wordmark + Sheet Trigger)   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. Daily North Star (Hero Focal Anchor)          │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 2. Guided Query ("What brings you here today?")  │  │
│  │    [Speak]  [Write]  [Choose Mood]               │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 3. Guidance Results (Passage Cards & Audio)      │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│ Customization BottomSheet │ │ Audio Engine Service      │
│ - Explanation Depth       │ │ - Arabic Reciters (Audio) │
│ - Session Length (2-60m)  │ │ - Swedish TTS API Player  │
│ - Life Spheres Filter     │ └─────────────┬─────────────┘
│ - Text Size / Contrast    │               │
└───────────────────────────┘               ▼
                              ┌───────────────────────────┐
                              │ POST /api/tts             │
                              │ - gemini-3.8-flash-lite   │
                              │ - Swedish Language Native │
                              │ - Returns Base64 WAV      │
                              └───────────────────────────┘
```

### Component & File Mapping

1. **`src/app/api/tts/route.ts` (New)**:
   - Server route receiving `{ text: string, language: string }`.
   - Calls `@google/genai` with `gemini-3.8-flash-lite-tts` and appropriate voice config (`Kore` or `Puck`).
   - Returns audio stream / base64 WAV with `audio/wav` headers.
2. **`src/services/speechSynthesisService.ts`**:
   - Updated to call `/api/tts` for Swedish and non-English text to guarantee native pronunciation.
   - Falls back to browser `window.speechSynthesis` only if network is offline.
3. **`src/components/CustomizationSheet.tsx` (New)**:
   - Houses `SessionDepthSelector`, `ExplanationDepthSelector`, `SphereFilter`, and text accessibility controls in an animated, accessible bottom sheet.
4. **`src/app/page.tsx`**:
   - Streamlined mobile layout: Top bar $\rightarrow$ Daily North Star $\rightarrow$ Guidance input $\rightarrow$ Search results.
   - All clutter removed from the initial view, creating a clean reading environment.
5. **`src/components/DailyNorthStar.tsx`**:
   - Enhanced responsive mobile layout with prominent audio play trigger and clean visual hierarchy.

---

## 5. Verification & Quality Gates

- **Compilation**: Run `compile_applet` to verify clean build without TypeScript or runtime issues.
- **Lint Check**: Run `lint_applet` (`tsc --noEmit`) to verify strict typing.
- **Audio Verification**: Test `/api/tts` with Swedish sample text (`"Koranen är en vägledning för människorna"`) to confirm proper Swedish phonetics.
- **Mobile Viewport Testing**: Verify zero horizontal overflow, touch target accessibility ($\ge 44\text{px}$), and responsive collapse across 375px–430px viewports.
