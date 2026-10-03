"use client";

import React, { useState } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  BookOpen,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { Language, QuranVerseFixture } from '../types';

interface SourceLadderProps {
  verse: QuranVerseFixture;
  language: Language;
}

interface LadderLevel {
  level: number;
  badge: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  sourceExample: Record<Language, string>;
  colorBg: string;
  colorBorder: string;
  colorText: string;
}

const LADDER_LEVELS: LadderLevel[] = [
  {
    level: 1,
    badge: "Level 1",
    name: {
      en: "Original Quranic Arabic",
      sv: "Ursprunglig Quran-arabiska",
      fr: "Texte Coranique Arabe Original",
      ar: "النص القرآني الشريف بالرسم العثماني",
    },
    description: {
      en: "Divine revelation in the verified Uthmani script (Medina Mushaf via Tanzil). Never generated or altered by AI.",
      sv: "Gudomlig uppenbarelsetext i verifierad Uthmani-skrift (Medina Mushaf via Tanzil). Skapas aldrig av AI.",
      fr: "Révélation divine en graphie Uthmani certifiée (Médine Mushaf via Tanzil). Jamais générée par IA.",
      ar: "الوحي الإلهي المحفوظ بالرسم العثماني المعتمد (مصحف المدينة النبوية عبر تنزيل). لا يتدخل فيه الذكاء الاصطناعي قطعاً.",
    },
    sourceExample: {
      en: "Source: Tanzil Project & King Fahd Glorious Qur'an Printing Complex (Hafs 'an 'Asim)",
      sv: "Källa: Tanzil Project & King Fahd Qur'an Printing Complex (Hafs 'an 'Asim)",
      fr: "Source: Tanzil Project & Complexe du Roi Fahd (Hafs 'an 'Asim)",
      ar: "المصدر: مشروع تنزيل ومجمع الملك فهد لطباعة المصحف الشريف (رواية حفص عن عاصم)",
    },
    colorBg: "bg-emerald-900/10 dark:bg-emerald-950/40",
    colorBorder: "border-emerald-700/40",
    colorText: "text-emerald-900 dark:text-emerald-200",
  },
  {
    level: 2,
    badge: "Level 2",
    name: {
      en: "Attributed Human Translation",
      sv: "Tillskriven mänsklig översättning",
      fr: "Traduction Humaine Attribuée",
      ar: "التفسير الميسر والمعاني المعتمدة",
    },
    description: {
      en: "Certified scholarly translation to your language, explicitly attributed to recognized human translators.",
      sv: "Verifierad akademisk översättning med tydlig källangivelse till erkända mänskliga översättare.",
      fr: "Traduction savante reconnue dans votre langue, explicitement attribuée à son auteur.",
      ar: "بيان معاني الآيات من مصادر معتمدة وموثقة لغوياً وتفسيرياً، منسوبة بوضوح إلى أهل العلم.",
    },
    sourceExample: {
      en: "English: Saheeh International | Swedish: Knut Bernström | French: Muhammad Hamidullah",
      sv: "Svenska: Mohammed Knut Bernström | Engelska: Saheeh Int. | Franska: M. Hamidullah",
      fr: "Français: Muhammad Hamidullah | Anglais: Saheeh Int. | Suédois: Knut Bernström",
      ar: "العربية: التفسير الميسر (مجمع الملك فهد) | السويدية: كنوت برنستروم | الفرنسية: محمد حميد الله",
    },
    colorBg: "bg-blue-900/10 dark:bg-blue-950/40",
    colorBorder: "border-blue-700/40",
    colorText: "text-blue-900 dark:text-blue-200",
  },
  {
    level: 3,
    badge: "Level 3",
    name: {
      en: "Classical Tafsir (Exegesis)",
      sv: "Klassisk Tafsir (Koran-kommentar)",
      fr: "Tafsir Classique (Exégèse)",
      ar: "التفاسير الكبرى المأثورة",
    },
    description: {
      en: "Authentic interpretations from major classical scholars, citing historical books and centuries.",
      sv: "Autentiska tolkningar från klassiska lärda med angivande av verk och tidsperiod.",
      fr: "Interprétations authentiques issues des grands exégètes classiques, avec mention de l'ouvrage.",
      ar: "بيان معاني الآيات من أمهات كتب التفسير المأثورة عن السلف وأئمة التفسير الموثوقين مع ذكر المصنفات.",
    },
    sourceExample: {
      en: "Sources: Ibn Kathir (8th H), Al-Sa'di (14th H), Al-Muyassar (King Fahd Complex)",
      sv: "Källor: Ibn Kathir (1300-tal), Al-Sa'di (1900-tal), Al-Muyassar (King Fahd-komplexet)",
      fr: "Sources: Ibn Kathir (8e H), Al-Sa'di (14e H), Al-Muyassar (Complexe Roi Fahd)",
      ar: "المصادر المعتمدة: تفسير ابن كثير، تفسير السعدي (تيسير الكريم الرحمن)، التفسير الميسر",
    },
    colorBg: "bg-purple-900/10 dark:bg-purple-950/40",
    colorBorder: "border-purple-700/40",
    colorText: "text-purple-900 dark:text-purple-200",
  },
  {
    level: 4,
    badge: "Level 4",
    name: {
      en: "Sacred Context & Asbab al-Nuzul",
      sv: "Sammanhang & Uppenbarelsebakgrund",
      fr: "Contexte Historique & Asbab al-Nuzul",
      ar: "السياق القرآني وأسباب النزول",
    },
    description: {
      en: "Historical circumstances of revelation (Meccan/Medinan period) and thematic placement within the Surah.",
      sv: "Historiska uppenbarelseomständigheter (Mecka/Medina) och versens plats i surans helhet.",
      fr: "Circonstances historiques de la révélation (période mecquoise/médinoise) et unité thématique.",
      ar: "الظروف التاريخية للنزول (مكي/مدني) وموقع الآية وسياقها الموضوعي ضمن السورة الكريمة.",
    },
    sourceExample: {
      en: "Context: Circumstances of revelation & surrounding verses (Before & After)",
      sv: "Kontext: Historisk bakgrund och omgivande verser (före och efter)",
      fr: "Contexte: Circonstances de révélation et versets environnants",
      ar: "السياق: أسباب النزول المأثورة والآيات المحيطة (قبل وبعد)",
    },
    colorBg: "bg-amber-900/10 dark:bg-amber-950/40",
    colorBorder: "border-amber-700/40",
    colorText: "text-amber-900 dark:text-amber-200",
  },
  {
    level: 5,
    badge: "Level 5",
    name: {
      en: "Hidaya Topic Mapping (Relevance)",
      sv: "Hidayas ämneskoppling (Relevans)",
      fr: "Cartographie Thématique Hidaya (Pertinence)",
      ar: "مخطط الهداية والصلة بواقع الإنسان",
    },
    description: {
      en: "Structured categorization mapping human life situations and emotional needs to relevant Quranic principles.",
      sv: "Strukturerad koppling som matchar mänskliga livssituationer och känslor mot Quranens principer.",
      fr: "Mise en relation structurée entre situations de vie, émotions et principes coraniques.",
      ar: "تصنيف منهجي يربط واقع الإنسان وحاجاته النفسية والوجدانية بالأصول والتوجيهات القرآنية المناسبة.",
    },
    sourceExample: {
      en: "Curated Verse-Topic Graph (Emotion, Situation, Core Need, Spiritual Principle)",
      sv: "Kurerat vers-ämnesdiagram (Känsla, situation, behov, andlig princip)",
      fr: "Graphe thématique verset-situation (Émotion, besoin, principe spirituel)",
      ar: "رسم بياني للهداية: المشاعر، الحالة الحياتية، الحاجة النفسية، المبدأ الإيماني",
    },
    colorBg: "bg-teal-900/10 dark:bg-teal-950/40",
    colorBorder: "border-teal-700/40",
    colorText: "text-teal-900 dark:text-teal-200",
  },
  {
    level: 6,
    badge: "Level 6",
    name: {
      en: "From Quran to Life: Reflection Prompts",
      sv: "Från Quran till liv: Reflektionsfrågor",
      fr: "Du Coran à la Vie : Invites de Réflexion",
      ar: "من القرآن إلى الحياة: محاور التدبر والعمل",
    },
    description: {
      en: "Contemplative prompts and micro-actions. Clearly marked as contemporary human reflections, not divine laws.",
      sv: "Eftertankar och handlingsförslag. Tydligt märkta som nutida reflektioner, inte religiösa domar.",
      fr: "Questions introspectives et actions concrètes. Clairement identifiées comme méditations humaines.",
      ar: "أسئلة تدبرية وخطوات عملية محددة. مصنفة بوضوح كخواطر تدبر وتطبيق بشري معاصر وليست أحكاماً شرعية قطعية.",
    },
    sourceExample: {
      en: "4-Step Cycle: Understand → Reflect → Apply → Live & Carry",
      sv: "4-stegsmodell: Förstå → Reflektera → Tillämpa → Efterfölj i livet",
      fr: "Cycle en 4 étapes: Comprendre → Méditer → Appliquer → Incarner au quotidien",
      ar: "دورة التدبر الرباعية: افهم الآية ← تأمل في نفسك ← بادر بالعمل ← احمل المعنى في حياتك",
    },
    colorBg: "bg-amber-500/10 dark:bg-amber-950/40",
    colorBorder: "border-amber-600/40",
    colorText: "text-amber-900 dark:text-amber-200",
  },
];

