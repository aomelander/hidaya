"use client";

import React, { useState } from 'react';
import {
  Users,
  X,
  Volume2,
  BookOpen,
  MessageCircle,
  HeartHandshake,
  Check,
  Save,
  Printer,
  Sparkles,
  Share2,
} from 'lucide-react';
import { QuranVerseFixture, Language } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface HalaqahModalProps {
  verse: QuranVerseFixture | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const UI_TEXT: Record<Language, {
  modalTitle: string;
  modalSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  commitmentPlaceholder: string;
  saveCommitment: string;
  savedCommitment: string;
  printBtn: string;
  closeBtn: string;
}> = {
  en: {
    modalTitle: "Halaqah Circle • Family & Group Contemplation",
    modalSubtitle: "A 5–10 minute guided sitting to bring Quranic wisdom into your home and community",
    step1Title: "1. Listen Together in Silence",
    step1Desc: "Close your eyes or look at the text as the recitation plays. Let the room become tranquil.",
    step2Title: "2. Read Aloud Together",
    step2Desc: "Have one person recite the Arabic, and another read the translation aloud with expression.",
    step3Title: "3. Circle Discussion Questions",
    step3Desc: "Go around the circle. No wrong answers—every member shares their real-life perspective.",
    step4Title: "4. Shared Home / Group Commitment",
    step4Desc: "Agree on one practical principle our circle commits to embodying this week.",
    commitmentPlaceholder: "e.g., 'This week when friction arises at dinner, we will pause for 10 seconds before replying.'",
    saveCommitment: "Save Circle Commitment",
    savedCommitment: "Commitment Saved!",
    printBtn: "Print Halaqah Card",
    closeBtn: "Close Sitting",
  },
  sv: {
    modalTitle: "Halaqah-Cirkel • Familj & Gruppbegrundan",
    modalSubtitle: "En 5–10 minuters guidad stund för att förankra Quranen i hemmet och gemenskapen",
    step1Title: "1. Lyssna tillsammans i stillhet",
    step1Desc: "Slut ögonen eller följ med i texten medan recitationen spelas. Låt lugnet sänka sig.",
    step2Title: "2. Läs högt tillsammans",
    step2Desc: "Låt en person läsa arabiskan och en annan läsa den svenska översättningen med inlevelse.",
    step3Title: "3. Samtalsfrågor för cirkeln",
    step3Desc: "Låt ordet gå runt. Inga felaktiga svar—alla delar sina verkliga erfarenheter och tankar.",
    step4Title: "4. Gemensamt löfte för hemmet / gruppen",
    step4Desc: "Kom överens om en konkret princip som familjen eller cirkeln lever efter i veckan.",
    commitmentPlaceholder: "t.ex. 'När irritation uppstår vid middagsbordet tar vi 10 sekunders tystnad innan vi svarar.'",
    saveCommitment: "Spara cirkelns löfte",
    savedCommitment: "Löfte sparat!",
    printBtn: "Skriv ut Halaqah-kort",
    closeBtn: "Avsluta stunden",
  },
  fr: {
    modalTitle: "Cercle de Halaqah • Méditation en Famille & Groupe",
    modalSubtitle: "Une assise de 5 à 10 minutes pour ancrer la sagesse coranique dans votre foyer",
    step1Title: "1. Écouter ensemble dans le recueillement",
    step1Desc: "Fermez les yeux ou suivez les mots pendant la récitation. Laissez la sérénité s'installer.",
    step2Title: "2. Lecture à voix haute partagée",
    step2Desc: "Une personne récite le verset en arabe et une autre lit la traduction avec attention.",
    step3Title: "3. Questions de réflexion collective",
    step3Desc: "Faites un tour de table bienveillant où chacun exprime son ressenti et ses défis quotidiens.",
    step4Title: "4. Engagement commun du foyer",
    step4Desc: "Choisissez ensemble une action ou attitude concrète que votre cercle incarnera cette semaine.",
    commitmentPlaceholder: "ex: 'Cette semaine, en cas de tension, nous marquerons un temps de pause avant de réagir.'",
    saveCommitment: "Enregistrer l'engagement",
    savedCommitment: "Engagement enregistré !",
    printBtn: "Imprimer la fiche Halaqah",
    closeBtn: "Fermer l'assise",
  },
  ar: {
    modalTitle: "حلقة التدبر • مدارسة عائلية وجماعية",
    modalSubtitle: "جلسة مباركة مدتها ٥-١٠ دقائق لترسيخ الهداية القرآنية في بيتك ومجتمعك",
    step1Title: "١. الإنصات في سكينة وخشوع",
    step1Desc: "أغمض عينيك أو تابع مع التلاوة العطرة بصوت القارئ، ودع السكينة تغشى المكان.",
    step2Title: "٢. القراءة الجماعية المتأنية",
    step2Desc: "يقرأ أحد الحاضرين الآية الكريمة، ويقرأ آخر المعنى والتفسير الميسر بوضوح وتأمل.",
    step3Title: "٣. أسئلة المدارسة والحوار الصادق",
    step3Desc: "يدور الحديث بين الحاضرين بلطف، حيث يشارك كل فرد أثره في واقعه دون تكلف.",
    step4Title: "٤. ميثاق العمل الأسري / الجماعي",
    step4Desc: "اتفقوا على مبدأ سلوكي عملي تلتزم به الأسرة أو الحلقة طوال هذا الأسبوع.",
    commitmentPlaceholder: "مثال: 'هذا الأسبوع عند حدوث أي خلاف في المنزل، نتوقف ١٠ ثوانٍ قبل الرد ونتعامل بالرفق.'",
    saveCommitment: "حفظ ميثاق الحلقة",
    savedCommitment: "تم حفظ الميثاق بنجاح!",
    printBtn: "طباعة بطاقة الحلقة",
    closeBtn: "إتمام الجلسة",
  },
};

export const HalaqahModal: React.FC<HalaqahModalProps> = ({
  verse,
  isOpen,
  onClose,
  language,
}) => {
  const [groupCommitment, setGroupCommitment] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !verse) return null;

  const t = UI_TEXT[language] || UI_TEXT.en;
  const translationObj = verse.translations[language] || verse.translations.en;

  // Default fallback questions if not explicitly provided in fixture
  const defaultQuestions: Record<Language, string[]> = {
    en: [
      `Where in our daily life (at school, work, or home) do we find it hardest to practice this verse?`,
      `How would our home feel different this week if we actively prioritized this reminder?`,
      `What is one habit we could pause or start to embody this virtue together?`,
    ],
    sv: [
      `Var i vår vardag (i skolan, på jobbet eller hemma) är det svårast att leva efter denna vers?`,
      `Hur skulle stämningen i vårt hem förändras om vi aktivt påminde varandra om detta i veckan?`,
      `Vilken liten ovana kan vi tillsammans pausa för att ge plats åt denna goda egenskap?`,
    ],
    fr: [
      `Où dans notre quotidien (à l'école, au travail ou à la maison) est-il le plus difficile d'appliquer ce verset ?`,
      `Quelle différence positive ressentirions-nous dans notre foyer si nous mettions en pratique ce rappel ?`,
      `Quelle habitude pourrions-nous changer ensemble cette semaine pour incarner cette valeur ?`,
    ],
    ar: [
      `أين نجد في واقعنا اليومي (في العمل، أو الدراسة، أو البيت) أكبر تحدٍ في تطبيق هذا التوجيه القرآني؟`,
      `كيف ستتغير سكينة بيتنا وعلاقاتنا هذا الأسبوع إذا جعلنا هذا المعنى القرآني حاضراً في تعاملاتنا؟`,
      `ما هي العادة العملية البسيطة التي نتفق جميعاً على البدء بها لتجسيد هذه الآية؟`,
    ],
  };

  const questions =
    verse.halaqahPrompts?.discussionQuestions[language] ||
    defaultQuestions[language] ||
    defaultQuestions.en;

  const handleSave = () => {
    try {
      localStorage.setItem(`hidaya_halaqah_${verse.id}`, groupCommitment);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch {}
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="halaqah-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] dark:bg-[#071913] text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border-2 border-emerald-900/20 dark:border-emerald-700/50 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-emerald-900/10 dark:bg-emerald-950/60 border-b border-emerald-900/10 dark:border-emerald-800/30 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-800 text-amber-300 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 id="halaqah-modal-title" className="text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-50">
                {t.modalTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Surah {verse.surahNameTransliterated} ({verse.id}) • {t.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* STEP 1: Listen Together */}
          <div className="p-5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-emerald-900/15 dark:border-emerald-800/30 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-sm">
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.step1Title}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t.step1Desc}
            </p>
            <div className="pt-1">
              <AudioPlayer audioUrl={verse.audioUrl} surahVerseId={verse.id} />
            </div>
          </div>

          {/* STEP 2: Read Aloud Together */}
          <div className="p-6 rounded-2xl bg-white dark:bg-emerald-950/30 border border-amber-600/20 dark:border-amber-500/20 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900/40 pb-2">
              <span className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-sm">
                <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t.step2Title}</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Ayah {verse.verseNumber}
              </span>
            </div>

            <p dir="rtl" className="font-arabic text-right text-2xl sm:text-3xl text-emerald-950 dark:text-emerald-50 leading-loose">
              {verse.arabicText}
            </p>

            <blockquote className="text-sm sm:text-base italic text-slate-800 dark:text-slate-100 border-l-4 border-emerald-600 pl-4 py-1 font-serif">
              &ldquo;{translationObj.text}&rdquo;
              <span className="block text-xs not-italic text-slate-500 mt-1">
                — {translationObj.translator}
              </span>
            </blockquote>
          </div>

          {/* STEP 3: Circle Discussion Questions */}
          <div className="p-6 rounded-2xl bg-emerald-900/5 dark:bg-emerald-950/40 border border-emerald-900/10 dark:border-emerald-800/30 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-sm">
              <MessageCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{t.step3Title}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t.step3Desc}
            </p>

            <div className="space-y-3 pt-1">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#071711] border border-emerald-900/10 dark:border-emerald-800/40 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {q}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 4: Shared Group Commitment */}
          <div className="p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-950/25 border border-amber-600/30 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
              <HeartHandshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t.step4Title}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              {t.step4Desc}
            </p>

            <textarea
              value={groupCommitment}
              onChange={(e) => setGroupCommitment(e.target.value)}
              placeholder={t.commitmentPlaceholder}
              rows={3}
              className="w-full p-3.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#071711] border border-amber-600/30 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              aria-label="Circle commitment"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                  isSaved ? 'bg-emerald-600' : 'bg-emerald-800 hover:bg-emerald-700'
                }`}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? t.savedCommitment : t.saveCommitment}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] dark:bg-[#071913] border-t border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:border-emerald-600 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printBtn}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-sm"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
