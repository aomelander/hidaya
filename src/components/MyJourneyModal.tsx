"use client";

import React, { useState, useMemo } from 'react';
import {
  X,
  Compass,
  BookOpen,
  Calendar,
  Sparkles,
  Lock,
  Trash2,
  Printer,
  ChevronRight,
  Filter,
  CheckCircle2,
  Heart
} from 'lucide-react';
import { UserReflection, Language, QuranVerseFixture } from '../types';
import { StorageService } from '../services/storage';
import { QURAN_FIXTURES } from '../data/quranFixtures';

interface MyJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectVerse: (verse: QuranVerseFixture) => void;
}

export const MyJourneyModal: React.FC<MyJourneyModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectVerse,
}) => {
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [reflections, setReflections] = useState<Record<string, UserReflection>>(() =>
    StorageService.getReflections()
  );

  const refreshReflections = () => {
    setReflections(StorageService.getReflections());
  };

  const handleDeleteReflection = (verseId: string) => {
    if (confirm(language === 'sv' ? 'Vill du ta bort denna reflektion?' : language === 'fr' ? 'Supprimer cette réflexion ?' : 'Delete this reflection?')) {
      const all = { ...reflections };
      delete all[verseId];
      localStorage.setItem('hidaya_reflections', JSON.stringify(all));
      setReflections(all);
    }
  };

  const reflectionList = useMemo(() => {
    return Object.values(reflections).map((r) => {
      const verse = QURAN_FIXTURES.find((f) => f.id === r.verseId) || null;
      return {
        ...r,
        verse,
      };
    });
  }, [reflections]);

  // Topic aggregations (Patience: X, Family: Y, etc.)
  const topicStats = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of reflectionList) {
      if (item.verse) {
        for (const topic of item.verse.topics) {
          map[topic] = (map[topic] || 0) + 1;
        }
      } else {
        map['General Contemplation'] = (map['General Contemplation'] || 0) + 1;
      }
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [reflectionList]);

  // Filtered reflections
  const filteredReflections = useMemo(() => {
    if (selectedTopicFilter === 'all') return reflectionList;
    return reflectionList.filter(
      (item) => item.verse && item.verse.topics.includes(selectedTopicFilter)
    );
  }, [reflectionList, selectedTopicFilter]);

  if (!isOpen) return null;

  const tRecord: Record<Language, {
    title: string;
    subtitle: string;
    privacyBannerTitle: string;
    privacyBannerText: string;
    totalReflections: string;
    topicsCovered: string;
    filterAll: string;
    emptyTitle: string;
    emptyDesc: string;
    understandLabel: string;
    reflectLabel: string;
    applyLabel: string;
    carryLabel: string;
    reviewAyah: string;
    printJournal: string;
    close: string;
  }> = {
    en: {
      title: 'My Journey — Quran Contemplation Diary',
      subtitle: 'Your personal reflections, moral commitments, and spiritual growth milestones.',
      privacyBannerTitle: '100% Private & Locally Owned',
      privacyBannerText:
        'Your sacred reflections are preserved strictly within your browser storage. Zero personal life narratives are shared or logged.',
      totalReflections: 'Saved Reflections',
      topicsCovered: 'Spiritual Themes',
      filterAll: 'All Themes',
      emptyTitle: 'Begin Your Reflection Journey',
      emptyDesc: 'Open any Quranic passage and click "From Quran to Life" to record your contemplation.',
      understandLabel: 'Understand',
      reflectLabel: 'Reflect',
      applyLabel: 'Apply Action',
      carryLabel: 'Carry Today',
      reviewAyah: 'Contemplate Verse',
      printJournal: 'Print / PDF',
      close: 'Close',
    },
    sv: {
      title: 'Min Resa — Personlig Quran-dagbok',
      subtitle: 'Dina personliga reflektioner, moraliska handlingar och andliga steg.',
      privacyBannerTitle: '100% privat & lokalt sparad',
      privacyBannerText:
        'Dina personliga reflektioner sparas uteslutande i din webbläsare. Inga känsliga livsberättelser skickas eller loggas i molnet.',
      totalReflections: 'Sparade reflektioner',
      topicsCovered: 'Andliga teman',
      filterAll: 'Alla teman',
      emptyTitle: 'Börja din personliga resa',
      emptyDesc: 'Öppna vilken Quran-passage som helst och klicka på "Från Quran till Liv" för att skriva ner din reflektion.',
      understandLabel: 'Förstå',
      reflectLabel: 'Begrunda',
      applyLabel: 'Handling',
      carryLabel: 'Att bära med mig',
      reviewAyah: 'Återvänd till versen',
      printJournal: 'Skriv ut / PDF',
      close: 'Stäng',
    },
    fr: {
      title: 'Mon Voyage — Journal de Méditation Coranique',
      subtitle: 'Vos réflexions personnelles, résolutions morales et repères spirituels.',
      privacyBannerTitle: '100% privé & confidentiel',
      privacyBannerText:
        'Vos réflexions intimes restent strictement dans votre navigateur local. Aucun récit de vie privé n\'est envoyé sur le cloud.',
      totalReflections: 'Méditations enregistrées',
      topicsCovered: 'Thèmes spirituels',
      filterAll: 'Tous les thèmes',
      emptyTitle: 'Commencez votre voyage',
      emptyDesc: 'Ouvrez un passage coranique et cliquez sur "Du Coran à la Vie" pour noter vos pensées.',
      understandLabel: 'Comprendre',
      reflectLabel: 'Méditer',
      applyLabel: 'Action concrète',
      carryLabel: 'À emporter aujourd\'hui',
      reviewAyah: 'Contempler le verset',
      printJournal: 'Imprimer / PDF',
      close: 'Fermer',
    },
    ar: {
      title: 'رحلتي مع القرآن — دفتر التدبر والخواطر',
      subtitle: 'تأملاتك الذاتية، ومواثيقك السلوكية، ومحطات نموك الروحي والأخلاقي.',
      privacyBannerTitle: 'خصوصية كاملة ١٠٠٪ ومحفوظة في جهازك',
      privacyBannerText:
        'خواطرك وتأملاتك محفوظة حصرياً في متصفحك الشخصي. لا يتم رفع أو حفظ أي تفاصيل عن حياتك أو مشاعرك على خوادم خارجية.',
      totalReflections: 'التأملات المحفوظة',
      topicsCovered: 'المحاور الإيمانية',
      filterAll: 'كافة المحاور',
      emptyTitle: 'ابدأ رحلة تدبرك الشخصية',
      emptyDesc: 'افتح أي آية كريمة واضغط على "من القرآن إلى الحياة" لتدوين تأملاتك وخطواتك العملية.',
      understandLabel: 'الفهم والمعنى',
      reflectLabel: 'التأمل في النفس',
      applyLabel: 'التطبيق العملي',
      carryLabel: 'أثر أحمله اليوم',
      reviewAyah: 'تأمل الآية الكريمة',
      printJournal: 'طباعة / حفظ PDF',
      close: 'إغلاق',
    },
  };

  const t = tRecord[language] || tRecord.en;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-journey-title"
    >
      <div className="bg-[#FAF8F5] dark:bg-[#071813] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-emerald-900/20 dark:border-emerald-700/40 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between bg-white dark:bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 id="my-journey-title" className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-50">
                {t.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Privacy Banner */}
          <div className="p-4 rounded-2xl bg-emerald-900/5 dark:bg-emerald-950/40 border border-emerald-800/20 flex items-start gap-3">
            <Lock className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-emerald-950 dark:text-emerald-100 block">
                {t.privacyBannerTitle}
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.privacyBannerText}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 text-center">
              <span className="text-2xl font-black text-emerald-900 dark:text-emerald-200 block">
                {reflectionList.length}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {t.totalReflections}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 text-center">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block">
                {topicStats.length}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {t.topicsCovered}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 text-center flex flex-col justify-center items-center">
              <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <Heart className="w-4 h-4 fill-current text-rose-500" />
                <span>Daily Cadence</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Reflecting with North Star
              </span>
            </div>
          </div>

          {/* Topic Journey Filter Badges */}
          {topicStats.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Themes Explored:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTopicFilter('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedTopicFilter === 'all'
                      ? 'bg-emerald-900 text-white dark:bg-emerald-700 shadow-xs'
                      : 'bg-white dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-emerald-800/40 hover:bg-emerald-50'
                  }`}
                >
                  {t.filterAll} ({reflectionList.length})
                </button>
                {topicStats.map(([topic, count]) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopicFilter(topic)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedTopicFilter === topic
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-emerald-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-emerald-800/40 hover:bg-amber-50'
                    }`}
                  >
                    <span>{topic}</span>
                    <span className="ml-1 text-[10px] opacity-75">({count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reflections List */}
          {filteredReflections.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-900/10 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                {t.emptyTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {t.emptyDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReflections.map((item) => (
                <div
                  key={item.verseId}
                  className="p-5 rounded-2xl bg-white dark:bg-emerald-950/30 border border-slate-200 dark:border-emerald-800/40 shadow-xs space-y-3"
                >
                  {/* Item Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-emerald-900/30 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                        {item.verse ? `Surah ${item.verse.surahNameTransliterated} (${item.verseId})` : `Ayah ${item.verseId}`}
                      </span>
                      {item.verse?.lifeSphere && (
                        <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                          • {item.verse.lifeSphere}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleDeleteReflection(item.verseId)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete reflection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Notes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {item.understandNotes && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 block">
                          1. {t.understandLabel}
                        </span>
                        <p className="text-slate-700 dark:text-slate-200">{item.understandNotes}</p>
                      </div>
                    )}

                    {item.reflectNotes && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 block">
                          2. {t.reflectLabel}
                        </span>
                        <p className="text-slate-700 dark:text-slate-200">{item.reflectNotes}</p>
                      </div>
                    )}

                    {item.applyNotes && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-emerald-900/20 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block">
                          3. {t.applyLabel}
                        </span>
                        <p className="text-slate-700 dark:text-slate-200">{item.applyNotes}</p>
                      </div>
                    )}

                    {item.liveNotes && (
                      <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-600/20 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>4. {t.carryLabel}</span>
                        </span>
                        <p className="text-slate-800 dark:text-slate-100 font-medium">{item.liveNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {item.verse && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => {
                          onSelectVerse(item.verse!);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-600 cursor-pointer"
                      >
                        <span>{t.reviewAyah}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between bg-white dark:bg-emerald-950/40 text-xs">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-emerald-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printJournal}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
