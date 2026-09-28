"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Headphones,
  Languages,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Gauge,
  ListOrdered
} from 'lucide-react';
import { QuranVerseFixture, Language, AudioPlaybackMode, ReciterId } from '../types';
import { AVAILABLE_RECITERS, getAudioUrlForVerse } from '../services/audioReciters';
import { StorageService } from '../services/storage';

interface ContinuousSessionAudioPlayerProps {
  verses: QuranVerseFixture[];
  language: Language;
  onActiveVerseChange?: (verseId: string) => void;
  onClose?: () => void;
}

export const ContinuousSessionAudioPlayer: React.FC<ContinuousSessionAudioPlayerProps> = ({
  verses,
  language,
  onActiveVerseChange,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<AudioPlaybackMode>('quran_translation');
  const [reciterId, setReciterId] = useState<ReciterId>(() => StorageService.getPreferredReciter());
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [playbackPhase, setPlaybackPhase] = useState<'recitation' | 'translation' | 'reflection' | 'idle'>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showReciterMenu, setShowReciterMenu] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isTransitioningRef = useRef(false);

  const currentVerse = verses[currentIndex] || verses[0];

  // Resolve audio URL for current verse & reciter
  const currentAudioUrl = React.useMemo(() => {
    if (!currentVerse) return '';
    return getAudioUrlForVerse(currentVerse.surahNumber, currentVerse.verseNumber, reciterId);
  }, [currentVerse, reciterId]);

  // Notify parent of active verse
  useEffect(() => {
    if (currentVerse && onActiveVerseChange) {
      onActiveVerseChange(currentVerse.id);
    }
  }, [currentVerse, onActiveVerseChange]);

  // Clean up speech synthesis on unmount or pause
  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const handleNext = useCallback(() => {
    stopSpeech();
    if (currentIndex < verses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop or stop
      setIsPlaying(false);
      setPlaybackPhase('idle');
      setCurrentIndex(0);
    }
  }, [currentIndex, verses.length, stopSpeech]);

  const handlePrev = useCallback(() => {
    stopSpeech();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  }, [currentIndex, stopSpeech]);

  // Speech helper for translation and reflection
  const speakText = useCallback(
    (text: string, onComplete: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
        onComplete();
        return;
      }

      stopSpeech();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'sv' ? 'sv-SE' : language === 'fr' ? 'fr-FR' : 'en-US';
      utterance.rate = playbackRate * 0.95;

      utterance.onend = () => {
        onComplete();
      };
      utterance.onerror = () => {
        onComplete();
      };

      window.speechSynthesis.speak(utterance);
    },
    [language, playbackRate, stopSpeech]
  );

  // Playback state controller
  const startRecitation = useCallback(() => {
    if (!audioRef.current) return;
    setPlaybackPhase('recitation');
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn('Playback error', err);
        setIsPlaying(false);
      });
  }, []);

  // When audio recitation ends
  const handleAudioEnded = useCallback(() => {
    if (!isPlaying) return;

    if (playbackMode === 'quran_only') {
      // Advance to next verse after short 1s quiet pause
      setTimeout(() => {
        handleNext();
      }, 1000);
      return;
    }

    if (playbackMode === 'quran_translation' || playbackMode === 'quran_reflection') {
      setPlaybackPhase('translation');
      const translation = currentVerse?.translations[language]?.text || currentVerse?.translations.en.text;

      speakText(translation, () => {
        if (playbackMode === 'quran_reflection' && currentVerse?.reflectionFramework) {
          setPlaybackPhase('reflection');
          const prompt =
            currentVerse.reflectionFramework.reflectPrompt ||
            currentVerse.reflectionFramework.understand;

          setTimeout(() => {
            speakText(prompt, () => {
              // Pause then advance to next verse
              setTimeout(() => {
                handleNext();
              }, 1200);
            });
          }, 600);
        } else {
          // Advance to next verse
          setTimeout(() => {
            handleNext();
          }, 1000);
        }
      });
    }
  }, [isPlaying, playbackMode, currentVerse, language, speakText, handleNext]);

  // React to currentIndex or currentAudioUrl change when playing
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
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      setIsPlaying(true);
      startRecitation();
    }
  };

  const handleSelectReciter = (id: ReciterId) => {
    setReciterId(id);
    StorageService.setPreferredReciter(id);
    setShowReciterMenu(false);
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

  const activeReciter = AVAILABLE_RECITERS.find((r) => r.id === reciterId) || AVAILABLE_RECITERS[0];

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-120 z-40 transition-all duration-300 rounded-3xl bg-emerald-950/95 text-white shadow-2xl border border-emerald-700/50 backdrop-blur-md ${
        isMinimized ? 'p-3' : 'p-4'
      }`}
      role="region"
      aria-label="Hands-free continuous Quran contemplation session"
    >
      <audio
        ref={audioRef}
        src={currentAudioUrl}
        preload="metadata"
        onEnded={handleAudioEnded}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
      />

      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 border-b border-emerald-800/60 pb-2 mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center text-amber-400 shrink-0">
            <Headphones className="w-4 h-4 animate-pulse" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-100 truncate">
                {currentVerse.surahNameTransliterated} ({currentVerse.surahNumber}:{currentVerse.verseNumber})
              </span>
              <span className="text-[10px] text-emerald-400/80 shrink-0">
                • {currentIndex + 1}/{verses.length}
              </span>
            </div>
            <div className="text-[10px] text-emerald-300/70 truncate">
              {playbackPhase === 'recitation'
                ? `Reciting: ${activeReciter.name}`
                : playbackPhase === 'translation'
                ? 'Spoken Translation...'
                : playbackPhase === 'reflection'
                ? 'Reflection Prompt...'
                : 'Continuous Contemplation'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/50 transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {onClose && (
            <button
              onClick={() => {
                stopSpeech();
                if (audioRef.current) audioRef.current.pause();
                onClose();
              }}
              className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/50 transition-colors"
              title="Close player"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="space-y-3 pt-1">
          {/* Audio Modes (Quran only / Quran + Translation / Quran + Reflection) */}
          <div className="flex items-center gap-1 p-1 bg-emerald-900/60 rounded-xl border border-emerald-800/40 text-[11px]">
            <button
              onClick={() => setPlaybackMode('quran_only')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-colors ${
                playbackMode === 'quran_only'
                  ? 'bg-emerald-700 text-white font-bold'
                  : 'text-emerald-300/80 hover:text-white'
              }`}
            >
              1. Quran Only
            </button>
            <button
              onClick={() => setPlaybackMode('quran_translation')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-colors ${
                playbackMode === 'quran_translation'
                  ? 'bg-emerald-700 text-white font-bold'
                  : 'text-emerald-300/80 hover:text-white'
              }`}
            >
              2. + Translation
            </button>
            <button
              onClick={() => setPlaybackMode('quran_reflection')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-colors ${
                playbackMode === 'quran_reflection'
                  ? 'bg-emerald-700 text-white font-bold'
                  : 'text-emerald-300/80 hover:text-white'
              }`}
            >
              3. + Reflection
            </button>
          </div>

          {/* Current Verse Preview / Arabic snippet */}
          <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800/30">
            <p className="font-arabic text-right text-base text-amber-200 line-clamp-1" dir="rtl">
              {currentVerse.arabicText}
            </p>
            <p className="text-xs text-emerald-100/90 line-clamp-2 mt-1 italic">
              &quot;{currentVerse.translations[language]?.text || currentVerse.translations.en.text}&quot;
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Reciter Selector */}
            <div className="relative">
              <button
                onClick={() => setShowReciterMenu(!showReciterMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-800/50 text-[11px] text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition-colors"
              >
                <span>{activeReciter.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-emerald-400" />
              </button>

              {showReciterMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl bg-emerald-900 border border-emerald-700 shadow-xl overflow-hidden py-1 z-50 text-xs">
                  {AVAILABLE_RECITERS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSelectReciter(r.id)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-800 transition-colors ${
                        r.id === reciterId ? 'text-amber-300 font-bold bg-emerald-800/40' : 'text-emerald-100'
                      }`}
                    >
                      <span>{r.name}</span>
                      <span className="text-[10px] text-emerald-400/80">{r.style}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Playback Transport */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                title="Previous passage"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-emerald-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer font-bold"
                title={isPlaying ? 'Pause Session' : 'Play Session'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex >= verses.length - 1}
                className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                title="Next passage"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Speed & Mute */}
            <div className="flex items-center gap-1">
              <button
                onClick={cycleSpeed}
                className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-300 hover:text-white hover:bg-emerald-800/50"
                title="Playback Speed"
              >
                {playbackRate}x
              </button>

              <button
                onClick={() => {
                  const newMuted = !isMuted;
                  setIsMuted(newMuted);
                  if (audioRef.current) audioRef.current.muted = newMuted;
                }}
                className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/50"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Quick Transport */}
      {isMinimized && (
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] text-emerald-200 truncate flex-1">
            {currentVerse.surahNameTransliterated} {currentVerse.surahNumber}:{currentVerse.verseNumber}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1.5 text-emerald-300 hover:text-white disabled:opacity-30"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={togglePlay}
              className="w-7 h-7 rounded-full bg-amber-500 text-emerald-950 flex items-center justify-center font-bold"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= verses.length - 1}
              className="p-1.5 text-emerald-300 hover:text-white disabled:opacity-30"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
