"use client";

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
  ShieldAlert,
  ArrowUpDown,
  Compass,
  Users,
  Home,
  User,
  Globe,
} from 'lucide-react';
import { QuranVerseFixture, Language } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { SourceLadder } from './SourceLadder';
import { LinguisticRoots } from './LinguisticRoots';
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
  onOpenHalaqah?: (verse: QuranVerseFixture) => void;
  sourceIndicator?: string;
}

const UI_TEXT = {
  en: {
    copyTooltip: "Copy verse text and translation",
    exportSlideTooltip: "Export PowerPoint Slide Deck",
    bookmarkTooltip: "Bookmark this verse",
    removeBookmarkTooltip: "Remove bookmark",
    level1Badge: "Level 1: Verified Uthmani Text",
    tashkeelVocalized: "Tashkeel Vocalized",
    level2Badge: "Level 2: Certified Translation",
    whyVerseTitle: "Why this verse? (Traceability & Topic Mapping)",
    emotionAddressed: "Emotion Addressed",
    lifeSituation: "Life Situation",
    underlyingNeed: "Underlying Need",
    spiritualPrinciple: "Spiritual Principle",
    mappingFactors: "Mapping Factors:",
    notSayingTitle: "Contextual Boundary: What this verse is NOT saying",
    surroundingToggle: "View Surrounding Context (Before & After Verses)",
    hideSurrounding: "Hide Surrounding Verses",
    beforeVerse: "Preceding Passage",
    afterVerse: "Succeeding Passage",
    openTafsirBtn: "Level 3: Classical Tafsir",
    openReflectionBtn: "Level 4: From Quran to Life",
    openHalaqahBtn: "Halaqah Circle Mode",
    sphereIndividual: "Individual & Soul",
    sphereFamily: "Family & Home",
    sphereSociety: "Society & Work",
  },
  sv: {
    copyTooltip: "Kopiera verstext och översättning",
    exportSlideTooltip: "Exportera PowerPoint-presentation",
    bookmarkTooltip: "Bokmärk denna vers",
    removeBookmarkTooltip: "Ta bort bokmärke",
    level1Badge: "Nivå 1: Verifierad Uthmani-text",
    tashkeelVocalized: "Vokaliserad med Tashkeel",
    level2Badge: "Nivå 2: Certifierad översättning",
    whyVerseTitle: "Varför denna vers? (Spårbarhet & Ämneskoppling)",
    emotionAddressed: "Adresserad känsla",
    lifeSituation: "Livssituation",
    underlyingNeed: "Underliggande behov",
    spiritualPrinciple: "Andlig princip",
    mappingFactors: "Kopplingsfaktorer:",
    notSayingTitle: "Kontextuell gränsdragning: Vad denna vers INTE säger",
    surroundingToggle: "Visa omgivande sammanhang (Före & Efter)",
    hideSurrounding: "Dölj omgivande verser",
    beforeVerse: "Föregående passage",
    afterVerse: "Efterföljande passage",
    openTafsirBtn: "Nivå 3: Klassisk Tafsir",
    openReflectionBtn: "Nivå 4: Från Quran till Liv",
    openHalaqahBtn: "Halaqah-Cirkel",
    sphereIndividual: "Individ & Själ",
    sphereFamily: "Familj & Hem",
    sphereSociety: "Samhälle & Arbetsliv",
  },
  fr: {
    copyTooltip: "Copier le texte et la traduction",
    exportSlideTooltip: "Exporter la présentation PowerPoint",
    bookmarkTooltip: "Ajouter aux favoris",
    removeBookmarkTooltip: "Retirer des favoris",
    level1Badge: "Niveau 1 : Texte Uthmani Vérifié",
    tashkeelVocalized: "Vocalisé avec Tashkeel",
    level2Badge: "Niveau 2 : Traduction Certifiée",
    whyVerseTitle: "Pourquoi ce verset ? (Traçabilité & Pertinence)",
    emotionAddressed: "Émotion ciblée",
    lifeSituation: "Situation vécue",
    underlyingNeed: "Besoin spirituel",
    spiritualPrinciple: "Principe spirituel",
    mappingFactors: "Facteurs de correspondance :",
    notSayingTitle: "Cadre contextuel : Ce que ce verset NE dit PAS",
    surroundingToggle: "Voir le contexte environnant (Avant & Après)",
    hideSurrounding: "Masquer les versets environnants",
    beforeVerse: "Passage précédent",
    afterVerse: "Passage suivant",
    openTafsirBtn: "Niveau 3 : Tafsir Classique",
    openReflectionBtn: "Niveau 4 : Du Coran à la Vie",
    openHalaqahBtn: "Cercle de Halaqah",
    sphereIndividual: "Individu & Âme",
    sphereFamily: "Famille & Foyer",
    sphereSociety: "Société & Travail",
  },
};

