"use client";

import React from 'react';
import { X, ShieldAlert, BookOpen, HeartHandshake, CheckCircle2 } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="relative w-full max-w-lg p-6 bg-[#FAF8F5] dark:bg-[#0D241E] border border-emerald-900/20 dark:border-emerald-700/40 rounded-2xl shadow-2xl text-slate-800 dark:text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-emerald-900/40 transition-colors"
          aria-label="Close boundaries dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 id="disclaimer-title" className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
              Guidance Boundaries & Ethics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transparency, source integrity, and scholarly respect
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-600 rounded-r-lg">
            <p className="font-semibold text-emerald-900 dark:text-emerald-200 text-xs uppercase tracking-wider mb-1">
              Core Boundary
            </p>
            <p className="text-xs sm:text-sm">
              <strong>Hidaya is a guide to Quranic sources, not a religious authority or fatwa service.</strong> It does not issue legal rulings (Ahkam) or provide binding jurisprudential edicts.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-xs">
                <strong>Zero Text Invention:</strong> All Arabic Quranic verses are verified Uthmani texts with exact vocalization. Translations and Tafsir quotations are sourced directly from established classical works (Ibn Kathir, Al-Sa&apos;di, Al-Muyassar).
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-xs">
                <strong>Multi-Level Separation:</strong> The interface clearly demarcates Level 1 (Sacred Text), Level 2 (Translation), Level 3 (Classical Exegesis), and Level 4 (Personal Reflection Prompts).
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-xs">
                <strong>Consult Traditional Scholars:</strong> For critical marital, legal, inheritance, or bioethical questions, please consult qualified scholars within your community.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-emerald-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
