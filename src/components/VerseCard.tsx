"use client";

/**
 * @file src/components/VerseCard.tsx
 * @description Calm, minimalist Quranic Verse Card with 100% localization (EN, SV, FR, AR)
 * and zero popup triggers.
 * Enforces the 4-level hierarchy:
 * - Level 1: Verified Uthmani Arabic (always visible)
 * - Level 2: Certified Human Translation (always visible)
 * - Level 3: Classical Tafsir (expands inline inside the card, localized)
 * - Level 4: Personal 4-Step Reflection (expands inline inside the card, localized)
 */

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { QuranVerseFixture, Language, ExplanationDepth, PerspectiveMode } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { StorageService } from '../services/storage';
import { getLocalizedVerseDetails } from '../data/localizedVerseContent';
import { getLocalizedReflection } from '../data/localizedReflections';

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
}

const UI_TEXT: Record<
  Language,
  {
    copyTooltip: string;
    bookmarkTooltip: string;
    removeBookmarkTooltip: string;
    tafsirTab: string;
    reflectionTab: string;
    contextTab: string;
    revelationLabel: string;
    saveBtn: string;
    savedBtn: string;
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
  }
> = {
  en: {
    copyTooltip: 'Copy verse',
    bookmarkTooltip: 'Save verse to Journal',
    removeBookmarkTooltip: 'Remove from Journal',
    tafsirTab: 'Tafsir',
    reflectionTab: 'Reflection',
    contextTab: 'Context',
    revelationLabel: 'Revelation Context',
    saveBtn: 'Save to Journal',
    savedBtn: 'Saved to Journal',
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
  },
  sv: {
    copyTooltip: 'Kopiera vers',
    bookmarkTooltip: 'Spara vers i dagbok',
    removeBookmarkTooltip: 'Ta bort från dagbok',
    tafsirTab: 'Tafsir',
    reflectionTab: 'Reflektion',
    contextTab: 'Sammanhang',
    revelationLabel: 'Uppenbarelsekontext',
    saveBtn: 'Spara i dagbok',
    savedBtn: 'Sparad!',
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
  },
  fr: {
    copyTooltip: 'Copier le verset',
    bookmarkTooltip: 'Enregistrer dans le journal',
    removeBookmarkTooltip: 'Retirer du journal',
    tafsirTab: 'Tafsir',
    reflectionTab: 'Méditation',
    contextTab: 'Contexte',
    revelationLabel: 'Contexte de révélation',
    saveBtn: 'Enregistrer dans le journal',
    savedBtn: 'Enregistré !',
    step1Title: '01. Comprendre',
    step2Title: '02. Méditer sur votre situation',
    step2Placeholder: 'Notez vos pensées sincères ou ressentis...',
    step3Title: '03. Action concrète',
    step3Placeholder: 'Un geste concret ou apaisement à appliquer...',
    step4Title: '04. Emporter aujourd’hui',
    step4Placeholder: 'Un rappel intérieur à garder présent...',
    notSayingTitle: 'Cadre contextuel',
    beforeVerse: 'Verset précédent',
    afterVerse: 'Verset suivant',
  },
  ar: {
    copyTooltip: 'نسخ الآية',
    bookmarkTooltip: 'حفظ في اليوميات',
    removeBookmarkTooltip: 'إزالة من اليوميات',
    tafsirTab: 'التفسير',
    reflectionTab: 'التدبر',
    contextTab: 'السياق',
    revelationLabel: 'سياق التنزيل',
    saveBtn: 'حفظ في اليوميات',
    savedBtn: 'تم الحفظ!',
    step1Title: '٠١. الفهم والبيان',
    step2Title: '٠٢. التأمل ومحاسبة النفس',
    step2Placeholder: 'اكتب خواطرك الصادقة ومشاعرك تجاه هذه الآية...',
    step3Title: '٠٣. التطبيق العملي',
    step3Placeholder: 'خطوة عملية أو سلوك تعزم على تطبيقه...',
    step4Title: '٠٤. أثر تحمله اليوم',
    step4Placeholder: 'معنى إيماني تحمله في قلبك اليوم...',
    notSayingTitle: 'الضابط السياقي للآية',
    beforeVerse: 'الآية السابقة',
    afterVerse: 'الآية اللاحقة',
  },
};

type InlineSection = 'none' | 'tafsir' | 'reflection' | 'context';

