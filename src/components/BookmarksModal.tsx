"use client";

import React, { useState, useRef } from 'react';
import { X, Bookmark, BookOpen, Trash2, ArrowRight, Sparkles, Download, Upload, Search, Filter } from 'lucide-react';
import { QuranVerseFixture, Language } from '../types';
import { StorageService } from '../services/storage';
import { JournalStorage } from '../lib/storage/journalStorage';

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
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'journey'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const bookmarkIds = StorageService.getBookmarks();
  const bookmarkedVerses = allVerses.filter((v) => bookmarkIds.includes(v.id));
  const reflections = StorageService.getReflections();

  // Extract all unique topics from bookmarked verses
  const allTopics = Array.from(new Set(bookmarkedVerses.flatMap((v) => v.topics)));

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
        alert('Journal imported successfully!');
        window.location.reload(); // Quick way to refresh state
      } else {
        alert('Failed to import journal. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const filteredVerses = bookmarkedVerses.filter((verse) => {
    const matchesSearch = verse.arabicText.includes(searchQuery) || 
      verse.translations.en.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (verse.translations[language]?.text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      verse.id.includes(searchQuery);
      
    const matchesTopic = selectedTopic ? verse.topics.includes(selectedTopic) : true;
    
    // For journey tab, only show verses that have reflections
    const hasReflection = !!reflections[verse.id]?.reflectNotes || !!reflections[verse.id]?.applyNotes;
    const matchesTab = activeTab === 'bookmarks' ? true : hasReflection;

    return matchesSearch && matchesTopic && matchesTab;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md h-full bg-[#FAF8F5] dark:bg-[#071913] text-slate-900 dark:text-slate-100 shadow-2xl border-l border-emerald-900/20 dark:border-emerald-700/40 flex flex-col transform transition-transform">
        {/* Header */}
        <div className="p-5 border-b border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between bg-emerald-900/5 dark:bg-emerald-950/40">
          <div>
            <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
              Journal & Bookmarks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your personal reflection space
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition" title="Backup Journal">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition" title="Restore Journal">
              <Upload className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-emerald-900/10 dark:border-emerald-800/30">
          <button 
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'bookmarks' ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300' : 'border-transparent text-slate-500'}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            Saved Verses
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'journey' ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300' : 'border-transparent text-slate-500'}`}
            onClick={() => setActiveTab('journey')}
          >
            Reflection Journey
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 space-y-3 bg-white dark:bg-emerald-950/20 border-b border-emerald-900/10 dark:border-emerald-800/30">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search verses or reflections..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          {allTopics.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button 
                onClick={() => setSelectedTopic(null)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${!selectedTopic ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-slate-100 text-slate-600 dark:bg-emerald-950 dark:text-slate-400'}`}
              >
                All Topics
              </button>
              {allTopics.map(topic => (
                <button 
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${selectedTopic === topic ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-slate-100 text-slate-600 dark:bg-emerald-950 dark:text-slate-400'}`}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredVerses.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-emerald-950/40 text-slate-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {activeTab === 'bookmarks' ? 'No saved verses found' : 'No reflections found'}
              </p>
            </div>
          ) : (
            filteredVerses.map((verse) => {
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
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onRemoveBookmark(verse.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/40 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
                      {reflections[verse.id]?.reflectNotes && (
                        <div className="mb-2">
                          <span className="font-semibold block mb-0.5">Reflection:</span>
                          <p className="italic">&quot;{reflections[verse.id]?.reflectNotes}&quot;</p>
                        </div>
                      )}
                      {reflections[verse.id]?.applyNotes && (
                        <div>
                          <span className="font-semibold block mb-0.5">Action:</span>
                          <p className="italic">&quot;{reflections[verse.id]?.applyNotes}&quot;</p>
                        </div>
                      )}
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
      </div>
    </div>
  );
};
