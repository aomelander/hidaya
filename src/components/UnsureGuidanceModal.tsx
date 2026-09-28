"use client";

import React, { useState } from 'react';
import {
  Compass,
  X,
  Heart,
  Lightbulb,
  Shield,
  Eye,
  Navigation,
  ArrowRight,
  Sparkles,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import { Language, EntryMode } from '../types';

interface UnsureGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onComplete: (queryText: string, mode: EntryMode) => void;
}

interface DimensionOption {
  id: string;
  icon: React.ReactNode;
  title: Record<Language, string>;
  description: Record<Language, string>;
  query: Record<Language, string>;
  mode: EntryMode;
}

const DIMENSIONS: DimensionOption[] = [
  {
    id: 'comfort',
    icon: <Heart className="w-5 h-5 text-rose-500" />,
    title: {
      en: 'Comfort & Relief',
      sv: 'Tröst & Lättnad',
      fr: 'Réconfort & Soulagement',
      ar: 'السكينة وتفريج الهموم',
    },
    description: {
      en: 'When your chest feels tight, sorrowful, or wounded by loss.',
      sv: 'När bröstet känns trångt, hjärtat sörjer eller bär på smärta.',
      fr: 'Quand la poitrine se serre, dans le deuil ou la détresse émotionnelle.',
      ar: 'حين يضيق الصدر، أو يحزن القلب، أو تؤلمك الخسارة ومرارة الفقد.',
    },
    query: {
      en: 'Heartache, sadness, seeking comfort and relief with hardship',
      sv: 'Tröst i sorg, oroligt hjärta, lättnad efter svårighet',
      fr: 'Recherche de réconfort, tristesse, apaisement face à l\'épreuve',
      ar: 'الحزن، ضيق الصدر، انشراح الصدر، الفرج بعد الشدة',
    },
    mode: 'moment',
  },
  {
    id: 'clarity',
    icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
    title: {
      en: 'Clarity in Confusion',
      sv: 'Klarhet i Förvirring',
      fr: 'Clarté dans le Doute',
      ar: 'البصيرة وانجلاء الحيرة',
    },
    description: {
      en: 'When you stand at a crossroads and cannot see the next step.',
      sv: 'När du står vid ett vägskäl och har svårt att fatta beslut.',
      fr: 'Quand vous êtes à la croisée des chemins et hésitez sur la décision.',
      ar: 'حين تقف عند مفترق طرق وتشوش الرؤية في اتخاذ القرار الصائب.',
    },
    query: {
      en: 'Difficult decision, confusion, seeking divine guidance and clarity',
      sv: 'Svårt beslut, förvirring, söker vägledning och klarhet',
      fr: 'Décision difficile, doute, recherche de clarté et d\'orientation',
      ar: 'الحيرة في القرار، طلب الهداية والبصيرة، الاستخارة والتوكل',
    },
    mode: 'moment',
  },
  {
    id: 'patience',
    icon: <Shield className="w-5 h-5 text-emerald-500" />,
    title: {
      en: 'Patience & Inner Strength',
      sv: 'Tålamod & Inre Styrka',
      fr: 'Patience & Force Intérieure',
      ar: 'الصبر وقوة الإرادة',
    },
    description: {
      en: 'When friction, exhaustion, or provocative people test your limits.',
      sv: 'När konflikter, utmattning eller provokationer sätter dig på prov.',
      fr: 'Quand les conflits, la fatigue ou l\'injustice éprouvent votre endurance.',
      ar: 'عند النزاعات، أو الإرهاق، أو استفزازات الآخرين التي تختبر ثباتك.',
    },
    query: {
      en: 'Patience in adversity, restraining anger, enduring hardship',
      sv: 'Tålamod i motgång, behärska vrede, styrka att uthärda',
      fr: 'Patience dans l\'adversité, maîtriser la colère, force d\'endurer',
      ar: 'الصبر على البلاء، كظم الغيظ، الثبات وقوة التحمل',
    },
    mode: 'growth',
  },
  {
    id: 'perspective',
    icon: <Eye className="w-5 h-5 text-blue-500" />,
    title: {
      en: 'Perspective & Meaning',
      sv: 'Perspektiv & Livsmening',
      fr: 'Perspective & Sens de la Vie',
      ar: 'فهم حكمة الابتلاء ومعنى الحياة',
    },
    description: {
      en: 'When life feels unfair, small, or you question why trials happen.',
      sv: 'När livet känns orättvist och du frågar dig varför prövningar sker.',
      fr: 'Quand les épreuves semblent injustes et que vous cherchez le sens profond.',
      ar: 'حين تتساءل عن حكمة الأقدار ولماذا تحدث الابتلاءات في هذه الحياة.',
    },
    query: {
      en: 'Why do we suffer? Purpose of life and divine wisdom in trials',
      sv: 'Varför prövas människan? Livets syfte och Guds vishet i motgång',
      fr: 'Pourquoi la souffrance ? Le sens de la vie et la sagesse divine dans l\'épreuve',
      ar: 'حكمة الابتلاء، الرضا بالقضاء والقدر، معنى الحياة وغاية الخلق',
    },
    mode: 'questions',
  },
  {
    id: 'direction',
    icon: <Navigation className="w-5 h-5 text-teal-500" />,
    title: {
      en: 'Moral Direction & Character',
      sv: 'Moralisk Riktning & Karaktär',
      fr: 'Direction Morale & Caractère',
      ar: 'تزكية النفس وحسن الخلق',
    },
    description: {
      en: 'When you want to anchor your character, speech, and integrity.',
      sv: 'När du vill stärka din karaktär, ditt tal och din hederlighet.',
      fr: 'Quand vous désirez parfaire votre comportement et la pureté de vos actes.',
      ar: 'حين ترغب في تزكية أخلاقك، وضبط لسانك، وترسيخ الاستقامة والنزاهة.',
    },
    query: {
      en: 'How to live righteously, noble character, humility, pure speech',
      sv: 'Hur lever man rättfärdigt? God karaktär, ödmjukhet, gott tal',
      fr: 'Comment bien agir ? Noble caractère, humilité et parole bienveillante',
      ar: 'حسن الخلق، تزكية النفس، عفة اللسان، التواضع والإحسان',
    },
    mode: 'growth',
  },
];

