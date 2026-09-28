"use client";

import React, { useState } from 'react';
import { X, BookOpen, Sparkles, CheckCircle2, HelpCircle, Compass, Search } from 'lucide-react';
import { Language } from '../types';
import { INQUIRER_GLOSSARY, InquirerGlossaryTerm } from '../data/editorialReviews';

interface InquirerGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const InquirerGlossaryModal: React.FC<InquirerGlossaryModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const tRecord: Record<Language, {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    universalLesson: string;
    misconception: string;
    close: string;
  }> = {
    en: {
      title: 'Inquirer & Curious Seeker Glossary',
      subtitle: 'Universal ethical insights from Quranic terms with common misconceptions clarified.',
      searchPlaceholder: 'Search Quranic concept (Sabr, Ihsan, Rahmah)...',
      universalLesson: 'Universal Ethical Dimension',
      misconception: 'Common Misconception Clarified',
      close: 'Close Glossary',
    },
    sv: {
      title: 'Begreppsordlista för den nyfikne & sökaren',
      subtitle: 'Universella etiska insikter ur Quran-begrepp med vanliga missuppfattningar utredda.',
      searchPlaceholder: 'Sök begrepp (Sabr, Ihsan, Rahmah)...',
      universalLesson: 'Universell etisk dimension',
      misconception: 'Vanlig missuppfattning utredd',
      close: 'Stäng ordlista',
    },
    fr: {
      title: 'Glossaire pour le Chercheur de Sagesse',
      subtitle: 'Perspectives éthiques universelles issues du Coran avec éclaircissements sur les idées reçues.',
      searchPlaceholder: 'Rechercher un concept (Sabr, Ihsan, Rahmah)...',
      universalLesson: 'Dimension éthique universelle',
      misconception: 'Idée reçue clarifiée',
      close: 'Fermer le glossaire',
    },
    ar: {
      title: 'معجم البصائر والمفاهيم القرآنية الكبرى',
      subtitle: 'أبعاد إيمانية وأخلاقية شاملة للمصطلحات القرآنية مع توضيح وتصحيح المفاهيم الخاطئة الشائعة.',
      searchPlaceholder: 'ابحث في المصطلحات (صبر، إحسان، توكل، رحمة)...',
      universalLesson: 'البعد الأخلاقي والإنساني الشامل',
      misconception: 'تصحيح المفهوم الخاطئ الشائع',
      close: 'إغلاق المعجم',
    },
  };

  const t = tRecord[language] || tRecord.en;

  const filteredGlossary = INQUIRER_GLOSSARY.filter((g) => {
    const lesson = g.universalLesson[language] || g.universalLesson.en;
    return (
      g.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.arabic.includes(searchTerm) ||
      lesson.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-title"
    >
      <div className="bg-[#FAF8F5] dark:bg-[#071813] w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl border border-emerald-900/20 dark:border-emerald-700/40 flex flex-col overflow-hidden text-slate-800 dark:text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between bg-white dark:bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 id="glossary-title" className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-50">
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

        {/* Search */}
        <div className="p-4 border-b border-emerald-900/10 dark:border-emerald-800/30 bg-slate-50/50 dark:bg-emerald-950/20">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/40 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Glossary Items List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredGlossary.map((item) => (
            <div
              key={item.term}
              className="p-5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900/30 pb-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                    {item.term}
                  </h3>
                  <span className="font-arabic text-amber-700 dark:text-amber-400 text-lg">
                    ({item.arabic})
                  </span>
                </div>
                <span className="text-xs text-slate-500 italic">
                  {item.literalMeaning}
                </span>
              </div>

              {/* Universal Lesson */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide block text-[10px]">
                  ✦ {t.universalLesson}
                </span>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                  {item.universalLesson[language] || item.universalLesson.en}
                </p>
              </div>

              {/* Misconception Clarified */}
              <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-600/20 space-y-1 text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide block text-[10px] flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-amber-600" />
                  <span>{t.misconception}</span>
                </span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                  {item.misconceptionClarified[language] || item.misconceptionClarified.en}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-900/10 dark:border-emerald-800/30 flex justify-end bg-white dark:bg-emerald-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
