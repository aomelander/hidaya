"use client";

/**
 * @file src/components/JournalDrawer.tsx
 * @description Dedicated Journal & Saved Verses view (`inlinePage` mode) with a subtle
 * inline offline readiness badge and per-verse offline audio caching toggle.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Bookmark,
  Trash2,
  ArrowRight,
  Download,
  Upload,
  Search,
  Check,
  Headphones,
  WifiOff,
} from 'lucide-react';
import { QuranVerseFixture, Language, ReflectionMood } from '../types';
import { StorageService } from '../services/storage';
import { JournalStorage } from '../lib/storage/journalStorage';
import { OfflineCacheService } from '../services/offlineCacheService';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

const MOOD_FILTER_LABELS: Record<Language, Record<ReflectionMood | 'all', string>> = {
  en: {
    all: 'All Moods',
    calm: 'Calm',
    hopeful: 'Hopeful',
    grateful: 'Grateful',
    anxious: 'Anxious',
    overwhelmed: 'Overwhelmed',
  },
  sv: {
    all: 'Alla känslor',
    calm: 'Lugn',
    hopeful: 'Hoppfull',
    grateful: 'Tacksam',
    anxious: 'Orolig',
    overwhelmed: 'Överväldigad',
  },
  fr: {
    all: 'Toutes humeurs',
    calm: 'Apaisé',
    hopeful: 'Plein d’espoir',
    grateful: 'Reconnaissant',
    anxious: 'Anxieux',
    overwhelmed: 'Submergé',
  },
  ar: {
    all: 'كل المشاعر',
    calm: 'مطمئن',
    hopeful: 'متفائل',
    grateful: 'شاكر',
    anxious: 'قلق',
    overwhelmed: 'مرهق',
  },
};

export interface JournalDrawerProps {
  isOpen: boolean;
  onClose?: () => void;
  allVerses: QuranVerseFixture[];
  language: Language;
  onSelectVerse: (verse: QuranVerseFixture) => void;
  onRemoveBookmark: (verseId: string) => void;
  onOpenReflection?: (verse: QuranVerseFixture) => void;
  inlinePage?: boolean;
}

const JOURNAL_STRINGS: Record<
  Language,
  {
    title: string;
    subtitle: string;
    savedTab: string;
    journeyTab: string;
    searchPlaceholder: string;
    allTopics: string;
    emptySaved: string;
    emptyReflections: string;
    studyVerse: string;
    offlineBadgeReady: string;
    offlineBadgeActive: string;
    passagesLabel: string;
    audioLabel: string;
    saveAudioBtn: string;
    audioCachedBtn: string;
  }
> = {
  en: {
    title: 'Journal & Saved Verses',
    subtitle: 'Your personal contemplation space stored privately on your device.',
    savedTab: 'Saved Verses',
    journeyTab: 'Reflections',
    searchPlaceholder: 'Search verses or reflections...',
    allTopics: 'All Topics',
    emptySaved: 'No saved verses yet. Bookmark any verse in Guidance to keep it here.',
    emptyReflections: 'No personal reflections recorded yet.',
    studyVerse: 'Open Verse',
    offlineBadgeReady: 'Offline Ready',
    offlineBadgeActive: 'Offline Mode Active',
    passagesLabel: 'passages cached',
    audioLabel: 'audio cached',
    saveAudioBtn: 'Save Audio Offline',
    audioCachedBtn: 'Audio Offline',
  },
  sv: {
    title: 'Dagbok & Sparade Verser',
    subtitle: 'Ditt personliga reflektionsutrymme sparat lokalt på din enhet.',
    savedTab: 'Sparade verser',
    journeyTab: 'Reflektioner',
    searchPlaceholder: 'Sök i verser eller anteckningar...',
    allTopics: 'Alla ämnen',
    emptySaved: 'Inga sparade verser hittades.',
    emptyReflections: 'Inga reflektioner sparade ännu.',
    studyVerse: 'Öppna vers',
    offlineBadgeReady: 'Tillgänglig offline',
    offlineBadgeActive: 'Offlineläge aktivt',
    passagesLabel: 'passager sparade',
    audioLabel: 'ljud sparade',
    saveAudioBtn: 'Spara ljud offline',
    audioCachedBtn: 'Ljud sparat offline',
  },
  fr: {
    title: 'Journal & Versets Enregistrés',
    subtitle: 'Votre espace personnel de méditation conservé sur votre appareil.',
    savedTab: 'Versets enregistrés',
    journeyTab: 'Méditations',
    searchPlaceholder: 'Rechercher des versets ou notes...',
    allTopics: 'Tous les thèmes',
    emptySaved: 'Aucun verset enregistré.',
    emptyReflections: 'Aucune méditation enregistrée.',
    studyVerse: 'Ouvrir le verset',
    offlineBadgeReady: 'Prêt hors-ligne',
    offlineBadgeActive: 'Mode hors-ligne actif',
    passagesLabel: 'passages en cache',
    audioLabel: 'audios en cache',
    saveAudioBtn: 'Audio hors-ligne',
    audioCachedBtn: 'Audio enregistré',
  },
  ar: {
    title: 'يوميات التدبر والآيات المحفوظة',
    subtitle: 'مساحتك الخاصة لحفظ الآيات والخواطر محلياً بخصوصية تامة.',
    savedTab: 'الآيات المحفوظة',
    journeyTab: 'تأملاتي',
    searchPlaceholder: 'ابحث في الآيات أو التأملات...',
    allTopics: 'كافة المواضيع',
    emptySaved: 'لا توجد آيات محفوظة حالياً.',
    emptyReflections: 'لا توجد تأملات مسجلة بعد.',
    studyVerse: 'عرض الآية',
    offlineBadgeReady: 'متاح بدون إنترنت',
    offlineBadgeActive: 'وضع عدم الاتصال نشط',
    passagesLabel: 'مقاطع محفوظة',
    audioLabel: 'تلاوات محفوظة',
    saveAudioBtn: 'حفظ التلاوة بدون إنترنت',
    audioCachedBtn: 'التلاوة محفوظة',
  },
};

export const JournalDrawer: React.FC<JournalDrawerProps> = ({
  isOpen,
  onClose,
  allVerses,
  language,
  onSelectVerse,
  onRemoveBookmark,
  inlinePage = false,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'journey'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<ReflectionMood | 'all'>('all');
  const [cachedAudioUrls, setCachedAudioUrls] = useState<string[]>([]);
  const [busyAudioVerseId, setBusyAudioVerseId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isOnline, stats, refreshStats } = useOfflineStatus();
  const t = JOURNAL_STRINGS[language] || JOURNAL_STRINGS.en;
  const moodLabels = MOOD_FILTER_LABELS[language] || MOOD_FILTER_LABELS.en;

  useEffect(() => {
    setCachedAudioUrls(OfflineCacheService.getTrackedAudioUrls());
    const handleUpdate = () => {
      setCachedAudioUrls(OfflineCacheService.getTrackedAudioUrls());
      refreshStats();
    };
    window.addEventListener('hidaya-offline-cache-updated', handleUpdate);
    return () => window.removeEventListener('hidaya-offline-cache-updated', handleUpdate);
  }, [refreshStats]);

  if (!isOpen) return null;

  const bookmarkIds = StorageService.getBookmarks();
  const bookmarkedVerses = allVerses.filter((v) => bookmarkIds.includes(v.id));
  const reflections = StorageService.getReflections();
  const allTopics = Array.from(new Set(bookmarkedVerses.flatMap((v) => v.topics)));

  const handleToggleVerseAudio = async (verse: QuranVerseFixture) => {
    if (!verse.audioUrl || busyAudioVerseId === verse.id) return;
    setBusyAudioVerseId(verse.id);
    try {
      await OfflineCacheService.toggleVerseAudioCache(verse.audioUrl);
      setCachedAudioUrls(OfflineCacheService.getTrackedAudioUrls());
      await refreshStats();
    } finally {
      setBusyAudioVerseId(null);
    }
  };

  const handleExport = () => {
    JournalStorage.exportJournalBackup();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = JournalStorage.importJournalBackup(content);
      if (success) {
        window.location.reload();
      }
    };
    reader.readAsText(file);
  };

  const filteredVerses = bookmarkedVerses.filter((verse) => {
    const userNote = reflections[verse.id];
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      verse.arabicText.includes(searchQuery) ||
      verse.translations.en.text.toLowerCase().includes(q) ||
      (verse.translations[language]?.text || '').toLowerCase().includes(q) ||
      verse.id.includes(searchQuery) ||
      (userNote?.reflectNotes || '').toLowerCase().includes(q) ||
      (userNote?.applyNotes || '').toLowerCase().includes(q) ||
      (userNote?.liveNotes || '').toLowerCase().includes(q);

    const matchesTopic = selectedTopic ? verse.topics.includes(selectedTopic) : true;
    const matchesMood = selectedMood === 'all' ? true : userNote?.mood === selectedMood;
    const hasReflection =
      !!userNote?.reflectNotes || !!userNote?.applyNotes || !!userNote?.liveNotes;
    const matchesTab = activeTab === 'bookmarks' ? true : hasReflection;

    return matchesSearch && matchesTopic && matchesMood && matchesTab;
  });

  const content = (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className={
        inlinePage
          ? 'w-full max-w-2xl mx-auto rounded-3xl bg-white dark:bg-[#0A1E17] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs overflow-hidden flex flex-col'
          : 'w-full max-w-2xl max-h-[85vh] rounded-t-2xl overflow-y-auto bg-[#FAF8F5] dark:bg-[#071913] text-slate-900 dark:text-slate-100 shadow-2xl border-t border-emerald-900/20 dark:border-emerald-700/40 flex flex-col'
      }
    >
      {!inlinePage && (
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-emerald-900/30 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-50">
            {t.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.subtitle}</p>

          {/* Subtle Inline Offline Readiness Status Line */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-300 tabular-nums">
            {!isOnline ? (
              <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            ) : (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span className="font-semibold">
              {!isOnline ? t.offlineBadgeActive : t.offlineBadgeReady}
            </span>
            <span className="text-slate-400" aria-hidden="true">
              ·
            </span>
            <span>
              {stats.cachedPassagesCount} {t.passagesLabel}
            </span>
            <span className="text-slate-400" aria-hidden="true">
              ·
            </span>
            <span>
              {stats.cachedAudioCount} {t.audioLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleExport}
            className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition cursor-pointer"
            title="Backup Journal"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition cursor-pointer"
            title="Restore Journal"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleImport}
          />
          {!inlinePage && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-emerald-900/10 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
              aria-label="Close journal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-emerald-900/30">
        <button
          type="button"
          className={`flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'bookmarks'
              ? 'border-emerald-700 text-emerald-900 dark:text-emerald-300'
              : 'border-transparent text-slate-500'
          }`}
          onClick={() => setActiveTab('bookmarks')}
        >
          {t.savedTab} ({bookmarkedVerses.length})
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'journey'
              ? 'border-emerald-700 text-emerald-900 dark:text-emerald-300'
              : 'border-transparent text-slate-500'
          }`}
          onClick={() => setActiveTab('journey')}
        >
          {t.journeyTab}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="p-5 space-y-3 bg-[#FAF8F5]/60 dark:bg-emerald-950/20 border-b border-slate-100 dark:border-emerald-900/30">
        <div className="relative">
          <Search className="w-4 h-4 absolute start-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-10 pe-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-emerald-950/50 border border-slate-200 dark:border-emerald-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        {allTopics.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedTopic(null)}
              className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer ${
                !selectedTopic
                  ? 'bg-emerald-800 text-white'
                  : 'bg-white dark:bg-emerald-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-emerald-800/40'
              }`}
            >
              {t.allTopics}
            </button>
            {allTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  selectedTopic === topic
                    ? 'bg-emerald-800 text-white'
                    : 'bg-white dark:bg-emerald-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-emerald-800/40'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        )}
        {/* Mood Filter Controls */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {(['all', 'calm', 'hopeful', 'grateful', 'anxious', 'overwhelmed'] as const).map(
            (moodKey) => (
              <button
                key={moodKey}
                type="button"
                onClick={() => setSelectedMood(moodKey)}
                className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  selectedMood === moodKey
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-white dark:bg-emerald-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-emerald-800/40'
                }`}
              >
                {moodLabels[moodKey]}
              </button>
            )
          )}
        </div>
      </div>

      {/* Saved Verses List */}
      <div className="p-5 space-y-4">
        {filteredVerses.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-emerald-950/40 text-slate-400 flex items-center justify-center mx-auto">
              <Bookmark className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {activeTab === 'bookmarks' ? t.emptySaved : t.emptyReflections}
            </p>
          </div>
        ) : (
          filteredVerses.map((verse) => {
            const translationObj = verse.translations[language] || verse.translations.en;
            const userNote = reflections[verse.id];
            const audioIsCached = cachedAudioUrls.includes(verse.audioUrl);

            return (
              <div
                key={verse.id}
                className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300">
                      Surah {verse.surahNameTransliterated} · {verse.id}
                    </span>
                    {userNote?.mood && (
                      <span className="text-amber-700 dark:text-amber-400 font-medium">
                        · {moodLabels[userNote.mood]}
                      </span>
                    )}
                    {userNote?.date && (
                      <span className="text-slate-400 tabular-nums">
                        · {userNote.date.slice(0, 10)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveBookmark(verse.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    aria-label="Remove bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p
                  dir="rtl"
                  className="font-arabic text-right text-lg text-emerald-950 dark:text-emerald-100 leading-relaxed"
                >
                  {verse.arabicText}
                </p>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic">
                  &ldquo;{translationObj.text}&rdquo;
                </p>

                {(userNote?.reflectNotes || userNote?.applyNotes || userNote?.liveNotes) && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-emerald-950/60 border border-emerald-900/10 dark:border-emerald-800/40 text-xs space-y-1.5">
                    {userNote.reflectNotes && (
                      <p className="text-slate-700 dark:text-slate-200">{userNote.reflectNotes}</p>
                    )}
                    {userNote.applyNotes && (
                      <p className="text-emerald-800 dark:text-emerald-300 font-medium">
                        → {userNote.applyNotes}
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleVerseAudio(verse)}
                    disabled={busyAudioVerseId === verse.id}
                    className={`min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      audioIsCached
                        ? 'bg-emerald-900/10 border-emerald-700/40 text-emerald-900 dark:text-emerald-200'
                        : 'bg-white dark:bg-emerald-950/50 border-slate-200 dark:border-emerald-800/40 text-slate-600 dark:text-slate-300 hover:border-emerald-600'
                    }`}
                  >
                    {audioIsCached ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Headphones className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>
                      {busyAudioVerseId === verse.id
                        ? '...'
                        : audioIsCached
                        ? t.audioCachedBtn
                        : t.saveAudioBtn}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectVerse(verse);
                      onClose?.();
                    }}
                    className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    <span>{t.studyVerse}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  if (inlinePage) {
    return content;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {content}
    </div>
  );
};
