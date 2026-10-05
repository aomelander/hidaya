"use client";

/**
 * @file src/components/ContinuousSessionAudioPlayer.tsx
 * @description Dedicated full-view Audio Contemplation Workspace (`inlinePage` mode)
 * or compact player with synchronized Word-by-Word highlighting across all consecutive
 * verses for Recitation, Translation, and Classical Tafsir.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Headphones,
  BookOpen,
  Quote,
} from 'lucide-react';
import {
  QuranVerseFixture,
  Language,
  AudioPlaybackMode,
  ReciterId,
  PreferredScholar,
} from '../types';
import { AVAILABLE_RECITERS, getAudioUrlsForVerseRange } from '../services/audioReciters';
import { StorageService } from '../services/storage';
import { SpeechService } from '../services/speechSynthesisService';
import { getLocalizedVerseDetails } from '../data/localizedVerseContent';

interface ContinuousSessionAudioPlayerProps {
  verses: QuranVerseFixture[];
  language: Language;
  onActiveVerseChange?: (verseId: string) => void;
  onClose?: () => void;
  inlinePage?: boolean;
}

type PlaybackPhase = 'idle' | 'recitation' | 'translation' | 'tafsir';

const AUDIO_UI: Record<
  Language,
  {
    title: string;
    subtitle: string;
    modeQuranOnly: string;
    modeWithTranslation: string;
    modeWithTafsir: string;
    reciterLabel: string;
    queueLabel: string;
    tafsirHeading: string;
    phaseRecitation: string;
    phaseTranslation: string;
    phaseTafsir: string;
  }
> = {
  en: {
    title: 'Audio Contemplation Sanctuary',
    subtitle: 'Listen to verified Quranic recitation with synchronized word-by-word reading, translation, and classical Tafsir.',
    modeQuranOnly: 'Quran only',
    modeWithTranslation: 'Quran + Trans',
    modeWithTafsir: 'Quran + Tafsir',
    reciterLabel: 'Select Reciter',
    queueLabel: 'Session Passages Queue',
    tafsirHeading: 'Level 3: Classical Tafsir',
    phaseRecitation: 'Reciting Arabic',
    phaseTranslation: 'Reading Translation',
    phaseTafsir: 'Explaining Tafsir',
  },
  sv: {
    title: 'Ljud & Kontemplation',
    subtitle: 'Lyssna på verifierad Quran-recitation med synkroniserad ord-för-ord-läsning, översättning och klassisk Tafsir.',
    modeQuranOnly: 'Endast Quran',
    modeWithTranslation: 'Quran + Översättning',
    modeWithTafsir: 'Quran + Tafsir',
    reciterLabel: 'Välj recitatör',
    queueLabel: 'Valda passager i kö',
    tafsirHeading: 'Nivå 3: Klassisk Tafsir',
    phaseRecitation: 'Reciterar arabiska',
    phaseTranslation: 'Läser översättning',
    phaseTafsir: 'Förklarar Tafsir',
  },
  fr: {
    title: 'Sanctuaire Audio & Récitation',
    subtitle: 'Écoutez la récitation coranique vérifiée avec suivi mot-à-mot, traduction vocale et exégèse (Tafsir).',
    modeQuranOnly: 'Coran seul',
    modeWithTranslation: 'Coran + Trad',
    modeWithTafsir: 'Coran + Tafsir',
    reciterLabel: 'Choisir le récitateur',
    queueLabel: 'Passages de la session',
    tafsirHeading: 'Niveau 3 : Exégèse Classique (Tafsir)',
    phaseRecitation: 'Récitation arabe',
    phaseTranslation: 'Lecture traduction',
    phaseTafsir: 'Explication Tafsir',
  },
  ar: {
    title: 'الاستماع والتدبر الصوتي',
    subtitle: 'استمع إلى التلاوة القرآنية المرتلة ومتابعة كلمة بكلمة مع الترجمة والتفسير المعتمد.',
    modeQuranOnly: 'تلاوة فقط',
    modeWithTranslation: 'تلاوة وترجمة',
    modeWithTafsir: 'تلاوة وتفسير',
    reciterLabel: 'اختر القارئ',
    queueLabel: 'قائمة الآيات المختارة',
    tafsirHeading: 'المستوى الثالث: التفسير المعتمد',
    phaseRecitation: 'تلاوة قرآنية',
    phaseTranslation: 'قراءة الترجمة',
    phaseTafsir: 'بيان التفسير',
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
  const [playbackPhase, setPlaybackPhase] = useState<PlaybackPhase>('idle');

  // Multi-verse track progression for consecutive verses (up to 3 consecutive verses)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [recitationRatio, setRecitationRatio] = useState(0);
  const [translationRatio, setTranslationRatio] = useState(0);
  const [tafsirRatio, setTafsirRatio] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t = AUDIO_UI[language] || AUDIO_UI.en;

  const currentVerse = verses[currentIndex] || verses[0];

  // Consecutive verses audio tracks (handles single ayah "134" or ranges "5-6" / "133-135")
  const rangeAudioUrls = useMemo(() => {
    if (!currentVerse) return [];
    return getAudioUrlsForVerseRange(currentVerse.surahNumber, currentVerse.verseNumber, reciterId);
  }, [currentVerse, reciterId]);

  const activeAudioUrl = rangeAudioUrls[currentTrackIndex] || rangeAudioUrls[0] || '';
  const totalTracks = Math.max(1, rangeAudioUrls.length);

  // Preferred Tafsir scholar citation
  const preferredScholar: PreferredScholar = StorageService.getPreferredScholar();
  const localizedDetails = useMemo(() => {
    if (!currentVerse) return null;
    return getLocalizedVerseDetails(currentVerse, language);
  }, [currentVerse, language]);

  const currentTafsirCitation = useMemo(() => {
    if (!localizedDetails?.tafsirCitations || localizedDetails.tafsirCitations.length === 0) return null;
    const scholarIdx =
      preferredScholar === "Al-Sa'di" ? 1 : preferredScholar === 'Al-Muyassar' ? 2 : 0;
    return localizedDetails.tafsirCitations[scholarIdx] || localizedDetails.tafsirCitations[0];
  }, [localizedDetails, preferredScholar]);

  // Texts
  const translationText = useMemo(() => {
    if (!currentVerse) return '';
    return currentVerse.translations[language]?.text || currentVerse.translations.en.text;
  }, [currentVerse, language]);

  const tafsirText = currentTafsirCitation?.text || '';

  // Word tokenization for word-by-word synchronous highlighting
  const arabicWords = useMemo(
    () => (currentVerse?.arabicText || '').trim().split(/\s+/).filter(Boolean),
    [currentVerse?.arabicText]
  );

  const translationWords = useMemo(
    () => translationText.trim().split(/\s+/).filter(Boolean),
    [translationText]
  );

  const tafsirWords = useMemo(
    () => tafsirText.trim().split(/\s+/).filter(Boolean),
    [tafsirText]
  );

  // Active word indices
  const activeArabicWordIndex = useMemo(() => {
    if (playbackPhase !== 'recitation' || arabicWords.length === 0) return -1;
    const idx = Math.floor(recitationRatio * arabicWords.length);
    return Math.min(arabicWords.length - 1, Math.max(0, idx));
  }, [playbackPhase, recitationRatio, arabicWords.length]);

  const activeTranslationWordIndex = useMemo(() => {
    if (playbackPhase !== 'translation' || translationWords.length === 0) return -1;
    const idx = Math.floor(translationRatio * translationWords.length);
    return Math.min(translationWords.length - 1, Math.max(0, idx));
  }, [playbackPhase, translationRatio, translationWords.length]);

  const activeTafsirWordIndex = useMemo(() => {
    if (playbackPhase !== 'tafsir' || tafsirWords.length === 0) return -1;
    const idx = Math.floor(tafsirRatio * tafsirWords.length);
    return Math.min(tafsirWords.length - 1, Math.max(0, idx));
  }, [playbackPhase, tafsirRatio, tafsirWords.length]);

  useEffect(() => {
    if (currentVerse && onActiveVerseChange) {
      onActiveVerseChange(currentVerse.id);
    }
  }, [currentVerse, onActiveVerseChange]);

  const stopAllSpeech = useCallback(() => {
    SpeechService.cancel();
  }, []);

  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, [stopAllSpeech]);

  // Clean reset when changing verse index
  useEffect(() => {
    stopAllSpeech();
    setCurrentTrackIndex(0);
    setRecitationRatio(0);
    setTranslationRatio(0);
    setTafsirRatio(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [currentIndex, stopAllSpeech]);

  const handleNext = useCallback(() => {
    stopAllSpeech();
    if (currentIndex < verses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
      setPlaybackPhase('idle');
      setCurrentIndex(0);
    }
  }, [currentIndex, verses.length, stopAllSpeech]);

  const handlePrev = useCallback(() => {
    stopAllSpeech();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [currentIndex, stopAllSpeech]);

  const speakWithHighlight = useCallback(
    (
      text: string,
      onProgress: (ratio: number) => void,
      onComplete: () => void
    ) => {
      if (!text || (language === 'ar' && !/[\u0600-\u06FF]/.test(text))) {
        onComplete();
        return;
      }
      onProgress(0);
      SpeechService.speak(text, language, {
        rate: playbackRate * 0.92,
        onProgress: (r) => onProgress(r),
        onEnd: () => {
          onProgress(1);
          onComplete();
        },
        onError: () => {
          onProgress(0);
          onComplete();
        },
      });
    },
    [language, playbackRate]
  );

  const startRecitation = useCallback(() => {
    if (!audioRef.current) return;
    setPlaybackPhase('recitation');
    audioRef.current.playbackRate = playbackRate;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [playbackRate]);

  // Auto-play consecutive track in range
  useEffect(() => {
    if (isPlaying && currentTrackIndex > 0 && audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current
        .play()
        .then(() => setPlaybackPhase('recitation'))
        .catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex, isPlaying, playbackRate]);

  const handleAudioEnded = useCallback(() => {
    if (!isPlaying) return;

    // Advance to next verse in consecutive range (e.g. Ayah 5 -> Ayah 6)
    if (currentTrackIndex < totalTracks - 1) {
      setCurrentTrackIndex((prev) => prev + 1);
      return;
    }

    // Finished reciting all Arabic verses in range
    setRecitationRatio(1);

    if (playbackMode === 'quran_only') {
      setTimeout(() => handleNext(), 1000);
      return;
    }

    // Phase 2: Translation voiceover with word-by-word progress
    setPlaybackPhase('translation');
    speakWithHighlight(
      translationText,
      (ratio) => setTranslationRatio(ratio),
      () => {
        if (playbackMode === 'quran_tafsir' && tafsirText) {
          // Phase 3: Classical Tafsir voiceover with word-by-word progress
          setPlaybackPhase('tafsir');
          speakWithHighlight(
            tafsirText,
            (ratio) => setTafsirRatio(ratio),
            () => {
              setTimeout(() => handleNext(), 900);
            }
          );
        } else {
          setTimeout(() => handleNext(), 900);
        }
      }
    );
  }, [
    isPlaying,
    currentTrackIndex,
    totalTracks,
    playbackMode,
    translationText,
    tafsirText,
    speakWithHighlight,
    handleNext,
  ]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 0;
      if (dur > 0) {
        const trackRatio = Math.min(1, Math.max(0, cur / dur));
        const combined = Math.min(1, Math.max(0, (currentTrackIndex + trackRatio) / totalTracks));
        setRecitationRatio(combined);
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startRecitation();
    }
  }, [currentIndex, reciterId]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setPlaybackPhase('idle');
      stopAllSpeech();
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
    const speeds = [1, 0.75, 1.25];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  if (!verses || verses.length === 0 || !currentVerse) return null;

  const activeReciter =
    AVAILABLE_RECITERS.find((r) => r.id === reciterId) || AVAILABLE_RECITERS[0];

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="w-full max-w-3xl mx-auto space-y-6 animate-fadeIn"
    >
      <audio
        ref={audioRef}
        src={activeAudioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
      />

      {/* Main Audio Sanctuary Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0A1E17] border border-emerald-900/10 dark:border-emerald-800/40 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-emerald-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-50">
                {t.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.subtitle}</p>
            </div>
          </div>

          {/* Phase Badge */}
          {isPlaying && playbackPhase !== 'idle' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>
                {playbackPhase === 'recitation'
                  ? t.phaseRecitation
                  : playbackPhase === 'translation'
                  ? t.phaseTranslation
                  : t.phaseTafsir}
              </span>
            </div>
          )}
        </div>

        {/* Mode Selector (Quran Only · Quran + Trans · Quran + Tafsir) */}
        <div className="flex items-center gap-1.5 p-1 bg-emerald-900/5 dark:bg-emerald-950/60 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/40">
          <button
            type="button"
            onClick={() => {
              setPlaybackMode('quran_only');
              if (isPlaying) {
                stopAllSpeech();
                setCurrentTrackIndex(0);
                startRecitation();
              }
            }}
            className={`flex-1 min-h-[40px] py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap truncate ${
              playbackMode === 'quran_only'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100'
            }`}
          >
            {t.modeQuranOnly}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaybackMode('quran_translation');
              if (isPlaying) {
                stopAllSpeech();
                setCurrentTrackIndex(0);
                startRecitation();
              }
            }}
            className={`flex-1 min-h-[40px] py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap truncate ${
              playbackMode === 'quran_translation'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100'
            }`}
          >
            {t.modeWithTranslation}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaybackMode('quran_tafsir');
              if (isPlaying) {
                stopAllSpeech();
                setCurrentTrackIndex(0);
                startRecitation();
              }
            }}
            className={`flex-1 min-h-[40px] py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap truncate ${
              playbackMode === 'quran_tafsir'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100'
            }`}
          >
            {t.modeWithTafsir}
          </button>
        </div>

        {/* Active Multi-Level Card Display with Synchronized Word-by-Word Highlighting */}
        <div className="p-5 sm:p-7 rounded-2xl bg-[#FAF8F5] dark:bg-[#071711] border border-emerald-900/10 dark:border-emerald-800/30 space-y-5">
          {/* Card Top Sub-Header */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-emerald-900/10 dark:border-emerald-800/30 pb-3">
            <span className="font-semibold text-emerald-900 dark:text-emerald-300">
              Surah {currentVerse.surahNameTransliterated} · {currentVerse.id}{' '}
              {totalTracks > 1 ? `(${currentTrackIndex + 1}/${totalTracks})` : ''}
            </span>
            <span className="tabular-nums">
              {currentIndex + 1} / {verses.length} · {activeReciter.name}
            </span>
          </div>

          {/* LEVEL 1: Verified Uthmani Arabic Script with synchronized word highlighting */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block tracking-wider uppercase">
              Level 1 · Uthmani Script
            </span>
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-right text-2xl sm:text-3xl text-emerald-950 dark:text-emerald-50 leading-loose select-text"
            >
              {arabicWords.map((word, idx) => {
                const isWordActive =
                  playbackPhase === 'recitation' && idx === activeArabicWordIndex;
                return (
                  <React.Fragment key={idx}>
                    <span
                      className={`inline-block rounded-lg px-0.5 transition-colors duration-150 ${
                        isWordActive
                          ? 'bg-amber-400/35 dark:bg-amber-400/30 text-emerald-950 dark:text-amber-200 underline decoration-amber-500 decoration-2 underline-offset-8'
                          : ''
                      }`}
                    >
                      {word}
                    </span>{' '}
                  </React.Fragment>
                );
              })}
            </p>
          </div>

          {/* LEVEL 2: Certified Translation with synchronized word highlighting */}
          <div className="space-y-1 pt-3 border-t border-emerald-900/10 dark:border-emerald-800/30">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 block tracking-wider uppercase">
              Level 2 · Translation ({currentVerse.translations[language]?.translator || currentVerse.translations.en.translator})
            </span>
            <blockquote className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed italic">
              &ldquo;
              {translationWords.map((word, idx) => {
                const isWordActive =
                  playbackPhase === 'translation' && idx === activeTranslationWordIndex;
                return (
                  <React.Fragment key={idx}>
                    <span
                      className={`inline-block rounded-md px-0.5 transition-colors duration-150 ${
                        isWordActive
                          ? 'bg-amber-400/35 dark:bg-amber-400/30 text-emerald-950 dark:text-amber-200 underline decoration-amber-500 decoration-2 underline-offset-4'
                          : ''
                      }`}
                    >
                      {word}
                    </span>{' '}
                  </React.Fragment>
                );
              })}
              &rdquo;
            </blockquote>
          </div>

          {/* LEVEL 3: Classical Tafsir with synchronized word highlighting (included in 'quran_tafsir' mode) */}
          {playbackMode === 'quran_tafsir' && currentTafsirCitation && (
            <div className="space-y-2 pt-3 border-t border-emerald-900/10 dark:border-emerald-800/30 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {currentTafsirCitation.scholar} · {currentTafsirCitation.sourceBook}
                  </span>
                </span>
                <Quote className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 opacity-70" />
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {tafsirWords.map((word, idx) => {
                  const isWordActive =
                    playbackPhase === 'tafsir' && idx === activeTafsirWordIndex;
                  return (
                    <React.Fragment key={idx}>
                      <span
                        className={`inline-block rounded-md px-0.5 transition-colors duration-150 ${
                          isWordActive
                            ? 'bg-amber-400/35 dark:bg-amber-400/30 text-emerald-950 dark:text-amber-200 underline decoration-amber-500 decoration-2 underline-offset-4'
                            : ''
                        }`}
                      >
                        {word}
                      </span>{' '}
                    </React.Fragment>
                  );
                })}
              </p>
            </div>
          )}
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <button
            type="button"
            onClick={cycleSpeed}
            className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer tabular-nums hover:border-emerald-600 transition-colors"
          >
            {playbackRate}x
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-emerald-800/40 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer hover:border-emerald-600 transition-colors"
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
              className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-emerald-800/40 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer hover:border-emerald-600 transition-colors"
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
            className="min-h-[42px] min-w-[42px] p-2 rounded-xl border border-slate-200 dark:border-emerald-800/40 flex items-center justify-center text-slate-700 dark:text-slate-300 cursor-pointer hover:border-emerald-600 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Reciter Selection */}
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
                    ? 'bg-emerald-800 text-white border-emerald-700 font-semibold shadow-2xs'
                    : 'bg-[#FAF8F5] dark:bg-emerald-950/40 border-emerald-900/10 dark:border-emerald-800/30 text-slate-700 dark:text-slate-300 hover:border-emerald-600'
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
          <div className="space-y-1.5 max-h-52 overflow-y-auto pe-1">
            {verses.map((v, idx) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-full p-3 rounded-xl text-start flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  idx === currentIndex
                    ? 'bg-emerald-900/10 dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 font-semibold border border-emerald-900/20 dark:border-emerald-700/40'
                    : 'hover:bg-slate-50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-400 border border-transparent'
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
