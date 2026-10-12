"use client";

/**
 * @file src/components/audio/VerseMemorizationView.tsx
 * @description 3-Level Interactive Hifz / Memorization Trainer with Native Arabic Voice Verification
 * (PDF Pages 14–19).
 *
 * Features:
 * - 4 CSS mask modes (`visible`, `blur`, `first_letter`, `hidden`) with 0% CPU overhead.
 * - Individual word tap/remote-click reveal + sequential "Reveal Next Word" & "Reset / Reveal All".
 * - Duolingo-style "🎙️ Recite & Verify" button (`ar-SA` Web Speech API) that automatically reveals
 *   and highlights each Arabic word in Emerald Green as the user recites it from memory (auto-hidden
 *   on Smart TVs that lack SpeechRecognition).
 */

import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, RotateCcw, Sparkles, Mic, MicOff, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Language, WordTimestamp } from '../../types';
import {
  isSpeechRecognitionSupported,
  startArabicVoiceVerification,
  VoiceVerificationController,
} from '../../services/arabicPronunciationService';
import { findActiveWordIndexByMs } from '../../lib/audio/wordTimestampsResolver';

export type MemorizationMaskMode = 'visible' | 'blur' | 'first_letter' | 'hidden';

export interface VerseMemorizationViewProps {
  timestamps: WordTimestamp[];
  currentTimeMs: number;
  activeWordIndex?: number;
  isPlaying?: boolean;
  arabicScale?: number;
  language: Language;
}

const MEMO_LABELS: Record<
  Language,
  {
    title: string;
    modeVisible: string;
    modeBlur: string;
    modeFirstLetter: string;
    modeHidden: string;
    revealNext: string;
    revealAll: string;
    resetMask: string;
    reciteVerify: string;
    stopVerify: string;
    completedMsg: string;
    tapHint: string;
  }
> = {
  fr: {
    title: 'Mémorisation (Hifz)',
    modeVisible: 'Visible',
    modeBlur: '1. Flou',
    modeFirstLetter: '2. 1ère Lettre',
    modeHidden: '3. Masqué',
    revealNext: 'Mot suivant',
    revealAll: 'Tout révéler',
    resetMask: 'Réinitialiser',
    reciteVerify: 'Réciter & Vérifier',
    stopVerify: 'Arrêter micro',
    completedMsg: 'Masha’Allah ! Verset récité au complet.',
    tapHint: 'Touchez un mot ou récitez à voix haute pour le révéler',
  },
  en: {
    title: 'Memorization (Hifz)',
    modeVisible: 'Visible',
    modeBlur: '1. Blur',
    modeFirstLetter: '2. First Letter',
    modeHidden: '3. Hidden',
    revealNext: 'Next Word',
    revealAll: 'Reveal All',
    resetMask: 'Reset',
    reciteVerify: 'Recite & Verify',
    stopVerify: 'Stop Mic',
    completedMsg: 'Masha’Allah! Full verse verified.',
    tapHint: 'Tap any word or recite aloud to reveal',
  },
  sv: {
    title: 'Memoreringsläge (Hifz)',
    modeVisible: 'Synlig',
    modeBlur: '1. Suddig',
    modeFirstLetter: '2. Första bokstav',
    modeHidden: '3. Dold',
    revealNext: 'Nästa ord',
    revealAll: 'Visa alla',
    resetMask: 'Återställ',
    reciteVerify: 'Recitera & Verifiera',
    stopVerify: 'Stoppa mikrofon',
    completedMsg: 'Masha’Allah! Hela versen verifierad.',
    tapHint: 'Tryck på ett ord eller recitera högt för att visa',
  },
  ar: {
    title: 'وضع التحفيظ والتسميع (حفظ)',
    modeVisible: 'ظاهر',
    modeBlur: '١. تمويه',
    modeFirstLetter: '٢. أول حرف',
    modeHidden: '٣. إخفاء كامل',
    revealNext: 'الكلمة التالية',
    revealAll: 'إظهار الكل',
    resetMask: 'إعادة الإخفاء',
    reciteVerify: 'تسميع صوتي ذكي',
    stopVerify: 'إيقاف الميكروفون',
    completedMsg: 'ما شاء الله! أتممت تسميع الآية بنجاح.',
    tapHint: 'انقر على الكلمة لإظهارها أو ابدأ التسميع الصوتي',
  },
};

/**
 * Extracts the first base Arabic letter (plus its attached haraka if present) as a memory cue.
 */
function getFirstArabicLetterCue(word: string): string {
  const clean = word.trim();
  if (!clean) return '…';
  // Match first Arabic letter and any immediately following diacritics
  const match = clean.match(/^[\u0621-\u064A\u0671][\u064B-\u065F\u0670]*/);
  if (match) {
    return `${match[0]}…`;
  }
  return `${clean.charAt(0)}…`;
}