const UI_STRINGS: Record<Language, {
  title: string;
  shortTitle: string;
  subtitle: string;
  expandBtn: string;
  collapseBtn: string;
  closeBtn: string;
  guaranteeTitle: string;
  guaranteeText: string;
}> = {
  en: {
    title: "Source Transparency Ladder",
    shortTitle: "Source Ladder",
    subtitle: "Always know exactly where each layer of knowledge comes from.",
    expandBtn: "View 6-Level Transparency Ladder",
    collapseBtn: "Hide Ladder",
    closeBtn: "Close",
    guaranteeTitle: "Ethical & Epistemological Guarantee:",
    guaranteeText: "Hidaya never mixes divine Quran text with AI opinions or blends different tafsirs under a vague 'Islam says'. Every level is strictly isolated, verified, and attributed.",
  },
  sv: {
    title: "Källhierarkins Stege (Source Ladder)",
    shortTitle: "Källstege",
    subtitle: "Vet alltid exakt vilken nivå varje del av kunskapen kommer ifrån.",
    expandBtn: "Visa källhierarkin i 6 nivåer",
    collapseBtn: "Dölj källstege",
    closeBtn: "Stäng",
    guaranteeTitle: "Etisk & Källkritisk Garanti:",
    guaranteeText: "Hidaya blandar aldrig gudomlig Quran-text med AI-åsikter eller slår ihop olika tolkningar under ett vagt 'Islam säger'. Varje nivå hålls strikt åtskild och källangiven.",
  },
  fr: {
    title: "Échelle de Transparence des Sources",
    shortTitle: "Échelle des Sources",
    subtitle: "Sachez toujours avec certitude d'où provient chaque niveau d'information.",
    expandBtn: "Consulter l'échelle des sources (6 niveaux)",
    collapseBtn: "Masquer l'échelle",
    closeBtn: "Fermer",
    guaranteeTitle: "Garantie Éthique & Épistémologique :",
    guaranteeText: "Hidaya ne mélange jamais le texte coranique avec des suppositions d'IA ni ne fusionne divers avis sous une formule floue. Chaque niveau est rigoureusement séparé et attribué.",
  },
  ar: {
    title: "سلم المصادر والمراجع",
    shortTitle: "سلم المصادر والمراجع",
    subtitle: "اعرف دائماً وبكل دقة ويقين مصدر كل طبقة معرفية في التطبيق.",
    expandBtn: "عرض سلم المصادر والمراجع (6 مستويات)",
    collapseBtn: "إخفاء سلم المصادر",
    closeBtn: "إغلاق",
    guaranteeTitle: "الضمانة الأخلاقية والمنهجية:",
    guaranteeText: "تلتزم هداية بعدم خلط النص القرآني المقدس مع آراء الذكاء الاصطناعي، أو دمج التفاسير تحت عبارة مبهمة مثل 'الإسلام يقول'. كل مستوى معزول وموثق ومعزو لأصله بدقة.",
  },
};

