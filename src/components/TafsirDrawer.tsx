"use client";

import React, { useState } from 'react';
import { X, ScrollText, History, Quote } from 'lucide-react';
import { QuranVerseFixture, Language } from '../types';
import { getDictionary } from '../lib/i18n/dictionaries';

interface TafsirDrawerProps {
  verse: QuranVerseFixture | null;
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
}

export const TafsirDrawer: React.FC<TafsirDrawerProps> = ({
  verse,
  isOpen,
  onClose,
  language = 'en',
}) => {
  const [selectedScholar, setSelectedScholar] = useState<'Ibn Kathir' | "Al-Sa'di" | 'Al-Muyassar'>('Ibn Kathir');

  if (!isOpen || !verse) return null;

  const dict = getDictionary(language);
  const currentCitation =
    verse.tafsirCitations.find((c) => c.scholar === selectedScholar) || verse.tafsirCitations[0];

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tafsir-drawer-title"
    >
      <div className="relative w-full max-w-xl h-full bg-[#FAF8F5] dark:bg-[#081B15] text-slate-900 dark:text-slate-100 shadow-2xl flex flex-col border-s border-emerald-900/20 dark:border-emerald-700/40 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between rtl:space-x-reverse bg-emerald-900/5 dark:bg-emerald-950/40">
          <div className="flex items-center gap-2.5 rtl:space-x-reverse">
            <div className="p-2 rounded-lg bg-emerald-800 text-amber-300">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="tafsir-drawer-title" className="text-base font-bold text-emerald-950 dark:text-emerald-50">
                {language === 'ar'
                  ? `المستوى ٣: ${dict.tafsirHeader}`
                  : `Level 3: ${dict.tafsirHeader}`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ar'
                  ? `سورة ${verse.surahNameArabic} (${verse.id}) • التراث التفسيري المعتمد`
                  : `Surah ${verse.surahNameTransliterated} (${verse.id}) • Certified Exegetical Tradition`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 ms-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
            aria-label="Close Tafsir drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Revelation Context Card */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-600/20 dark:border-amber-500/20 text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-2 rtl:space-x-reverse mb-2 text-amber-900 dark:text-amber-300 font-semibold text-xs tracking-wider uppercase">
              <History className="w-4 h-4" />
              <span>
                {language === 'ar'
                  ? 'عهد التنزيل وأسباب النزول'
                  : 'Revelation Era & Asbab al-Nuzul'}
              </span>
            </div>
            <div className="flex items-center gap-2 rtl:space-x-reverse mb-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                {verse.revelationType}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ar' ? `الجزء ${verse.juz}` : `Juz ${verse.juz}`}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {verse.revelationContext}
            </p>
          </div>

          {/* Scholar Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              {language === 'ar' ? 'اختر المصدر التفسيري المعتمد:' : 'Select Authoritative Exegesis:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {verse.tafsirCitations.map((citation) => (
                <button
                  key={citation.scholar}
                  onClick={() => setSelectedScholar(citation.scholar)}
                  className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                    selectedScholar === citation.scholar
                      ? 'bg-emerald-800 text-white border-emerald-900 dark:bg-emerald-700 shadow-sm'
                      : 'bg-white dark:bg-emerald-950/40 border-slate-200 dark:border-emerald-800/40 text-slate-700 dark:text-slate-300 hover:border-emerald-600'
                  }`}
                >
                  <p className="text-xs font-bold truncate">{citation.scholar}</p>
                  <p
                    className={`text-[10px] truncate ${
                      selectedScholar === citation.scholar ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {citation.century}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Tafsir Quotation */}
          {currentCitation && (
            <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-emerald-900/40">
                <div>
                  <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    {currentCitation.scholar}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    {language === 'ar' ? 'المصدر: ' : 'Source: '}
                    {currentCitation.sourceBook}
                  </p>
                </div>
                <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  <Quote className="w-4 h-4" />
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-normal">
                  {currentCitation.text}
                </p>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <span>
                  {language === 'ar'
                    ? 'نص موثق من أمهات كتب التفسير المعتمدة.'
                    : 'Verified canonical transcription from classical Arabic exegeses.'}
                </span>
              </div>
            </div>
          )}

          {/* Academic Integrity Note */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-900/20 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {language === 'ar' ? 'الأمانة العلمية والتوثيق' : 'Scholarly Lineage'}
            </p>
            <p>
              {language === 'ar'
                ? 'تحفظ التفاسير المأثورة سلاسل الإسناد والضوابط اللغوية للقرون الأولى، وتلتزم هداية بعرضها دون تحريف أو اجتزاء.'
                : 'Classical exegeses preserve the transmission chains (Isnad) and linguistic norms of the early prophetic community. Hidaya never truncates or alters classical meanings to fit contemporary colloquialisms.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-900/10 dark:border-emerald-800/30 bg-[#FAF8F5] dark:bg-[#081B15] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white shadow-sm transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق التفسير' : 'Close Tafsir'}
          </button>
        </div>
      </div>
    </div>
  );
};
