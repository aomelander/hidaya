import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Sparkles,
  HelpCircle,
  Volume2,
  Copy,
  Check,
  Presentation,
  Printer,
  ChevronDown,
  ChevronUp,
  Share2,
} from 'lucide-react';
import { QuranVerseFixture, Language } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { ExportService } from '../services/exportService';
import { StorageService } from '../services/storage';

interface VerseCardProps {
  verse: QuranVerseFixture;
  language: Language;
  arabicScale: number;
  showTransliteration: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (verseId: string) => void;
  onOpenTafsir: (verse: QuranVerseFixture) => void;
  onOpenReflection: (verse: QuranVerseFixture) => void;
  sourceIndicator?: string;
}

export const VerseCard: React.FC<VerseCardProps> = ({
  verse,
  language,
  arabicScale,
  showTransliteration,
  isBookmarked,
  onToggleBookmark,
  onOpenTafsir,
  onOpenReflection,
  sourceIndicator,
}) => {
  const [showWhyVerse, setShowWhyVerse] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);

  const translationObj = verse.translations[language] || verse.translations.en;
  const userReflection = StorageService.getReflection(verse.id);

  const handleCopy = () => {
    const textToCopy = `${verse.arabicText}\n\n"${translationObj.text}"\n— Surah ${verse.surahNameTransliterated} (${verse.id}) [${translationObj.translator}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPPTX = async () => {
    try {
      setIsExportingPPTX(true);
      await ExportService.exportToPPTX(verse, language, userReflection);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingPPTX(false);
    }
  };

  return (
    <article
      className="bg-white dark:bg-[#0A1E17] rounded-3xl border border-emerald-900/10 dark:border-emerald-800/40 shadow-lg shadow-emerald-950/5 overflow-hidden transition-all duration-200"
      aria-labelledby={`verse-heading-${verse.id}`}
    >
      {/* Top Banner: Surah details & Action Bar */}
      <div className="px-6 py-4 bg-emerald-900/5 dark:bg-emerald-950/40 border-b border-emerald-900/10 dark:border-emerald-800/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 font-bold text-xs shadow-xs">
            {verse.surahNumber}
          </span>
          <div>
            <h2
              id={`verse-heading-${verse.id}`}
              className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-50 flex items-center gap-2"
            >
              Surah {verse.surahNameTransliterated}
              <span className="font-arabic text-amber-600 dark:text-amber-400 font-normal">
                ({verse.surahNameArabic})
              </span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                Ayah {verse.verseNumber}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {verse.surahNameMeaning} • {verse.revelationType} Revelation • Juz {verse.juz}
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-slate-500 hover:text-emerald-800 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-900/10 transition-colors"
            title="Copy verse text and translation"
            aria-label="Copy verse text and translation"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleExportPPTX}
            disabled={isExportingPPTX}
            className="p-2 rounded-lg text-slate-500 hover:text-emerald-800 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-900/10 transition-colors"
            title="Export PowerPoint Slide Card"
            aria-label="Export PowerPoint Slide Card"
          >
            <Presentation className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </button>

          <button
            onClick={() => onToggleBookmark(verse.id)}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'text-slate-500 hover:text-emerald-800 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-900/10'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this verse'}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this verse'}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Grounding Indicator Badge */}
      {sourceIndicator && (
        <div className="px-6 py-2 bg-slate-50 border-b border-emerald-900/10 text-[10px] font-mono tracking-wide text-slate-500 uppercase flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          <span>{sourceIndicator}</span>
        </div>
      )}

      {/* Main Content Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* LEVEL 1: Verified Uthmani Arabic Text */}
        <section aria-label="Level 1: Verified Arabic Quran Text">
          <div className="flex items-center justify-between mb-3 text-[11px] font-semibold tracking-wider uppercase text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Level 1: Verified Uthmani Text
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
              Tashkeel Vocalized
            </span>
          </div>

          <div
            className="p-6 sm:p-8 rounded-2xl bg-[#FAF8F5] dark:bg-[#071711] border border-amber-600/20 dark:border-amber-500/15 relative"
            style={{
              fontSize: `${Math.round(26 * arabicScale)}px`,
              lineHeight: 2.2,
            }}
          >
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-right text-emerald-950 dark:text-emerald-50 select-text antialiased font-normal tracking-wide"
            >
              {verse.arabicText}
            </p>
          </div>

          {/* Transliteration */}
          {showTransliteration && (
            <div className="mt-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-900/30">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-serif italic leading-relaxed">
                {verse.transliteration}
              </p>
            </div>
          )}
        </section>

        {/* Audio Player for this verse */}
        <div className="pt-1">
          <AudioPlayer audioUrl={verse.audioUrl} surahVerseId={verse.id} />
        </div>

        {/* LEVEL 2: Certified Translation */}
        <section aria-label="Level 2: Certified Translation" className="pt-2">
          <div className="flex items-center justify-between mb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Level 2: Certified Translation
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              {translationObj.translator}
            </span>
          </div>

          <blockquote className="p-5 rounded-2xl bg-slate-50/70 dark:bg-emerald-950/20 border-l-4 border-emerald-700 dark:border-emerald-500 text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-relaxed">
            &ldquo;{translationObj.text}&rdquo;
          </blockquote>
        </section>

        {/* "Why this verse?" Context Section */}
        <div className="rounded-2xl border border-amber-600/20 dark:border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/15 overflow-hidden transition-all">
          <button
            onClick={() => setShowWhyVerse(!showWhyVerse)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-amber-500/10 transition-colors"
            aria-expanded={showWhyVerse}
          >
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs sm:text-sm">
              <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Why this verse? (Context & Topic Mapping)</span>
            </div>
            {showWhyVerse ? (
              <ChevronUp className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            )}
          </button>

          {showWhyVerse && (
            <div className="px-5 pb-5 pt-1 space-y-4 text-xs sm:text-sm border-t border-amber-600/10">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {verse.whyThisVerse.mappingExplanation}
              </p>

              {/* Explicit mapping factor grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white/80 dark:bg-emerald-950/40 border border-amber-600/15">
                  <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">
                    Emotion Addressed
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {verse.whyThisVerse.emotion}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-emerald-950/40 border border-amber-600/15">
                  <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">
                    Life Situation
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {verse.whyThisVerse.situation}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-emerald-950/40 border border-amber-600/15">
                  <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">
                    Underlying Need
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {verse.whyThisVerse.coreNeed}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-emerald-950/40 border border-amber-600/15">
                  <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">
                    Spiritual Principle
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {verse.whyThisVerse.spiritualPrinciple}
                  </p>
                </div>
              </div>

              {/* Topic tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
                  Mapping Factors:
                </span>
                {verse.whyThisVerse.topics.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LEVEL 3 & 4 Action Row */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Level 3: Tafsir Drawer button */}
          <button
            onClick={() => onOpenTafsir(verse)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-800/30 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Level 3: Tafsir & Context ({verse.tafsirCitations.length} Classical Sources)</span>
          </button>

          {/* Level 4: "From Quran to Life" Reflection Flow */}
          <button
            onClick={() => onOpenReflection(verse)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/10 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Level 4: From Quran to Life Flow</span>
            {userReflection && (
              <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-emerald-900" title="Notes recorded"></span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
