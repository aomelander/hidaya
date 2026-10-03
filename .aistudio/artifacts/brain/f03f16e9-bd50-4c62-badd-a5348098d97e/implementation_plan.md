# Remove Guidance Context Banner & Complete 100% Multilingual Localization (`SV`, `FR`, `AR`, `EN`)

Remove the redundant top `GuidanceContextBanner` and ensure that every single visible string inside `VerseCard` and `AudioPlayer`—including Surah titles/meanings, revelation era, audio controls, Classical Tafsir citations, 4-step Reflection prompts, and Context explanations—renders strictly in the user's selected language (`sv`, `fr`, `ar`, `en`) with zero English leaks.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed with you:

- **Remove Top `GuidanceContextBanner`**: Eliminate the 3-box `Guidance Mapping Analysis` banner above the verse cards so the screen leads directly from the search/topic portal into the `VerseCard` itself.
- **Full Localization of `VerseCard` & `AudioPlayer` (`SV`, `FR`, `AR`, `EN`)**:
  - **Surah Header & Metadata**: Localize `Surah` (`Sura` in SV, `Sourate` in FR, `سورة` in AR), Surah name meaning (`Imrans familj`, `La Famille d'Imran`, `آل عمران`), Revelation era (`Medinsk` / `Meckansk`, `Médinoise` / `Mecquoise`, `مدنية` / `مكية`), and `Juz` (`Juz` / `الجزء`).
  - **AudioPlayer**: Pass `language` into `AudioPlayer` inside `VerseCard` and localize all buttons and labels (`Spara ljud` / `Sparad offline`, `Vers`, `Upprepa`, reciter subtitle).
  - **Inline Classical Tafsir, Reflection Prompts & Context**: Provide complete localized datasets for Swedish (`sv`), French (`fr`), Arabic (`ar`), and English (`en`) so switching to `SV` immediately displays Swedish Tafsir commentary, Swedish 4-step reflection prompts, and Swedish context/revelation background.

---

## 1. Overview & Core Concept

- **What It Does**: Eliminates all English text leaks when Swedish (`SV`), French (`FR`), or Arabic (`عربي`) is active, and streamlines the Guidance view by removing the noisy `GuidanceContextBanner`.
- **Key Value**: Creates an authentic, uninterrupted native-language reading and contemplation experience while maintaining strict attribution to classical Tafsir sources (Ibn Kathir, Al-Sa'di, Al-Muyassar).

---

## 2. Technical Architecture & Localization Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│ Guidance View (src/app/page.tsx)                                       │
│  ├── Guidance Portal (Localized Search + Entry Modes + Topic Pills)    │
│  ├── [Removed] GuidanceContextBanner                                   │
│  └── VerseCard (100% Localized for EN / SV / FR / AR)                  │
│        ├── Header: Sura Ali 'Imran · 3:134                             │
│        │           Imrans familj · Medinsk · Juz 4                     │
│        ├── Level 1: Verified Uthmani Arabic                            │
│        ├── Level 2: Certified Translation (Taher / Bernström, etc.)    │
│        ├── AudioPlayer (language={language} passed -> "Spara ljud")    │
│        └── Inline 3-Segment Tabs (Tafsir · Reflektion · Sammanhang)    │
│              ├── Tafsir: Localized Ibn Kathir, Al-Sa'di, Al-Muyassar   │
│              ├── Reflektion: Localized 4-Step Prompts                  │
│              └── Sammanhang: Localized Mapping & Revelation Context    │
└────────────────────────────────────────────────────────────────────────┘
```

### Files to Create / Update

1. **`src/data/localizedVerseContent.ts` (New)**:
   - Centralizes verified localized Surah meanings, revelation types (`Meccan` / `Medinan`), revelation context (`Asbab al-Nuzul`), `whyThisVerse` context explanations, and Classical Tafsir summaries (`Ibn Kathir`, `Al-Sa'di`, `Al-Muyassar`) across `sv`, `fr`, `ar`, and `en`.
2. **`src/components/VerseCard.tsx`**:
   - Uses `getLocalizedVerseDetails(verse, language)` and `getLocalizedReflection(verse.id, language)` so the header, Tafsir panel, Reflection panel, and Context panel are 100% localized.
   - Passes `language={language}` to `<AudioPlayer />`.
3. **`src/components/AudioPlayer.tsx`**:
   - Localizes `Ayah` (`Vers` in SV, `Verset` in FR, `الآية` in AR), `+ Translation`, reciter descriptions, and offline audio button labels.
4. **`src/app/page.tsx`**:
   - Removes `<GuidanceContextBanner />` from the Guidance tab.
