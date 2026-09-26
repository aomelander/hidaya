import React from 'react';
import { X, Bookmark, BookOpen, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { QuranVerseFixture, Language } from '../types';
import { StorageService } from '../services/storage';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  allVerses: QuranVerseFixture[];
  language: Language;
  onSelectVerse: (verse: QuranVerseFixture) => void;
  onRemoveBookmark: (verseId: string) => void;
  onOpenReflection: (verse: QuranVerseFixture) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  allVerses,
  language,
  onSelectVerse,
  onRemoveBookmark,
  onOpenReflection,
}) => {
  if (!isOpen) return null;

  const bookmarkIds = StorageService.getBookmarks();
  const bookmarkedVerses = allVerses.filter((v) => bookmarkIds.includes(v.id));
  const reflections = StorageService.getReflections();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookmarks-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#FAF8F5] dark:bg-[#071913] text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-emerald-900/20 dark:border-emerald-700/40 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between bg-emerald-900/5 dark:bg-emerald-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 id="bookmarks-modal-title" className="text-base font-bold text-emerald-950 dark:text-emerald-50">
                Saved Verses & Reflections ({bookmarkedVerses.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personal spiritual bookmarks stored in browser memory
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-emerald-900/40 transition-colors"
            aria-label="Close bookmarks modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {bookmarkedVerses.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-emerald-950/40 text-slate-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No saved verses yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Click the bookmark icon on any Quran passage to keep it handy for morning or evening reflection.
              </p>
            </div>
          ) : (
            bookmarkedVerses.map((verse) => {
              const translationObj = verse.translations[language] || verse.translations.en;
              const hasReflection = !!reflections[verse.id]?.reflectNotes || !!reflections[verse.id]?.applyNotes;

              return (
                <div
                  key={verse.id}
                  className="p-4 rounded-2xl bg-white dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 hover:border-emerald-500 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                        Surah {verse.surahNameTransliterated} ({verse.id})
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-2">
                        {verse.surahNameMeaning}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onRemoveBookmark(verse.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Remove bookmark"
                        aria-label={`Remove bookmark for verse ${verse.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="font-arabic text-right text-base text-emerald-950 dark:text-emerald-100 leading-relaxed">
                    {verse.arabicText}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                    &quot;{translationObj.text}&quot;
                  </p>

                  {hasReflection && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200">
                      <span className="font-semibold block mb-0.5">My Saved Reflection:</span>
                      <p className="italic line-clamp-1">
                        &quot;{reflections[verse.id]?.reflectNotes || reflections[verse.id]?.applyNotes}&quot;
                      </p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-emerald-900/30">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenReflection(verse);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{hasReflection ? 'Edit Reflection' : 'Add Reflection'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onSelectVerse(verse);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-800 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
                    >
                      <span>Study Verse</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-900/10 dark:border-emerald-800/30 bg-[#FAF8F5] dark:bg-[#071913] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-emerald-950 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-emerald-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
