"use client";

/**
 * @file src/components/ContinuousSessionAudioPlayer.tsx
 * @description Dedicated full-view Audio Contemplation Workspace (`inlinePage` mode)
 * or compact player. Eliminates floating popup clutter when rendered inside the Audio tab.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Headphones,
} from 'lucide-react';
import { QuranVerseFixture, Language, AudioPlaybackMode, ReciterId } from '../types';
import { AVAILABLE_RECITERS, getAudioUrlForVerse } from '../services/audioReciters';
import { StorageService } from '../services/storage';
import { SpeechService } from '../services/speechSynthesisService';
import { getLocalizedReflection } from '../data/localizedReflections';

interface ContinuousSessionAudioPlayerProps {
  verses: QuranVerseFixture[];
  language: Language;
  onActiveVerseChange?: (verseId: string) => void;
  onClose?: () => void;
  inlinePage?: boolean;
}

const AUDIO_UI: Record<
  Language,
  {
    title: string;
    subtitle: string;
    modeQuranOnly: string;
    modeWithTranslation: string;
    modeWithReflection: string;
    reciterLabel: string;
    queueLabel: string;
  }
> = {
  en: {
    title: 'Audio Contemplation Sanctuary',
    subtitle: 'Listen to verified Quranic recitation with optional spoken translation and reflection.',
    modeQuranOnly: 'Quran Only',
    modeWithTranslation: 'Quran + Translation',
    modeWithReflection: 'Quran + Reflection',
    reciterLabel: 'Select Reciter',
    queueLabel: 'Session Passages Queue',
  },
  sv: {
    title: 'Ljud & Kontemplation',
    subtitle: 'Lyssna på verifierad Quran-recitation med naturlig svensk översättning och reflektion.',
    modeQuranOnly: 'Endast Quran',
    modeWithTranslation: 'Quran + Översättning',
    modeWithReflection: 'Quran + Reflektion',
    reciterLabel: 'Välj recitatör',
    queueLabel: 'Valda passager i kö',
  },
  fr: {
    title: 'Sanctuaire Audio & Récitation',
    subtitle: 'Écoutez la récitation coranique vérifiée avec traduction vocale et méditation.',
    modeQuranOnly: 'Coran seul',
    modeWithTranslation: 'Coran + Traduction',
    modeWithReflection: 'Coran + Méditation',
    reciterLabel: 'Choisir le récitateur',
    queueLabel: 'Passages de la session',
  },
  ar: {
    title: 'الاستماع والتدبر الصوتي',
    subtitle: 'استمع إلى التلاوة القرآنية المرتلة بأصوات القراء المعتمدين.',
    modeQuranOnly: 'تلاوة فقط',
    modeWithTranslation: 'تلاوة وتفسير',
    modeWithReflection: 'تلاوة وتدبر',
    reciterLabel: 'اختر القارئ',
    queueLabel: 'قائمة الآيات المختارة',
  },
};

export const ContinuousSessionAudioPlayer: React.FC<ContinuousSessionAudioPlayerProps> = ({
  verses,
  language,
  onActiveVerseChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<AudioPlaybackMode>('quran_translation');
  const [reciterId, setReciterId] = useState<ReciterId>(() => StorageService.getPreferredReciter());
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackPhase, setPlaybackPhase] = useState<
    'recitation' | 'translation' | 'reflection' | 'idle'
  >('idle');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t = AUDIO_UI[language] || AUDIO_UI.en;

  const currentVerse = verses[currentIndex] || verses[0];

  const currentAudioUrl = React.useMemo(() => {
    if (!currentVerse) return '';
    return getAudioUrlForVerse(currentVerse.surahNumber, currentVerse.verseNumber, reciterId);
  }, [currentVerse, reciterId]);

  useEffect(() => {
    if (currentVerse && onActiveVerseChange) {
      onActiveVerseChange(currentVerse.id);
    }
  }, [currentVerse, onActiveVerseChange]);

  const stopSpeech = useCallback(() => {
    SpeechService.cancel();
  }, []);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  const handleNext = useCallback(() => {
    stopSpeech();
    if (currentIndex < verses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
      setPlaybackPhase('idle');
      setCurrentIndex(0);
    }
  }, [currentIndex, verses.length, stopSpeech]);

  const handlePrev = useCallback(() => {
    stopSpeech();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [currentIndex, stopSpeech]);

  const speakText = useCallback(
    (text: string, onComplete: () => void) => {
      if (!text || language === 'ar') {
        onComplete();
        return;
      }
      SpeechService.speak(text, language, {
        rate: playbackRate * 0.94,
        onEnd: onComplete,
        onError: () => onComplete(),
      });
    },
    [language, playbackRate]
  );

  const startRecitation = useCallback(() => {
    if (!audioRef.current) return;
    setPlaybackPhase('recitation');
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, []);

  const handleAudioEnded = useCallback(() => {
    if (!isPlaying) return;

    if (playbackMode === 'quran_only' || language === 'ar') {
      setTimeout(() => handleNext(), 1000);
      return;
    }

    setPlaybackPhase('translation');
    const translation =
      currentVerse?.translations[language]?.text || currentVerse?.translations.en.text;

    speakText(translation, () => {
      if (playbackMode === 'quran_reflection' && currentVerse) {
        setPlaybackPhase('reflection');
        const localizedRefl = getLocalizedReflection(currentVerse.id, language);
        const prompt = localizedRefl.reflectPrompt || localizedRefl.understand;
        setTimeout(() => {
          speakText(prompt, () => {
            setTimeout(() => handleNext(), 1000);
          });
        }, 500);
      } else {
        setTimeout(() => handleNext(), 900);
      }
    });
  }, [isPlaying, playbackMode, currentVerse, language, speakText, handleNext]);

  useEffect(() => {
    if (isPlaying) {
      startRecitation();
    }
  }, [currentIndex, currentAudioUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setPlaybackPhase('idle');
      stopSpeech();
      audioRef.current?.pause();
    } else {
      setIsPlaying(true);
      startRecitation();
    }
  };

  const handleSelectReciter = (id: ReciterId) => {
    setReciterId(id);
    StorageService.setPreferredReciter(id);
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 0.85];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  if (!verses || verses.length === 0) return null;

  const activeReciter =
    AVAILABLE_RECITERS.find((r) => r.id === reciterId) || AVAILABLE_RECITERS[0];

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="max-w-2xl mx-auto space-y-6"
      role="region"
      aria-label={t.title}
    >
      <audio
        ref={audioRef}
        src={currentAudioUrl}
        preload="metadata"
        onEnded={handleAudioEnded}
      />

      {/* Main Audio Sanctuary Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A1E17] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-emerald-900/30 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-50">
              {t.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.subtitle}</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-emerald-900/5 dark:bg-emerald-950/60 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/40">
          <button
            type="button"
            onClick={() => setPlaybackMode('quran_only')}
            className={`flex-1 min-h-[40px] py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              playbackMode === 'quran_only'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.modeQuranOnly}
          </button>
          <button
            type="button"
            onClick={() => setPlaybackMode('quran_translation')}
            className={`flex-1 min-h-[40px] py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              playbackMode === 'quran_translation'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.modeWithTranslation}
          </button>
          <button
            type="button"
            onClick={() => setPlaybackMode('quran_reflection')}
            className={`flex-1 min-h-[40px] py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              playbackMode === 'quran_reflection'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.modeWithReflection}
          </button>
        </div>

        {/* Active Verse Display */}
        <div className="p-6 rounded-2xl bg-[#FAF8F5] dark:bg-[#071711] border border-emerald-900/10 dark:border-emerald-800/30 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-emerald-900 dark:text-emerald-300">
              Surah {currentVerse.surahNameTransliterated} · {currentVerse.id}
            </span>
            <span className="tabular-nums">
              {currentIndex + 1} / {verses.length} · {activeReciter.name}
            </span>
          </div>

          <p
            dir="rtl"
            lang="ar"
            className="font-arabic text-right text-2xl sm:text-3xl text-emerald-950 dark:text-emerald-50 leading-loose"
          >
            {currentVerse.arabicText}
          </p>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed italic">
            &ldquo;
            {currentVerse.translations[language]?.text || currentVerse.translations.en.text}
            &rdquo;
          </p>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={cycleSpeed}
            className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer tabular-nums"
          >
            {playbackRate}x
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-emerald-800/40 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer"
              aria-label="Previous verse"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-emerald-800 hover:bg-emerald-700 text-amber-300 flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ms-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex >= verses.length - 1}
              className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-emerald-800/40 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer"
              aria-label="Next verse"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const nextMute = !isMuted;
              setIsMuted(nextMute);
              if (audioRef.current) audioRef.current.muted = nextMute;
            }}
            className="min-h-[42px] min-w-[42px] p-2 rounded-xl border border-slate-200 dark:border-emerald-800/40 flex items-center justify-center text-slate-700 dark:text-slate-300 cursor-pointer"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Reciter Selection Pills */}
        <div className="pt-4 border-t border-slate-100 dark:border-emerald-900/30 space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            {t.reciterLabel}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AVAILABLE_RECITERS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectReciter(r.id)}
                className={`p-2.5 rounded-xl border text-start text-xs transition-all cursor-pointer ${
                  r.id === reciterId
                    ? 'bg-emerald-800 text-white border-emerald-700 font-semibold'
                    : 'bg-[#FAF8F5] dark:bg-emerald-950/40 border-emerald-900/10 dark:border-emerald-800/30 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="block truncate">{r.name}</span>
                <span className="text-[10px] opacity-75 block truncate">{r.style}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Playlist Queue */}
        <div className="pt-4 border-t border-slate-100 dark:border-emerald-900/30 space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            {t.queueLabel} ({verses.length})
          </span>
          <div className="space-y-1.5">
            {verses.map((v, idx) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-full p-3 rounded-xl text-start flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  idx === currentIndex
                    ? 'bg-emerald-900/10 dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 font-semibold'
                    : 'hover:bg-slate-50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>
                  {idx + 1}. Surah {v.surahNameTransliterated} ({v.id})
                </span>
                <span className="font-arabic text-sm text-amber-700 dark:text-amber-400">
                  {v.surahNameArabic}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
