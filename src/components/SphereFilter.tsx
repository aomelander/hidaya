"use client";

import React from 'react';
import { User, Home, Globe, Sparkles } from 'lucide-react';
import { LifeSphere, Language } from '../types';

interface SphereFilterProps {
  activeSphere: LifeSphere;
  onSelectSphere: (sphere: LifeSphere) => void;
  language: Language;
}

const SPHERE_LABELS = {
  all: {
    en: "All Life Spheres",
    sv: "Alla Livssfärer",
    fr: "Toutes les Sphères",
    ar: "كافة مجالات الحياة",
    descEn: "Across all dimensions of human experience",
    descSv: "Över alla livets dimensioner",
    descFr: "À travers toutes les dimensions",
    descAr: "عبر كافة أبعاد التجربة الإنسانية",
  },
  individual: {
    en: "Individual & Soul",
    sv: "Individ & Själ",
    fr: "Individu & Âme",
    ar: "الفرد والروح",
    descEn: "Anxiety, Solitude, Gratitude & Personal Worship",
    descSv: "Ångest, ensamhet, tacksamhet & inre frid",
    descFr: "Sérénité, anxiété, solitude & foi personnelle",
    descAr: "السكينة، الخلوة، القلق، الشكر والعبادة الذاتية",
  },
  family: {
    en: "Family & Home",
    sv: "Familj & Hem",
    fr: "Famille & Foyer",
    ar: "الأسرة والبيت",
    descEn: "Parents, Marriage, Children & Kinship",
    descSv: "Föräldrar, äktenskap, barn & familjeband",
    descFr: "Parents, couple, éducation & liens familiaux",
    descAr: "بر الوالدين، المودة الزوجية، الأبناء وصلة الرحم",
  },
  society: {
    en: "Society & Work",
    sv: "Samhälle & Arbetsliv",
    fr: "Société & Travail",
    ar: "المجتمع والعمل",
    descEn: "Workplace Ethics, Justice & Commercial Integrity",
    descSv: "Arbetsetik, rättvisa & samhällsansvar",
    descFr: "Éthique au travail, justice & engagement social",
    descAr: "أخلاقيات العمل، القسط، الأمانة والنزاهة المجتمعية",
  },
};

export const SphereFilter: React.FC<SphereFilterProps> = ({
  activeSphere,
  onSelectSphere,
  language,
}) => {
  const spheres: { id: LifeSphere; icon: React.ReactNode }[] = [
    { id: 'all', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'individual', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'family', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'society', icon: <Globe className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-2 max-w-3xl mx-auto" role="region" aria-label="Life Spheres Filter">
      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>
          {language === 'ar'
            ? 'تصفية حسب مجالات الحياة:'
            : language === 'sv'
            ? 'Filtrera efter livets sfärer:'
            : language === 'fr'
            ? 'Filtrer par sphère de vie :'
            : 'Filter by life sphere:'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {spheres.map((s) => {
          const isSelected = activeSphere === s.id;
          const label = SPHERE_LABELS[s.id][language] || SPHERE_LABELS[s.id].en;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSphere(s.id)}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-emerald-800 text-white dark:bg-emerald-700 border-emerald-900/40 shadow-xs scale-[1.02]'
                  : 'bg-white/80 dark:bg-emerald-950/30 text-slate-700 dark:text-slate-300 border-emerald-900/10 dark:border-emerald-800/30 hover:border-emerald-700/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              }`}
              aria-pressed={isSelected}
            >
              <span className={isSelected ? 'text-amber-300' : 'text-emerald-700 dark:text-emerald-400'}>
                {s.icon}
              </span>
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
