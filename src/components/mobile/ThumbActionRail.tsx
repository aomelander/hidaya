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

  return (
    <aside
      aria-label="Thumb Action Controls"
      className="fixed top-1/2 right-3 sm:right-5 z-40 flex flex-col items-center gap-2.5 select-none pointer-events-auto"
    >
      {/* 1. Play / Pause Controller (44px, 30% larger, top aligned at screen midpoint) */}
      <button
        type="button"
        onClick={handlePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className={`w-[44px] h-[44px] rounded-full flex items-center justify-center bg-black/40 dark:bg-black/50 backdrop-blur-[2px] border transition-transform active:scale-90 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${
          isPlaying
            ? 'border-amber-400 text-amber-400 ring-2 ring-amber-400/30'
            : 'border-white/40 dark:border-white/30 text-white/95 hover:border-white hover:text-white'
        }`}
      >
        {isPlaying ? <Pause className="w-[18px] h-[18px] fill-current" /> : <Play className="w-[18px] h-[18px] fill-current ms-0.5" />}
      </button>

      {/* 2. Mute / Unmute Button (44px, 30% larger) */}
      <button
        type="button"
        onClick={handleMute}
        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        className={`w-[44px] h-[44px] rounded-full flex items-center justify-center bg-black/40 dark:bg-black/50 backdrop-blur-[2px] border transition-transform active:scale-90 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${
          isMuted
            ? 'border-red-400 text-red-400 ring-2 ring-red-400/30'
            : 'border-white/40 dark:border-white/30 text-white/95 hover:border-white hover:text-white'
        }`}
      >
        {isMuted ? <VolumeX className="w-[18px] h-[18px]" /> : <Volume2 className="w-[18px] h-[18px] text-emerald-400" />}
      </button>

      {/* 3. Like (♥) Button (44px, 30% larger) */}
      <button
        type="button"
        onClick={handleBookmark}
        aria-label={isBookmarked ? 'Liked' : 'Like'}
        aria-pressed={isBookmarked}
        className={`w-[44px] h-[44px] rounded-full flex items-center justify-center bg-black/40 dark:bg-black/50 backdrop-blur-[2px] border transition-transform active:scale-90 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${
          isBookmarked
            ? 'border-red-400 text-red-400 ring-2 ring-red-400/30'
            : 'border-white/40 dark:border-white/30 text-white/95 hover:border-white hover:text-white'
        }`}
      >
        <Heart className={`w-[18px] h-[18px] transition-transform ${isBookmarked ? 'fill-current scale-110' : ''}`} />
      </button>

      {/* 4. Comments (💬) Trigger (44px, 30% larger) */}
      <button
        type="button"
        onClick={onOpenComments}
        aria-label="Comments and reflections"
        className="w-[44px] h-[44px] rounded-full flex flex-col items-center justify-center bg-black/40 dark:bg-black/50 backdrop-blur-[2px] border border-white/40 dark:border-white/30 text-white/95 hover:border-white hover:text-white transition-transform active:scale-90 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
      >
        <MessageCircle className="w-[18px] h-[18px]" />
        {commentsCount > 0 && (
          <span className="text-[10px] font-bold font-mono -mt-0.5 leading-none tabular-nums text-emerald-300">
            {commentsCount}
          </span>
        )}
      </button>

      {/* 5. Share / Studio Trigger (↗) (44px, 30% larger) */}
      <button
        type="button"
        onClick={onShare}
        aria-label="Share verse and open studio"
        className="w-[44px] h-[44px] rounded-full flex items-center justify-center bg-black/40 dark:bg-black/50 backdrop-blur-[2px] border border-white/40 dark:border-white/30 text-white/95 hover:border-white hover:text-white transition-transform active:scale-90 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
      >
        <Share2 className="w-[18px] h-[18px]" />
      </button>

      {/* 6. Mode Lecture Continue du Coran (📖) (44px, 30% larger) */}
      {onToggleContinuousReading && (
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onToggleContinuousReading();
          }}
          title={
            isContinuousReading
              ? language === 'fr'
                ? 'Quitter la lecture continue et revenir au verset initial'
                : language === 'ar'
                ? 'الخروج من وضع القراءة المتواصلة والعودة للآية السابقة'
                : 'Exit continuous reading & return to initial verse'
              : language === 'fr'
              ? 'Mode lecture continue du Coran à partir de ce verset'
              : language === 'ar'
              ? 'وضع القراءة المتواصلة للقرآن الكريم بدءاً من هذه الآية'
              : 'Continuous Quran reading mode from this verse'
          }
          aria-label={
            isContinuousReading
              ? 'Exit continuous Quran reading'
              : 'Enter continuous Quran reading'
          }
          aria-pressed={isContinuousReading}
          className={`w-[44px] h-[44px] rounded-full flex items-center justify-center bg-black/40 dark:bg-black/50 backdrop-blur-[2px] border transition-all active:scale-90 cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${
            isContinuousReading
              ? 'border-emerald-400 text-emerald-400 ring-2 ring-emerald-400/40 scale-105'
              : 'border-white/40 dark:border-white/30 text-white/95 hover:border-white hover:text-white'
          }`}
        >
          <BookOpen className="w-[18px] h-[18px]" />
        </button>
      )}
    </aside>
  );
};
