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
import { Volume2, VolumeX, Heart, MessageCircle, Share2, Play, Pause, Sparkles } from 'lucide-react';
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
      className="fixed bottom-6 right-3 sm:right-6 z-40 flex flex-col items-center gap-2 select-none pointer-events-auto"
    >
      {/* 1. Play / Pause Controller (30% smaller: 34px, transparent glass) */}
      <button
        type="button"
        onClick={handlePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className={`w-[34px] h-[34px] rounded-full flex items-center justify-center backdrop-blur-md border shadow-xs transition-transform active:scale-90 cursor-pointer ${
          isPlaying
            ? 'bg-amber-500/25 text-amber-300 border-amber-400/50 shadow-amber-500/20'
            : 'bg-white/10 dark:bg-black/25 text-white/90 hover:text-white border-white/25 dark:border-white/15'
        }`}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ms-0.5" />}
      </button>

      {/* 2. Mute / Unmute Button (30% smaller: 34px, transparent glass) */}
      <button
        type="button"
        onClick={handleMute}
        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        className={`w-[34px] h-[34px] rounded-full flex items-center justify-center backdrop-blur-md border shadow-xs transition-transform active:scale-90 cursor-pointer ${
          isMuted
            ? 'bg-red-500/25 text-red-300 border-red-400/50 shadow-red-500/20'
            : 'bg-white/10 dark:bg-black/25 text-white/90 hover:text-white border-white/25 dark:border-white/15'
        }`}
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-300" />}
      </button>

      {/* 3. Like (♥) Button (30% smaller: 34px, transparent glass) */}
      <button
        type="button"
        onClick={handleBookmark}
        aria-label={isBookmarked ? 'Liked' : 'Like'}
        aria-pressed={isBookmarked}
        className={`w-[34px] h-[34px] rounded-full flex items-center justify-center backdrop-blur-md border shadow-xs transition-transform active:scale-90 cursor-pointer ${
          isBookmarked
            ? 'bg-red-500/30 text-red-400 border-red-400/60 shadow-red-500/20'
            : 'bg-white/10 dark:bg-black/25 text-white/90 hover:text-white border-white/25 dark:border-white/15'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 transition-transform ${isBookmarked ? 'fill-current scale-110' : ''}`} />
      </button>

      {/* 4. Comments (💬) Trigger (30% smaller: 34px, transparent glass) */}
      <button
        type="button"
        onClick={onOpenComments}
        aria-label="Comments and reflections"
        className="w-[34px] h-[34px] rounded-full flex flex-col items-center justify-center backdrop-blur-md bg-white/10 dark:bg-black/25 text-white/90 hover:text-white border border-white/25 dark:border-white/15 shadow-xs transition-transform active:scale-90 cursor-pointer"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {commentsCount > 0 && (
          <span className="text-[9px] font-bold font-mono -mt-0.5 leading-none tabular-nums text-emerald-300">
            {commentsCount}
          </span>
        )}
      </button>

      {/* 5. Share / Studio Trigger (↗) (30% smaller: 34px, transparent glass) */}
      <button
        type="button"
        onClick={onShare}
        aria-label="Share verse and open studio"
        className="w-[34px] h-[34px] rounded-full flex items-center justify-center backdrop-blur-md bg-white/10 dark:bg-black/25 text-white/90 hover:text-white border border-white/25 dark:border-white/15 shadow-xs transition-transform active:scale-90 cursor-pointer"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
