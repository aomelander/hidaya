"use client";

/**
 * @file src/components/mobile/ThumbActionRail.tsx
 * @description Ergonomic Bottom-Right Thumb Action Rail for 1-handed mobile browsing (Instagram / TikTok style).
 * Positioned in the natural natural thumb zone for one-hand operation:
 * - Quick Mute / Unmute toggle with active volume indicator
 * - 1-tap Like (♥) with haptic feedback
 * - Quick Comments (💬) trigger
 * - Quick Share / Creation Studio trigger (↗ / 🎬)
 * - Play / Pause controller
 */

import React from 'react';
import { Volume2, VolumeX, Heart, MessageCircle, Share2, Play, Pause, BookOpen } from 'lucide-react';
import { Language } from '../../types';

interface ThumbActionRailProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenComments: () => void;
  onShare: () => void;
  commentsCount?: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isContinuousReading?: boolean;
  onToggleContinuousReading?: () => void;
  language: Language;
}

export const ThumbActionRail: React.FC<ThumbActionRailProps> = ({
  isMuted,
  onToggleMute,
  isBookmarked,
  onToggleBookmark,
  onOpenComments,
  onShare,
  commentsCount = 0,
  isPlaying,
  onTogglePlay,
  isContinuousReading = false,
  onToggleContinuousReading,
  language,
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // Ignore vibration errors
      }
    }
  };

  const handleBookmark = () => {
    triggerHaptic();
    onToggleBookmark();
  };

  const handleMute = () => {
    triggerHaptic();
    onToggleMute();
  };

  const handlePlay = () => {
    triggerHaptic();
    onTogglePlay();
  };

  const tooltips = {
    fr: {
      play: isPlaying ? 'Mettre en pause' : 'Écouter la récitation',
      mute: isMuted ? 'Activer le son' : 'Couper le son',
      like: isBookmarked ? 'Dans vos Favoris ♥' : 'Ajouter aux Favoris ♥',
      comments: 'Commentaires & Réflexions 💬',
      share: 'Partager / Studio Photo & Vidéo 🎬',
      continuous: isContinuousReading ? 'Quitter la lecture continue' : 'Lecture continue du Coran 📖',
    },
    en: {
      play: isPlaying ? 'Pause recitation' : 'Play recitation',
      mute: isMuted ? 'Unmute audio' : 'Mute audio',
      like: isBookmarked ? 'Saved in Favorites ♥' : 'Save to Favorites ♥',
      comments: 'Comments & Reflections 💬',
      share: 'Share / Creation Studio 🎬',
      continuous: isContinuousReading ? 'Exit continuous reading' : 'Continuous Quran reading 📖',
    },
    sv: {
      play: isPlaying ? 'Pausa recitation' : 'Spela upp recitation',
      mute: isMuted ? 'Slå på ljudet' : 'Stäng av ljudet',
      like: isBookmarked ? 'Sparad i favoriter ♥' : 'Spara till favoriter ♥',
      comments: 'Kommentarer & Reflektioner 💬',
      share: 'Dela / Skaparstudio 🎬',
      continuous: isContinuousReading ? 'Avsluta kontinuerlig läsning' : 'Kontinuerlig läsning 📖',
    },
    ar: {
      play: isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة',
      mute: isMuted ? 'تشغيل الصوت' : 'كتم الصوت',
      like: isBookmarked ? 'محفوظ في المفضلة ♥' : 'حفظ في المفضلة ♥',
      comments: 'الخواطر والتدبرات 💬',
      share: 'مشاركة / استوديو التصميم 🎬',
      continuous: isContinuousReading ? 'إنهاء التلاوة المتواصلة' : 'تلاوة متواصلة للمصحف 📖',
    },
  }[language];

  return (
    <aside
      aria-label="Thumb Action Controls"
      className="fixed top-1/2 right-3 sm:right-5 z-40 flex flex-col items-center gap-2.5 select-none pointer-events-auto"
    >
      {/* 1. Play / Pause Controller */}
      <div className="relative group flex items-center justify-center">
        <button
          type="button"
          onClick={handlePlay}
          title={tooltips.play}
          aria-label={tooltips.play}
          className={`w-[44px] h-[44px] rounded-full flex items-center justify-center bg-black/40 dark:bg-black/50 backdrop-blur-[2px] border transition-transform active:scale-90 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${
            isPlaying
              ? 'border-amber-400 text-amber-400 ring-2 ring-amber-400/30'
              : 'border-white/40 dark:border-white/30 text-white/95 hover:border-white hover:text-white'
          }`}
        >
          {isPlaying ? <Pause className="w-[18px] h-[18px] fill-current" /> : <Play className="w-[18px] h-[18px] fill-current ms-0.5" />}
        </button>
        <span className="hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none absolute right-full top-1/2 -translate-y-1/2 me-2.5 px-2.5 py-1 rounded-xl bg-slate-900/95 text-white text-[11px] font-semibold whitespace-nowrap border border-white/10 shadow-lg backdrop-blur-xs">
          {tooltips.play}
        </span>
      </div>

      {/* 2. Mute / Unmute Button */}
      <div className="relative group flex items-center justify-center">
        <button
          type="button"
          onClick={handleMute}
          title={tooltips.mute}
          aria-label={tooltips.mute}
          className={`w-[44px] h-[44px] rounded-full flex items-center justify-center bg-black/40 dark:bg-black/50 backdrop-blur-[2px] border transition-transform active:scale-90 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${
            isMuted
              ? 'border-red-400 text-red-400 ring-2 ring-red-400/30'
              : 'border-white/40 dark:border-white/30 text-white/95 hover:border-white hover:text-white'
          }`}
        >
          {isMuted ? <VolumeX className="w-[18px] h-[18px]" /> : <Volume2 className="w-[18px] h-[18px] text-emerald-400" />}
        </button>
        <span className="hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none absolute right-full top-1/2 -translate-y-1/2 me-2.5 px-2.5 py-1 rounded-xl bg-slate-900/95 text-white text-[11px] font-semibold whitespace-nowrap border border-white/10 shadow-lg backdrop-blur-xs">
          {tooltips.mute}
        </span>
      </div>

      {/* 3. Like (♥) Button */}
      <div className="relative group flex items-center justify-center">
        <button
          type="button"
          onClick={handleBookmark}
          title={tooltips.like}
          aria-label={tooltips.like}
          aria-pressed={isBookmarked}
          className={`w-[44px] h-[44px] rounded-full flex items-center justify-center bg-black/40 dark:bg-black/50 backdrop-blur-[2px] border transition-transform active:scale-90 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${
            isBookmarked
              ? 'border-red-400 text-red-400 ring-2 ring-red-400/30'
              : 'border-white/40 dark:border-white/30 text-white/95 hover:border-white hover:text-white'
          }`}
        >
          <Heart className={`w-[18px] h-[18px] transition-transform ${isBookmarked ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
        </button>
        <span className="hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none absolute right-full top-1/2 -translate-y-1/2 me-2.5 px-2.5 py-1 rounded-xl bg-slate-900/95 text-white text-[11px] font-semibold whitespace-nowrap border border-white/10 shadow-lg backdrop-blur-xs">
          {tooltips.like}
        </span>
      </div>

      {/* 4. Comments (💬) Trigger */}
      <div className="relative group flex items-center justify-center">
        <button
          type="button"
          onClick={onOpenComments}
          title={tooltips.comments}
          aria-label={tooltips.comments}
          className="w-[44px] h-[44px] rounded-full flex flex-col items-center justify-center bg-black/40 dark:bg-black/50 backdrop-blur-[2px] border border-white/40 dark:border-white/30 text-white/95 hover:border-white hover:text-white transition-transform active:scale-90 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
        >
          <MessageCircle className="w-[18px] h-[18px]" />
          {commentsCount > 0 && (
            <span className="text-[10px] font-bold font-mono -mt-0.5 leading-none tabular-nums text-emerald-300">
              {commentsCount}
            </span>
          )}
        </button>
        <span className="hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none absolute right-full top-1/2 -translate-y-1/2 me-2.5 px-2.5 py-1 rounded-xl bg-slate-900/95 text-white text-[11px] font-semibold whitespace-nowrap border border-white/10 shadow-lg backdrop-blur-xs">
          {tooltips.comments}
        </span>
      </div>

      {/* 5. Share / Studio Trigger (↗) */}
      <div className="relative group flex items-center justify-center">
        <button
          type="button"
          onClick={onShare}
          title={tooltips.share}
          aria-label={tooltips.share}
          className="w-[44px] h-[44px] rounded-full flex items-center justify-center bg-black/40 dark:bg-black/50 backdrop-blur-[2px] border border-white/40 dark:border-white/30 text-white/95 hover:border-white hover:text-white transition-transform active:scale-90 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
        >
          <Share2 className="w-[18px] h-[18px]" />
        </button>
        <span className="hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none absolute right-full top-1/2 -translate-y-1/2 me-2.5 px-2.5 py-1 rounded-xl bg-slate-900/95 text-white text-[11px] font-semibold whitespace-nowrap border border-white/10 shadow-lg backdrop-blur-xs">
          {tooltips.share}
        </span>
      </div>

      {/* 6. Mode Lecture Continue du Coran (📖) */}
      {onToggleContinuousReading && (
        <div className="relative group flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onToggleContinuousReading();
            }}
            title={tooltips.continuous}
            aria-label={tooltips.continuous}
            aria-pressed={isContinuousReading}
            className={`w-[44px] h-[44px] rounded-full flex items-center justify-center bg-black/40 dark:bg-black/50 backdrop-blur-[2px] border transition-all active:scale-90 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${
              isContinuousReading
                ? 'border-emerald-400 text-emerald-400 ring-2 ring-emerald-400/40 scale-105'
                : 'border-white/40 dark:border-white/30 text-white/95 hover:border-white hover:text-white'
            }`}
          >
            <BookOpen className="w-[18px] h-[18px]" />
          </button>
          <span className="hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none absolute right-full top-1/2 -translate-y-1/2 me-2.5 px-2.5 py-1 rounded-xl bg-slate-900/95 text-white text-[11px] font-semibold whitespace-nowrap border border-white/10 shadow-lg backdrop-blur-xs">
            {tooltips.continuous}
          </span>
        </div>
      )}
    </aside>
  );
};
