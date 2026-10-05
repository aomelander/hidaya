"use client";

import React, { useState, useRef } from 'react';
import {
  Compass,
  Sparkles,
  Volume2,
  VolumeX,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sun,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Language, QuranVerseFixture } from '../types';
import {
  DailyNorthStarVerse,
  DAILY_NORTH_STARS,
  getTodayNorthStar,
  getLocalizedText,
} from '../data/dailyNorthStar';
import { QURAN_FIXTURES } from '../data/quranFixtures';
import { StorageService, StreakData } from '../services/storage';

interface DailyNorthStarProps {
  language: Language;
  arabicScale: number;
  showTransliteration: boolean;
  onSelectVerse: (verse: QuranVerseFixture) => void;
  onOpenReflection: (verse: QuranVerseFixture) => void;
}

const UI_STRINGS: Record<Language, {
  badge: string;
  subheading: string;
  sourceAttribution: string;
  contextHeader: string;
  sitWithThis: string;
  carryThis: string;
  openSessionBtn: string;
  reflectBtn: string;
  copied: string;
  copy: string;
  nextStar: string;
  prevStar: string;
  todayLabel: string;
  collapse: string;
  expand: string;
  streakUnit: string;
  totalDaysUnit: string;
}> = {
  en: {
    badge: "Today's North Star • Ledstjärna",
    subheading: "A daily Quranic contemplation to anchor your day in divine guidance.",
    sourceAttribution: "Verified Uthmani Script",
    contextHeader: "Sacred Context & Revelation Background",
    sitWithThis: "Today, sit with this:",
    carryThis: "Carry this with you today:",
    openSessionBtn: "Explore in Deep Session",
    reflectBtn: "Open Reflection Journal",
    copied: "Copied!",
    copy: "Share",
    nextStar: "Next Day",
    prevStar: "Previous Day",
    todayLabel: "Today",
    collapse: "Minimize",
    expand: "Expand North Star",
    streakUnit: "day streak",
    totalDaysUnit: "days reflected",
  },
  sv: {
    badge: "Dagens Ledstjärna • North Star",
    subheading: "En daglig Quran-reflektion för att förankra din dag i vägledning.",
    sourceAttribution: "Verifierad Uthmani-skrift",
    contextHeader: "Sammanhang och uppenbarelsens bakgrund",
    sitWithThis: "Begrunda detta idag:",
    carryThis: "Ta med dig detta idag:",
    openSessionBtn: "Utforska i djup session",
    reflectBtn: "Öppna reflektionsdagbok",
    copied: "Kopierad!",
    copy: "Dela",
    nextStar: "Nästa dag",
    prevStar: "Föregående dag",
    todayLabel: "Idag",
    collapse: "Minimera",
    expand: "Visa Ledstjärnan",
    streakUnit: "dagars svit",
    totalDaysUnit: "dagar i reflektion",
  },
  fr: {
    badge: "Étoile Polaire du Jour • North Star",
    subheading: "Une méditation coranique quotidienne pour ancrer votre journée dans la guidance.",
    sourceAttribution: "Texte Uthmani Vérifié",
    contextHeader: "Contexte sacré et circonstances de révélation",
    sitWithThis: "Méditez sur ceci aujourd'hui :",
    carryThis: "Portez ceci avec vous aujourd'hui :",
    openSessionBtn: "Explorer en session profonde",
    reflectBtn: "Ouvrir le journal intime",
    copied: "Copié !",
    copy: "Partager",
    nextStar: "Jour suivant",
    prevStar: "Jour précédent",
    todayLabel: "Aujourd'hui",
    collapse: "Réduire",
    expand: "Déployer l'Étoile",
    streakUnit: "jours consécutifs",
    totalDaysUnit: "jours médités",
  },
  ar: {
    badge: "نجمة الهداية اليومية • Daily North Star",
    subheading: "تدبر قرآني يومي مبارك لترسيخ يومك في نور الوحي الإلهي.",
    sourceAttribution: "الرسم العثماني المعتمد",
    contextHeader: "سياق الآية وأسباب النزول",
    sitWithThis: "تأمل في هذا اليوم:",
    carryThis: "احمل هذا المعنى في قلبك وعملك اليوم:",
    openSessionBtn: "استكشف في جلسة تدبر معمقة",
    reflectBtn: "سجل خواطرك في دفتر التدبر",
    copied: "تم النسخ بنجاح!",
    copy: "مشاركة",
    nextStar: "اليوم التالي",
    prevStar: "اليوم السابق",
    todayLabel: "اليوم",
    collapse: "طي النافذة",
    expand: "عرض نجمة الهداية",
    streakUnit: "أيام متتالية",
    totalDaysUnit: "أيام تدبر",
  }
};

