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
} from 'lucide-react';
import {
  QuranVerseFixture,
  Language,
  ExplanationDepth,
  PerspectiveMode,
  ReaderProfile,
  ReflectionMood,
  PreferredScholar,
} from '../types';
import { AudioPlayer } from './AudioPlayer';
import { StorageService } from '../services/storage';
import { getLocalizedVerseDetails } from '../data/localizedVerseContent';
import { getLocalizedReflection } from '../data/localizedReflections';
import { getAgeAdaptiveContent } from '../data/ageAdaptiveContent';

interface VerseCardProps {
  verse: QuranVerseFixture;
  language: Language;
  arabicScale: number;
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

type InlineSection = 'none' | 'tafsir' | 'reflection' | 'context';

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
  },
};

export const VerseCard: React.FC<VerseCardProps> = ({
  verse,
  language,
  arabicScale,
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

  // Optional inclusion of adjacent preceding/following single verse when needed for context (max 3 consecutive verses)
  const [includeBefore, setIncludeBefore] = useState(false);
  const [includeAfter, setIncludeAfter] = useState(false);

  // Word-by-word recitation & translation sync state
  const [playbackRatio, setPlaybackRatio] = useState(0);
  const [isReciting, setIsReciting] = useState(false);
  const [playbackPhase, setPlaybackPhase] = useState<'recitation' | 'translation' | 'idle'>('idle');

  // Personal reflection inputs (stored locally in browser)
  const [reflectNotes, setReflectNotes] = useState('');
  const [applyNotes, setApplyNotes] = useState('');
  const [liveNotes, setLiveNotes] = useState('');
  const [selectedMood, setSelectedMood] = useState<ReflectionMood | undefined>(undefined);

  const t = UI_TEXT[language] || UI_TEXT.en;
  const moodDict = MOOD_LABELS[language] || MOOD_LABELS.en;
  const localizedDetails = getLocalizedVerseDetails(verse, language);
  const localizedReflection = getLocalizedReflection(verse.id, language);
  const ageBundle = useMemo(() => getAgeAdaptiveContent(verse, language), [verse, language]);

  // Count how many consecutive verses are already in the base fixture (e.g. "134" = 1, "5-6" = 2, "3-5" = 3)
  const baseRangeBounds = useMemo(() => {
    const parts = verse.verseNumber.split('-').map((s) => parseInt(s.trim(), 10));
    const start = !isNaN(parts[0]) ? parts[0] : 1;
    const end = parts.length > 1 && !isNaN(parts[1]) ? Math.min(parts[1], start + 2) : start;
    return { start, end, count: end - start + 1 };
  }, [verse.verseNumber]);

  const canAddBefore = useMemo(() => {
    const bNum = parseInt(verse.surroundingVerses?.before?.verseNumber || '', 10);
    return (
      !isNaN(bNum) &&
      !verse.surroundingVerses?.before?.verseNumber.includes('-') &&
      bNum === baseRangeBounds.start - 1 &&
      baseRangeBounds.count < 3
    );
  }, [verse.surroundingVerses, baseRangeBounds]);

  const canAddAfter = useMemo(() => {
    const aNum = parseInt(verse.surroundingVerses?.after?.verseNumber || '', 10);
    const currentCount = baseRangeBounds.count + (includeBefore && canAddBefore ? 1 : 0);
    return (
      !isNaN(aNum) &&
      !verse.surroundingVerses?.after?.verseNumber.includes('-') &&
      aNum === baseRangeBounds.end + 1 &&
      currentCount < 3
    );
  }, [verse.surroundingVerses, baseRangeBounds, includeBefore, canAddBefore]);

  const effectiveStartVerse =
    includeBefore && canAddBefore ? baseRangeBounds.start - 1 : baseRangeBounds.start;
  const effectiveEndVerse =
    includeAfter && canAddAfter
      ? Math.min(effectiveStartVerse + 2, baseRangeBounds.end + 1)
      : Math.min(effectiveStartVerse + 2, baseRangeBounds.end);

  const effectiveVerseNumberStr =
    effectiveStartVerse === effectiveEndVerse
      ? String(effectiveStartVerse)
      : `${effectiveStartVerse}-${effectiveEndVerse}`;

  const effectiveVerseId = `${verse.surahNumber}:${effectiveVerseNumberStr}`;

  const baseTranslationObj =
    language === 'ar'
      ? {
          text:
            localizedDetails.tafsirCitations[2]?.text ||
            localizedDetails.tafsirCitations[0]?.text ||
            verse.arabicText,
          translator: 'التفسير الميسر - مجمع الملك فهد',
        }
      : verse.translations[language] || verse.translations.en;

  const combinedArabicText = useMemo(() => {
    const parts: string[] = [];
    if (includeBefore && canAddBefore && verse.surroundingVerses?.before) {
      parts.push(verse.surroundingVerses.before.arabicText);
    }
    parts.push(verse.arabicText);
    if (includeAfter && canAddAfter && verse.surroundingVerses?.after) {
      parts.push(verse.surroundingVerses.after.arabicText);
    }
    return parts.join(' ۝ ');
  }, [verse, includeBefore, canAddBefore, includeAfter, canAddAfter]);

  const combinedTranslationText = useMemo(() => {
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
  }, [verse, language, baseTranslationObj.text, includeBefore, canAddBefore, includeAfter, canAddAfter]);

  const translationObj = {
    text: combinedTranslationText,
    translator: baseTranslationObj.translator,
  };

  // Split Uthmani Arabic into words for synchronized word-by-word reading highlight
  const arabicWords = useMemo(
    () => combinedArabicText.trim().split(/\s+/).filter(Boolean),
    [combinedArabicText]
  );

  // Split Translation into words for synchronized word-by-word highlight when translation voiceover plays
  const translationWords = useMemo(
    () => translationObj.text.trim().split(/\s+/).filter(Boolean),
    [translationObj.text]
  );

  const activeWordIndex = useMemo(() => {
    if (!isReciting || playbackPhase !== 'recitation' || arabicWords.length === 0) return -1;
    const idx = Math.floor(playbackRatio * arabicWords.length);
    return Math.min(arabicWords.length - 1, Math.max(0, idx));
  }, [isReciting, playbackPhase, playbackRatio, arabicWords.length]);

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
      setReflectNotes(saved.reflectNotes || '');
      setApplyNotes(saved.applyNotes || '');
      setLiveNotes(saved.liveNotes || '');
      setSelectedMood(saved.mood);
    } else {
      setReflectNotes('');
      setApplyNotes('');
      setLiveNotes('');
      setSelectedMood(undefined);
    }
  }, [verse.id]);

  const handleCopy = () => {
    const textToCopy = `${verse.arabicText}\n\n"${translationObj.text}"\n— ${localizedDetails.surahPrefix} ${localizedDetails.surahNameDisplay} (${verse.id}) [${translationObj.translator}]`;
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

      // Translation text
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
      reflectNotes,
      applyNotes,
      liveNotes,
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

  const hasSavedNotes = Boolean(reflectNotes.trim() || applyNotes.trim() || liveNotes.trim());
  const currentCitation = useMemo(() => {
    const idx =
      preferredScholar === "Al-Sa'di" ? 1 : preferredScholar === 'Al-Muyassar' ? 2 : 0;
    return localizedDetails.tafsirCitations[idx] || localizedDetails.tafsirCitations[0];
  }, [localizedDetails.tafsirCitations, preferredScholar]);

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
            <span>
              {localizedDetails.surahPrefix} {localizedDetails.surahNameDisplay}
            </span>
            <span className="text-slate-400" aria-hidden="true">
              ·
            </span>
            <span className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400 tabular-nums">
              {effectiveVerseId}
            </span>
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
        {/* Optional Adjacent Context Verses Toggle (Strictly capped at max 3 consecutive verses) */}
        {(canAddBefore || canAddAfter || includeBefore || includeAfter) && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {canAddBefore && (
              <button
                type="button"
                onClick={() => setIncludeBefore((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                  includeBefore
                    ? 'bg-emerald-800 text-white border-emerald-700'
                    : 'bg-[#FAF8F5] dark:bg-emerald-950/40 border-emerald-900/15 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 hover:border-emerald-600'
                }`}
              >
                {includeBefore ? '✓ ' : '+ '}
                {t.beforeVerse} ({verse.surroundingVerses?.before?.verseNumber})
              </button>
            )}
            {(canAddAfter || includeAfter) && (
              <button
                type="button"
                onClick={() => setIncludeAfter((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                  includeAfter
                    ? 'bg-emerald-800 text-white border-emerald-700'
                    : 'bg-[#FAF8F5] dark:bg-emerald-950/40 border-emerald-900/15 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 hover:border-emerald-600'
                }`}
              >
                {includeAfter ? '✓ ' : '+ '}
                {t.afterVerse} ({verse.surroundingVerses?.after?.verseNumber})
              </button>
            )}
          </div>
        )}

        {/* LEVEL 1: Original Verified Quranic Arabic (Uthmani Script) with Word-by-Word Recitation Sync */}
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
              {arabicWords.map((word, idx) => {
                const isWordActive = idx === activeWordIndex;
                return (
                  <React.Fragment key={idx}>
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
            </p>
          </div>

          {showTransliteration && verse.transliteration && (
            <p className="mt-2.5 px-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed">
              {verse.transliteration}
            </p>
          )}
        </section>

        {/* LEVEL 2: Certified Human Translation with Word-by-Word Highlighting when Spoken */}
        <section aria-label="Level 2: Certified Translation" className="space-y-1.5">
          <blockquote className="text-slate-800 dark:text-slate-100 text-base sm:text-lg leading-relaxed">
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
            translationText={translationObj.text}
            language={language}
            onPlaybackProgress={(ratio, playing, phase) => {
              setPlaybackRatio(ratio);
              setIsReciting(playing);
              setPlaybackPhase(phase || (playing ? 'recitation' : 'idle'));
            }}
          />
        </div>

        {/* Single-Row 3-Segment Inline Disclosure Bar (Tafsir · Reflection · Context) */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/60 border border-emerald-900/10 dark:border-emerald-800/40">
          {/* Level 3: Inline Classical Tafsir Toggle */}
          <button
            type="button"
            onClick={() => toggleSection('tafsir')}
            aria-expanded={activeSection === 'tafsir'}
            className={`min-h-[42px] inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap truncate ${
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
            className={`min-h-[42px] inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap truncate ${
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

          {/* Context, Root Imagery, Family Halaqah & Surrounding Verses Toggle */}
          <button
            type="button"
            onClick={() => toggleSection('context')}
            aria-expanded={activeSection === 'context'}
            className={`min-h-[42px] inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap truncate ${
              activeSection === 'context'
                ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs'
                : 'text-emerald-900 dark:text-emerald-200 hover:bg-emerald-900/10 dark:hover:bg-emerald-900/30'
            }`}
          >
            <span className="truncate">{t.contextTab}</span>
            {activeSection === 'context' ? (
              <ChevronUp className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
            )}
          </button>
        </div>

        {/* INLINE PANEL 1: LEVEL 3 CLASSICAL TAFSIR (Uses Preferred Scholar from Preferences) */}
        {activeSection === 'tafsir' && (
          <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 space-y-4">
            {currentCitation && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                    {currentCitation.scholar} · {currentCitation.sourceBook}{' '}
                    {currentCitation.century ? `(${currentCitation.century})` : ''}
                  </span>
                  <Quote className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                </div>
                <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {currentCitation.text}
                </p>
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

            <div className="pt-3 border-t border-emerald-900/10 dark:border-emerald-800/30 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                {t.revelationLabel}:{' '}
              </span>
              <span>{localizedDetails.revelationContext}</span>
            </div>
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

            <div className="space-y-1">
              <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                {t.step1Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {localizedReflection.understand}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
                {t.step2Title}
              </label>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {localizedReflection.reflectPrompt}
              </p>
              <textarea
                value={reflectNotes}
                onChange={(e) => setReflectNotes(e.target.value)}
                placeholder={t.step2Placeholder}
                rows={2}
                className="w-full p-3 text-xs sm:text-sm rounded-xl bg-white dark:bg-emerald-950/50 border border-slate-200 dark:border-emerald-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
                {t.step3Title}
              </label>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {localizedReflection.applyAction}
              </p>
              <textarea
                value={applyNotes}
                onChange={(e) => setApplyNotes(e.target.value)}
                placeholder={t.step3Placeholder}
                rows={2}
                className="w-full p-3 text-xs sm:text-sm rounded-xl bg-white dark:bg-emerald-950/50 border border-slate-200 dark:border-emerald-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
                {t.step4Title}
              </label>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {localizedReflection.livePrompt}
              </p>
              <textarea
                value={liveNotes}
                onChange={(e) => setLiveNotes(e.target.value)}
                placeholder={t.step4Placeholder}
                rows={2}
                className="w-full p-3 text-xs sm:text-sm rounded-xl bg-white dark:bg-emerald-950/50 border border-slate-200 dark:border-emerald-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex justify-end pt-1">
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

        {/* INLINE PANEL 3: CONTEXT, ROOT IMAGERY, FAMILY QUESTION, BOUNDARY & SURROUNDING VERSES */}
        {activeSection === 'context' && (
          <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 space-y-4 text-xs sm:text-sm">
            <div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {localizedDetails.mappingExplanation}
              </p>
            </div>

            {/* Arabic Root Word Visual Imagery (Loved by 13yo & 17yo) */}
            <div className="pt-3 border-t border-emerald-900/10 dark:border-emerald-800/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                  {t.rootImageryTitle}
                </span>
                <span className="font-arabic text-base text-amber-700 dark:text-amber-400 font-bold">
                  {rootItem.termArabic} ({rootItem.termTransliterated}) · {rootItem.root}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {rootItem.literalImagery[language] || rootItem.literalImagery.en}
              </p>
            </div>

            {/* Family Circle Question (Loved by 8yo & Parents) */}
            <div className="pt-3 border-t border-emerald-900/10 dark:border-emerald-800/30 space-y-1">
              <span className="font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                {ageBundle.kids.familyQuestionTitle}
              </span>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                {ageBundle.kids.familyQuestion}
              </p>
            </div>

            {/* Contextual Boundary ("What this verse is NOT saying") */}
            <div className="pt-3 border-t border-emerald-900/10 dark:border-emerald-800/30">
              <span className="font-semibold text-amber-800 dark:text-amber-400 block mb-1">
                {t.notSayingTitle}
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {notSayingText}
              </p>
            </div>

            {verse.surroundingVerses && (
              <div className="pt-3 border-t border-emerald-900/10 dark:border-emerald-800/30 space-y-3">
                {verse.surroundingVerses.before && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500">
                      {t.beforeVerse} ({verse.surroundingVerses.before.verseNumber})
                    </span>
                    <p
                      dir="rtl"
                      className="font-arabic text-right text-base text-emerald-950 dark:text-emerald-100"
                    >
                      {verse.surroundingVerses.before.arabicText}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                      &ldquo;
                      {verse.surroundingVerses.before.translations[language] ||
                        verse.surroundingVerses.before.translations.en}
                      &rdquo;
                    </p>
                  </div>
                )}

                {verse.surroundingVerses.after && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500">
                      {t.afterVerse} ({verse.surroundingVerses.after.verseNumber})
                    </span>
                    <p
                      dir="rtl"
                      className="font-arabic text-right text-base text-emerald-950 dark:text-emerald-100"
                    >
                      {verse.surroundingVerses.after.arabicText}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                      &ldquo;
                      {verse.surroundingVerses.after.translations[language] ||
                        verse.surroundingVerses.after.translations.en}
                      &rdquo;
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