export const VerseMemorizationView: React.FC<VerseMemorizationViewProps> = ({
  timestamps,
  currentTimeMs,
  activeWordIndex = -1,
  isPlaying = false,
  arabicScale = 1.15,
  language,
}) => {
  const [maskMode, setMaskMode] = useState<MemorizationMaskMode>('blur');
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [voiceVerifiedIndices, setVoiceVerifiedIndices] = useState<Set<number>>(new Set());
  const [isListening, setIsListening] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);

  const verifierRef = useRef<VoiceVerificationController | null>(null);
  const labels = MEMO_LABELS[language] || MEMO_LABELS.en;

  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
    return () => {
      verifierRef.current?.stop();
    };
  }, []);

  // Reset state when verse changes
  useEffect(() => {
    setRevealedIndices(new Set());
    setVoiceVerifiedIndices(new Set());
    setIsCompleted(false);
    setLiveTranscript('');
    if (isListening) {
      verifierRef.current?.stop();
      setIsListening(false);
    }
  }, [timestamps.length, timestamps[0]?.word_arabic]);

  const computedMsIndex =
    isPlaying && currentTimeMs > 0 ? findActiveWordIndexByMs(timestamps, currentTimeMs) : -1;
  const effectiveAudioIndex = computedMsIndex >= 0 ? computedMsIndex : activeWordIndex;

  const toggleWordReveal = (idx: number) => {
    setRevealedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleRevealNext = () => {
    for (let i = 0; i < timestamps.length; i++) {
      if (!revealedIndices.has(i) && !voiceVerifiedIndices.has(i)) {
        setRevealedIndices((prev) => new Set(prev).add(i));
        if (i === timestamps.length - 1) setIsCompleted(true);
        break;
      }
    }
  };

  const handleRevealAll = () => {
    const all = new Set<number>();
    timestamps.forEach((_, idx) => all.add(idx));
    setRevealedIndices(all);
  };

  const handleResetMask = () => {
    setRevealedIndices(new Set());
    setVoiceVerifiedIndices(new Set());
    setIsCompleted(false);
    setLiveTranscript('');
    setMicError(null);
  };

  const handleToggleVoiceVerification = () => {
    if (isListening) {
      verifierRef.current?.stop();
      setIsListening(false);
      return;
    }

    setMicError(null);

    // Ensure words are masked before starting voice verification if currently in 'visible'
    if (maskMode === 'visible') {
      setMaskMode('blur');
    }
    setRevealedIndices(new Set());
    setVoiceVerifiedIndices(new Set());
    setIsCompleted(false);
    setLiveTranscript('');
    setIsListening(true);

    const targetWords = timestamps.map((t) => t.word_arabic || t.word || '');
    verifierRef.current = startArabicVoiceVerification({
      targetArabicWords: targetWords,
      onWordMatched: (matchedIdx) => {
        setVoiceVerifiedIndices((prev) => {
          const next = new Set(prev);
          for (let i = 0; i <= matchedIdx; i++) {
            next.add(i);
          }
          return next;
        });
        setRevealedIndices((prev) => {
          const next = new Set(prev);
          for (let i = 0; i <= matchedIdx; i++) {
            next.add(i);
          }
          return next;
        });
      },
      onTranscriptUpdate: (transcript) => {
        setLiveTranscript(transcript);
      },
      onComplete: () => {
        setIsListening(false);
        setIsCompleted(true);
      },
      onError: (err) => {
        setIsListening(false);
        if (err && err !== 'aborted') {
          setMicError(
            err === 'not-allowed'
              ? language === 'fr'
                ? 'Accès au micro refusé. Veuillez autoriser le microphone dans votre navigateur.'
                : language === 'ar'
                ? 'تم رفض إذن الميكروفون. يرجى تفعيل الميكروفون في المتصفح.'
                : 'Microphone access blocked. Please allow microphone permissions.'
              : String(err)
          );
        }
      },
    });
  };

  const fontSizePx = Math.round(25 * arabicScale);

  return (
    <div className="space-y-3">
      {/* Top Hifz Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-amber-900/12 dark:border-emerald-800/35">
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              { id: 'visible', label: labels.modeVisible },
              { id: 'blur', label: labels.modeBlur },
              { id: 'first_letter', label: labels.modeFirstLetter },
              { id: 'hidden', label: labels.modeHidden },
            ] as { id: MemorizationMaskMode; label: string }[]
          ).map((m) => {
            const active = maskMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMaskMode(m.id);
                  setRevealedIndices(new Set());
                  setIsCompleted(false);
                }}
                aria-pressed={active}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#006D53] text-white shadow-2xs'
                    : 'bg-white/80 dark:bg-[#0B3027] text-slate-700 dark:text-[#9BAFA7] border border-amber-900/12 dark:border-emerald-800/40 hover:bg-emerald-900/10'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Action controls: Next Word, Reveal All, Reset, and Native Mic Verify */}
        <div className="flex flex-wrap items-center gap-1.5">
          {maskMode !== 'visible' && (
            <>
              <button
                type="button"
                onClick={handleRevealNext}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-amber-500/15 text-amber-900 dark:text-[#F4B900] border border-amber-500/30 hover:bg-amber-500/25 inline-flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{labels.revealNext}</span>
              </button>

              <button
                type="button"
                onClick={
                  revealedIndices.size >= timestamps.length ? handleResetMask : handleRevealAll
                }
                className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white/80 dark:bg-[#0B3027] text-slate-700 dark:text-[#9BAFA7] border border-amber-900/12 dark:border-emerald-800/40 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
              >
                {revealedIndices.size >= timestamps.length ? (
                  <>
                    <RotateCcw className="w-3 h-3" />
                    <span>{labels.resetMask}</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>{labels.revealAll}</span>
                  </>
                )}
              </button>
            </>
          )}

          {speechSupported && (
            <button
              type="button"
              onClick={handleToggleVoiceVerification}
              aria-pressed={isListening}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-xs'
                  : 'bg-[#006D53] hover:bg-emerald-700 text-white shadow-2xs'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isListening ? labels.stopVerify : labels.reciteVerify}</span>
            </button>
          )}
        </div>
      </div>

      {/* Word Blocks with CSS Masking & Voice Verification Feedback */}
      <div
        dir="rtl"
        lang="ar"
        className="flex flex-wrap items-center justify-start gap-2.5 py-2"
        role="list"
        aria-label={labels.title}
      >
        {timestamps.map((item, idx) => {
          const arabicWord = item.word_arabic || item.word || '';
          const isRevealed =
            maskMode === 'visible' || revealedIndices.has(idx) || voiceVerifiedIndices.has(idx);
          const isVoiceMatched = voiceVerifiedIndices.has(idx);
          const isAudioActive = isPlaying && idx === effectiveAudioIndex;

          return (
            <button
              key={`${item.position}-${idx}`}
              type="button"
              role="listitem"
              data-word-index={idx}
              onClick={() => toggleWordReveal(idx)}
              style={{ fontSize: `${fontSizePx}px`, lineHeight: 1.8 }}
              className={`font-arabic px-3 py-1.5 rounded-2xl border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4B900] ${
                isVoiceMatched
                  ? 'bg-emerald-500/20 dark:bg-emerald-500/25 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-semibold shadow-2xs'
                  : isAudioActive
                  ? 'bg-[#F4B900]/30 border-[#F4B900] text-emerald-950 dark:text-[#F4B900] scale-105'
                  : isRevealed
                  ? 'bg-white/85 dark:bg-[#0B3027] border-amber-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2]'
                  : 'bg-amber-900/8 dark:bg-[#0B3027]/60 border-dashed border-amber-900/25 dark:border-emerald-700/40 text-emerald-950 dark:text-[#F5F7F2] hover:border-[#006D53]'
              }`}
            >
              {isRevealed ? (
                <span>{arabicWord}</span>
              ) : maskMode === 'blur' ? (
                <span className="inline-block filter blur-[6px] select-none opacity-85">
                  {arabicWord}
                </span>
              ) : maskMode === 'first_letter' ? (
                <span className="inline-block text-amber-800 dark:text-[#F4B900]">
                  {getFirstArabicLetterCue(arabicWord)}
                </span>
              ) : (
                <span className="inline-block opacity-0 select-none">{arabicWord}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Live Status / Completion Banner */}
      {isCompleted ? (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{labels.completedMsg}</span>
          </span>
          <button
            type="button"
            onClick={handleResetMask}
            className="underline underline-offset-2 text-[11px] cursor-pointer"
          >
            {labels.resetMask}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#9BAFA7]">
          <span className="inline-flex items-center gap-1">
            {maskMode === 'visible' ? (
              <Eye className="w-3.5 h-3.5 opacity-70" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 opacity-70" />
            )}
            <span>{labels.tapHint}</span>
          </span>
          {isListening && liveTranscript && (
            <span dir="rtl" className="font-arabic text-xs text-emerald-700 dark:text-[#F4B900] truncate max-w-[220px]">
              {liveTranscript}
            </span>
          )}
        </div>
      )}

      {/* Microphone Error Notice */}
      {micError && (
        <div className="px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-900 dark:text-[#F4B900] flex items-center justify-between gap-2">
          <span>⚠️ {micError}</span>
          <button
            type="button"
            onClick={() => setMicError(null)}
            className="text-[10px] font-bold uppercase underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