const QUICK_FEELINGS: Record<Language, Array<{ label: string; text: string }>> = {
  en: [
    { label: "Overwhelmed by everything", text: "I feel completely overwhelmed and carrying too many burdens" },
    { label: "Restless or anxious heart", text: "My heart feels restless and anxious without a clear reason" },
    { label: "Angry at unfairness", text: "I feel burning anger and wronged by people around me" },
    { label: "Grieving or lonely", text: "I feel profound grief, loneliness, and emotional hurt" },
    { label: "Lost & spiritually drained", text: "I feel spiritually empty and don't know where my life is heading" },
  ],
  sv: [
    { label: "Överväldigad av allt", text: "Jag känner mig helt överväldigad och bär på för tunga bördor" },
    { label: "Oroligt och rastlöst hjärta", text: "Mitt hjärta är rastlöst och oroligt utan tydlig orsak" },
    { label: "Arg över orättvisa", text: "Jag känner brännande vrede och känner mig orättvist behandlad" },
    { label: "Sorgsen eller ensam", text: "Jag känner djup sorg, ensamhet och känslomässig smärta" },
    { label: "Vilsen och andligt tom", text: "Jag känner mig vilsen och vet inte vart mitt liv är på väg" },
  ],
  fr: [
    { label: "Submergé par les épreuves", text: "Je me sens totalement submergé et porte un fardeau trop lourd" },
    { label: "Cœur agité ou anxieux", text: "Mon cœur est agité et anxieux sans raison apparente" },
    { label: "En colère face à l'injustice", text: "Je ressens une vive colère face à une injustice vécue" },
    { label: "En deuil ou solitaire", text: "Je ressens un profond chagrin et une solitude pesante" },
    { label: "Perdu et sans repères", text: "Je me sens spirituellement vide et ne sais plus quelle direction prendre" },
  ],
  ar: [
    { label: "أشعر بثقل الأعباء وتراكم الهموم", text: "أشعر بالإرهاق الشديد وتراكم الضغوطات على كاهلي" },
    { label: "اضطراب وقلق في القلب", text: "أشعر بضيق واضطراب في قلبي وأحتاج إلى سكينة وطمأنينة" },
    { label: "غضب وألم من الظلم", text: "أشعر بغيظ شديد وألم من معاملة ظالمة أو مجحفة" },
    { label: "حزن وفقد ووحدة", text: "أشعر بحزن عميق وفقد ووحدة وأحتاج إلى المواساة" },
    { label: "حيرة وفراغ روحي", text: "أشعر بفتور وفراغ روحي وأبحث عن الوجهة الصحيحة لحياتي" },
  ],
};

