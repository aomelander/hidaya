"use client";

import React from 'react';
import { Compass, Sparkles, BookOpen, HelpCircle, ArrowRight } from 'lucide-react';
import { Language } from '../types';

interface InquirerPerspectiveBannerProps {
  language: Language;
  onOpenGlossary: () => void;
  onSwitchPerspective: () => void;
}

export const InquirerPerspectiveBanner: React.FC<InquirerPerspectiveBannerProps> = ({
  language,
  onOpenGlossary,
  onSwitchPerspective,
}) => {
  const t = {
    en: {
      tag: 'Inquirer & Universal Wisdom Lens Active',
      title: 'Exploring the Quran from an Inquirer’s Perspective',
      description:
        'You are reading with contextual clarifications designed for seekers of ethical wisdom, beginners, and non-Muslim inquirers. Every passage includes historical background and ethical principles without assuming theological prerequisites.',
      glossaryBtn: 'Explore Concept Glossary (Sabr, Ihsan, Rahmah)',
      switchDevotional: 'Switch to Devotional Contemplation',
    },
    sv: {
      tag: 'Lins för sökare & universell visdom aktiv',
      title: 'Utforska Koranen ur ett nyfiket perspektiv',
      description:
        'Du läser med kontextuella förklaringar anpassade för kunskapssökare, nybörjare och nyfikna. Varje passage belyser historisk bakgrund och allmänmänskliga etiska principer utan förkunskapskrav.',
      glossaryBtn: 'Öppna begreppsordlista (Sabr, Ihsan, Rahmah)',
      switchDevotional: 'Växla till personlig begrundan',
    },
    fr: {
      tag: 'Perspective de sagesse universelle active',
      title: 'Explorer le Coran dans une démarche d’ouverture',
      description:
        'Vous consultez ces versets avec des explications contextuelles destinées aux chercheurs de sens et aux curieux. Chaque texte met en lumière la portée éthique et universelle sans prérequis théologiques.',
      glossaryBtn: 'Consulter le glossaire (Sabr, Ihsan, Rahmah)',
      switchDevotional: 'Passer en méditation spirituelle',
    },
  }[language];

  return (
    <section
      aria-label="Inquirer Perspective Context"
      className="p-5 rounded-3xl bg-linear-to-r from-amber-500/15 via-emerald-900/10 to-amber-500/10 border-2 border-amber-500/30 text-slate-800 dark:text-slate-200 space-y-3 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
            {t.tag}
          </span>
        </div>
        <button
          onClick={onSwitchPerspective}
          className="text-[11px] text-emerald-800 dark:text-emerald-300 hover:underline font-semibold cursor-pointer"
        >
          {t.switchDevotional}
        </button>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-100">
          {t.title}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          {t.description}
        </p>
      </div>

      <div className="pt-1 flex flex-wrap items-center gap-2">
        <button
          onClick={onOpenGlossary}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t.glossaryBtn}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
