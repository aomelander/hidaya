"use client";

/**
 * @file src/components/AudioPlayer.tsx
 * @description Fully localized verse recitation audio player (EN, SV, FR, AR)
 * with optional per-verse offline audio caching.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
  Headphones,
  Languages,
  ChevronDown,
  Download,
  Check,
} from 'lucide-react';
import { ReciterId, Language } from '../types';
import { AVAILABLE_RECITERS, getAudioUrlForVerse } from '../services/audioReciters';
import { StorageService } from '../services/storage';
import { SpeechService } from '../services/speechSynthesisService';
import { OfflineCacheService } from '../services/offlineCacheService';

interface AudioPlayerProps {
  surahVerseId: string;
  surahNumber?: number;
  verseNumber?: string;
  audioUrl?: string;
  initialAudioUrl?: string;
  translationText?: string;
  language?: Language;
}

const PLAYER_STRINGS: Record<
  Language,
  {
    verseLabel: string;
    speakingTranslation: string;
    addTranslation: string;
    saveAudio: string;
    savedOffline: string;
    loopTooltip: string;
    restartTooltip: string;
    playLabel: string;
    pauseLabel: string;
    muteLabel: string;
    unmuteLabel: string;
  }
> = {
  en: {
    verseLabel: 'Ayah',
    speakingTranslation: 'Speaking Translation...',
    addTranslation: '+ Translation',
    saveAudio: 'Save Audio',
    savedOffline: 'Offline Audio',
    loopTooltip: 'Loop verse',
    restartTooltip: 'Restart recitation',
    playLabel: 'Play recitation',
    pauseLabel: 'Pause recitation',
    muteLabel: 'Mute',
    unmuteLabel: 'Unmute',
  },
  sv: {
    verseLabel: 'Vers',
    speakingTranslation: 'Läser översättning...',
    addTranslation: '+ Översättning',
    saveAudio: 'Spara ljud',
    savedOffline: 'Sparad offline',
    loopTooltip: 'Upprepa vers',
    restartTooltip: 'Starta om recitation',
    playLabel: 'Spela recitation',
    pauseLabel: 'Pausa recitation',
    muteLabel: 'Ljud av',
    unmuteLabel: 'Ljud på',
  },
  fr: {
    verseLabel: 'Verset',
    speakingTranslation: 'Lecture de la traduction...',
    addTranslation: '+ Traduction',
    saveAudio: 'Audio hors-ligne',
    savedOffline: 'Audio enregistré',
    loopTooltip: 'Répéter le verset',
    restartTooltip: 'Recommencer la récitation',
    playLabel: 'Lire la récitation',
    pauseLabel: 'Mettre en pause',
    muteLabel: 'Couper le son',
    unmuteLabel: 'Activer le son',
  },
  ar: {
    verseLabel: 'الآية',
    speakingTranslation: 'جاري قراءة الترجمة...',
    addTranslation: '+ الترجمة',
    saveAudio: 'حفظ التلاوة',
    savedOffline: 'محفوظة بدون إنترنت',
    loopTooltip: 'تكرار الآية',
    restartTooltip: 'إعادة التلاوة',
    playLabel: 'تشغيل التلاوة',
    pauseLabel: 'إيقاف مؤقت',
    muteLabel: 'كتم الصوت',
    unmuteLabel: 'تشغيل الصوت',
  },
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  surahVerseId,
  surahNumber,
  verseNumber,
  audioUrl,
  initialAudioUrl,
  translationText,
  language = 'en',
}) => {
  const [reciterId, setReciterId] = useState<ReciterId>(() => StorageService.getPreferredReciter());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [playTranslationVoiceover, setPlayTranslationVoiceover] = useState(false);
  const [isSpeakingTranslation, setIsSpeakingTranslation] = useState(false);
  const [showRecitersList, setShowRecitersList] = useState(false);

  const [isAudioCached, setIsAudioCached] = useState(false);
  const [isCachingAudio, setIsCachingAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const p = PLAYER_STRINGS[language] || PLAYER_STRINGS.en;

  const { resolvedSurah, resolvedVerse } = React.useMemo(() => {
    if (surahNumber && verseNumber) {
      return { resolvedSurah: surahNumber, resolvedVerse: verseNumber };
    }
    if (surahVerseId && surahVerseId.includes(':')) {
      const [s, v] = surahVerseId.split(':');
      return { resolvedSurah: parseInt(s, 10), resolvedVerse: v };
    }
    return { resolvedSurah: surahNumber || 3, resolvedVerse: verseNumber || '134' };
  }, [surahNumber, verseNumber, surahVerseId]);

  const activeAudioUrl = React.useMemo(() => {
    if (resolvedSurah && resolvedVerse) {
      return getAudioUrlForVerse(resolvedSurah, resolvedVerse, reciterId);
    }
    return audioUrl || initialAudioUrl || '';
  }, [resolvedSurah, resolvedVerse, reciterId, audioUrl, initialAudioUrl]);

  useEffect(() => {
    setIsPlaying(false);
    setIsSpeakingTranslation(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (activeAudioUrl) {
      OfflineCacheService.isAudioCached(activeAudioUrl).then(setIsAudioCached);
    }
  }, [activeAudioUrl]);

  useEffect(() => {
    const syncCacheStatus = () => {
      if (activeAudioUrl) {
        OfflineCacheService.isAudioCached(activeAudioUrl).then(setIsAudioCached);
      }
    };
    window.addEventListener('hidaya-offline-cache-updated', syncCacheStatus);
    return () => window.removeEventListener('hidaya-offline-cache-updated', syncCacheStatus);
  }, [activeAudioUrl]);

  const handleToggleOfflineAudio = async () => {
    if (!activeAudioUrl || isCachingAudio) return;
    setIsCachingAudio(true);
    try {
      const nowCached = await OfflineCacheService.toggleVerseAudioCache(activeAudioUrl);
      setIsAudioCached(nowCached);
    } finally {
      setIsCachingAudio(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeakingTranslation(false);
      }
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Audio playback error', err);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const speakTranslation = () => {
    if (language === 'ar' || !translationText) {
      if (isLooping && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => setIsPlaying(true));
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
      return;
    }

    try {
      SpeechService.cancel();
      setIsSpeakingTranslation(true);

      SpeechService.speak(translationText, language, {
        rate: 0.92,
        onStart: () => setIsSpeakingTranslation(true),
        onEnd: () => {
          setIsSpeakingTranslation(false);
          if (isLooping && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().then(() => setIsPlaying(true));
          } else {
            setIsPlaying(false);
            setCurrentTime(0);
          }
        },
        onError: () => {
          setIsSpeakingTranslation(false);
          setIsPlaying(false);
        },
      });
    } catch {
      setIsSpeakingTranslation(false);
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    if (playTranslationVoiceover && translationText) {
      setIsPlaying(false);
      speakTranslation();
    } else if (isLooping) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => setIsPlaying(true));
      }
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingTranslation(false);
    }
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
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentReciter =
    AVAILABLE_RECITERS.find((r) => r.id === reciterId) || AVAILABLE_RECITERS[0];

  const offlineAudioLabel = isAudioCached ? p.savedOffline : p.saveAudio;

  return (
    <div
      className="p-3.5 bg-emerald-950/5 dark:bg-emerald-900/20 border border-emerald-800/15 dark:border-emerald-700/30 rounded-2xl space-y-2.5"
      role="region"
      aria-label={`Recitation audio player for verse ${surahVerseId}`}
    >
      <audio
        ref={audioRef}
        src={activeAudioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Top Bar: Reciter & Offline Audio Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/10 dark:border-emerald-800/30 pb-2">
        {/* Reciter Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRecitersList(!showRecitersList)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-[#071913] border border-emerald-900/15 dark:border-emerald-700/40 text-emerald-900 dark:text-emerald-200 hover:border-emerald-600 transition-colors cursor-pointer"
            aria-expanded={showRecitersList}
          >
            <Headphones className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate max-w-[130px] sm:max-w-[170px]">{currentReciter.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRecitersList && (
            <div className="absolute start-0 top-full mt-1.5 z-30 w-64 p-1.5 bg-white dark:bg-[#071913] border border-emerald-900/20 dark:border-emerald-700/50 rounded-xl shadow-xl space-y-1">
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

        {/* Offline Audio Cache Button + Repeat Toggles */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={handleToggleOfflineAudio}
            disabled={isCachingAudio}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
              isAudioCached
                ? 'bg-emerald-800/15 border-emerald-700/40 text-emerald-900 dark:text-emerald-200'
                : 'bg-white/60 dark:bg-emerald-950/40 border-slate-200 dark:border-emerald-800/40 text-slate-600 dark:text-slate-400 hover:border-emerald-600'
            }`}
            title={offlineAudioLabel}
            aria-pressed={isAudioCached}
          >
            {isAudioCached ? (
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Download className="w-3 h-3 text-slate-500" />
            )}
            <span>{isCachingAudio ? '...' : offlineAudioLabel}</span>
          </button>

          {translationText && language !== 'ar' && (
            <button
              type="button"
              onClick={() => setPlayTranslationVoiceover(!playTranslationVoiceover)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                playTranslationVoiceover
                  ? 'bg-amber-500/15 border-amber-600/40 text-amber-900 dark:text-amber-200 font-bold'
                  : 'bg-white/60 dark:bg-emerald-950/40 border-slate-200 dark:border-emerald-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-400'
              }`}
              aria-pressed={playTranslationVoiceover}
            >
              <Languages className="w-3 h-3 text-amber-500" />
              <span>{p.addTranslation}</span>
            </button>
          )}

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

      {/* Main Player Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-sm transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            aria-label={isPlaying ? p.pauseLabel : p.playLabel}
          >
            {isPlaying || isSpeakingTranslation ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ms-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={restart}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-900/10 transition-colors cursor-pointer"
            title={p.restartTooltip}
            aria-label={p.restartTooltip}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex flex-col text-start">
            <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-200 tracking-wide">
              {isSpeakingTranslation
                ? p.speakingTranslation
                : `${p.verseLabel} ${resolvedVerse}`}
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
            aria-label="Seek recitation timeline"
            className="w-full h-1.5 bg-emerald-200 dark:bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-700 dark:accent-emerald-500"
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
