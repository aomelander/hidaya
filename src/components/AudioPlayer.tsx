"use client";

/**
 * @file src/components/AudioPlayer.tsx
 * @description Fully localized verse audio player supporting:
 * 1. Verified Quran Recitation (EveryAyah CDN across 5 reciters)
 * 2. Stored Neural Translation Audio (via server /api/ayah-audio/[id])
 * 3. Stored Classical Tafsir Audio (via server /api/ayah-audio/[id])
 * with offline Service Worker caching in `hidaya-audio-v2` and SpeechService fallback.
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
  Clock,
} from 'lucide-react';
import { ReciterId, Language } from '../types';
import { AVAILABLE_RECITERS, getAudioUrlsForVerseRange } from '../services/audioReciters';
import { StorageService } from '../services/storage';
import { SpeechService } from '../services/speechSynthesisService';
import { OfflineCacheService } from '../services/offlineCacheService';
import {
  fetchAyahAudioMetadata,
  StoredAudioMetadata,
  StoredAudioType,
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
    speakingTranslation: string;
    addTranslationFallback: string;
    saveAudio: string;
    savedOffline: string;
    loopTooltip: string;
    restartTooltip: string;
    playLabel: string;
    pauseLabel: string;
    muteLabel: string;
    unmuteLabel: string;
    processingLabel: string;
    unavailableLabel: string;
    errorLabel: string;
    loadingMetadata: string;
  }
> = {
  en: {
    verseLabel: 'Ayah',
    recitationTab: 'Recitation',
    translationTab: 'Translation',
    tafsirTab: 'Tafsir',
    speakingTranslation: 'Speaking Translation...',
    addTranslationFallback: '+ Voiceover',
    saveAudio: 'Save Audio',
    savedOffline: 'Offline Audio',
    loopTooltip: 'Loop verse',
    restartTooltip: 'Restart playback',
    playLabel: 'Play',
    pauseLabel: 'Pause',
    muteLabel: 'Mute',
    unmuteLabel: 'Unmute',
    processingLabel: 'Audio in production',
    unavailableLabel: 'Audio unavailable',
    errorLabel: 'Stream error',
    loadingMetadata: 'Checking stream...',
  },
  sv: {
    verseLabel: 'Vers',
    recitationTab: 'Recitation',
    translationTab: 'Översättning',
    tafsirTab: 'Tafsir',
    speakingTranslation: 'Läser översättning...',
    addTranslationFallback: '+ Talsyntes',
    saveAudio: 'Spara ljud',
    savedOffline: 'Sparad offline',
    loopTooltip: 'Upprepa vers',
    restartTooltip: 'Starta om uppspelning',
    playLabel: 'Spela',
    pauseLabel: 'Pausa',
    muteLabel: 'Ljud av',
    unmuteLabel: 'Ljud på',
    processingLabel: 'Ljud produceras',
    unavailableLabel: 'Ljud ej tillgängligt',
    errorLabel: 'Strömningsfel',
    loadingMetadata: 'Kontrollerar ljud...',
  },
  fr: {
    verseLabel: 'Verset',
    recitationTab: 'Récitation',
    translationTab: 'Traduction',
    tafsirTab: 'Tafsir',
    speakingTranslation: 'Lecture traduction...',
    addTranslationFallback: '+ Synthèse',
    saveAudio: 'Audio hors-ligne',
    savedOffline: 'Audio enregistré',
    loopTooltip: 'Répéter le verset',
    restartTooltip: 'Recommencer',
    playLabel: 'Lire',
    pauseLabel: 'Mettre en pause',
    muteLabel: 'Couper le son',
    unmuteLabel: 'Activer le son',
    processingLabel: 'Audio en production',
    unavailableLabel: 'Audio indisponible',
    errorLabel: 'Erreur de lecture',
    loadingMetadata: 'Vérification...',
  },
  ar: {
    verseLabel: 'الآية',
    recitationTab: 'تلاوة',
    translationTab: 'ترجمة صوتية',
    tafsirTab: 'تفسير صوتي',
    speakingTranslation: 'جاري قراءة الترجمة...',
    addTranslationFallback: '+ صوت ناطق',
    saveAudio: 'حفظ التلاوة',
    savedOffline: 'محفوظة بدون إنترنت',
    loopTooltip: 'تكرار الآية',
    restartTooltip: 'إعادة التشغيل',
    playLabel: 'تشغيل',
    pauseLabel: 'إيقاف مؤقت',
    muteLabel: 'كتم الصوت',
    unmuteLabel: 'تشغيل الصوت',
    processingLabel: 'الصوت قيد الإنتاج',
    unavailableLabel: 'الصوت غير متوفر',
    errorLabel: 'خطأ في التدفق',
    loadingMetadata: 'جاري التحقق...',
  },
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  surahVerseId,
  surahNumber,
  verseNumber,
  ayahId,
  audioUrl,
  initialAudioUrl,
  translationText,
  tafsirText,
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
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Client speech synthesis fallback
  const [isSpeakingFallback, setIsSpeakingFallback] = useState(false);

  const [isAudioCached, setIsAudioCached] = useState(false);
  const [isCachingAudio, setIsCachingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  // Recitation URLs for Arabic Quran
  const recitationUrls = useMemo(() => {
    if (resolvedSurah && resolvedVerse) {
      return getAudioUrlsForVerseRange(resolvedSurah, resolvedVerse, reciterId);
    }
    const single = audioUrl || initialAudioUrl || '';
    return single ? [single] : [];
  }, [resolvedSurah, resolvedVerse, reciterId, audioUrl, initialAudioUrl]);

  // Fetch neural translation and tafsir metadata from server API
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingMetadata(true);

    const loadMetadata = async () => {
      try {
        const [transMeta, tafMeta] = await Promise.all([
          fetchAyahAudioMetadata({
            surahNumber: resolvedSurah,
            ayahNumber: resolvedVerse,
            language,
            type: 'translation',
            ayahId,
          }),
          fetchAyahAudioMetadata({
            surahNumber: resolvedSurah,
            ayahNumber: resolvedVerse,
            language,
            type: 'tafsir',
            ayahId,
          }),
        ]);

        if (!isCancelled) {
          setTranslationMetadata(transMeta);
          setTafsirMetadata(tafMeta);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn('Error fetching audio stream metadata:', err);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMetadata(false);
        }
      }
    };

    loadMetadata();

    return () => {
      isCancelled = true;
    };
  }, [resolvedSurah, resolvedVerse, language, ayahId]);

  // Determine active MP3 audio URL based on stream mode
  const effectiveActiveUrl = useMemo(() => {
    if (streamMode === 'recitation') {
      return recitationUrls[currentTrackIndex] || recitationUrls[0] || '';
    }
    if (streamMode === 'translation') {
      return translationMetadata?.status === 'available'
        ? translationMetadata.record?.audioUrl || ''
        : '';
    }
    if (streamMode === 'tafsir') {
      return tafsirMetadata?.status === 'available'
        ? tafsirMetadata.record?.audioUrl || ''
        : '';
    }
    return '';
  }, [streamMode, recitationUrls, currentTrackIndex, translationMetadata, tafsirMetadata]);

  const totalTracks = streamMode === 'recitation' ? Math.max(1, recitationUrls.length) : 1;

  // Active status for the current mode
  const currentModeStatus = useMemo(() => {
    if (streamMode === 'recitation') {
      return { status: 'available' as const };
    }
    if (streamMode === 'translation') {
      return {
        status: translationMetadata?.status || ('unavailable' as const),
        message: translationMetadata?.message,
        voice: translationMetadata?.record?.voice,
        attribution: translationMetadata?.record?.attribution,
      };
    }
    return {
      status: tafsirMetadata?.status || ('unavailable' as const),
      message: tafsirMetadata?.message,
      voice: tafsirMetadata?.record?.voice,
      attribution: tafsirMetadata?.record?.attribution,
    };
  }, [streamMode, translationMetadata, tafsirMetadata]);

  // Reset audio playback on verse, reciter, or streamMode change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setHasPlaybackError(false);
    setIsSpeakingFallback(false);
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
    if (isSpeakingFallback) {
      SpeechService.cancel();
      setIsSpeakingFallback(false);
      setIsPlaying(false);
      onPlaybackProgress?.(0, false, 'idle');
      return;
    }

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

  // Client speech synthesis fallback when stored translation audio is not available
  const handlePlaySpeechFallback = () => {
    if (!translationText || language === 'ar') return;

    if (isSpeakingFallback) {
      SpeechService.cancel();
      setIsSpeakingFallback(false);
      setIsPlaying(false);
      onPlaybackProgress?.(0, false, 'idle');
      return;
    }

    SpeechService.cancel();
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(true);
    setIsSpeakingFallback(true);
    onPlaybackProgress?.(0, true, 'translation');

    SpeechService.speak(translationText, language, {
      rate: playbackRate * 0.92,
      onProgress: (ratio) => onPlaybackProgress?.(ratio, true, 'translation'),
      onEnd: () => {
        setIsSpeakingFallback(false);
        setIsPlaying(false);
        onPlaybackProgress?.(0, false, 'idle');
      },
      onError: () => {
        setIsSpeakingFallback(false);
        setIsPlaying(false);
        onPlaybackProgress?.(0, false, 'idle');
      },
    });
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
    if (isSpeakingFallback) {
      handlePlaySpeechFallback();
      return;
    }
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

  const isPlayDisabled =
    currentModeStatus.status !== 'available' || !effectiveActiveUrl || hasPlaybackError;

  return (
    <div
      className="p-3.5 bg-emerald-950/5 dark:bg-emerald-900/20 border border-emerald-800/15 dark:border-emerald-700/30 rounded-2xl space-y-2.5 transition-colors"
      role="region"
      aria-label={`Calm audio player for verse ${surahVerseId}`}
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

      {/* Top Header: Stream Type Mode Switcher (Recitation · Translation · Tafsir) & Offline Save */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/10 dark:border-emerald-800/30 pb-2">
        {/* Stream Mode Segmented Control */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white dark:bg-[#071913] border border-emerald-900/15 dark:border-emerald-700/40 text-xs">
          <button
            type="button"
            onClick={() => setStreamMode('recitation')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              streamMode === 'recitation'
                ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-amber-400" />
            <span>{p.recitationTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setStreamMode('translation')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              streamMode === 'translation'
                ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-amber-500" />
            <span>{p.translationTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setStreamMode('tafsir')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              streamMode === 'tafsir'
                ? 'bg-emerald-800 text-white dark:bg-emerald-700 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>{p.tafsirTab}</span>
          </button>
        </div>

        {/* Action Controls: Reciter selector (Recitation mode) or Voice Badge + Offline Save + Loop */}
        <div className="flex items-center gap-1.5 text-xs">
          {streamMode === 'recitation' ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRecitersList(!showRecitersList)}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-[#071913] border border-emerald-900/15 dark:border-emerald-700/40 text-emerald-900 dark:text-emerald-200 hover:border-emerald-600 transition-colors cursor-pointer"
                aria-expanded={showRecitersList}
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
                      className={`w-full text-start p-2 rounded-lg text-xs transition-colors flex flex-col cursor-pointer ${
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
          ) : (
            currentModeStatus.voice && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-900/10 dark:bg-emerald-900/30 border border-emerald-800/20">
                {currentModeStatus.voice.split('-').slice(-2).join('-')}
              </span>
            )
          )}

          {/* Offline Save Toggle */}
          <button
            type="button"
            onClick={handleToggleOfflineAudio}
            disabled={isCachingAudio || !effectiveActiveUrl}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
              isAudioCached
                ? 'bg-emerald-800/15 border-emerald-700/40 text-emerald-900 dark:text-emerald-200'
                : 'bg-white/60 dark:bg-emerald-950/40 border-slate-200 dark:border-emerald-800/40 text-slate-600 dark:text-slate-400 hover:border-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
            title={isAudioCached ? p.savedOffline : p.saveAudio}
            aria-pressed={isAudioCached}
          >
            {isCachingAudio ? (
              <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
            ) : isAudioCached ? (
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Download className="w-3 h-3 text-slate-500" />
            )}
            <span className="hidden sm:inline">{isCachingAudio ? '...' : isAudioCached ? p.savedOffline : p.saveAudio}</span>
          </button>

          {/* Loop toggle */}
          <button
            type="button"
            onClick={() => setIsLooping(!isLooping)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
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

      {/* Secondary Notification Bar if in-production or unavailable */}
      {streamMode !== 'recitation' && currentModeStatus.status !== 'available' && (
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-1.5 truncate">
            {isLoadingMetadata ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-amber-600" />
            ) : currentModeStatus.status === 'processing' ? (
              <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            )}
            <span className="truncate">
              {isLoadingMetadata
                ? p.loadingMetadata
                : currentModeStatus.status === 'processing'
                ? p.processingLabel
                : p.unavailableLabel}
            </span>
          </div>

          {/* Optional Speech fallback button for translation when audio is unavailable */}
          {streamMode === 'translation' && translationText && language !== 'ar' && (
            <button
              type="button"
              onClick={handlePlaySpeechFallback}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border transition-colors cursor-pointer shrink-0 ${
                isSpeakingFallback
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-white dark:bg-emerald-950 border-amber-600/40 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              {isSpeakingFallback ? p.pauseLabel : p.addTranslationFallback}
            </button>
          )}
        </div>
      )}

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
            disabled={isPlayDisabled && !isSpeakingFallback}
            className={`flex items-center justify-center w-10 h-10 rounded-full text-white shadow-sm transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isSpeakingFallback
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600'
            }`}
            aria-label={isPlaying ? p.pauseLabel : p.playLabel}
          >
            {isPlaying || isSpeakingFallback ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ms-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={restart}
            disabled={isPlayDisabled && !isSpeakingFallback}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-900/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title={p.restartTooltip}
            aria-label={p.restartTooltip}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex flex-col text-start">
            <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-200 tracking-wide truncate max-w-[120px] sm:max-w-[160px]">
              {isSpeakingFallback
                ? p.speakingTranslation
                : streamMode === 'recitation'
                ? `${p.verseLabel} ${resolvedVerse}`
                : streamMode === 'translation'
                ? `${p.translationTab} (${language.toUpperCase()})`
                : `${p.tafsirTab}`}
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
            disabled={isPlayDisabled && !isSpeakingFallback}
            aria-label="Seek playback timeline"
            className="w-full h-1.5 bg-emerald-200 dark:bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-700 dark:accent-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed"
          />
        </div>

        {/* Speed & Volume Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={cycleSpeed}
            className="px-2 py-1 text-[11px] font-semibold rounded border border-emerald-700/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-800/10 cursor-pointer tabular-nums"
          >
            {playbackRate}x
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 cursor-pointer"
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
