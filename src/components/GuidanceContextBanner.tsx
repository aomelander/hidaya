"use client";

/**
 * @file GuidanceContextBanner.tsx
 * @description Visual card detailing the semantic guidance analysis: detected emotion,
 * real-life situation, underlying spiritual need, and grounding rationale.
 */

import React from 'react';
import { QueryAnalysisResponse } from '../types';

interface GuidanceContextBannerProps {
  analysisResult: QueryAnalysisResponse;
  passageCount: number;
}

export const GuidanceContextBanner: React.FC<GuidanceContextBannerProps> = ({
  analysisResult,
  passageCount,
}) => {
  return (
    <section
      aria-label="Semantic Guidance Context"
      className="p-5 rounded-2xl bg-linear-to-r from-emerald-900/10 via-emerald-800/5 to-amber-500/10 border border-emerald-800/20 dark:border-emerald-700/30 space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
            Guidance Mapping Analysis
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Grounding: {passageCount} Verified Quran Passage(s)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/20">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
            Detected Emotion
          </span>
          <span className="font-semibold text-emerald-950 dark:text-emerald-100">
            {analysisResult.detectedEmotion || 'Contemplative'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/20">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
            Life Situation
          </span>
          <span className="font-semibold text-emerald-950 dark:text-emerald-100 truncate block">
            {analysisResult.detectedSituation || 'Daily Living'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white/70 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/20">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
            Underlying Spiritual Need
          </span>
          <span className="font-semibold text-emerald-950 dark:text-emerald-100 truncate block">
            {analysisResult.underlyingNeed || 'Divine Grounding'}
          </span>
        </div>
      </div>

      {analysisResult.relevanceExplanation && (
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
          <strong>Why this applies:</strong> {analysisResult.relevanceExplanation}
        </p>
      )}
    </section>
  );
};
