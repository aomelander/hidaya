"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  BookOpen,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Mic,
  Video,
  FileCheck2,
  AlertTriangle,
  Info,
  Scale,
} from 'lucide-react';
import { TafsirCitation, Language, QuranVerseFixture } from '../types';

interface ScholarProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  citation: TafsirCitation | null;
  verse: QuranVerseFixture | null;
  language: Language;
}

const UI_TEXT: Record<
  Language,
  {
    modalTitle: string;
    modalSubtitle: string;
    level3Title: string;
    level4Title: string;
    statusCanonical: string;
    statusTranscribed: string;
    statusAiTranslated: string;
    statusAiSynthesized: string;
    scholarLabel: string;
    sourceWorkLabel: string;
    centuryLabel: string;
    sourceRefLabel: string;
    originalArabicTitle: string;
    originalArabicSubtitle: string;
    copyArabicBtn: string;
    copiedBtn: string;
    translationTitle: string;
    translationSubtitle: string;
    aiNoticeTitle: string;
    aiNoticeBody: string;
    safetyBoundaryTitle: string;
    safetyBoundaryBody: string;
    closeBtn: string;
  }
> = {
  en: {
    modalTitle: 'Tafsir Source Provenance & Audit',
    modalSubtitle: 'Full scholarly attribution, original Arabic text, and AI translation audit trail',
    level3Title: 'Level 3: Classical Exegesis & Verified Scholar Lectures',
    level4Title: 'Level 4: AI Synthesis / Reflection Prompt',
    statusCanonical: 'Verified Canonical Exegesis (Classically Authenticated)',
    statusTranscribed: 'Verified Scholar Lecture (Audio/Video Transcription)',
    statusAiTranslated: 'AI Translation of Verified Expert Lecture',
    statusAiSynthesized: 'AI Synthesis (Clearly Marked)',
    scholarLabel: 'Author / Scholar',
    sourceWorkLabel: 'Source Work',
    centuryLabel: 'Era / Century',
    sourceRefLabel: 'Exact Citation / Lecture Archive Reference',
    originalArabicTitle: 'Original Verbatim Arabic Source',
    originalArabicSubtitle: 'Authentic transcribed Arabic words as written or spoken by the scholar',
    copyArabicBtn: 'Copy Original Arabic',
    copiedBtn: 'Copied to Clipboard!',
    translationTitle: 'Translated Commentary',
    translationSubtitle: 'Rendered for clarity in your selected language',
    aiNoticeTitle: 'AI Translation & Integrity Protocol',
    aiNoticeBody:
      'Translated with AI assistance under strict Usul al-Tafsir guardrails (AGENTS.md). The original Arabic is provided verbatim above to allow scholarly audit. The AI is strictly prohibited from adding personal rulings, altering meanings, or hallucinating citations.',
    safetyBoundaryTitle: 'Theological Boundary Reminder',
    safetyBoundaryBody:
      'Hidaya is a navigational guide to Quranic sources, NOT a religious authority. It does NOT issue fatwas, legal rulings, or life verdicts.',
    closeBtn: 'Close',
  },
  sv: {
    modalTitle: 'Tafsir-källans ursprung & granskning',
    modalSubtitle: 'Akademisk attribuering, ursprunglig arabisk text och AI-översättningsgranskning',
    level3Title: 'Nivå 3: Klassisk korankommentar & verifierade lärdas föreläsningar',
    level4Title: 'Nivå 4: AI-syntes / reflektionsfråga',
    statusCanonical: 'Verifierad klassisk tafsir (Historiskt autentiserad)',
    statusTranscribed: 'Verifierad föreläsning (Transkription av ljud/video)',
    statusAiTranslated: 'AI-översättning av verifierad expertföreläsning',
    statusAiSynthesized: 'AI-syntes (Tydligt märkt)',
    scholarLabel: 'Författare / Lärd',
    sourceWorkLabel: 'Källverk',
    centuryLabel: 'Epok / Århundrade',
    sourceRefLabel: 'Exakt citat / Föreläsningsarkiv',
    originalArabicTitle: 'Ursprunglig arabisk ordagrann text',
    originalArabicSubtitle: 'Autentiska arabiska ord som de nedtecknades eller uttalades av den lärde',
    copyArabicBtn: 'Kopiera arabisk text',
    copiedBtn: 'Kopierat till urklipp!',
    translationTitle: 'Översatt kommentar',
    translationSubtitle: 'Framställd för tydlighet på valt språk',
    aiNoticeTitle: 'AI-översättning & integritetsprotokoll',
    aiNoticeBody:
      'Översatt med AI-stöd under strikta Usul al-Tafsir-riktlinjer (AGENTS.md). Den ursprungliga arabiska texten visas ordagrant ovan för oberoende kontroll. AI är strikt förbjuden att utfärda egna domslut eller ändra innebörden.',
    safetyBoundaryTitle: 'Teologisk ansvarsfriskrivning',
    safetyBoundaryBody:
      'Hidaya är en vägledande kompass till korankällor, INTE en religiös auktoritet. Appen utfärdar inga fatwor eller juridiska avgöranden.',
    closeBtn: 'Stäng',
  },
  fr: {
    modalTitle: 'Traçabilité & Source du Tafsir',
    modalSubtitle: 'Attribution savante complète, texte arabe original et audit de traduction IA',
    level3Title: 'Niveau 3 : Exégèse classique & conférences de savants vérifiées',
    level4Title: 'Niveau 4 : Synthèse IA / Piste de méditation',
    statusCanonical: 'Exégèse classique vérifiée (Authentification canonique)',
    statusTranscribed: 'Conférence savante vérifiée (Transcription audio/vidéo)',
    statusAiTranslated: 'Traduction IA d’une conférence d’expert vérifiée',
    statusAiSynthesized: 'Synthèse IA (Clairement indiquée)',
    scholarLabel: 'Auteur / Savant',
    sourceWorkLabel: 'Ouvrage source',
    centuryLabel: 'Époque / Siècle',
    sourceRefLabel: 'Référence exacte / Archive de la conférence',
    originalArabicTitle: 'Texte arabe original in extenso',
    originalArabicSubtitle: 'Mots arabes authentiques tels qu’écrits ou prononcés par le savant',
    copyArabicBtn: 'Copier le texte arabe',
    copiedBtn: 'Copié dans le presse-papiers !',
    translationTitle: 'Commentaire traduit',
    translationSubtitle: 'Rendu avec clarté dans la langue sélectionnée',
    aiNoticeTitle: 'Protocole d’intégrité & Traduction IA',
    aiNoticeBody:
      'Traduit avec assistance IA sous strict protocole théologique Usul al-Tafsir (AGENTS.md). Le texte arabe original est fourni mot à mot ci-dessus pour audit. L’IA a interdiction absolue d’émettre des avis juridiques ou de déformer le sens.',
    safetyBoundaryTitle: 'Rappel des limites théologiques',
    safetyBoundaryBody:
      'Hidaya est un guide vers les sources coraniques et NON une autorité religieuse. Elle n’émet aucune fatwa ni décret jurisprudentiel.',
    closeBtn: 'Fermer',
  },
  ar: {
    modalTitle: 'توثيق مصدر التفسير والأصل العربي',
    modalSubtitle: 'العزو العلمي المعتمد، النص العربي الأصلي، وتوثيق الترجمة والذكاء الاصطناعي',
    level3Title: 'المستوى ٣: التراث التفسيري ومحاضرات العلماء الموثقة',
    level4Title: 'المستوى ٤: صياغة تدبرية / ذكاء اصطناعي',
    statusCanonical: 'تفسير كلاسيكي معتمد (توثيق أصيل)',
    statusTranscribed: 'تفريغ موثق لمحاضرة عالم (تسجيل صوتي/مرئي)',
    statusAiTranslated: 'ترجمة بالذكاء الاصطناعي لتفريغ موثق لعالم خبير',
    statusAiSynthesized: 'صياغة تدبرية بالذكاء الاصطناعي (موسومة بوضوح)',
    scholarLabel: 'العالم / المفسر',
    sourceWorkLabel: 'المصنف أو السلسلة',
    centuryLabel: 'العصر / القرن',
    sourceRefLabel: 'المرجع الدقيق / رابط الحلقة من الأرشيف',
    originalArabicTitle: 'اللفظ العربي الأصلي المنقول',
    originalArabicSubtitle: 'النص العربي المنقول بلفظه الأصلي من أمهات الكتب أو من كلام الشيخ',
    copyArabicBtn: 'نسخ النص العربي الأصلي',
    copiedBtn: 'تم نسخ النص بنجاح!',
    translationTitle: 'البيان المترجم',
    translationSubtitle: 'المعنى المنقول بدقة إلى لغة العرض الحالية',
    aiNoticeTitle: 'بروتوكول الأمانة العلمية والترجمة بالذكاء الاصطناعي',
    aiNoticeBody:
      'تتم ترجمة تفريغات العلماء بدعم الذكاء الاصطناعي وفق ضوابط أصول التفسير الصارمة (AGENTS.md). يُعرض النص العربي الأصلي كاملاً أعلاه لتمكين المراجعة العلمية، ويُحظر على النموذج الاستنباط المستقل أو الإفتاء.',
    safetyBoundaryTitle: 'تنبيه الحدود الشرعية',
    safetyBoundaryBody:
      'هداية دليل إرشادي إلى المصادر القرآنية وليست سلطة دينية أو جهة إفتاء، ولا تصدر أحكاماً شرعية.',
    closeBtn: 'إغلاق',
  },
};