export const DailyNorthStar: React.FC<DailyNorthStarProps> = ({
  language,
  arabicScale,
  showTransliteration,
  onSelectVerse,
  onOpenReflection,
}) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const today = getTodayNorthStar();
    const idx = DAILY_NORTH_STARS.findIndex((s) => s.id === today.id);
    return idx >= 0 ? idx : 0;
  });
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [streak, setStreak] = useState<StreakData>(() => StorageService.recordDailyVisit());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    setStreak(StorageService.recordDailyVisit());
  }, []);

  const star = DAILY_NORTH_STARS[currentIndex];
  const t = UI_STRINGS[language] || UI_STRINGS.en;

  const handleNext = () => {
    stopAudio();
    setCurrentIndex((prev) => (prev + 1) % DAILY_NORTH_STARS.length);
  };

  const handlePrev = () => {
    stopAudio();
    setCurrentIndex((prev) => (prev - 1 + DAILY_NORTH_STARS.length) % DAILY_NORTH_STARS.length);
  };

  const handleResetToday = () => {
    stopAudio();
    const today = getTodayNorthStar();
    const idx = DAILY_NORTH_STARS.findIndex((s) => s.id === today.id);
    setCurrentIndex(idx >= 0 ? idx : 0);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
  };

  const toggleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(star.audioUrl);
      audioRef.current.onended = () => setIsPlayingAudio(false);
      audioRef.current.onerror = () => setIsPlayingAudio(false);
    } else if (audioRef.current.src !== star.audioUrl) {
      audioRef.current.src = star.audioUrl;
    }

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().catch(() => setIsPlayingAudio(false));
      setIsPlayingAudio(true);
    }
  };

  const handleCopy = () => {
    const translation = star.translations[language] || star.translations.en;
    const textToCopy = `✨ ${t.badge} (${star.surahNameTransliterated} ${star.surahNumber}:${star.verseNumber})\n\n${star.arabicText}\n\n"${translation.text}" — ${translation.translator}\n\n💡 ${t.sitWithThis} ${getLocalizedText(star.reflectionQuestion, language)}\n🌱 ${t.carryThis} ${getLocalizedText(star.practicalAction, language)}\n\nHidaya — Quran guidance for your moment`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find matching full QuranVerseFixture if available
  const matchingFixture = QURAN_FIXTURES.find(
    (f) => f.id === star.id || f.id.startsWith(star.id) || star.id.startsWith(f.id)
  ) || QURAN_FIXTURES[0];

  const translation = star.translations[language] || star.translations.en;

  const todayFormatted = new Intl.DateTimeFormat(
    language === 'sv' ? 'sv-SE' : language === 'fr' ? 'fr-FR' : 'en-US',
    { weekday: 'long', month: 'short', day: 'numeric' }
  ).format(new Date());

  return (
    <article
      aria-label="Daily North Star Reflection"
      className="relative overflow-hidden rounded-3xl bg-linear-to-b from-amber-500/10 via-emerald-900/5 to-white/80 dark:from-emerald-950/70 dark:via-emerald-950/40 dark:to-[#071712] border-2 border-amber-600/25 dark:border-amber-500/20 shadow-xl shadow-amber-900/5 transition-all"
    >
      {/* Subtle Top Decorative Accent Banner */}
      <div className="h-1.5 w-full bg-linear-to-r from-amber-400 via-emerald-600 to-amber-500"></div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-xs">
              <Compass className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.badge}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  · {todayFormatted}
                </span>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 inline-flex items-center gap-1 tabular-nums">
                  · <Flame className="w-3.5 h-3.5 text-amber-500 inline" /> {streak.currentStreak}{' '}
                  {t.streakUnit} ({streak.totalDaysActive} {t.totalDaysUnit})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {t.subheading}
              </p>
            </div>
          </div>

          {/* Quick Date Browser Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              title={t.prevStar}
              aria-label={t.prevStar}
              className="p-1.5 rounded-xl border border-emerald-900/10 dark:border-emerald-700/30 hover:bg-emerald-900/10 dark:hover:bg-emerald-800/30 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetToday}
              title={t.todayLabel}
              className="px-2.5 py-1 text-xs font-semibold rounded-xl border border-amber-600/20 text-amber-800 dark:text-amber-200 hover:bg-amber-500/15 transition-colors cursor-pointer"
            >
              {t.todayLabel}
            </button>

            <button
              onClick={handleNext}
              title={t.nextStar}
              aria-label={t.nextStar}
              className="p-1.5 rounded-xl border border-emerald-900/10 dark:border-emerald-700/30 hover:bg-emerald-900/10 dark:hover:bg-emerald-800/30 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl border border-emerald-900/10 dark:border-emerald-700/30 hover:bg-emerald-900/10 dark:hover:bg-emerald-800/30 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer ml-1"
              title={isExpanded ? t.collapse : t.expand}
              aria-expanded={isExpanded}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Primary Content (Collapsible) */}
        {isExpanded && (
          <div className="space-y-6 pt-2">
            {/* Surah Reference & Theme Title */}
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-amber-900/10 dark:border-emerald-800/30 pb-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-50">
                  {getLocalizedText(star.theme, language)}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {star.surahNameTransliterated} ({star.surahNameMeaning}) • Surah {star.surahNumber}, Ayah {star.verseNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAudio}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-amber-500 text-slate-950 animate-pulse shadow-sm'
                      : 'bg-white dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-900/15 dark:border-emerald-700/30 hover:bg-emerald-50 dark:hover:bg-emerald-800/40'
                  }`}
                  aria-label={isPlayingAudio ? "Stop recitation" : "Listen to recitation"}
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? 'Pause' : 'Listen'}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-emerald-900/40 text-slate-700 dark:text-slate-300 border border-emerald-900/15 dark:border-emerald-700/30 hover:bg-emerald-50 dark:hover:bg-emerald-800/40 transition-all cursor-pointer"
                  title={t.copy}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? t.copied : t.copy}</span>
                </button>
              </div>
            </div>

            {/* Level 1: Original Verified Quranic Arabic (Uthmani) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                  Level 1: {t.sourceAttribution}
                </span>
                <span className="font-arabic text-sm">{star.surahNameArabic}</span>
              </div>

              <div
                dir="rtl"
                style={{ fontSize: `${arabicScale * 1.5}rem` }}
                className="font-arabic text-emerald-950 dark:text-amber-100 leading-[2.4] text-right p-4 rounded-2xl bg-amber-50/50 dark:bg-emerald-950/30 border border-amber-900/10 dark:border-emerald-800/20 select-text"
              >
                {star.arabicText}
              </div>

              {/* Transliteration */}
              {showTransliteration && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic px-1 font-serif leading-relaxed">
                  {star.transliteration}
                </p>
              )}
            </div>

            {/* Level 2: Human Translation */}
            <div className="space-y-1.5 bg-white/70 dark:bg-[#0A2219]/60 p-4 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/30">
              <div className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                Level 2: Human Translation ({translation.translator})
              </div>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-serif leading-relaxed">
                &ldquo;{translation.text}&rdquo;
              </p>
            </div>

            {/* Revelation Context & Wisdom */}
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-500/5 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-amber-500/20">
              <span className="font-bold text-emerald-900 dark:text-amber-300 block mb-1">
                {t.contextHeader}:
              </span>
              {getLocalizedText(star.context, language)}
            </div>

            {/* Level 4: "From Quran to Life" Dual Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Question: Today, sit with this */}
              <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/50 border border-emerald-800/20 dark:border-emerald-700/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>{t.sitWithThis}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {getLocalizedText(star.reflectionQuestion, language)}
                </p>
              </div>

              {/* Action: Carry this with you today */}
              <div className="p-4 rounded-2xl bg-linear-to-br from-emerald-900/10 via-emerald-800/5 to-amber-500/10 dark:from-emerald-900/30 dark:to-emerald-950/60 border border-emerald-700/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.carryThis}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {getLocalizedText(star.practicalAction, language)}
                </p>
              </div>
            </div>

            {/* Action Buttons to connect into full application */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                onClick={() => onOpenReflection(matchingFixture)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-emerald-950 border border-emerald-900/20 dark:border-emerald-700/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-all cursor-pointer shadow-2xs"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t.reflectBtn}</span>
              </button>

              <button
                onClick={() => onSelectVerse(matchingFixture)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-sm transition-all cursor-pointer"
              >
                <span>{t.openSessionBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
