import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Save,
  Presentation,
  Printer,
  Check,
  Share2,
} from 'lucide-react';
import { QuranVerseFixture, UserReflection, Language } from '../types';
import { StorageService } from '../services/storage';
import { ExportService } from '../services/exportService';

interface ReflectionDrawerProps {
  verse: QuranVerseFixture | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onReflectionSaved?: () => void;
}

export const ReflectionDrawer: React.FC<ReflectionDrawerProps> = ({
  verse,
  isOpen,
  onClose,
  language,
  onReflectionSaved,
}) => {
  const [reflectNotes, setReflectNotes] = useState('');
  const [applyNotes, setApplyNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);

  useEffect(() => {
    if (verse) {
      const existing = StorageService.getReflection(verse.id);
      if (existing) {
        setReflectNotes(existing.reflectNotes || '');
        setApplyNotes(existing.applyNotes || '');
      } else {
        setReflectNotes('');
        setApplyNotes('');
      }
      setIsSaved(false);
    }
  }, [verse]);

  if (!isOpen || !verse) return null;

  const handleSave = () => {
    StorageService.saveReflection(verse.id, {
      verseId: verse.id,
      reflectNotes,
      applyNotes,
    });
    setIsSaved(true);
    if (onReflectionSaved) onReflectionSaved();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportPPTX = async () => {
    try {
      setIsExportingPPTX(true);
      const reflection: UserReflection = {
        verseId: verse.id,
        date: new Date().toISOString(),
        understandNotes: verse.reflectionFramework.understand,
        reflectNotes,
        applyNotes,
      };
      await ExportService.exportToPPTX(verse, language, reflection);
    } catch (err) {
      console.error('Failed to export PPTX', err);
    } finally {
      setIsExportingPPTX(false);
    }
  };

  const handleExportPDF = () => {
    ExportService.exportToPDF();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reflection-drawer-title"
    >
      <div className="relative w-full max-w-2xl h-full bg-[#FAF8F5] dark:bg-[#071913] text-slate-900 dark:text-slate-100 shadow-2xl flex flex-col border-l border-emerald-900/20 dark:border-emerald-700/40 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between bg-emerald-900/5 dark:bg-emerald-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-800 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="reflection-drawer-title" className="text-base font-bold text-emerald-950 dark:text-emerald-50">
                From Quran to Life • 3-Step Reflection
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Surah {verse.surahNameTransliterated} ({verse.id}) • Personal Contemplation Flow
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-emerald-900/40 transition-colors"
            aria-label="Close reflection drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick verse anchor */}
          <div className="p-4 rounded-xl bg-white dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30">
            <p className="font-arabic text-right text-lg text-emerald-950 dark:text-emerald-100 mb-2 leading-loose">
              {verse.arabicText}
            </p>
            <p className="text-xs italic text-slate-600 dark:text-slate-300">
              &quot;{verse.translations[language]?.text || verse.translations.en.text}&quot;
            </p>
          </div>

          {/* STEP 1: UNDERSTAND */}
          <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950/20 border-l-4 border-emerald-600 border-t border-r border-b border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="text-sm font-bold tracking-wide uppercase">
                Step 1: Understand (Linguistic & Quranic Nuance)
              </h3>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 pl-8">
              {verse.reflectionFramework.understand}
            </p>
          </div>

          {/* STEP 2: REFLECT */}
          <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950/20 border-l-4 border-blue-600 border-t border-r border-b border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="text-sm font-bold tracking-wide uppercase">
                Step 2: Reflect (Heart & Situation Check)
              </h3>
            </div>

            <div className="pl-8 space-y-2">
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                {verse.reflectionFramework.reflectPrompt}
              </p>

              <textarea
                value={reflectNotes}
                onChange={(e) => setReflectNotes(e.target.value)}
                placeholder="Write your honest thoughts, current situation, or emotional hurdles here..."
                rows={4}
                className="w-full p-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-950/40 border border-slate-300 dark:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                aria-label="Personal reflection notes"
              />
            </div>
          </div>

          {/* STEP 3: APPLY */}
          <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950/20 border-l-4 border-amber-600 border-t border-r border-b border-emerald-900/10 dark:border-emerald-800/30 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h3 className="text-sm font-bold tracking-wide uppercase">
                Step 3: Apply (Daily Action or Mindset Shift)
              </h3>
            </div>

            <div className="pl-8 space-y-2">
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                {verse.reflectionFramework.applyAction}
              </p>

              <textarea
                value={applyNotes}
                onChange={(e) => setApplyNotes(e.target.value)}
                placeholder="What is one concrete act, boundary, du'a, or behavioral pause you commit to doing today?"
                rows={3}
                className="w-full p-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-emerald-950/40 border border-slate-300 dark:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                aria-label="Action commitment notes"
              />
            </div>
          </div>

          {/* Privacy Note */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
            Your reflection notes are stored privately in your browser&apos;s local storage. Anonymous guest access is standard.
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-emerald-900/10 dark:border-emerald-800/30 bg-[#FAF8F5] dark:bg-[#071913] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPPTX}
              disabled={isExportingPPTX}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:border-emerald-600 transition-colors disabled:opacity-50 cursor-pointer"
              title="Download 16:9 presentation slide with your reflection"
            >
              <Presentation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isExportingPPTX ? 'Generating...' : 'Export PPTX'}</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:border-emerald-600 transition-colors cursor-pointer"
              title="Print or save as PDF reflection card"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Print / PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-sm transition-all cursor-pointer ${
                isSaved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Saved Locally!' : 'Save Reflection'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