export const VerseCard: React.FC<VerseCardProps> = ({
  verse,
  language,
  arabicScale,
  showTransliteration,
  isBookmarked,
  onToggleBookmark,
  onReflectionSaved,
}) => {
  const [activeSection, setActiveSection] = useState<InlineSection>('none');
  const [selectedScholarIndex, setSelectedScholarIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Inline Reflection State
  const [reflectNotes, setReflectNotes] = useState('');
  const [applyNotes, setApplyNotes] = useState('');
  const [liveNotes, setLiveNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const t = UI_TEXT[language] || UI_TEXT.en;
  const localizedDetails = getLocalizedVerseDetails(verse, language);
  const localizedReflection = getLocalizedReflection(verse.id, language);

  const translationObj =
    language === 'ar'
      ? verse.translations.ar || {
          text: verse.tafsirCitations?.[0]?.text || verse.arabicText,
          translator: 'التفسير الميسر - مجمع الملك فهد',
        }
      : verse.translations[language] || verse.translations.en;

  useEffect(() => {
    const existing = StorageService.getReflection(verse.id);
    if (existing) {
      setReflectNotes(existing.reflectNotes || '');
      setApplyNotes(existing.applyNotes || '');
      setLiveNotes(existing.liveNotes || '');
    } else {
      setReflectNotes('');
      setApplyNotes('');
      setLiveNotes('');
    }
  }, [verse.id]);

  const handleCopy = () => {
    const textToCopy = `${verse.arabicText}\n\n"${translationObj.text}"\n— ${localizedDetails.surahPrefix} ${localizedDetails.surahNameDisplay} (${verse.id}) [${translationObj.translator}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveReflection = () => {
    StorageService.saveReflection(verse.id, {
      verseId: verse.id,
      reflectNotes,
      applyNotes,
      liveNotes,
    });
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
  const currentCitation =
    localizedDetails.tafsirCitations[selectedScholarIndex] ||
    localizedDetails.tafsirCitations[0];

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
              {verse.id}
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

        {/* Minimalist 2-Action Bar: Copy & Bookmark */}
        <div className="flex items-center gap-1">
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
        {/* LEVEL 1: Original Verified Quranic Arabic (Uthmani Script) */}
        <section aria-label="Level 1: Verified Uthmani Arabic">
          <div
            className="p-5 sm:p-7 rounded-2xl bg-[#FAF8F5] dark:bg-[#071711] border border-emerald-900/10 dark:border-emerald-800/30"
            style={{
              fontSize: `${Math.round(26 * arabicScale)}px`,
              lineHeight: 2.15,
            }}
          >
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-right text-emerald-950 dark:text-emerald-50 select-text antialiased font-normal"
            >
              {verse.arabicText}
            </p>
          </div>

          {showTransliteration && (
            <p className="mt-2.5 px-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed">
              {verse.transliteration}
            </p>
          )}
        </section>

        {/* LEVEL 2: Certified Human Translation */}
        <section aria-label="Level 2: Certified Translation" className="space-y-1.5">
          <blockquote className="text-slate-800 dark:text-slate-100 text-base sm:text-lg leading-relaxed">
            &ldquo;{translationObj.text}&rdquo;
          </blockquote>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            — {translationObj.translator}
          </p>
        </section>

        {/* Inline Audio Player (with language prop passed) */}
        <div className="pt-1">
          <AudioPlayer
            audioUrl={verse.audioUrl}
            surahVerseId={verse.id}
            language={language}
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

          {/* Context & Surrounding Verses Toggle */}
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

        {/* INLINE PANEL 1: LEVEL 3 CLASSICAL TAFSIR (100% Localized) */}
        {activeSection === 'tafsir' && (
          <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 space-y-4">
            {/* Single-Row 3-Column Scholar Segmented Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-emerald-900/5 dark:bg-emerald-950/60 border border-emerald-900/10 dark:border-emerald-800/40">
              {localizedDetails.tafsirCitations.map((cit, idx) => (
                <button
                  key={cit.scholar}
                  type="button"
                  onClick={() => setSelectedScholarIndex(idx)}
                  className={`min-h-[36px] px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap truncate text-center ${
                    selectedScholarIndex === idx
                      ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100'
                  }`}
                >
                  {cit.scholar}
                </button>
              ))}
            </div>

            {currentCitation && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {currentCitation.sourceBook}{' '}
                    {currentCitation.century ? `· ${currentCitation.century}` : ''}
                  </span>
                  <Quote className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                </div>
                <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {currentCitation.text}
                </p>
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

        {/* INLINE PANEL 2: LEVEL 4 PERSONAL REFLECTION (100% Localized) */}
        {activeSection === 'reflection' && (
          <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 space-y-4">
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

        {/* INLINE PANEL 3: CONTEXT, BOUNDARY & SURROUNDING VERSES (100% Localized) */}
        {activeSection === 'context' && (
          <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 space-y-4 text-xs sm:text-sm">
            <div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {localizedDetails.mappingExplanation}
              </p>
            </div>

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