export const SourceLadder: React.FC<SourceLadderProps> = ({
  verse,
  language,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = UI_STRINGS[language] || UI_STRINGS.en;

  return (
    <div className="pt-1">
      {/* Compact toggle button / bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full inline-flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-emerald-950/30 hover:bg-slate-100 dark:hover:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800/40 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>{isOpen ? t.collapseBtn : t.expandBtn}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-700/10 text-emerald-800 dark:text-emerald-300 font-bold">
            6 Levels Verified
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded 6-Level Hierarchy Panel */}
      {isOpen && (
        <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#081B14] border-2 border-emerald-900/15 dark:border-emerald-700/30 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-3 border-b border-emerald-900/10 dark:border-emerald-800/30 pb-3">
            <div>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.subtitle}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label={t.closeBtn}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Ladder Steps Stack */}
          <div className="space-y-2.5">
            {LADDER_LEVELS.map((item) => (
              <div
                key={item.level}
                className={`p-3 rounded-xl border ${item.colorBg} ${item.colorBorder} transition-all`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/80 dark:bg-black/30 border border-current font-mono">
                      {item.badge}
                    </span>
                    <span className={`text-xs font-bold ${item.colorText}`}>
                      {item.name[language] || item.name.en}
                    </span>
                  </div>
                  {item.level <= 3 && (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Immutable
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-1 pl-1">
                  {item.description[language] || item.description.en}
                </p>

                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pl-1 border-t border-black/5 dark:border-white/5 pt-1">
                  {item.sourceExample[language] || item.sourceExample.en}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Ethical Guarantee Callout */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-600/30 text-[11px] text-amber-950 dark:text-amber-200 leading-relaxed space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              {t.guaranteeTitle}
            </span>
            <p>{t.guaranteeText}</p>
          </div>
        </div>
      )}
    </div>
  );
};
