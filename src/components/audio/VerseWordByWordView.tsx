"use client";

/**
 * @file src/components/audio/VerseWordByWordView.tsx
 * @description "Coran Duo / Apprentissage" Word-by-Word Visualizer (PDF Pages 1, 5, 7–11).
 * Renders each Quranic word as a right-to-left interactive card block:
 * - Top Row: Uthmani Arabic word (`font-arabic`)
 * - Middle Row: Phonetic transliteration badge (`wa bar-ran`, `hay-yan`, etc.)
 * - Bottom Row (optional): Concise word-by-word translation
 * Highlights the active word in real time using `currentTimeMs` (`start_ms <= currentTimeMs <= end_ms`)
 * or fallback `activeWordIndex`, and marks `data-word-index` for smooth eye-level teleprompter scrolling.
 */

import React from 'react';
import { Language, WordTimestamp } from '../../types';
import { findActiveWordIndexByMs } from '../../lib/audio/wordTimestampsResolver';

export interface VerseWordByWordViewProps {
  timestamps: WordTimestamp[];
  currentTimeMs: number;
  activeWordIndex?: number;
  isPlaying?: boolean;
  arabicScale?: number;
  showTransliteration?: boolean;
  showWordTranslation?: boolean;
  language: Language;
  onSelectWord?: (word: WordTimestamp, index: number) => void;
}

export const VerseWordByWordView: React.FC<VerseWordByWordViewProps> = ({
  timestamps,
  currentTimeMs,
  activeWordIndex = -1,
  isPlaying = false,
  arabicScale = 1.15,
  showTransliteration = true,
  showWordTranslation = true,
  onSelectWord,
}) => {
  const computedMsIndex =
    isPlaying && currentTimeMs > 0 ? findActiveWordIndexByMs(timestamps, currentTimeMs) : -1;
  const effectiveActiveIndex = computedMsIndex >= 0 ? computedMsIndex : activeWordIndex;

  if (!timestamps || timestamps.length === 0) return null;

  const fontSizePx = Math.round(24 * arabicScale);

  return (
    <div
      dir="rtl"
      lang="ar"
      className="flex flex-wrap items-stretch justify-start gap-2.5 sm:gap-3 py-1 select-text"
      role="list"
      aria-label="Word-by-word Quranic Arabic with phonetic transliteration"
    >
      {timestamps.map((item, idx) => {
        const isActive = isPlaying && idx === effectiveActiveIndex;
        const arabicWord = item.word_arabic || item.word || '';
        const translit = item.transliteration || '';
        const translation = item.translation || '';

        return (
          <button
            key={`${item.position}-${idx}`}
            type="button"
            role="listitem"
            data-word-index={idx}
            onClick={() => onSelectWord?.(item, idx)}
            title={
              item.start_ms !== undefined && item.end_ms !== undefined
                ? `${arabicWord}${translit ? ` (${translit})` : ''} · ${(item.start_ms / 1000).toFixed(1)}s–${(item.end_ms / 1000).toFixed(1)}s`
                : arabicWord
            }
            className={`group flex flex-col items-center justify-between px-3 py-2 rounded-2xl border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
              isActive
                ? 'bg-[#F4B900]/25 dark:bg-[#F4B900]/25 border-[#F4B900] shadow-xs scale-[1.04] z-10'
                : 'bg-white/80 dark:bg-[#0B3027]/75 border-amber-900/12 dark:border-emerald-800/40 hover:border-[#006D53]/40 dark:hover:border-[#F4B900]/40 hover:bg-white dark:hover:bg-[#0B3027]'
            }`}
          >
            {/* Top Row: Verified Uthmani Arabic Word */}
            <span
              style={{ fontSize: `${fontSizePx}px`, lineHeight: 1.65 }}
              className={`font-arabic tracking-normal transition-colors ${
                isActive
                  ? 'text-emerald-950 dark:text-[#F4B900] font-semibold'
                  : 'text-emerald-950 dark:text-[#F5F7F2]'
              }`}
            >
              {arabicWord}
            </span>

            {/* Middle Row: Phonetic Transliteration Badge (LTR inside RTL block) */}
            {showTransliteration && translit && (
              <span
                dir="ltr"
                className={`mt-1 px-2 py-0.5 rounded-md font-mono text-[11px] sm:text-xs leading-tight tracking-tight transition-colors ${
                  isActive
                    ? 'bg-[#006D53] text-white font-semibold'
                    : 'bg-amber-900/8 dark:bg-emerald-950/80 text-amber-950/85 dark:text-amber-200/90 group-hover:bg-[#006D53]/15'
                }`}
              >
                {translit}
              </span>
            )}

            {/* Bottom Row: Word-by-Word Meaning */}
            {showWordTranslation && translation && (
              <span
                dir="ltr"
                className={`mt-1 text-[10px] sm:text-[11px] font-sans leading-tight max-w-[115px] truncate ${
                  isActive
                    ? 'text-emerald-950 dark:text-[#F4B900] font-medium'
                    : 'text-slate-500 dark:text-[#9BAFA7]'
                }`}
              >
                {translation}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
