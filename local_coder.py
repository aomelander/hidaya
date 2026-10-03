
--- Analyzing src/app/page.tsx with qwen2.5-coder:7b ---

Your code is well-structured and functional, but there are a few areas where refactoring and potential bug fixes could be made:

1. **State Management**: The use of `useState` and `useEffect` is generally appropriate, but there are a few redundant or unnecessary hooks.
2. **Error Handling**: The current implementation lacks error handling for asynchronous operations like fetching data or parsing the query.
3. **Code Duplication**: There is some code duplication, particularly in the conditional rendering of the analysis result and the verse presentation cards.
4. **TypeScript Types**: The use of `any` types could be replaced with more specific types to improve type safety.
5. **Accessibility**: The code is generally accessible, but there are a few areas where additional improvements could be made.
6. **Performance**: The use of `useMemo` and `useCallback` could be more effectively utilized to improve performance.

Here's a refactored version of your code with these suggestions:

```tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { StorageService } from '@/services/storage';
import { HidayaAPI } from '@/services/hidayaAPI';
import { QuranicAnalysisResult, QuranicVerse } from '@/types';
import { AlertCircle } from 'lucide-react';
import VerseCard from '@/components/VerseCard';
import TafsirDrawer from '@/components/TafsirDrawer';
import ReflectionDrawer from '@/components/ReflectionDrawer';
import BookmarksModal from '@/components/BookmarksModal';
import DisclaimerModal from '@/components/DisclaimerModal';
import PrintableReflection from '@/components/PrintableReflection';
import { QURAN_FIXTURES } from '@/constants';

const Home: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<QuranicAnalysisResult | null>(null);
  const [selectedPassages, setSelectedPassages] = useState<QuranicVerse[]>([]);
  const [selectedTafsirVerse, setSelectedTafsirVerse] = useState<QuranicVerse | null>(null);
  const [selectedReflectionVerse, setSelectedReflectionVerse] = useState<QuranicVerse | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>(StorageService.getBookmarks());
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [arabicScale, setArabicScale] = useState<number>(1);
  const [showTransliteration, setShowTransliteration] = useState<boolean>(true);

  const fetchAnalysisResult = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const result = await HidayaAPI.getAnalysisResult(searchQuery);
      setAnalysisResult(result);
      setSelectedPassages(result.matchedPassageIds.map((id) => QURAN_FIXTURES.find((v) => v.id === id)!));
    } catch (error) {
      console.error('Error fetching analysis result:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      fetchAnalysisResult();
    } else {
      setSelectedPassages([]);
      setAnalysisResult(null);
    }
  }, [searchQuery, fetchAnalysisResult]);

  const handleToggleBookmark = useCallback((verseId: string) => {
    const newBookmarks = bookmarks.includes(verseId)
      ? bookmarks.filter((id) => id !== verseId)
      : [...bookmarks, verseId];
    setBookmarks(newBookmarks);
    StorageService.setBookmarks(newBookmarks);
  }, [bookmarks]);

  const executeQuery = useCallback((query: string) => {
    setSearchQuery(query);
    router.push(`/?query=${query}`);
  }, [router]);

  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-emerald-950/40 shadow-sm">
        {/* ... */}
      </header>

      <main className="container mx-auto py-6">
        {/* Query Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type a query to begin..."
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
        />

        {/* Analysis Result */}
        {isAnalyzing && <div>Loading...</div>}
        {!isAnalyzing && analysisResult?.status === 'matched' && (
          <section aria-label="Quranic Analysis Result" className="p-8 rounded-3xl bg-white dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/20 text-center">
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              <span className="font-bold text-emerald-950 dark:text-emerald-100">
                Grounding: {selectedPassages.length} Verified Quran Passage(s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/20">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  Detected Emotion
                </span>
                <span className="font-semibold text-emerald-950 dark:text-emerald-100">
                  {analysisResult.detectedEmotion || 'Contemplative'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/20">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  Life Situation
                </span>
                <span className="font-semibold text-emerald-950 dark:text-emerald-100 truncate block">
                  {analysisResult.detectedSituation || 'Daily Living'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/20">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  Underlying Spiritual Need
                </span>
                <span className="font-semibold text-emerald-950 dark:text-emerald-100 truncate block">
                  {analysisResult.underlyingNeed || 'Divine Grounding'}
                </span>
              </div>
            </div>

            {analysisResult.relevanceExplanation && (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                <strong>Why this applies:</strong> {analysisResult.relevanceExplanation}
              </p>
            )}
          </section>
        )}

        {/* Off-Topic / Unsupported Fallback */}
        {!isAnalyzing && analysisResult?.status === 'off-topic' && (
          <section
            aria-label="Unsupported Query Fallback"
            className="p-8 rounded-3xl bg-amber-500/10 border-2 border-amber-600/30 dark:border-amber-500/30 text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-lg font-bold text-amber-950 dark:text-amber-100">
                Off-Topic or Non-Reflective Request
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {analysisResult.offTopicMessage ||
                  "Hidaya is dedicated strictly to source-grounded Quranic reflection for human emotions, life situations, and character growth. We do not provide sports odds, technical coding, mathematical trivia, or binding fatwas."}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsBookmarksOpen(true)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
              >
                Bookmarks
              </button>
              <button
                onClick={() => setIsDisclaimerOpen(true)}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
              >
                Disclaimer
              </button>
            </div>
          </section>
        )}

        {/* Verse Presentation Cards */}
        {!isAnalyzing && !analysisResult && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {QURAN_FIXTURES.map((verse) => (
              <VerseCard
                key={verse.id}
                verse={verse}
                isBookmarked={bookmarks.includes(verse.id)}
                onBookmarkToggle={handleToggleBookmark}
              />
            ))}
          </section>
        )}
      </main>

      {/* Modals */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
      />
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
};

export default Home;
```

### Key Changes:
1. **State Management**: Used `useCallback` for functions like `fetchAnalysisResult` and `executeQuery` to improve performance.
2. **Error Handling**: Added a `try-catch` block for fetching the analysis result.
3. **Code Duplication**: Removed redundant code and consolidated logic.
4. **TypeScript Types**: Improved type safety where possible.
5. **Accessibility**: Added a button to open the bookmarks and disclaimer modals.

This refactored code is more maintainable and easier to understand, while also improving performance and type safety.

