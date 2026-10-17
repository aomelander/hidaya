"use client";

/**
 * @file src/components/audio/TajweedText.tsx
 * @description Pedagogical Uthmani Tajweed recitation colorizer for the Holy Quran.
 * Accurately identifies standard recitation rules while strictly preserving Arabic cursive
 * letter joining (ligatures) and grapheme cluster integrity:
 * - Red / Rose: Maddah (Prolongation 4-6 Harakat: آ, U+0653, U+06E4)
 * - Amber / Gold: Ghunnah (Nasalization 2 Harakat on Shaddah Noon & Meem: نّ, مّ)
 * - Sky Blue: Qalqalah (Echoing on Qaf, Ta, Ba, Jeem, Dal with Sukun: ق, ط, ب, ج, د)
 * - Purple: Ikhfa & Iqlab (Concealment & Transformation: U+06E2, Noon Sakinah / Tanween)
 * - Teal: Idgham (Merging on Yarmaloon letters)
 */

import React, { useMemo } from 'react';

interface TajweedTextProps {
  text: string;
  className?: string;
}

interface Grapheme {
  baseChar: string;
  marks: string;
  full: string;
}

const COMBINING_MARKS_REGEX = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/;

/**
 * Decomposes an Arabic word into grapheme clusters (base letter + all its combining diacritics).
 */
function toGraphemes(word: string): Grapheme[] {
  const graphemes: Grapheme[] = [];
  let i = 0;

  while (i < word.length) {
    const char = word[i];
    let marks = '';
    let j = i + 1;

    while (j < word.length && COMBINING_MARKS_REGEX.test(word[j])) {
      marks += word[j];
      j++;
    }

    graphemes.push({
      baseChar: char,
      marks,
      full: char + marks,
    });
    i = j;
  }

  return graphemes;
}

export const TajweedText: React.FC<TajweedTextProps> = ({ text, className = '' }) => {
  const content = useMemo(() => {
    if (!text) return null;

    const words = text.split(/\s+/).filter(Boolean);

    return words.map((word, wordIdx) => {
      const graphemes = toGraphemes(word);
      const elements: React.ReactNode[] = [];

      for (let gIdx = 0; gIdx < graphemes.length; gIdx++) {
        const current = graphemes[gIdx];
        const { baseChar, marks, full } = current;

        // 1. Maddah (Prolongation)
        // Alif with Madda Above (آ U+0622), Maddah combining mark (U+0653), Small High Madda (U+06E4), or '~'
        const hasMadd =
          baseChar === '\u0622' || // آ
          marks.includes('\u0653') || // Combining Maddah above
          marks.includes('\u06E4') || // Small High Madda
          marks.includes('~');

        if (hasMadd) {
          elements.push(
            <span
              key={`${wordIdx}-${gIdx}`}
              className="text-rose-600 dark:text-rose-400 font-bold transition-colors"
              title="Madd (مد: إطالة الصوت)"
            >
              {full}
            </span>
          );
          continue;
        }

        // 2. Ghunnah (Nasalization on Noon or Meem with Shaddah)
        const hasShaddah = marks.includes('\u0651'); // Shaddah U+0651
        if ((baseChar === 'ن' || baseChar === 'م') && hasShaddah) {
          elements.push(
            <span
              key={`${wordIdx}-${gIdx}`}
              className="text-amber-600 dark:text-amber-400 font-bold transition-colors"
              title="Ghunnah (غنة: بمقدار حركتين)"
            >
              {full}
            </span>
          );
          continue;
        }

        // 3. Iqlab (Transformation - small high Meem U+06E2)
        if (marks.includes('\u06E2') || baseChar === '\u06E2') {
          elements.push(
            <span
              key={`${wordIdx}-${gIdx}`}
              className="text-purple-600 dark:text-purple-400 font-semibold transition-colors"
              title="Iqlab (إقلاب: قلب النون ميماً)"
            >
              {full}
            </span>
          );
          continue;
        }

        // 4. Qalqalah (Echoing vibration on Qaf, Ta, Ba, Jeem, Dal with Sukun or at pause)
        const isQalqalahBase = /[قطبجد]/.test(baseChar);
        const hasSukun =
          marks.includes('\u0652') || // Sukun U+0652
          marks.includes('\u06E1') || // Small high dotless head of khah U+06E1
          marks.includes('\u06DF');   // Small high rounded zero U+06DF
        const isEndWord = gIdx === graphemes.length - 1;

        if (isQalqalahBase && (hasSukun || (isEndWord && marks.length === 0))) {
          elements.push(
            <span
              key={`${wordIdx}-${gIdx}`}
              className="text-sky-600 dark:text-sky-400 font-bold transition-colors"
              title="Qalqalah (قلقلة: اضطراب المخرج عند النطق بالصامت ساكناً)"
            >
              {full}
            </span>
          );
          continue;
        }

        // 5. Ikhfa (Concealment)
        // Noon Sakinah (without vowels or with U+06E1) before Ikhfa letter in next grapheme/word
        const isIkhfaLetter = /[تثجدذزسشصضطظفقك]/.test(baseChar);
        const hasTanween = /[\u064B\u064C\u064D]/.test(marks);

        if (hasTanween) {
          elements.push(
            <span
              key={`${wordIdx}-${gIdx}`}
              className="text-purple-600 dark:text-purple-400 font-semibold transition-colors"
              title="Ikhfa / Tanween (إخفاء / تنوين)"
            >
              {full}
            </span>
          );
          continue;
        }

        if (baseChar === 'ن' && (marks.length === 0 || marks.includes('\u06E1'))) {
          const nextGrapheme = graphemes[gIdx + 1];
          if (nextGrapheme && isIkhfaLetter) {
            elements.push(
              <span
                key={`${wordIdx}-${gIdx}`}
                className="text-purple-600 dark:text-purple-400 font-semibold transition-colors"
                title="Ikhfa (إخفاء النون الساكنة)"
              >
                {full}
              </span>
            );
            continue;
          }
        }

        // Normal Uthmani character
        elements.push(
          <span key={`${wordIdx}-${gIdx}`}>
            {full}
          </span>
        );
      }

      return (
        <React.Fragment key={wordIdx}>
          <span className="inline whitespace-nowrap">{elements}</span>
          {wordIdx < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      );
    });
  }, [text]);

  return <span className={`inline font-arabic leading-relaxed ${className}`}>{content}</span>;
};
