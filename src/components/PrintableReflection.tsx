import React from 'react';
import { QuranVerseFixture, Language, UserReflection } from '../types';

interface PrintableReflectionProps {
  verse: QuranVerseFixture | null;
  language: Language;
  reflection: UserReflection | null;
}

export const PrintableReflection: React.FC<PrintableReflectionProps> = ({
  verse,
  language,
  reflection,
}) => {
  if (!verse) return null;

  const translationObj = verse.translations[language] || verse.translations.en;
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="hidden print:block p-8 max-w-4xl mx-auto bg-white text-black font-serif">
      {/* Header */}
      <div className="border-b-2 border-emerald-900 pb-4 mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-wider text-emerald-950 uppercase">
          Hidaya • Quran Guidance & Reflection
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Date: {dateStr} • Surah {verse.surahNameTransliterated} ({verse.id}) • Juz {verse.juz}
        </p>
      </div>

      {/* Level 1: Sacred Arabic Quran Text */}
      <div className="mb-6 p-6 border border-gray-300 rounded-lg text-center bg-gray-50">
        <p className="text-xs uppercase font-sans font-bold text-emerald-800 mb-2">
          Level 1: Verified Uthmani Quran Text
        </p>
        <p dir="rtl" className="text-2xl font-arabic leading-loose text-black mb-3">
          {verse.arabicText}
        </p>
        <p className="text-xs italic text-gray-700">
          Transliteration: {verse.transliteration}
        </p>
      </div>

      {/* Level 2: Translation */}
      <div className="mb-6 p-4 border-l-4 border-emerald-800 bg-gray-50">
        <p className="text-xs uppercase font-sans font-bold text-gray-500 mb-1">
          Level 2: Certified Translation ({translationObj.translator})
        </p>
        <p className="text-base text-gray-900 italic">
          &ldquo;{translationObj.text}&rdquo;
        </p>
      </div>

      {/* Level 3: Context & Classical Tafsir */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <p className="text-xs uppercase font-sans font-bold text-emerald-900 mb-2">
          Level 3: Classical Tafsir ({verse.tafsirCitations[0]?.scholar})
        </p>
        <p className="text-xs leading-relaxed text-gray-800">
          {verse.tafsirCitations[0]?.text}
        </p>
      </div>

      {/* Level 4: Personal Reflection Flow */}
      <div className="mb-8 space-y-4">
        <h2 className="text-sm font-sans font-bold uppercase tracking-wider text-emerald-900 border-b pb-1">
          Level 4: From Quran to Life Contemplation
        </h2>

        {/* 1. Understand */}
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-xs font-sans font-bold text-emerald-800 mb-1">
            1. Understand:
          </p>
          <p className="text-xs text-gray-800">
            {verse.reflectionFramework.understand}
          </p>
        </div>

        {/* 2. Reflect */}
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-xs font-sans font-bold text-blue-800 mb-1">
            2. Reflect (Self-Examination):
          </p>
          <p className="text-xs text-gray-700 italic mb-2">
            Prompt: {verse.reflectionFramework.reflectPrompt}
          </p>
          <p className="text-sm text-gray-900 font-sans font-medium whitespace-pre-line">
            My Notes: {reflection?.reflectNotes || '—'}
          </p>
        </div>

        {/* 3. Apply */}
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-xs font-sans font-bold text-amber-800 mb-1">
            3. Apply (Actionable Daily Shift):
          </p>
          <p className="text-xs text-gray-700 italic mb-2">
            Action: {verse.reflectionFramework.applyAction}
          </p>
          <p className="text-sm text-gray-900 font-sans font-medium whitespace-pre-line">
            My Commitment: {reflection?.applyNotes || '—'}
          </p>
        </div>

        {/* 4. Live & Carry */}
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-xs font-sans font-bold text-teal-800 mb-1">
            4. Live & Carry (Continuous Living with Quran):
          </p>
          <p className="text-xs text-gray-700 italic mb-2">
            What will show in your life? {verse.reflectionFramework.livePrompt || 'One thing I will carry with me today.'}
          </p>
          <p className="text-sm text-gray-900 font-sans font-medium whitespace-pre-line">
            What I Carry: {reflection?.liveNotes || '—'}
          </p>
        </div>
      </div>

      {/* Footer Ethics Note */}
      <div className="pt-4 border-t border-gray-300 text-center text-[10px] text-gray-500 font-sans">
        Hidaya is a source-grounded reflection companion, not a religious authority or fatwa service.
        Canonical texts verified from Uthmani script and classical exegesis.
      </div>
    </div>
  );
};
