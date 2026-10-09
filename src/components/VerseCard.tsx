"use client";

/**
 * @file src/components/VerseCard.tsx
 * @description Calm, minimalist Quranic Verse Card with 100% localization (EN, SV, FR, AR),
 * age-adaptive companion guidance (Adult, Teen, Kids), synchronized word-by-word Arabic
 * recitation highlighting, inline Vertical Story Card (9:16) PNG export, mood-tagged
 * reflections, Arabic root imagery, and Family Halaqah circle questions—all with zero popups.
 *
 * Enforces the 4-level hierarchy:
 * - Level 1: Verified Uthmani Arabic (always visible, with live word-by-word highlight during playback)
 * - Level 2: Certified Human Translation (always visible)
 * - Level 3: Classical Tafsir (expands inline inside the card, localized)
 * - Level 4: Personal 4-Step Reflection & Age-Adaptive Companion (expands inline, clearly tagged)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Save,
  Quote,
  Download,
  Users,
  Heart,
  ShieldCheck,
  FileText,
  Video,
  Presentation,
  Printer,
  Plus,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import {
  QuranVerseFixture,
  Language,
  ExplanationDepth,
  PerspectiveMode,
  ReaderProfile,
  ReflectionMood,
  PreferredScholar,
  UserReflection,
} from '../types';
import { AudioPlayer } from './AudioPlayer';
import { StorageService } from '../services/storage';
import { ExportService } from '../services/exportService';
import { getLocalizedVerseDetails } from '../data/localizedVerseContent';
import { getLocalizedReflection } from '../data/localizedReflections';
import { getAgeAdaptiveContent } from '../data/ageAdaptiveContent';
import { ScholarProvenanceModal } from './ScholarProvenanceModal';
import { AyahCartouche } from './AyahCartouche';

interface VerseCardProps {
  verse: QuranVerseFixture;
  language: Language;
  arabicScale: number;
  readingScale?: number;
  cardIndex?: number;
  totalCards?: number;
  showTransliteration: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (verseId: string) => void;
  onReflectionSaved?: () => void;
  onOpenTafsir?: (verse: QuranVerseFixture) => void;
  onOpenReflection?: (verse: QuranVerseFixture) => void;
  onOpenHalaqah?: (verse: QuranVerseFixture) => void;
  onOpenVisualCard?: (verse: QuranVerseFixture) => void;
  sourceIndicator?: string;
  explanationDepth?: ExplanationDepth;
  perspectiveMode?: PerspectiveMode;
  readerProfile?: ReaderProfile;
  preferredScholar?: PreferredScholar;
}

type InlineSection = 'none' | 'tafsir' | 'reflection';

const MOOD_LABELS: Record<Language, Record<ReflectionMood, string>> = {
  en: {
    calm: 'Calm',
    anxious: 'Anxious',
    grateful: 'Grateful',
    hopeful: 'Hopeful',
    overwhelmed: 'Overwhelmed',
  },
  sv: {
    calm: 'Lugn',
    anxious: 'Orolig',
    grateful: 'Tacksam',
    hopeful: 'Hoppfull',
    overwhelmed: 'Överväldigad',
  },
  fr: {
    calm: 'Apaisé',
    anxious: 'Anxieux',
    grateful: 'Reconnaissant',
    hopeful: 'Plein d’espoir',
    overwhelmed: 'Submergé',
  },
  ar: {
    calm: 'مطمئن',
    anxious: 'قلق',
    grateful: 'شاكر',
    hopeful: 'متفائل',
    overwhelmed: 'مرهق',
  },
};

const UI_TEXT: Record<
  Language,
  {
    copyTooltip: string;
    storyCardTooltip: string;
    storyCardSaved: string;
    bookmarkTooltip: string;
    removeBookmarkTooltip: string;
    tafsirTab: string;
    reflectionTab: string;
    contextTab: string;
    revelationLabel: string;
    saveBtn: string;
    savedBtn: string;
    moodLabel: string;
    step1Title: string;
    step2Title: string;
    step2Placeholder: string;
    step3Title: string;
    step3Placeholder: string;
    step4Title: string;
    step4Placeholder: string;
    notSayingTitle: string;
    beforeVerse: string;
    afterVerse: string;
    rootImageryTitle: string;
    teenTakeawayTitle: string;
    teenGlossaryTitle: string;
    viewProvenanceBtn: string;
    badgeClassical: string;
    badgeAiTranslated: string;
    badgeAiSynthesis: string;
    originalArabicSnippetTitle: string;
    exportPPTX: string;
    exportPDF: string;
    reflectionNotepadTitle: string;
    reflectionNotepadHint: string;
    reflectionNotepadPlaceholder: string;
    tafsirNoDataText: string;
  }
> = {
  en: {
    copyTooltip: 'Copy verse',
    storyCardTooltip: 'Download Story Card (9:16 PNG)',
    storyCardSaved: 'Card Saved',
    bookmarkTooltip: 'Save verse to Journal',
    removeBookmarkTooltip: 'Remove from Journal',
    tafsirTab: 'Tafsir',
    reflectionTab: 'Reflection',
    contextTab: 'Context',
    revelationLabel: 'Revelation Context',
    saveBtn: 'Save to Journal',
    savedBtn: 'Saved to Journal',
    moodLabel: 'How are you feeling right now?',
    step1Title: '01. Understand',
    step2Title: '02. Reflect on Your Situation',
    step2Placeholder: 'Write your thoughts or feelings on this verse...',
    step3Title: '03. Practical Step',
    step3Placeholder: 'One concrete action or pause you will take...',
    step4Title: '04. Carry Today',
    step4Placeholder: 'One reminder to carry in your heart today...',
    notSayingTitle: 'Contextual Boundary',
    beforeVerse: 'Preceding Verse',
    afterVerse: 'Following Verse',
    rootImageryTitle: 'Arabic Root Imagery',
    teenTakeawayTitle: 'Key Takeaway for Your Day',
    teenGlossaryTitle: 'Quick Concept Guide',
    viewProvenanceBtn: 'View Original Arabic Source & Provenance',
    badgeClassical: 'Classical Scholar',
    badgeAiTranslated: 'AI Translation of Scholar Lecture',
    badgeAiSynthesis: 'AI Reflection Synthesis',
    originalArabicSnippetTitle: 'Verbatim Arabic Source Snippet',
    exportPPTX: 'Export PPTX',
    exportPDF: 'Print / PDF',
    reflectionNotepadTitle: 'Personal Reflection & Journal Note',
    reflectionNotepadHint: 'Saved locally to your private Journal',
    reflectionNotepadPlaceholder: 'Take a quiet moment to reflect. Write your thoughts, reflections, feelings, or a personal action or prayer inspired by this verse...',
    tafsirNoDataText: 'No verified classical exegesis is currently indexed in this language for this scholar. Tap View Original Arabic Source or switch scholar.',
  },
  sv: {
    copyTooltip: 'Kopiera vers',
    storyCardTooltip: 'Ladda ner Story-kort (9:16 PNG)',
    storyCardSaved: 'Kort sparat',
    bookmarkTooltip: 'Spara vers i dagbok',
    removeBookmarkTooltip: 'Ta bort från dagbok',
    tafsirTab: 'Tafsir',
    reflectionTab: 'Reflektion',
    contextTab: 'Sammanhang',
    revelationLabel: 'Uppenbarelsekontext',
    saveBtn: 'Spara i dagbok',
    savedBtn: 'Sparad!',
    moodLabel: 'Hur känner du dig just nu?',
    step1Title: '01. Förstå',
    step2Title: '02. Reflektera över din situation',
    step2Placeholder: 'Skriv dina tankar eller känslor kring denna vers...',
    step3Title: '03. Praktiskt steg',
    step3Placeholder: 'En konkret handling eller paus du tar...',
    step4Title: '04. Bär med dig idag',
    step4Placeholder: 'En påminnelse att bära med dig i vardagen...',
    notSayingTitle: 'Kontextuell gränsdragning',
    beforeVerse: 'Föregående vers',
    afterVerse: 'Efterföljande vers',
    rootImageryTitle: 'Arabiskt bildspråk & rot',
    teenTakeawayTitle: 'Viktig lärdom för din vardag',
    teenGlossaryTitle: 'Snabb ordlista',
    viewProvenanceBtn: 'Visa ursprunglig källtext & proveniens',
    badgeClassical: 'Klassisk lärd',
    badgeAiTranslated: 'AI-översättning av föreläsning',
    badgeAiSynthesis: 'AI-reflektionssyntes',
    originalArabicSnippetTitle: 'Ordagrant arabiskt källutdrag',
    exportPPTX: 'Exportera PPTX',
    exportPDF: 'Skriv ut / PDF',
    reflectionNotepadTitle: 'Personlig reflektion & anteckning',
    reflectionNotepadHint: 'Sparas lokalt i din privata dagbok',
    reflectionNotepadPlaceholder: 'Ta en stilla stund för eftertanke. Skriv dina egna tankar, känslor, en praktisk handling eller bön inspirerad av denna vers...',
    tafsirNoDataText: 'Ingen verifierad kommentar är tillgänglig för denna lärd på detta språk ännu. Klicka på Visa ursprunglig källtext eller byt lärd.',
  },
  fr: {
    copyTooltip: 'Copier le verset',
    storyCardTooltip: 'Télécharger la carte Story (9:16 PNG)',
    storyCardSaved: 'Carte enregistrée',
    bookmarkTooltip: 'Enregistrer dans le journal',
    removeBookmarkTooltip: 'Retirer du journal',
    tafsirTab: 'Tafsir',
    reflectionTab: 'Méditation',
    contextTab: 'Contexte',
    revelationLabel: 'Contexte de révélation',
    saveBtn: 'Enregistrer',
    savedBtn: 'Enregistré !',
    moodLabel: 'Comment vous sentez-vous en cet instant ?',
    step1Title: '01. Comprendre',
    step2Title: '02. Méditer sur votre situation',
    step2Placeholder: 'Notez vos pensées ou ressentis personnels...',
    step3Title: '03. Action concrète',
    step3Placeholder: 'Un geste ou temps de pause à appliquer...',
    step4Title: "04. Emporter aujourd'hui",
    step4Placeholder: 'Un rappel à garder dans votre cœur...',
    notSayingTitle: 'Limite contextuelle',
    beforeVerse: 'Verset précédent',
    afterVerse: 'Verset suivant',
    rootImageryTitle: 'Racine arabe & image littérale',
    teenTakeawayTitle: "L'essentiel pour ta journée",
    teenGlossaryTitle: 'Repères clés',
    viewProvenanceBtn: 'Consulter la source arabe originale & audit',
    badgeClassical: 'Savant classique',
    badgeAiTranslated: 'Traduction IA de conférence',
    badgeAiSynthesis: 'Synthèse de méditation IA',
    originalArabicSnippetTitle: 'Extrait arabe original textuel',
    exportPPTX: 'Exporter PPTX',
    exportPDF: 'Imprimer / PDF',
    reflectionNotepadTitle: 'Méditation personnelle & journal',
    reflectionNotepadHint: 'Enregistré localement dans votre journal',
    reflectionNotepadPlaceholder: 'Prenez un instant de recueillement. Notez vos pensées, ressentis, résolutions personnelles ou invocations inspirées de ce verset...',
    tafsirNoDataText: 'Aucun commentaire vérifié n’est actuellement indexé dans cette langue pour ce savant. Consultez la source arabe originale ou changez d’exégète.',
  },
  ar: {
    copyTooltip: 'نسخ الآية',
    storyCardTooltip: 'تحميل بطاقة القصة (9:16 PNG)',
    storyCardSaved: 'تم الحفظ',
    bookmarkTooltip: 'حفظ في اليوميات',
    removeBookmarkTooltip: 'إزالة من اليوميات',
    tafsirTab: 'التفسير',
    reflectionTab: 'التدبر',
    contextTab: 'السياق',
    revelationLabel: 'سبب النزول والسياق',
    saveBtn: 'حفظ في اليوميات',
    savedBtn: 'تم الحفظ',
    moodLabel: 'بماذا يشعر قلبك الآن؟',
    step1Title: '٠١. الفهم والتأمل',
    step2Title: '٠٢. إسقاط الآية على واقعك',
    step2Placeholder: 'اكتب خواطرك ومشاعرك حول هذه الآية...',
    step3Title: '٠٣. الخطوة العملية',
    step3Placeholder: 'عمل محدد أو وقفة هادئة ستلتزم بها...',
    step4Title: '٠٤. أثر تحمله اليوم',
    step4Placeholder: 'معنى تحمله في قلبك طوال يومك...',
    notSayingTitle: 'تنبيه وضبط سياقي',
    beforeVerse: 'الآية السابقة',
    afterVerse: 'الآية اللاحقة',
    rootImageryTitle: 'الصورة اللغوية والجذر',
    teenTakeawayTitle: 'خلاصة مُلهمة ليومك',
    teenGlossaryTitle: 'دليل المفاهيم السريع',
    viewProvenanceBtn: 'عرض النص العربي الأصلي وتوثيق المصدر',
    badgeClassical: 'عالم كلاسيكي موثق',
    badgeAiTranslated: 'ترجمة آلية لمحاضرة عالم',
    badgeAiSynthesis: 'صياغة تدبرية بالذكاء الاصطناعي',
    originalArabicSnippetTitle: 'النص العربي المنقول بلفظه',
    exportPPTX: 'تصدير عارض (PPTX)',
    exportPDF: 'طباعة / PDF',
    reflectionNotepadTitle: 'خواطر التدبر وتدوين اليوميات',
    reflectionNotepadHint: 'تُحفظ محلياً في يومياتك الخاصة',
    reflectionNotepadPlaceholder: 'وقفة تدبر ومحاسبة هادئة... سجّل خواطرك ومشاعرك، عهداً تقطعه على نفسك، أو دعاءً يفيض به قلبك مستوحى من هذه الآية الكريمة...',
    tafsirNoDataText: 'لا يتوفر نص تفسيري موثق لهذا المفسر بهذه اللغة حالياً. انقر على عرض النص العربي الأصلي أو اختر مفسراً آخر.',
  },
};

export const VerseCard: React.FC<VerseCardProps> = ({
  verse,
  language,
  arabicScale,
  readingScale = 1.0,
  cardIndex,
  totalCards,
  showTransliteration,
  isBookmarked,
  onToggleBookmark,
  onReflectionSaved,
  readerProfile = 'adult',
  preferredScholar = 'Ibn Kathir',
}) => {
  const [activeSection, setActiveSection] = useState<InlineSection>('none');
  const [copied, setCopied] = useState(false);
  const [storyExported, setStoryExported] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Optional inclusion of adjacent preceding/following single verse when needed for context
  const [includeBefore, setIncludeBefore] = useState(false);
  const [includeAfter, setIncludeAfter] = useState(false);

  // Word-by-word recitation & translation sync state
  const [playbackRatio, setPlaybackRatio] = useState(0);
  const [isReciting, setIsReciting] = useState(false);
  const [playbackPhase, setPlaybackPhase] = useState<'recitation' | 'translation' | 'idle'>('idle');

  // Preferred scholar & provenance modal state
  const [selectedScholar, setSelectedScholar] = useState<string>(preferredScholar);
  const [provenanceModalOpen, setProvenanceModalOpen] = useState(false);

  useEffect(() => {
    if (preferredScholar) {
      setSelectedScholar(preferredScholar);
    }
  }, [preferredScholar]);

  // Personal reflection note (stored locally in browser)
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [selectedMood, setSelectedMood] = useState<ReflectionMood | undefined>(undefined);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);

  const t = UI_TEXT[language] || UI_TEXT.en;
  const moodDict = MOOD_LABELS[language] || MOOD_LABELS.en;
  const localizedDetails = getLocalizedVerseDetails(verse, language);
  const ageBundle = useMemo(() => getAgeAdaptiveContent(verse, language), [verse, language]);

  // Count how many consecutive verses are already in the base fixture (e.g. "134" = 1, "5-6" = 2, "3-5" = 3)
  const baseRangeBounds = useMemo(() => {
    const parts = verse.verseNumber.split('-').map((s) => parseInt(s.trim(), 10));
    const start = !isNaN(parts[0]) ? parts[0] : 1;
    const end = parts.length > 1 && !isNaN(parts[1]) ? Math.min(parts[1], start + 2) : start;
    return { start, end, count: end - start + 1 };
  }, [verse.verseNumber]);

  const canAddBefore = useMemo(() => {
    return Boolean(verse.surroundingVerses?.before);
  }, [verse.surroundingVerses]);

  const canAddAfter = useMemo(() => {
    return Boolean(verse.surroundingVerses?.after);
  }, [verse.surroundingVerses]);

  const effectiveStartVerse =
    includeBefore && canAddBefore && verse.surroundingVerses?.before
      ? verse.surroundingVerses.before.verseNumber
      : String(baseRangeBounds.start);
  const effectiveEndVerse =
    includeAfter && canAddAfter && verse.surroundingVerses?.after
      ? verse.surroundingVerses.after.verseNumber
      : String(baseRangeBounds.end);

  const effectiveVerseNumberStr =
    effectiveStartVerse === effectiveEndVerse
      ? String(effectiveStartVerse)
      : `${effectiveStartVerse}-${effectiveEndVerse}`;

  const effectiveVerseId = `${verse.surahNumber}:${effectiveVerseNumberStr}`;
  const availableCitations = localizedDetails.tafsirCitations;

  // Level 2 Human Translation object: Strictly distinct from Tafsir to prevent duplicate text
  const baseTranslationObj = useMemo(() => {
    if (language === 'ar') {
      const arTrans = verse.translations.ar?.text?.trim();
      // In Arabic, if no distinct translation exists or if it duplicates Arabic text/Tafsir, omit Level 2
      const isDuplicateOfQuranOrTafsir =
        !arTrans ||
        arTrans === verse.arabicText.trim() ||
        availableCitations.some((c) => c.text?.trim() === arTrans);

      if (isDuplicateOfQuranOrTafsir) {
        return null;
      }
      return {
        text: arTrans,
        translator: verse.translations.ar?.translator || 'بيان المعاني',
      };
    }

    const currentTrans = verse.translations[language];
    if (currentTrans?.text && currentTrans.text.trim().length > 0) {
      const transTrim = currentTrans.text.trim();
      // Verify not equal to Quranic Arabic or Tafsir text
      if (
        transTrim !== verse.arabicText.trim() &&
        !availableCitations.some((c) => c.text?.trim() === transTrim)
      ) {
        return currentTrans;
      }
    }

    // Only fall back to English if requested language is not available and English is distinct
    if (language !== 'en' && verse.translations.en?.text) {
      const enTrim = verse.translations.en.text.trim();
      if (
        enTrim.length > 0 &&
        enTrim !== verse.arabicText.trim() &&
        !availableCitations.some((c) => c.text?.trim() === enTrim)
      ) {
        return verse.translations.en;
      }
    }

    return null;
  }, [language, verse.translations, verse.arabicText, availableCitations]);

  // Build structured Arabic segments (up to 3 consecutive verses) with their exact Ayah numbers
  const arabicSegments = useMemo(() => {
    const cleanText = (str: string) =>
      str
        .replace(/[\u06DD\u06DE]/g, '')
        .replace(/[\u0660-\u0669]+/g, '')
        .trim();

    const segments: { verseNumber: string; text: string }[] = [];

    const pushParsedSegments = (rawText: string, vNumStr: string) => {
      const subParts = rawText
        .split('۝')
        .map((s) => cleanText(s))
        .filter(Boolean);
      const rangeMatch = vNumStr.match(/^(\d+)\s*-\s*(\d+)$/);
      const startNum = rangeMatch ? parseInt(rangeMatch[1], 10) : parseInt(vNumStr, 10);

      if (subParts.length > 1 && !isNaN(startNum)) {
        subParts.forEach((part, idx) => {
          segments.push({
            verseNumber: String(startNum + idx),
            text: part,
          });
        });
      } else {
        segments.push({
          verseNumber: vNumStr,
          text: subParts.join(' ') || cleanText(rawText),
        });
      }
    };

    if (includeBefore && canAddBefore && verse.surroundingVerses?.before) {
      pushParsedSegments(
        verse.surroundingVerses.before.arabicText,
        verse.surroundingVerses.before.verseNumber
      );
    }

    pushParsedSegments(verse.arabicText, verse.verseNumber);

    if (includeAfter && canAddAfter && verse.surroundingVerses?.after) {
      pushParsedSegments(
        verse.surroundingVerses.after.arabicText,
        verse.surroundingVerses.after.verseNumber
      );
    }

    return segments;
  }, [verse, includeBefore, canAddBefore, includeAfter, canAddAfter]);

  const combinedArabicText = useMemo(() => {
    return arabicSegments.map((s) => `${s.text} ﴿${s.verseNumber}﴾`).join(' ');
  }, [arabicSegments]);

  const combinedTranslationText = useMemo(() => {
    if (!baseTranslationObj) return '';
    const parts: string[] = [];
    if (includeBefore && canAddBefore && verse.surroundingVerses?.before) {
      const bTrans =
        verse.surroundingVerses.before.translations[language] ||
        verse.surroundingVerses.before.translations.en;
      if (bTrans) parts.push(bTrans);
    }
    parts.push(baseTranslationObj.text);
    if (includeAfter && canAddAfter && verse.surroundingVerses?.after) {
      const aTrans =
        verse.surroundingVerses.after.translations[language] ||
        verse.surroundingVerses.after.translations.en;
      if (aTrans) parts.push(aTrans);
    }
    return parts.join(' ');
  }, [verse, language, baseTranslationObj, includeBefore, canAddBefore, includeAfter, canAddAfter]);

  const translationObj = baseTranslationObj
    ? {
        text: combinedTranslationText,
        translator: baseTranslationObj.translator,
      }
    : null;

  // Tokenize Uthmani Arabic segments into words with global indices for synchronized word-by-word reading highlight
  const { tokenizedArabicSegments, totalArabicWordsCount } = useMemo(() => {
    let globalIndex = 0;
    const tokenized = arabicSegments.map((seg) => {
      const words = seg.text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => ({
          word,
          globalIdx: globalIndex++,
        }));
      return {
        verseNumber: seg.verseNumber,
        words,
      };
    });
    return { tokenizedArabicSegments: tokenized, totalArabicWordsCount: globalIndex };
  }, [arabicSegments]);

  // Split Translation into words for synchronized word-by-word highlight when translation voiceover plays
  const translationWords = useMemo(
    () => (translationObj?.text || '').trim().split(/\s+/).filter(Boolean),
    [translationObj?.text]
  );

  const activeWordIndex = useMemo(() => {
    if (!isReciting || playbackPhase !== 'recitation' || totalArabicWordsCount === 0) return -1;
    const idx = Math.floor(playbackRatio * totalArabicWordsCount);
    return Math.min(totalArabicWordsCount - 1, Math.max(0, idx));
  }, [isReciting, playbackPhase, playbackRatio, totalArabicWordsCount]);

  const activeTranslationWordIndex = useMemo(() => {
    if (!isReciting || playbackPhase !== 'translation' || translationWords.length === 0) return -1;
    const idx = Math.floor(playbackRatio * translationWords.length);
    return Math.min(translationWords.length - 1, Math.max(0, idx));
  }, [isReciting, playbackPhase, playbackRatio, translationWords.length]);

  useEffect(() => {
    setIncludeBefore(false);
    setIncludeAfter(false);
    const saved = StorageService.getReflection(verse.id);
    if (saved) {
      const combined = [saved.reflectNotes, saved.applyNotes, saved.liveNotes]
        .filter(Boolean)
        .join('\n\n');
      setReflectionNotes(combined);
      setSelectedMood(saved.mood);
    } else {
      setReflectionNotes('');
      setSelectedMood(undefined);
    }
  }, [verse.id]);

  const handleCopy = () => {
    const translationPortion = translationObj?.text
      ? `\n\n"${translationObj.text}"\n— ${translationObj.translator}`
      : '';
    const textToCopy = `${verse.arabicText}${translationPortion}\n— ${localizedDetails.surahPrefix} ${localizedDetails.surahNameDisplay} (${verse.id})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Generates a 9:16 Vertical Story Card (1080x1920 PNG) for Instagram/TikTok/WhatsApp sharing
   * directly from the card header without opening a modal popup.
   */
  const handleDownloadStoryCard = () => {
    try {
      const canvas = document.createElement('canvas');
      const width = 1080;
      const height = 1920;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Deep sanctuary emerald background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#06281E');
      grad.addColorStop(0.5, '#0A1E17');
      grad.addColorStop(1, '#04120D');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle architectural frame
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
      ctx.lineWidth = 3;
      ctx.strokeRect(64, 64, width - 128, height - 128);

      // Top header kicker
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HIDAYA · هِدَايَة', width / 2, 170);

      ctx.fillStyle = '#A7F3D0';
      ctx.font = '600 34px sans-serif';
      ctx.fillText(
        `${localizedDetails.surahPrefix} ${localizedDetails.surahNameDisplay} (${verse.id})`,
        width / 2,
        235
      );

      // Wrap Arabic text in center
      ctx.fillStyle = '#FFFBEB';
      ctx.font = '52px serif';
      const wrapText = (text: string, maxWidth: number) => {
        const words = text.split(' ');
        const lines: string[] = [];
        let current = '';
        for (const w of words) {
          const test = current ? `${current} ${w}` : w;
          if (ctx.measureText(test).width > maxWidth && current) {
            lines.push(current);
            current = w;
          } else {
            current = test;
          }
        }
        if (current) lines.push(current);
        return lines;
      };

      const arabicLines = wrapText(verse.arabicText, width - 220).slice(0, 8);
      let y = 440;
      for (const line of arabicLines) {
        ctx.fillText(line, width / 2, y);
        y += 84;
      }

      // Divider
      y += 30;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 140, y);
      ctx.lineTo(width / 2 + 140, y);
      ctx.stroke();

      // Translation text if available
      if (translationObj && translationObj.text.trim().length > 0) {
        y += 80;
        ctx.fillStyle = '#ECFDF5';
        ctx.font = 'italic 36px sans-serif';
        const transLines = wrapText(`"${translationObj.text}"`, width - 220).slice(0, 10);
        for (const line of transLines) {
          ctx.fillText(line, width / 2, y);
          y += 56;
        }

        // Translator attribution
        y += 24;
        ctx.fillStyle = '#6EE7B7';
        ctx.font = '500 28px sans-serif';
        ctx.fillText(`— ${translationObj.translator}`, width / 2, y);
      }

      // Footer
      ctx.fillStyle = 'rgba(255, 251, 235, 0.6)';
      ctx.font = '26px sans-serif';
      ctx.fillText('Verified Uthmani Script · Hidaya Waqf', width / 2, height - 120);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `hidaya-story-${verse.id.replace(':', '-')}.png`;
      link.href = dataUrl;
      link.click();

      setStoryExported(true);
      setTimeout(() => setStoryExported(false), 2200);
    } catch (err) {
      console.warn('Story card export failed:', err);
    }
  };

  const handleSaveReflection = () => {
    StorageService.saveReflection(verse.id, {
      verseId: verse.id,
      understandNotes: '',
      reflectNotes: reflectionNotes,
      applyNotes: '',
      liveNotes: '',
      mood: selectedMood,
    });
    StorageService.recordDailyVisit();
    if (!isBookmarked) {
      onToggleBookmark(verse.id);
    }
    setIsSaved(true);
    onReflectionSaved?.();
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportPPTX = async () => {
    setIsExportingPPTX(true);
    try {
      const reflectionPayload: UserReflection = {
        verseId: verse.id,
        date: new Date().toISOString(),
        understandNotes: '',
        reflectNotes: reflectionNotes,
        applyNotes: '',
        liveNotes: '',
        mood: selectedMood,
      };
      await ExportService.exportToPPTX(verse, language, reflectionPayload);
    } catch (err) {
      console.error('Failed to export PPTX:', err);
    } finally {
      setIsExportingPPTX(false);
    }
  };

  const toggleSection = (section: InlineSection) => {
    setActiveSection((prev) => (prev === section ? 'none' : section));
  };

  const notSayingText =
    verse.notSaying?.[language] ||
    verse.notSaying?.en ||
    (language === 'sv'
      ? 'Denna vers bör läsas i sitt historiska och tematiska sammanhang och inte ryckas lös ur sin kontext.'
      : language === 'fr'
      ? 'Ce passage doit être compris dans son contexte global et historique.'
      : language === 'ar'
      ? 'تُفهم هذه الآية الكريمة في ضوء سياقها القرآني العام ومقاصد الشريعة.'
      : 'Read this passage within its broader Quranic context and scholarly tradition.');

  const hasSavedNotes = Boolean(reflectionNotes.trim());
  const currentCitation = useMemo(() => {
    if (!availableCitations || availableCitations.length === 0) return null;
    const match = availableCitations.find(
      (c) => c.scholar.toLowerCase() === selectedScholar.toLowerCase()
    );
    return match || availableCitations[0];
  }, [availableCitations, selectedScholar]);

  // Trusted Tafsir text audit check: ensure commentary text is genuine and not duplicated from Quran or Translation
  const isTrustedTafsirText = useMemo(() => {
    if (!currentCitation?.text) return false;
    const tafsirTrimmed = currentCitation.text.trim();
    if (tafsirTrimmed.length === 0) return false;
    // Check if duplicate of Quranic text
    if (tafsirTrimmed === verse.arabicText.trim()) return false;
    // Check if duplicate of active human translation
    if (translationObj?.text && tafsirTrimmed === translationObj.text.trim()) return false;
    // Check if duplicate of any raw translation in the fixture
    for (const trans of Object.values(verse.translations)) {
      if (trans?.text && tafsirTrimmed === trans.text.trim()) return false;
    }
    return true;
  }, [currentCitation, verse.arabicText, verse.translations, translationObj]);

  const rootItem = ageBundle.defaultRoot;

  return (
    <article
      className="bg-white dark:bg-[#0A1E17] rounded-3xl border border-emerald-900/10 dark:border-emerald-800/35 shadow-xs overflow-hidden transition-colors"
      aria-labelledby={`verse-heading-${verse.id}`}
    >
      {/* Clean Unboxed Header Row (100% Localized) */}
      <div className="px-5 sm:px-7 py-4 border-b border-slate-100 dark:border-emerald-900/30 flex items-center justify-between gap-3">
        <div>
          <h2
            id={`verse-heading-${verse.id}`}
            className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-50 flex items-center gap-2 flex-wrap"
          >
            {/* Chosen Ayah Number at the start inside the circular symbol without duplication */}
            <AyahCartouche
              number={effectiveVerseNumberStr}
              size="md"
              className="text-amber-700 dark:text-amber-400"
            />
            <span>
              {localizedDetails.surahPrefix} {localizedDetails.surahNameDisplay}
            </span>
            {totalCards !== undefined && totalCards > 1 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-900/10 dark:bg-emerald-400/15 text-emerald-800 dark:text-emerald-300 font-semibold">
                #{cardIndex !== undefined ? cardIndex + 1 : 1} of {totalCards}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>{localizedDetails.surahMeaning}</span>
            <span className="mx-1.5" aria-hidden="true">
              ·
            </span>
            <span>{localizedDetails.revelationTypeDisplay}</span>
            <span className="mx-1.5" aria-hidden="true">
              ·
            </span>
            <span className="tabular-nums">{localizedDetails.juzDisplay}</span>
          </p>
        </div>

        {/* Minimalist 3-Action Bar: Story Card PNG, Copy & Bookmark */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleDownloadStoryCard}
            className="min-h-[40px] min-w-[40px] p-2 rounded-xl text-slate-500 hover:text-emerald-800 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-900/5 transition-colors flex items-center justify-center cursor-pointer"
            title={storyExported ? t.storyCardSaved : t.storyCardTooltip}
            aria-label={t.storyCardTooltip}
          >
            {storyExported ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[40px] min-w-[40px] p-2 rounded-xl text-slate-500 hover:text-emerald-800 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-900/5 transition-colors flex items-center justify-center cursor-pointer"
            title={t.copyTooltip}
            aria-label={t.copyTooltip}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => onToggleBookmark(verse.id)}
            className={`min-h-[40px] min-w-[40px] p-2 rounded-xl transition-colors flex items-center justify-center cursor-pointer ${
              isBookmarked
                ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'text-slate-500 hover:text-emerald-800 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-900/5'
            }`}
            title={isBookmarked ? t.removeBookmarkTooltip : t.bookmarkTooltip}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? t.removeBookmarkTooltip : t.bookmarkTooltip}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 fill-current" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-5 sm:p-7 space-y-5">
        {/* Adjacent Verses Flow Controller (Ornate Quranic Ayah Cartouches with directional indicators) */}
        {(canAddBefore || canAddAfter || includeBefore || includeAfter) && (
          <div className="flex flex-wrap items-center gap-2 pt-0.5 pb-0.5">
            {canAddBefore && (
              <button
                type="button"
                onClick={() => setIncludeBefore((prev) => !prev)}
                title={
                  includeBefore
                    ? `${t.beforeVerse} (${verse.surroundingVerses?.before?.verseNumber}) — Click to remove`
                    : `${t.beforeVerse} (${verse.surroundingVerses?.before?.verseNumber}) — Click to add to reading`
                }
                aria-label={`${t.beforeVerse} (${verse.surroundingVerses?.before?.verseNumber})`}
                aria-pressed={includeBefore}
                className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs ${
                  includeBefore
                    ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-700 dark:border-emerald-600 shadow-xs ring-1 ring-emerald-500/40'
                    : 'bg-[#FAF8F5] dark:bg-emerald-950/40 border-emerald-900/15 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-900/10 dark:hover:bg-emerald-900/40 hover:border-emerald-600/50 hover:scale-[1.03]'
                }`}
              >
                {/* Arrow and Sign indicator badge */}
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                    includeBefore
                      ? 'text-amber-300 dark:text-amber-200'
                      : 'text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
                  {includeBefore ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  )}
                </span>

                {/* Ornate Quranic Ayah Cartouche with the Verse Number Inside */}
                <AyahCartouche
                  number={verse.surroundingVerses?.before?.verseNumber || ''}
                  active={includeBefore}
                  size="md"
                />
              </button>
            )}

            {(canAddAfter || includeAfter) && (
              <button
                type="button"
                onClick={() => setIncludeAfter((prev) => !prev)}
                title={
                  includeAfter
                    ? `${t.afterVerse} (${verse.surroundingVerses?.after?.verseNumber}) — Click to remove`
                    : `${t.afterVerse} (${verse.surroundingVerses?.after?.verseNumber}) — Click to add to reading`
                }
                aria-label={`${t.afterVerse} (${verse.surroundingVerses?.after?.verseNumber})`}
                aria-pressed={includeAfter}
                className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs ${
                  includeAfter
                    ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-700 dark:border-emerald-600 shadow-xs ring-1 ring-emerald-500/40'
                    : 'bg-[#FAF8F5] dark:bg-emerald-950/40 border-emerald-900/15 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-900/10 dark:hover:bg-emerald-900/40 hover:border-emerald-600/50 hover:scale-[1.03]'
                }`}
              >
                {/* Ornate Quranic Ayah Cartouche with the Verse Number Inside */}
                <AyahCartouche
                  number={verse.surroundingVerses?.after?.verseNumber || ''}
                  active={includeAfter}
                  size="md"
                />

                {/* Sign and Arrow indicator badge */}
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                    includeAfter
                      ? 'text-amber-300 dark:text-amber-200'
                      : 'text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  {includeAfter ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  )}
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </span>
              </button>
            )}
          </div>
        )}

        {/* LEVEL 1: Original Verified Quranic Arabic (Uthmani Script) with Word-by-Word Recitation Sync & Circular Ayah Symbols */}
        <section aria-label="Level 1: Verified Uthmani Arabic">
          <div
            className="p-5 sm:p-7 rounded-2xl bg-[#FAF8F5] dark:bg-[#071711] border border-emerald-900/10 dark:border-emerald-800/30"
            style={{
              fontSize: `${Math.round(26 * (readerProfile === 'kids' ? Math.max(arabicScale, 1.3) : arabicScale))}px`,
              lineHeight: 2.15,
            }}
          >
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-right text-emerald-950 dark:text-emerald-50 select-text antialiased font-normal"
            >
              {tokenizedArabicSegments.map((seg, segIdx) => (
                <React.Fragment key={segIdx}>
                  {seg.words.map(({ word, globalIdx }) => {
                    const isWordActive = globalIdx === activeWordIndex;
                    return (
                      <React.Fragment key={globalIdx}>
                        <span
                          className={`inline-block rounded-lg px-0.5 transition-colors duration-150 ${
                            isWordActive
                              ? 'bg-amber-400/35 dark:bg-amber-400/30 text-emerald-950 dark:text-amber-200 underline decoration-amber-500 decoration-2 underline-offset-8'
                              : ''
                          }`}
                        >
                          {word}
                        </span>{' '}
                      </React.Fragment>
                    );
                  })}
                  <span className="inline-flex items-center align-middle mx-1 text-amber-700 dark:text-amber-400 select-none">
                    <AyahCartouche number={seg.verseNumber} size="inline" />
                  </span>{' '}
                </React.Fragment>
              ))}
            </p>
          </div>

          {showTransliteration && verse.transliteration && (
            <p className="mt-2.5 px-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed">
              {verse.transliteration}
            </p>
          )}
        </section>

        {/* LEVEL 2: Certified Human Translation with Word-by-Word Highlighting when Spoken */}
        {translationObj && translationObj.text.trim().length > 0 && (
          <section aria-label="Level 2: Certified Translation" className="space-y-1.5">
            <blockquote
              style={{ fontSize: `${readingScale * 1.125}rem` }}
              className="text-slate-800 dark:text-slate-100 leading-relaxed font-serif"
            >
              &ldquo;
              {translationWords.map((word, idx) => {
                const isWordActive = idx === activeTranslationWordIndex;
                return (
                  <React.Fragment key={idx}>
                    <span
                      className={`inline-block rounded-md px-0.5 transition-colors duration-150 ${
                        isWordActive
                          ? 'bg-amber-400/35 dark:bg-amber-400/30 text-emerald-950 dark:text-amber-200 underline decoration-amber-500 decoration-2 underline-offset-4'
                          : ''
                      }`}
                    >
                      {word}
                    </span>{' '}
                  </React.Fragment>
                );
              })}
              &rdquo;
            </blockquote>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              — {translationObj.translator}
            </p>
          </section>
        )}

        {/* LEVEL 4 (Kids & Family Companion): Simple Story & Family Question when Kids Mode is active */}
        {readerProfile === 'kids' && (
          <section
            aria-label="Level 4: Kids & Family Story Companion"
            className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-emerald-950/40 border border-amber-500/25 dark:border-amber-500/20 space-y-3"
          >
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{ageBundle.kids.title}</span>
              </h3>
              <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
                {ageBundle.kids.storyText}
              </p>
            </div>

            <div className="pt-2.5 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  {ageBundle.kids.familyQuestionTitle}
                </span>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  {ageBundle.kids.familyQuestion}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-300 block">
                  {ageBundle.kids.tryTodayLabel}
                </span>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  {ageBundle.kids.tryTodayAction}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* LEVEL 4 (Teen Companion): Concise Takeaway & Root Snapshot when Teen Mode is active */}
        {readerProfile === 'teen' && (
          <section
            aria-label="Level 4: Teen Key Takeaway"
            className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/35 border border-emerald-900/10 dark:border-emerald-800/35 space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <span>{t.teenTakeawayTitle}</span>
              <span className="font-arabic text-sm text-amber-700 dark:text-amber-400">
                {rootItem.termArabic} · {rootItem.root}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {ageBundle.teenKeyTakeaway}
            </p>
          </section>
        )}

        {/* Inline Audio Player with Consecutive Range Playback & Word-by-Word Progress Callback */}
        <div className="pt-1">
          <AudioPlayer
            audioUrl={verse.audioUrl}
            surahNumber={verse.surahNumber}
            verseNumber={effectiveVerseNumberStr}
            surahVerseId={effectiveVerseId}
            ayahId={verse.id}
            translationText={translationObj?.text || ''}
            tafsirText={currentCitation?.text || ''}
            language={language}
            onPlaybackProgress={(ratio, playing, phase) => {
              setPlaybackRatio(ratio);
              setIsReciting(playing);
              setPlaybackPhase(phase === 'tafsir' ? 'idle' : phase || (playing ? 'recitation' : 'idle'));
            }}
          />
        </div>

        {/* Single-Row 2-Segment Inline Disclosure Bar (Tafsir · Reflection) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/60 border border-emerald-900/10 dark:border-emerald-800/40">
          {/* Level 3: Inline Classical Tafsir Toggle */}
          <button
            type="button"
            onClick={() => toggleSection('tafsir')}
            aria-expanded={activeSection === 'tafsir'}
            className={`min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap truncate ${
              activeSection === 'tafsir'
                ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs'
                : 'text-emerald-900 dark:text-emerald-200 hover:bg-emerald-900/10 dark:hover:bg-emerald-900/30'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.tafsirTab}</span>
            {activeSection === 'tafsir' ? (
              <ChevronUp className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
            )}
          </button>

          {/* Level 4: Inline Personal Reflection Toggle */}
          <button
            type="button"
            onClick={() => toggleSection('reflection')}
            aria-expanded={activeSection === 'reflection'}
            className={`min-h-[42px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap truncate ${
              activeSection === 'reflection'
                ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs'
                : 'text-emerald-900 dark:text-emerald-200 hover:bg-emerald-900/10 dark:hover:bg-emerald-900/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span className="truncate">{t.reflectionTab}</span>
            {hasSavedNotes && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Saved notes" />
            )}
            {activeSection === 'reflection' ? (
              <ChevronUp className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
            )}
          </button>
        </div>

        {/* INLINE PANEL 1: LEVEL 3 CLASSICAL & EXPERT TAFSIR WITH PROVENANCE AUDIT */}
        {activeSection === 'tafsir' && (
          <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 space-y-4">
            {/* Interactive Scholar Selector Bar (Segmented Control) */}
            {availableCitations.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-emerald-950/5 dark:bg-emerald-950/60 border border-emerald-900/10 dark:border-emerald-800/40 text-xs">
                {availableCitations.map((c) => {
                  const isActive = currentCitation?.scholar.toLowerCase() === c.scholar.toLowerCase();
                  const isAiLecture =
                    c.sourceType === 'ai_translated_expert' ||
                    c.sourceType === 'expert_transcription';
                  return (
                    <button
                      key={c.scholar}
                      type="button"
                      onClick={() => setSelectedScholar(c.scholar)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-white dark:bg-emerald-800 text-emerald-950 dark:text-emerald-50 shadow-2xs font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100 hover:bg-white/40 dark:hover:bg-emerald-900/30'
                      }`}
                    >
                      {isAiLecture && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                          title="Transcribed Lecture"
                        />
                      )}
                      <span>{c.scholar}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentCitation && isTrustedTafsirText ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/30 space-y-3.5 shadow-2xs">
                {/* Header: Scholar info + Provenance Badge + View Original Source Trigger */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-emerald-900/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                        {currentCitation.scholar}
                      </h3>
                      <span className="text-slate-400" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {currentCitation.sourceBook}{' '}
                        {currentCitation.century ? `(${currentCitation.century})` : ''}
                      </span>
                    </div>

                    {/* 3-Tier Classification Provenance Badge */}
                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      {currentCitation.sourceType === 'ai_translated_expert' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/35">
                          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>{t.badgeAiTranslated}</span>
                        </span>
                      ) : currentCitation.sourceType === 'ai_synthesis' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/15 text-purple-900 dark:text-purple-200 border border-purple-500/35">
                          <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>{t.badgeAiSynthesis}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{t.badgeClassical}</span>
                        </span>
                      )}

                      {currentCitation.sourceReference && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline truncate max-w-xs font-mono">
                          · {currentCitation.sourceReference.split(',')[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* "View Original Arabic Source" Drawer/Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => setProvenanceModalOpen(true)}
                    className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-[#FAF8F5] dark:bg-emerald-900/30 border border-emerald-900/15 dark:border-emerald-700/40 hover:bg-emerald-800 hover:text-white dark:hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer shrink-0"
                    title={t.viewProvenanceBtn}
                    aria-label={t.viewProvenanceBtn}
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{t.viewProvenanceBtn}</span>
                  </button>
                </div>

                {/* Verbatim Arabic Quote Excerpt Preview (Only if originalArabicRaw is distinct from currentCitation.text and viewing in EN/SV/FR) */}
                {currentCitation.originalArabicRaw &&
                  language !== 'ar' &&
                  currentCitation.originalArabicRaw.trim() !== currentCitation.text.trim() && (
                    <div
                      dir="rtl"
                      className="p-3 rounded-xl bg-amber-500/5 dark:bg-black/20 border border-amber-600/15 dark:border-emerald-800/30 text-right"
                    >
                      <p className="font-arabic text-sm text-slate-800 dark:text-amber-50 leading-loose line-clamp-2 select-text">
                        &ldquo;{currentCitation.originalArabicRaw}&rdquo;
                      </p>
                    </div>
                  )}

                {/* Commentary Text (Preserves verbatim Arabic RTL for Quranpedia Book 18 or localized commentary) */}
                <p
                  dir={
                    /[\u0600-\u06FF]/.test(currentCitation.text.slice(0, 80)) ? 'rtl' : undefined
                  }
                  style={{ fontSize: `${readingScale * 0.95}rem` }}
                  className={`leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line ${
                    /[\u0600-\u06FF]/.test(currentCitation.text.slice(0, 80))
                      ? 'font-arabic text-right leading-loose'
                      : ''
                  }`}
                >
                  {currentCitation.text}
                </p>

                {/* AI Model Attribution Disclaimer if AI-translated */}
                {currentCitation.translationDisclaimer && (
                  <p className="text-[11px] text-amber-900/70 dark:text-amber-300/70 italic pt-1">
                    * {currentCitation.translationDisclaimer}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 dark:bg-emerald-950/20 border border-amber-900/10 dark:border-emerald-800/20 text-center space-y-2.5">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {t.tafsirNoDataText}
                </p>
                <button
                  type="button"
                  onClick={() => setProvenanceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-white dark:bg-emerald-900/40 border border-emerald-900/15 dark:border-emerald-700/40 hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{t.viewProvenanceBtn}</span>
                </button>
              </div>
            )}

            {/* Teen-Friendly Concept Glossary when Teen or Kids profile is active */}
            {readerProfile !== 'adult' && (
              <div className="pt-3 border-t border-emerald-900/10 dark:border-emerald-800/30 space-y-2">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                  {t.teenGlossaryTitle}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {ageBundle.teenGlossary.map((item) => (
                    <div
                      key={item.term}
                      className="p-2.5 rounded-xl bg-white dark:bg-emerald-950/50 border border-emerald-900/10 dark:border-emerald-800/30"
                    >
                      <span className="font-bold text-emerald-950 dark:text-emerald-200 block">
                        {item.term}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">{item.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* INLINE PANEL 2: LEVEL 4 PERSONAL REFLECTION WITH MOOD TAGS (100% Localized) */}
        {activeSection === 'reflection' && (
          <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 space-y-4">
            {/* Mood Selector for Journal Filtering */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
                {t.moodLabel}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['calm', 'hopeful', 'grateful', 'anxious', 'overwhelmed'] as ReflectionMood[]).map(
                  (m) => {
                    const active = selectedMood === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMood(active ? undefined : m)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          active
                            ? 'bg-emerald-800 text-white dark:bg-emerald-700'
                            : 'bg-white dark:bg-emerald-950/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-emerald-800/40 hover:border-emerald-600'
                        }`}
                      >
                        {moodDict[m]}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Clean Personal Reflection Note & Journal Command Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={`reflection-notes-${verse.id}`}
                  className="block text-xs font-bold text-emerald-900 dark:text-emerald-300"
                >
                  {t.reflectionNotepadTitle}
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.reflectionNotepadHint}
                </span>
              </div>

              <textarea
                id={`reflection-notes-${verse.id}`}
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder={t.reflectionNotepadPlaceholder}
                rows={5}
                style={{ fontSize: `${readingScale * 0.9}rem` }}
                className="w-full p-3.5 leading-relaxed rounded-2xl bg-white dark:bg-emerald-950/50 border border-slate-200 dark:border-emerald-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-slate-400 dark:placeholder:text-emerald-300/40 text-slate-800 dark:text-slate-100 resize-y"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-emerald-800/40">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportPPTX}
                  disabled={isExportingPPTX}
                  className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-900/5 dark:bg-emerald-950/60 border border-emerald-900/10 dark:border-emerald-800/40 hover:bg-emerald-900/10 transition-colors cursor-pointer disabled:opacity-50"
                  title={t.exportPPTX}
                  aria-label={t.exportPPTX}
                >
                  <Presentation className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{isExportingPPTX ? '...' : t.exportPPTX}</span>
                </button>
                <button
                  type="button"
                  onClick={() => ExportService.exportToPDF()}
                  className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-emerald-900/5 dark:bg-emerald-950/60 border border-emerald-900/10 dark:border-emerald-800/40 hover:bg-emerald-900/10 transition-colors cursor-pointer"
                  title={t.exportPDF}
                  aria-label={t.exportPDF}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.exportPDF}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveReflection}
                className={`min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer ${
                  isSaved ? 'bg-emerald-600' : 'bg-emerald-800 hover:bg-emerald-700'
                }`}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? t.savedBtn : t.saveBtn}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ScholarProvenanceModal
        isOpen={provenanceModalOpen}
        onClose={() => setProvenanceModalOpen(false)}
        citation={currentCitation}
        verse={verse}
        language={language}
      />
    </article>
  );
};