export const ScholarProvenanceModal: React.FC<ScholarProvenanceModalProps> = ({
  isOpen,
  onClose,
  citation,
  verse,
  language,
}) => {
  const [copied, setCopied] = useState(false);
  const t = UI_TEXT[language] || UI_TEXT.en;
  const isRtl = language === 'ar';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !citation) return null;

  const sourceType = citation.sourceType || 'classical_book';
  const verificationStatus = citation.verificationStatus || 'verified_canonical';

  const isVideoOrAudio =
    sourceType === 'expert_transcription' || sourceType === 'ai_translated_expert';

  const isAiAssisted =
    sourceType === 'ai_translated_expert' ||
    sourceType === 'ai_synthesis' ||
    verificationStatus === 'ai_translated_pending_review' ||
    verificationStatus === 'ai_synthesized';

  const handleCopyArabic = async () => {
    const textToCopy = citation.originalArabicRaw || citation.text;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  // Get status badge styling & copy
  const getStatusBadge = () => {
    if (verificationStatus === 'verified_canonical' || sourceType === 'classical_book') {
      return {
        label: t.statusCanonical,
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        badgeClass:
          'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
      };
    }
    if (verificationStatus === 'transcription_verified') {
      return {
        label: t.statusTranscribed,
        icon: <Video className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />,
        badgeClass: 'bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30',
      };
    }
    if (verificationStatus === 'ai_translated_pending_review' || sourceType === 'ai_translated_expert') {
      return {
        label: t.statusAiTranslated,
        icon: <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
        badgeClass: 'bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/40',
      };
    }
    return {
      label: t.statusAiSynthesized,
      icon: <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />,
      badgeClass:
        'bg-purple-500/10 text-purple-900 dark:text-purple-300 border-purple-500/30',
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="provenance-modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#081B15] text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-emerald-900/20 dark:border-emerald-700/40 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-emerald-900/10 dark:border-emerald-800/30 flex items-start justify-between gap-4 bg-emerald-900/5 dark:bg-emerald-950/40">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-800 text-amber-300 shrink-0 shadow-xs">
              {isVideoOrAudio ? <Mic className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-900/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  {sourceType === 'ai_synthesis' ? t.level4Title : t.level3Title}
                </span>
                {verse && (
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                    {verse.id}
                  </span>
                )}
              </div>
              <h2
                id="provenance-modal-title"
                className="text-lg font-bold text-emerald-950 dark:text-emerald-50 mt-1"
              >
                {t.modalTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
            aria-label={t.closeBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Status Badge */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-medium ${statusBadge.badgeClass}`}
          >
            {statusBadge.icon}
            <span className="flex-1">{statusBadge.label}</span>
          </div>

          {/* Scholar Meta Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-medium">
                  {t.scholarLabel}
                </span>
                <span className="text-sm font-bold text-emerald-950 dark:text-emerald-200 mt-0.5 block">
                  {citation.scholar}
                </span>
              </div>

              {citation.century && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">
                    {t.centuryLabel}
                  </span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {citation.century}
                  </span>
                </div>
              )}

              <div className="sm:col-span-2">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">
                  {t.sourceWorkLabel}
                </span>
                <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mt-0.5 block">
                  {citation.sourceBook}
                </span>
              </div>

              {citation.sourceReference && (
                <div className="sm:col-span-2 pt-2 border-t border-emerald-900/10 dark:border-emerald-800/20">
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">
                    {t.sourceRefLabel}
                  </span>
                  <p className="text-xs font-mono text-emerald-950 dark:text-emerald-200 mt-1 bg-white dark:bg-emerald-900/30 p-2.5 rounded-xl border border-emerald-900/10 dark:border-emerald-800/20">
                    {citation.sourceReference}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Verbatim Original Arabic Text */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-emerald-900/20 border border-amber-600/20 dark:border-emerald-700/30 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  {t.originalArabicTitle}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.originalArabicSubtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyArabic}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-900/15 dark:border-emerald-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors shadow-2xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.copiedBtn}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.copyArabicBtn}</span>
                  </>
                )}
              </button>
            </div>

            <div
              dir="rtl"
              className="p-4 rounded-xl bg-white dark:bg-black/30 border border-amber-500/20 dark:border-emerald-800/30 text-right"
            >
              <p className="font-serif text-base sm:text-lg leading-loose text-slate-900 dark:text-amber-50 select-text">
                {citation.originalArabicRaw ||
                  (language === 'ar'
                    ? citation.text
                    : 'النص العربي المنقول بلفظه الأصلي قيد التوثيق المباشر.')}
              </p>
            </div>
          </div>

          {/* Active Localized Translation */}
          {language !== 'ar' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/30 space-y-2">
              <div>
                <h3 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                  {t.translationTitle}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.translationSubtitle}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {citation.text}
              </p>
            </div>
          )}

          {/* AI Translation & Integrity Notice */}
          {isAiAssisted && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-semibold text-xs">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{t.aiNoticeTitle}</span>
                {citation.aiModel && (
                  <span className="ms-auto text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                    Model: {citation.aiModel}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-amber-950/80 dark:text-amber-200/90">
                {t.aiNoticeBody}
              </p>
            </div>
          )}

          {/* Strict AGENTS.md Boundary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-900/30 flex items-start gap-3">
            <Scale className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {t.safetyBoundaryTitle}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.safetyBoundaryBody}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-900/10 dark:border-emerald-800/30 bg-[#FAF8F5] dark:bg-emerald-950/40 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
