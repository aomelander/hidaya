"use client";

/**
 * @file src/components/AudioPlayer.tsx
 * @description Fully localized verse audio player supporting:
 * 1. Verified Quran Recitation (EveryAyah CDN across 5 reciters, always in Arabic)
 * 2. Stored Neural Translation Audio (via server /api/ayah-audio/[id], strictly matching selected language)
 * 3. Stored Classical Tafsir Audio (via server /api/ayah-audio/[id], strictly matching selected language)
 * Hides unavailable translation/tafsir audio controls, cancels in-flight metadata on language change,
 * and never falls back to browser speech synthesis.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
  Headphones,
  Languages,
  BookOpen,
  ChevronDown,
  Download,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { ReciterId, Language } from '../types';
import { AVAILABLE_RECITERS, getAudioUrlsForVerseRange } from '../services/audioReciters';
import { StorageService } from '../services/storage';
import { SpeechService } from '../services/speechSynthesisService';
import { OfflineCacheService } from '../services/offlineCacheService';
import {
  fetchAyahAudioMetadata,
  StoredAudioMetadata,
} from '../lib/audio/audioResolverService';

export type AudioStreamMode = 'recitation' | 'translation' | 'tafsir';

interface AudioPlayerProps {
  surahVerseId: string;
  surahNumber?: number;
  verseNumber?: string;
  ayahId?: string;
  audioUrl?: string;
  initialAudioUrl?: string;
  translationText?: string;
  tafsirText?: string;
  language?: Language;
  onPlaybackProgress?: (
    progressRatio: number,
    isPlaying: boolean,
    phase?: 'recitation' | 'translation' | 'tafsir' | 'idle'
  ) => void;
}

const PLAYER_STRINGS: Record<
  Language,
  {
    verseLabel: string;
    recitationTab: string;
    translationTab: string;
    tafsirTab: string;
    saveAudio: string;
    savedOffline: string;
    loopTooltip: string;
    restartTooltip: string;
    playLabel: string;
    pauseLabel: string;
    muteLabel: string;
    unmuteLabel: string;
    errorLabel: string;
    seekLabel: string;
    speedLabel: string;
    selectReciterLabel: string;
  }
> = {
  en: {
    verseLabel: 'Ayah',
    recitationTab: 'Recitation (AR)',
    translationTab: 'Translation',
    tafsirTab: 'Tafsir',
    saveAudio: 'Save Audio',
    savedOffline: 'Offline Audio',
    loopTooltip: 'Loop verse',
    restartTooltip: 'Restart playback',
    playLabel: 'Play',
    pauseLabel: 'Pause',
    muteLabel: 'Mute',
    unmuteLabel: 'Unmute',
    errorLabel: 'Stream error',
    seekLabel: 'Seek playback timeline',
    speedLabel: 'Playback speed',
    selectReciterLabel: 'Select Quran reciter',
  },
  sv: {
    verseLabel: 'Vers',
    recitationTab: 'Recitation (AR)',
    translationTab: 'Översättning',
    tafsirTab: 'Tafsir',
    saveAudio: 'Spara ljud',
    savedOffline: 'Sparad offline',
    loopTooltip: 'Upprepa vers',
    restartTooltip: 'Starta om uppspelning',
    playLabel: 'Spela',
    pauseLabel: 'Pausa',
    muteLabel: 'Ljud av',
    unmuteLabel: 'Ljud på',
    errorLabel: 'Strömningsfel',
    seekLabel: 'Spola i uppspelning',
    speedLabel: 'Uppspelningshastighet',
    selectReciterLabel: 'Välj recitatör',
  },
  fr: {
    verseLabel: 'Verset',
    recitationTab: 'Récitation (AR)',
    translationTab: 'Traduction',
    tafsirTab: 'Tafsir',
    saveAudio: 'Audio hors-ligne',
    savedOffline: 'Audio enregistré',
    loopTooltip: 'Répéter le verset',
    restartTooltip: 'Recommencer',
    playLabel: 'Lire',
    pauseLabel: 'Mettre en pause',
    muteLabel: 'Couper le son',
    unmuteLabel: 'Activer le son',
    errorLabel: 'Erreur de lecture',
    seekLabel: 'Parcourir la piste audio',
    speedLabel: 'Vitesse de lecture',
    selectReciterLabel: 'Choisir le récitateur',
  },
  ar: {
    verseLabel: 'الآية',
    recitationTab: 'تلاوة قرآنية',
    translationTab: 'ترجمة صوتية',
    tafsirTab: 'تفسير صوتي',
    saveAudio: 'حفظ التلاوة',
    savedOffline: 'محفوظة بدون إنترنت',
    loopTooltip: 'تكرار الآية',
    restartTooltip: 'إعادة التشغيل',
    playLabel: 'تشغيل',
    pauseLabel: 'إيقاف مؤقت',
    muteLabel: 'كتم الصوت',
    unmuteLabel: 'تشغيل الصوت',
    errorLabel: 'خطأ في التدفق',
    seekLabel: 'شريط تقدم التلاوة',
    speedLabel: 'سرعة التلاوة',
    selectReciterLabel: 'اختيار القارئ',
  },
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  surahVerseId,
  surahNumber,
  verseNumber,
  ayahId,
  audioUrl,
  initialAudioUrl,
  translationText = '',
  tafsirText = '',
  language = 'en',
  onPlaybackProgress,
}) => {
  const [streamMode, setStreamMode] = useState<AudioStreamMode>('recitation');
  const [reciterId, setReciterId] = useState<ReciterId>(() => StorageService.getPreferredReciter());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [showRecitersList, setShowRecitersList] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);

  // Stored neural audio states
  const [translationMetadata, setTranslationMetadata] = useState<StoredAudioMetadata | null>(null);
  const [tafsirMetadata, setTafsirMetadata] = useState<StoredAudioMetadata | null>(null);

  const [isAudioCached, setIsAudioCached] = useState(false);
  const [isCachingAudio, setIsCachingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const metadataRequestIdRef = useRef(0);
  const p = PLAYER_STRINGS[language] || PLAYER_STRINGS.en;

  const { resolvedSurah, resolvedVerse } = useMemo(() => {
    if (surahNumber && verseNumber) {
      return { resolvedSurah: surahNumber, resolvedVerse: verseNumber };
    }
    if (surahVerseId && surahVerseId.includes(':')) {
      const [s, v] = surahVerseId.split(':');
      return { resolvedSurah: parseInt(s, 10), resolvedVerse: v };
    }
    return { resolvedSurah: surahNumber || 3, resolvedVerse: verseNumber || '134' };
  }, [surahNumber, verseNumber, surahVerseId]);

  // Recitation URLs for Arabic Quran (always available in Arabic across all app languages)
  const recitationUrls = useMemo(() => {
    if (resolvedSurah && resolvedVerse) {
      return getAudioUrlsForVerseRange(resolvedSurah, resolvedVerse, reciterId);
    }
    const single = audioUrl || initialAudioUrl || '';
    return single ? [single] : [];
  }, [resolvedSurah, resolvedVerse, reciterId, audioUrl, initialAudioUrl]);

  const hasTranslationText = Boolean(language !== 'ar' && translationText && translationText.trim().length > 0);
  const hasTafsirText = Boolean(tafsirText && tafsirText.trim().length > 0);

  // Strict language and availability check for translation and tafsir audio
  const isTranslationAudioAvailable = Boolean(
    hasTranslationText &&
      translationMetadata?.status === 'available' &&
      translationMetadata?.record?.audioUrl &&
      translationMetadata?.record?.languageCode?.toLowerCase() === language.toLowerCase()
  );

  const isTafsirAudioAvailable = Boolean(
    hasTafsirText &&
      tafsirMetadata?.status === 'available' &&
      tafsirMetadata?.record?.audioUrl &&
      tafsirMetadata?.record?.languageCode?.toLowerCase() === language.toLowerCase()
  );

  // Stop previous audio and fetch neural translation/tafsir metadata when verse or language changes
  useEffect(() => {
    const currentRequestId = ++metadataRequestIdRef.current;
    const controller = new AbortController();

    // Immediately stop any active audio or speech and clear stale metadata on language/verse change
    SpeechService.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setHasPlaybackError(false);
    setTranslationMetadata(null);
    setTafsirMetadata(null);
    onPlaybackProgress?.(0, false, 'idle');

    const loadMetadata = async () => {
      try {
        const [transMeta, tafMeta] = await Promise.all([
          !hasTranslationText
            ? Promise.resolve<StoredAudioMetadata>({ status: 'unavailable' })
            : fetchAyahAudioMetadata({
                surahNumber: resolvedSurah,
                ayahNumber: resolvedVerse,
                language,
                type: 'translation',
                ayahId,
                signal: controller.signal,
              }),
          !hasTafsirText
            ? Promise.resolve<StoredAudioMetadata>({ status: 'unavailable' })
            : fetchAyahAudioMetadata({
                surahNumber: resolvedSurah,
                ayahNumber: resolvedVerse,
                language,
                type: 'tafsir',
                ayahId,
                signal: controller.signal,
              }),
        ]);

        // Ignore late responses from a previous language or verse selection
        if (currentRequestId !== metadataRequestIdRef.current || controller.signal.aborted) {
          return;
        }

        setTranslationMetadata(transMeta);
        setTafsirMetadata(tafMeta);
      } catch {
        // Ignore aborted requests
      }
    };

    void loadMetadata();

    return () => {
      controller.abort();
    };
  }, [resolvedSurah, resolvedVerse, language, ayahId, hasTranslationText, hasTafsirText]); // eslint-disable-line react-hooks/exhaustive-deps

  // If the currently selected stream mode is not available in the selected language, switch back to recitation
  useEffect(() => {
    if (streamMode === 'translation' && !isTranslationAudioAvailable) {
      setStreamMode('recitation');
    } else if (streamMode === 'tafsir' && !isTafsirAudioAvailable) {
      setStreamMode('recitation');
    }
  }, [streamMode, isTranslationAudioAvailable, isTafsirAudioAvailable]);

  // Determine active MP3 audio URL based on stream mode
  const effectiveActiveUrl = useMemo(() => {
    if (streamMode === 'recitation') {
      return recitationUrls[currentTrackIndex] || recitationUrls[0] || '';
    }
    if (streamMode === 'translation' && isTranslationAudioAvailable) {
      return translationMetadata?.record?.audioUrl || '';
    }
    if (streamMode === 'tafsir' && isTafsirAudioAvailable) {
      return tafsirMetadata?.record?.audioUrl || '';
    }
    return '';
  }, [
    streamMode,
    recitationUrls,
    currentTrackIndex,
    isTranslationAudioAvailable,
    isTafsirAudioAvailable,
    translationMetadata,
    tafsirMetadata,
  ]);

  const totalTracks = streamMode === 'recitation' ? Math.max(1, recitationUrls.length) : 1;

  // Reset audio playback on verse, reciter, or streamMode change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setHasPlaybackError(false);
    SpeechService.cancel();
    onPlaybackProgress?.(0, false, 'idle');

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (effectiveActiveUrl) {
      OfflineCacheService.isAudioCached(effectiveActiveUrl).then(setIsAudioCached);
    } else {
      setIsAudioCached(false);
    }
  }, [surahVerseId, resolvedSurah, resolvedVerse, reciterId, streamMode, effectiveActiveUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-play consecutive tracks in multi-verse ranges (recitation mode)
  useEffect(() => {
    if (isPlaying && streamMode === 'recitation' && currentTrackIndex > 0 && audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current
        .play()
        .then(() => {
          onPlaybackProgress?.(currentTrackIndex / totalTracks, true, 'recitation');
        })
        .catch(() => {
          setIsPlaying(false);
          onPlaybackProgress?.(0, false, 'idle');
        });
    }
  }, [currentTrackIndex, isPlaying, streamMode, totalTracks, playbackRate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const syncCacheStatus = () => {
      if (effectiveActiveUrl) {
        OfflineCacheService.isAudioCached(effectiveActiveUrl).then(setIsAudioCached);
      }
    };
    window.addEventListener('hidaya-offline-cache-updated', syncCacheStatus);
    return () => window.removeEventListener('hidaya-offline-cache-updated', syncCacheStatus);
  }, [effectiveActiveUrl]);

  const handleToggleOfflineAudio = async () => {
    if (!effectiveActiveUrl || isCachingAudio) return;
    setIsCachingAudio(true);
    try {
      const cached = await OfflineCacheService.toggleVerseAudioCache(effectiveActiveUrl);
      setIsAudioCached(cached);
    } finally {
      setIsCachingAudio(false);
    }
  };

  const computeCombinedRatio = useCallback(
    (trackIdx: number, cur: number, dur: number) => {
      const trackRatio = dur > 0 ? Math.min(1, Math.max(0, cur / dur)) : 0;
      return Math.min(1, Math.max(0, (trackIdx + trackRatio) / totalTracks));
    },
    [totalTracks]
  );

  const togglePlay = () => {
    if (!audioRef.current || !effectiveActiveUrl) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPlaybackProgress?.(
        computeCombinedRatio(currentTrackIndex, currentTime, duration),
        false,
        'idle'
      );
    } else {
      setHasPlaybackError(false);
      audioRef.current.playbackRate = playbackRate;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          onPlaybackProgress?.(
            computeCombinedRatio(currentTrackIndex, currentTime, duration),
            true,
            streamMode
          );
        })
        .catch((err) => {
          console.warn('Audio playback error:', err);
          setHasPlaybackError(true);
          setIsPlaying(false);
          onPlaybackProgress?.(0, false, 'idle');
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration || duration;
      setCurrentTime(cur);
      if (dur > 0) {
        onPlaybackProgress?.(
          computeCombinedRatio(currentTrackIndex, cur, dur),
          true,
          streamMode
        );
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.playbackRate = playbackRate;
      setHasPlaybackError(false);
    }
  };

  const handleEnded = () => {
    if (streamMode === 'recitation' && currentTrackIndex < totalTracks - 1) {
      setCurrentTrackIndex((prev) => prev + 1);
      return;
    }

    onPlaybackProgress?.(0, false, 'idle');
    if (isLooping) {
      setCurrentTrackIndex(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => setIsPlaying(true));
      }
    } else {
      setIsPlaying(false);
      setCurrentTrackIndex(0);
      setCurrentTime(0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      if (duration > 0) {
        onPlaybackProgress?.(
          computeCombinedRatio(currentTrackIndex, time, duration),
          isPlaying,
          streamMode
        );
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cycleSpeed = () => {
    const speeds = [1, 0.75, 1.25];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const restart = () => {
    setCurrentTrackIndex(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const handleReciterChange = (id: ReciterId) => {
    setReciterId(id);
    StorageService.setPreferredReciter(id);
    setShowRecitersList(false);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentReciter =
    AVAILABLE_RECITERS.find((r) => r.id === reciterId) || AVAILABLE_RECITERS[0];

  const isPlayDisabled = !effectiveActiveUrl || hasPlaybackError;

  return (
    <div
      className="p-3.5 bg-emerald-950/5 dark:bg-emerald-900/20 border border-emerald-800/15 dark:border-emerald-700/30 rounded-2xl space-y-2.5 transition-colors"
      role="region"
      aria-label={`Audio player for verse ${surahVerseId}`}
    >
      <audio
        ref={audioRef}
        src={effectiveActiveUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setHasPlaybackError(true)}
      />

      {/* Top Header: Stream Type Mode Switcher (Only shows available streams in selected language) & Offline Save */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/10 dark:border-emerald-800/30 pb-2">
        <div
          className="flex items-center gap-1 p-0.5 rounded-xl bg-white dark:bg-[#071913] border border-emerald-900/15 dark:border-emerald-700/40 text-xs"
          role="group"
          aria-label="Audio stream type"
        >
          <button
            type="button"
            onClick={() => setStreamMode('recitation')}
            aria-pressed={streamMode === 'recitation'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              streamMode === 'recitation'
                ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-amber-400" />
            <span>{p.recitationTab}</span>
          </button>

          {isTranslationAudioAvailable && (
            <button
              type="button"
              onClick={() => setStreamMode('translation')}
              aria-pressed={streamMode === 'translation'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                streamMode === 'translation'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100'
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {p.translationTab} ({language.toUpperCase()})
              </span>
            </button>
          )}

          {isTafsirAudioAvailable && (
            <button
              type="button"
              onClick={() => setStreamMode('tafsir')}
              aria-pressed={streamMode === 'tafsir'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                streamMode === 'tafsir'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {p.tafsirTab} ({language.toUpperCase()})
              </span>
            </button>
          )}
        </div>

        {/* Action Controls: Reciter selector (Recitation mode) + Offline Save + Loop */}
        <div className="flex items-center gap-1.5 text-xs">
          {streamMode === 'recitation' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRecitersList(!showRecitersList)}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-[#071913] border border-emerald-900/15 dark:border-emerald-700/40 text-emerald-900 dark:text-emerald-200 hover:border-emerald-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-expanded={showRecitersList}
                aria-label={`${p.selectReciterLabel}: ${currentReciter.name}`}
              >
                <span className="truncate max-w-[100px] sm:max-w-[130px]">{currentReciter.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRecitersList && (
                <div className="absolute end-0 top-full mt-1.5 z-30 w-60 p-1.5 bg-white dark:bg-[#071913] border border-emerald-900/20 dark:border-emerald-700/50 rounded-xl shadow-xl space-y-1">
                  {AVAILABLE_RECITERS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleReciterChange(r.id)}
                      aria-pressed={r.id === reciterId}
                      className={`w-full text-start p-2 rounded-lg text-xs transition-colors flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        r.id === reciterId
                          ? 'bg-emerald-800/15 dark:bg-emerald-800/30 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-emerald-900/20 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{r.name}</span>
                      <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                        {r.subname} · {r.style}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Offline Save Toggle */}
          <button
            type="button"
            onClick={handleToggleOfflineAudio}
            disabled={isCachingAudio || !effectiveActiveUrl}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isAudioCached
                ? 'bg-emerald-800/15 border-emerald-700/40 text-emerald-900 dark:text-emerald-200'
                : 'bg-white/60 dark:bg-emerald-950/40 border-slate-200 dark:border-emerald-800/40 text-slate-600 dark:text-slate-400 hover:border-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
            title={isAudioCached ? p.savedOffline : p.saveAudio}
            aria-label={isAudioCached ? p.savedOffline : p.saveAudio}
            aria-pressed={isAudioCached}
          >
            {isCachingAudio ? (
              <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
            ) : isAudioCached ? (
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Download className="w-3 h-3 text-slate-500" />
            )}
            <span className="hidden sm:inline">
              {isCachingAudio ? '...' : isAudioCached ? p.savedOffline : p.saveAudio}
            </span>
          </button>

          {/* Loop toggle */}
          <button
            type="button"
            onClick={() => setIsLooping(!isLooping)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isLooping
                ? 'bg-emerald-800/20 border-emerald-800/40 text-emerald-900 dark:text-emerald-200 font-bold'
                : 'bg-white/60 dark:bg-emerald-950/40 border-slate-200 dark:border-emerald-800/40 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title={p.loopTooltip}
            aria-label={p.loopTooltip}
            aria-pressed={isLooping}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {hasPlaybackError && (
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-800 dark:text-red-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
          <span>{p.errorLabel}</span>
        </div>
      )}

      {/* Main Player Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            onClick={togglePlay}
            disabled={isPlayDisabled}
            className="flex items-center justify-center w-10 h-10 rounded-full text-white shadow-sm transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            aria-label={isPlaying ? p.pauseLabel : p.playLabel}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ms-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={restart}
            disabled={isPlayDisabled}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-900/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title={p.restartTooltip}
            aria-label={p.restartTooltip}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex flex-col text-start">
            <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-200 tracking-wide truncate max-w-[140px] sm:max-w-[180px]">
              {streamMode === 'recitation'
                ? `${p.verseLabel} ${resolvedVerse}`
                : streamMode === 'translation'
                ? `${p.translationTab} (${language.toUpperCase()})`
                : `${p.tafsirTab} (${language.toUpperCase()})`}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Progress scrubber */}
        <div className="flex-1 w-full flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={isPlayDisabled}
            aria-label={p.seekLabel}
            className="w-full h-1.5 bg-emerald-200 dark:bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-700 dark:accent-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          />
        </div>

        {/* Speed & Volume Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={cycleSpeed}
            aria-label={`${p.speedLabel}: ${playbackRate}x`}
            className="px-2 py-1 text-[11px] font-semibold rounded border border-emerald-700/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-800/10 cursor-pointer tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {playbackRate}x
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={isMuted}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title={isMuted ? p.unmuteLabel : p.muteLabel}
            aria-label={isMuted ? p.unmuteLabel : p.muteLabel}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