const UI_TEXT: Record<Language, {
  title: string;
  subtitle: string;
  step1Title: string;
  step1Placeholder: string;
  step2Title: string;
  submitBtn: string;
  closeBtn: string;
}> = {
  en: {
    title: "I don't know what I need",
    subtitle: "When words are hard to find, let Hidaya gently guide your reflection.",
    step1Title: "1. Take a gentle breath. What feels heaviest right now?",
    step1Placeholder: "Describe anything on your heart in your own words, or choose below...",
    step2Title: "2. Which of these feels closest to what your soul is seeking?",
    submitBtn: "Seek Relevant Quranic Passages",
    closeBtn: "Close",
  },
  sv: {
    title: "Jag vet inte riktigt vad jag behöver",
    subtitle: "När det är svårt att sätta ord på känslorna hjälper Hidaya dig varsamt att börja.",
    step1Title: "1. Ta ett djupt andetag. Vad känns tyngst just nu?",
    step1Placeholder: "Beskriv vad du bär på med dina egna ord, eller välj ett alternativ nedan...",
    step2Title: "2. Vilket av dessa känns närmast det din själ söker just nu?",
    submitBtn: "Sök relevanta Quran-passager",
    closeBtn: "Stäng",
  },
  fr: {
    title: "Je ne sais pas exactement ce dont j'ai besoin",
    subtitle: "Quand les mots manquent, laissez Hidaya vous guider vers la sérénité.",
    step1Title: "1. Respirez profondément. Qu'est-ce qui pèse le plus sur votre cœur ?",
    step1Placeholder: "Exprimez ce que vous ressentez avec vos propres mots, ou choisissez ci-dessous...",
    step2Title: "2. Laquelle de ces dimensions résonne le plus avec votre besoin ?",
    submitBtn: "Découvrir les passages coraniques",
    closeBtn: "Fermer",
  },
  ar: {
    title: "لست متأكداً مما أحتاجه الآن",
    subtitle: "حين تعجز الكلمات عن التعبير، تدلك هداية برفق إلى نور الوحي.",
    step1Title: "١. خذ نفساً عميقاً هادئاً. ما الذي يثقل قلبك في هذه اللحظة؟",
    step1Placeholder: "صف ما يجول في خاطرك بكلماتك البسيطة، أو اختر من الحالات أدناه...",
    step2Title: "٢. أي من هذه الأبواب تشعر بأنه الأقرب لما تبحث عنه روحك؟",
    submitBtn: "استكشف الآيات القرآنية المناسبة",
    closeBtn: "إغلاق",
  },
};

export const UnsureGuidanceModal: React.FC<UnsureGuidanceModalProps> = ({
  isOpen,
  onClose,
  language,
  onComplete,
}) => {
  const [userFeeling, setUserFeeling] = useState('');
  const [selectedDimension, setSelectedDimension] = useState<string>('comfort');

  if (!isOpen) return null;

  const t = UI_TEXT[language] || UI_TEXT.en;
  const feelings = QUICK_FEELINGS[language] || QUICK_FEELINGS.en;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const dimension = DIMENSIONS.find((d) => d.id === selectedDimension) || DIMENSIONS[0];
    const combinedQuery = userFeeling.trim()
      ? `${userFeeling.trim()} — ${dimension.query[language] || dimension.query.en}`
      : dimension.query[language] || dimension.query.en;

    onComplete(combinedQuery, dimension.mode);
    onClose();
  };

  const handleSelectDimensionDirect = (dimension: DimensionOption) => {
    setSelectedDimension(dimension.id);
    const combinedQuery = userFeeling.trim()
      ? `${userFeeling.trim()} — ${dimension.query[language] || dimension.query.en}`
      : dimension.query[language] || dimension.query.en;
    onComplete(combinedQuery, dimension.mode);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsure-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FAF8F5] dark:bg-[#081812] border-2 border-emerald-900/15 dark:border-emerald-700/40 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 dark:text-slate-100">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-emerald-900/10 dark:border-emerald-800/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-900/10 dark:bg-emerald-800/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 id="unsure-modal-title" className="text-xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">
                {t.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
            aria-label={t.closeBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Feeling input & pills */}
        <div className="space-y-3">
          <label className="block text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
            {t.step1Title}
          </label>

          <textarea
            value={userFeeling}
            onChange={(e) => setUserFeeling(e.target.value)}
            placeholder={t.step1Placeholder}
            rows={2}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-emerald-900/15 dark:border-emerald-800/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />

          <div className="flex flex-wrap gap-2">
            {feelings.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => setUserFeeling(f.text)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  userFeeling === f.text
                    ? 'bg-emerald-800 text-white border-emerald-800 dark:bg-emerald-700'
                    : 'bg-white/80 dark:bg-emerald-950/30 border-slate-200 dark:border-emerald-800/30 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Dimensions */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
            {t.step2Title}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DIMENSIONS.map((dim) => {
              const isSelected = selectedDimension === dim.id;
              return (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() => handleSelectDimensionDirect(dim)}
                  className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-emerald-900/10 dark:bg-emerald-800/30 border-emerald-700 dark:border-emerald-500 shadow-sm'
                      : 'bg-white dark:bg-emerald-950/20 border-slate-200 dark:border-emerald-800/30 hover:border-emerald-600 dark:hover:border-emerald-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {dim.icon}
                    <span className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100">
                      {dim.title[language] || dim.title.en}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {dim.description[language] || dim.description.en}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-emerald-900/10 dark:border-emerald-800/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {t.closeBtn}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/10 transition-all cursor-pointer"
          >
            <span>{t.submitBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