export const VerseCard: React.FC<VerseCardProps> = ({
  verse,
  language,
  arabicScale,
  showTransliteration,
  isBookmarked,
  onToggleBookmark,
  onOpenTafsir,
  onOpenReflection,
  onOpenHalaqah,
  sourceIndicator,
}) => {
  const [showWhyVerse, setShowWhyVerse] = useState(true);
  const [showSurrounding, setShowSurrounding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);

  const t = UI_TEXT[language] || UI_TEXT.en;
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

  // Fallback for notSaying if not explicitly defined in fixture
  const notSayingText =
    verse.notSaying?.[language] ||
    verse.notSaying?.en ||
    (language === 'sv'
      ? "Denna vers bör läsas i sitt historiska och tematiska sammanhang och inte ryckas lös som ett isolerat krav eller ersättning för professionell rådgivning."
      : language === 'fr'
      ? "Ce passage doit être compris dans son contexte historique et global, sans être isolé sous forme d'injonction rigide ou substitut à un avis professionnel."
      : "This passage should be understood within its wider thematic context and not isolated as an absolute general mandate or substitute for qualified guidance.");

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
              className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-50 flex items-center gap-2 flex-wrap"
            >
              Surah {verse.surahNameTransliterated}
              <span className="font-arabic text-amber-600 dark:text-amber-400 font-normal">
                ({verse.surahNameArabic})
              </span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                Ayah {verse.verseNumber}
              </span>
              {verse.lifeSphere && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800/10 text-emerald-800 dark:text-emerald-300 border border-emerald-800/20">
                  {verse.lifeSphere === 'family' ? (
                    <Home className="w-3 h-3 text-amber-600" />
                  ) : verse.lifeSphere === 'society' ? (
                    <Globe className="w-3 h-3 text-blue-600" />
                  ) : (
                    <User className="w-3 h-3 text-emerald-600" />
                  )}
                  <span>
                    {verse.lifeSphere === 'family'
                      ? t.sphereFamily
                      : verse.lifeSphere === 'society'
                      ? t.sphereSociety
                      : t.sphereIndividual}
                  </span>
                </span>
              )}
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
            className="p-2 rounded-lg text-slate-500 hover:text-emerald-800 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-900/10 transition-colors cursor-pointer"
            title={t.copyTooltip}
            aria-label={t.copyTooltip}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleExportPPTX}
            disabled={isExportingPPTX}
            className="p-2 rounded-lg text-slate-500 hover:text-emerald-800 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-900/10 transition-colors cursor-pointer"
            title={t.exportSlideTooltip}
            aria-label={t.exportSlideTooltip}
          >
            <Presentation className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </button>

          <button
            onClick={() => onToggleBookmark(verse.id)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                : 'text-slate-500 hover:text-emerald-800 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-900/10'
            }`}
            title={isBookmarked ? t.removeBookmarkTooltip : t.bookmarkTooltip}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? t.removeBookmarkTooltip : t.bookmarkTooltip}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Grounding Indicator Badge */}
      {sourceIndicator && (
        <div className="px-6 py-2 bg-slate-50 dark:bg-emerald-950/20 border-b border-emerald-900/10 dark:border-emerald-800/30 text-[10px] font-mono tracking-wide text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>{sourceIndicator}</span>
        </div>
      )}

      {/* Main Content Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Source Transparency Ladder Component */}
        <SourceLadder verse={verse} language={language} />

        {/* LEVEL 1: Verified Uthmani Arabic Text */}
        <section aria-label="Level 1: Verified Arabic Quran Text">
          <div className="flex items-center justify-between mb-3 text-[11px] font-semibold tracking-wider uppercase text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              {t.level1Badge}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
              {t.tashkeelVocalized}
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
              {t.level2Badge}
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              {translationObj.translator}
            </span>
          </div>

          <blockquote className="p-5 rounded-2xl bg-slate-50/70 dark:bg-emerald-950/20 border-l-4 border-emerald-700 dark:border-emerald-500 text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-relaxed font-serif">
            &ldquo;{translationObj.text}&rdquo;
          </blockquote>
        </section>

        {/* "Before & After" Surrounding Verses Section */}
        {verse.surroundingVerses && (
          <div className="rounded-2xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50/70 dark:bg-emerald-950/20 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSurrounding(!showSurrounding)}
              className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
              aria-expanded={showSurrounding}
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                <ArrowUpDown className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>{showSurrounding ? t.hideSurrounding : t.surroundingToggle}</span>
              </div>
              {showSurrounding ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showSurrounding && (
              <div className="p-5 space-y-4 border-t border-slate-200 dark:border-emerald-900/40 text-xs sm:text-sm">
                {verse.surroundingVerses.before && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/30 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                      <span>{t.beforeVerse} (Ayah {verse.surroundingVerses.before.verseNumber})</span>
                    </div>
                    <p dir="rtl" className="font-arabic text-right text-base text-emerald-950 dark:text-emerald-100 leading-relaxed">
                      {verse.surroundingVerses.before.arabicText}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 italic font-serif">
                      &ldquo;{verse.surroundingVerses.before.translations[language] || verse.surroundingVerses.before.translations.en}&rdquo;
                    </p>
                  </div>
                )}

                {verse.surroundingVerses.after && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/30 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                      <span>{t.afterVerse} (Ayah {verse.surroundingVerses.after.verseNumber})</span>
                    </div>
                    <p dir="rtl" className="font-arabic text-right text-base text-emerald-950 dark:text-emerald-100 leading-relaxed">
                      {verse.surroundingVerses.after.arabicText}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 italic font-serif">
                      &ldquo;{verse.surroundingVerses.after.translations[language] || verse.surroundingVerses.after.translations.en}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* "What this verse is NOT saying" (Contextual Boundary Guard) */}
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-600/30 dark:border-amber-500/25 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{t.notSayingTitle}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {notSayingText}
          </p>
        </div>

        {/* Deep Tadabbur: Linguistic Roots */}
        <LinguisticRoots roots={verse.linguisticRoots} language={language} />

        {/* "Why this verse?" Traceability & Topic Mapping */}
        <div className="rounded-2xl border border-amber-600/20 dark:border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/15 overflow-hidden transition-all">
          <button
            onClick={() => setShowWhyVerse(!showWhyVerse)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-amber-500/10 transition-colors cursor-pointer"
            aria-expanded={showWhyVerse}
          >
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs sm:text-sm">
              <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t.whyVerseTitle}</span>
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
                    {t.emotionAddressed}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {verse.whyThisVerse.emotion}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-emerald-950/40 border border-amber-600/15">
                  <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">
                    {t.lifeSituation}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {verse.whyThisVerse.situation}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-emerald-950/40 border border-amber-600/15">
                  <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">
                    {t.underlyingNeed}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {verse.whyThisVerse.coreNeed}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-emerald-950/40 border border-amber-600/15">
                  <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block mb-1">
                    {t.spiritualPrinciple}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {verse.whyThisVerse.spiritualPrinciple}
                  </p>
                </div>
              </div>

              {/* Topic tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
                  {t.mappingFactors}
                </span>
                {verse.whyThisVerse.topics.map((tTag) => (
                  <span
                    key={tTag}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800/60"
                  >
                    {tTag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LEVEL 3 & 4 Action Row */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Level 3: Tafsir Drawer button */}
          <button
            onClick={() => onOpenTafsir(verse)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-800/30 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>{t.openTafsirBtn}</span>
          </button>

          {/* Halaqah Circle Mode button */}
          {onOpenHalaqah && (
            <button
              onClick={() => onOpenHalaqah(verse)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-amber-600/30 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t.openHalaqahBtn}</span>
            </button>
          )}

          {/* Level 4: "From Quran to Life" Reflection Flow */}
          <button
            onClick={() => onOpenReflection(verse)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-900/10 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t.openReflectionBtn}</span>
            {userReflection && (
              <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-emerald-900" title="Notes recorded"></span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
