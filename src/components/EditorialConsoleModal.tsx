"use client";

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  BookOpen,
  Filter,
  Save,
  Download,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { QuranVerseFixture, Language, EditorialReviewEntry, ScholarReviewStatus } from '../types';
import { QURAN_FIXTURES } from '../data/quranFixtures';
import { INITIAL_EDITORIAL_REVIEWS } from '../data/editorialReviews';

interface EditorialConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const EditorialConsoleModal: React.FC<EditorialConsoleModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [reviews, setReviews] = useState<Record<string, EditorialReviewEntry>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hidaya_editorial_reviews');
      if (saved) {
        try {
          return { ...INITIAL_EDITORIAL_REVIEWS, ...JSON.parse(saved) };
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_EDITORIAL_REVIEWS;
  });

  const [selectedVerseId, setSelectedVerseId] = useState<string>('3:134');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  if (!isOpen) return null;

  const currentVerse = QURAN_FIXTURES.find((v) => v.id === selectedVerseId) || QURAN_FIXTURES[0];
  const currentReview: EditorialReviewEntry = reviews[currentVerse.id] || {
    verseId: currentVerse.id,
    reviewerName: 'Editorial Board (Pending Assignment)',
    institution: 'Hidaya Theological Review Committee',
    status: 'pending',
    mappingConfidence: 85,
    theologicalNotes: 'Initial mapping established based on thematic relevance. Awaiting secondary scholar verification.',
    boundaryConfirmed: true,
    lastAudited: new Date().toISOString().split('T')[0],
  };

  const handleUpdateReview = (updates: Partial<EditorialReviewEntry>) => {
    const updated = {
      ...reviews,
      [currentVerse.id]: {
        ...currentReview,
        ...updates,
        lastAudited: new Date().toISOString().split('T')[0],
      },
    };
    setReviews(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hidaya_editorial_reviews', JSON.stringify(updated));
    }
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  const handleExportAuditReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reviews, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Hidaya_Theological_Audit_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredVerses = QURAN_FIXTURES.filter((v) => {
    const review = reviews[v.id];
    const matchesSearch =
      v.id.includes(searchFilter) ||
      v.surahNameTransliterated.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.whyThisVerse.emotion.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.whyThisVerse.situation.toLowerCase().includes(searchFilter.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    const currentStatus = review?.status || 'pending';
    return matchesSearch && currentStatus === statusFilter;
  });

  const t = {
    en: {
      title: 'Editorial & Scholar Review Console',
      subtitle: 'Audit verse-to-topic mappings, classical sources, and contextual boundaries.',
      auditTrail: 'Theological Audit Trail',
      reviewerAttribution: 'Reviewer & Institution',
      confidenceScore: 'Mapping Theological Confidence',
      statusLabel: 'Verification Status',
      notesLabel: 'Scholar Exegesis Notes',
      guardrailsTitle: 'Permanent Theological Guardrails Checklist',
      guardrail1: 'Level 1 Arabic: Verified against Tanzil Medina Mushaf (Zero alterations).',
      guardrail2: 'Level 2 Translations: Explicitly attributed to certified human translators.',
      guardrail3: 'Level 3 Exegesis: Sourced directly from historical classical works (Ibn Kathir, Al-Sa’di).',
      guardrail4: 'Level 4 Reflections: AI-generated prompts bounded; strictly NO fatwas or legal rulings.',
      guardrail5: 'Contextual Boundary Guard: "What this verse is NOT saying" verified to prevent misuse.',
      exportAudit: 'Export Audit Report (JSON)',
      close: 'Close Console',
      savedText: 'Saved!',
    },
    sv: {
      title: 'Redaktions- & Forskargranskningskonsol',
      subtitle: 'Granska verskopplingar, klassiska källor och kontextuella gränsdragningar.',
      auditTrail: 'Teologiskt granskningsspår',
      reviewerAttribution: 'Granskare & Lärosäte',
      confidenceScore: 'Teologisk tillförlitlighet',
      statusLabel: 'Verifieringsstatus',
      notesLabel: 'Lärda granskningsanteckningar',
      guardrailsTitle: 'Checklista för permanenta teologiska skyddsräcken',
      guardrail1: 'Nivå 1 arabiska: Verifierad mot Tanzil Medina-mushaf (Noll förändringar).',
      guardrail2: 'Nivå 2 översättningar: Tydligt attribuerad till certifierade översättare.',
      guardrail3: 'Nivå 3 exeges: Hämtad direkt ur klassiska verk (Ibn Kathir, Al-Sa’di).',
      guardrail4: 'Nivå 4 reflektioner: Avgränsade reflektioner; absolut INGA fatwor eller juridiska domar.',
      guardrail5: 'Kontextuell gränsdragning: "Vad denna vers INTE säger" verifierad mot vantolkning.',
      exportAudit: 'Exportera granskningsrapport (JSON)',
      close: 'Stäng konsol',
      savedText: 'Sparat!',
    },
    fr: {
      title: 'Console Éditoriale & Revue Théologique',
      subtitle: 'Auditez les correspondances de versets, sources classiques et limites contextuelles.',
      auditTrail: 'Piste d\'audit théologique',
      reviewerAttribution: 'Réviseur & Institution',
      confidenceScore: 'Confiance théologique',
      statusLabel: 'Statut de vérification',
      notesLabel: 'Notes d\'exégèse du savant',
      guardrailsTitle: 'Garde-fous théologiques permanents',
      guardrail1: 'Niveau 1 arabe : Conforme au Mushaf de Médine Tanzil (Zéro altération).',
      guardrail2: 'Niveau 2 traductions : Attribuées explicitement à des traducteurs certifiés.',
      guardrail3: 'Niveau 3 exégèse : Issu des commentaires classiques (Ibn Kathir, Al-Sa’di).',
      guardrail4: 'Niveau 4 réflexions : Prompts encadrés ; strictement AUCUNE fatwa ou jugement légal.',
      guardrail5: 'Garde contextuelle : "Ce que ce verset NE dit PAS" vérifié contre toute dérive.',
      exportAudit: 'Exporter le rapport d\'audit (JSON)',
      close: 'Fermer la console',
      savedText: 'Enregistré !',
    },
  }[language];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-emerald-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editorial-console-title"
    >
      <div className="bg-[#FAF8F5] dark:bg-[#071813] w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl border border-emerald-900/20 dark:border-emerald-700/40 flex flex-col overflow-hidden text-slate-800 dark:text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between bg-white dark:bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="editorial-console-title" className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-50">
                {t.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Console Workspace: 2-column layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Verses Selector List */}
          <div className="w-full md:w-80 border-r border-emerald-900/10 dark:border-emerald-800/30 bg-slate-50/50 dark:bg-emerald-950/20 p-4 flex flex-col gap-3 overflow-y-auto max-h-56 md:max-h-none">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search verse or topic..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-emerald-900/40 border border-slate-200 dark:border-emerald-800/40 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded-lg font-medium cursor-pointer ${
                  statusFilter === 'all' ? 'bg-emerald-800 text-white font-bold' : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                All ({QURAN_FIXTURES.length})
              </button>
              <button
                onClick={() => setStatusFilter('verified')}
                className={`px-2 py-1 rounded-lg font-medium cursor-pointer ${
                  statusFilter === 'verified' ? 'bg-emerald-800 text-white font-bold' : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2 py-1 rounded-lg font-medium cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-emerald-800 text-white font-bold' : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                Pending
              </button>
            </div>

            {/* List */}
            <div className="space-y-1.5 flex-1 overflow-y-auto">
              {filteredVerses.map((verse) => {
                const r = reviews[verse.id];
                const isSelected = verse.id === selectedVerseId;
                const status = r?.status || 'pending';

                return (
                  <button
                    key={verse.id}
                    onClick={() => setSelectedVerseId(verse.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-emerald-900 text-white border-emerald-800 shadow-xs'
                        : 'bg-white dark:bg-emerald-950/40 border-slate-200 dark:border-emerald-800/30 hover:border-emerald-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">
                        {verse.surahNameTransliterated} {verse.id}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                          status === 'verified'
                            ? isSelected
                              ? 'bg-emerald-700 text-emerald-100'
                              : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                            : isSelected
                            ? 'bg-amber-600 text-white'
                            : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] truncate block ${
                        isSelected ? 'text-emerald-200' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {verse.whyThisVerse.emotion} • {verse.whyThisVerse.situation}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Review & Audit Details */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* Top Bar for Selected Verse */}
            <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/30 border border-slate-200 dark:border-emerald-800/40 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50">
                    Surah {currentVerse.surahNameTransliterated} ({currentVerse.id})
                  </h3>
                  <span className="text-xs text-slate-500">
                    {currentVerse.revelationType} • Juz {currentVerse.juz}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  &ldquo;{currentVerse.translations[language]?.text || currentVerse.translations.en.text}&rdquo;
                </p>
              </div>

              {/* Status Picker */}
              <div className="flex items-center gap-2">
                {(['verified', 'reviewed', 'pending', 'flagged'] as ScholarReviewStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateReview({ status: st })}
                    className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                      currentReview.status === st
                        ? st === 'verified'
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : st === 'flagged'
                          ? 'bg-rose-700 text-white'
                          : 'bg-amber-600 text-white'
                        : 'bg-slate-100 dark:bg-emerald-900/30 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/30 border border-slate-200 dark:border-emerald-800/40 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  {t.reviewerAttribution}
                </label>
                <input
                  type="text"
                  value={currentReview.reviewerName}
                  onChange={(e) => handleUpdateReview({ reviewerName: e.target.value })}
                  placeholder="Reviewer Name"
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/40 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                <input
                  type="text"
                  value={currentReview.institution}
                  onChange={(e) => handleUpdateReview({ institution: e.target.value })}
                  placeholder="Institution or Academic Body"
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/40 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/30 border border-slate-200 dark:border-emerald-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t.confidenceScore}
                  </label>
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                    {currentReview.mappingConfidence}%
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={currentReview.mappingConfidence}
                  onChange={(e) => handleUpdateReview({ mappingConfidence: Number(e.target.value) })}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Plensible (60%)</span>
                  <span>Direct Classical Grounding (100%)</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Last audited: {currentReview.lastAudited}
                </div>
              </div>
            </div>

            {/* Scholar Exegesis Notes */}
            <div className="p-4 rounded-2xl bg-white dark:bg-emerald-950/30 border border-slate-200 dark:border-emerald-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t.notesLabel}</span>
                </label>
                {isSavedRecently && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.savedText}</span>
                  </span>
                )}
              </div>
              <textarea
                rows={4}
                value={currentReview.theologicalNotes}
                onChange={(e) => handleUpdateReview({ theologicalNotes: e.target.value })}
                className="w-full p-3 text-xs leading-relaxed rounded-xl bg-slate-50 dark:bg-emerald-900/30 border border-slate-200 dark:border-emerald-800/40 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Guardrails Verification Checklist */}
            <div className="p-4 rounded-2xl bg-emerald-900/5 dark:bg-emerald-950/40 border border-emerald-800/30 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                <FileCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>{t.guardrailsTitle}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t.guardrail1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t.guardrail2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t.guardrail3}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t.guardrail4}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t.guardrail5}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between bg-white dark:bg-emerald-950/40 text-xs">
          <button
            onClick={handleExportAuditReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-emerald-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportAudit}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
