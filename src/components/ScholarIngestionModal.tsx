"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Mic,
  Upload,
} from 'lucide-react';
import { Language, ScholarIngestionRecord, ScholarIngestionPayload } from '../types';

interface ScholarIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const PRESET_SCHOLARS = [
  {
    name: "Al-Sha'rawi",
    work: "تفسير الشعراوي — محمد متولي الشعراوي (Quranpedia Book #18)",
    ref: "Quranpedia (book_id=18) | verse_key=3:134 | Vol. 3 | pp. 1753–1757 | version=2026-08-10",
  },
];

const SAMPLE_TRANSCRIPTS = [
  {
    label: "Al-Sha'rawi on 3:134 (Quranpedia Book 18)",
    scholar: "Al-Sha'rawi",
    surah: 3,
    ayah: 134,
    ref: "Quranpedia (book_id=18) | verse_key=3:134 | Vol. 3 | pp. 1753–1757 | version=2026-08-10",
    text: "هذه بعض من صفات المتقين ﴿والكاظمين الغيظ﴾ لأن المعركة - معركة أُحد - ستعطينا هذه الصورة أيضاً. وأصل الكظم أن تملأ القِرْبة، فإذا مُلئت القربة بالماء شُدّ على رأسها أي رُبط رأسها ربطاً محكماً بحيث لا يخرج شيء مَمّا فيها. فهناك ثلاث مراحل: الأولى: كظم الغيظ. والثانية: العفو. والثالثة: أن يتجاوز الإنسان الكظم والعفو بأن يحسن إلى المسئ إليه.",
  },
  {
    label: "Al-Sha'rawi on 7:199 (Quranpedia Book 18)",
    scholar: "Al-Sha'rawi",
    surah: 7,
    ayah: 199,
    ref: "Quranpedia (book_id=18) | verse_key=7:199 | Vol. 8 | pp. 4531–4535 | version=2026-08-10",
    text: "وهذه آية جمع فيها المولى سبحانه وتعالى مكارم الأخلاق. والحق هنا يأمر رسوله عَلَيْهِ الصَّلَاة وَالسَّلَام ُ أن يأخذ العفو، أي أن يأخذ الأمر الميسر السهل، الذي لا تكلف فيه ولا اجتهاد؛ لأنك بذلك تُسهل على الناس أمورهم ولا تعقدها.",
  },
];

export const ScholarIngestionModal: React.FC<ScholarIngestionModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'ingest' | 'queue' | 'transcribe'>('ingest');

  // Form State
  const [scholarName, setScholarName] = useState(PRESET_SCHOLARS[0].name);
  const [workTitle, setWorkTitle] = useState(PRESET_SCHOLARS[0].work);
  const [surahNumber, setSurahNumber] = useState<number>(3);
  const [ayahNumber, setAyahNumber] = useState<number>(134);
  const [sourceReference, setSourceReference] = useState(PRESET_SCHOLARS[0].ref);
  const [sourceUrl, setSourceUrl] = useState('https://archive.org/details/El-Sharawy-Tafseer');
  const [originalArabicRaw, setOriginalArabicRaw] = useState(SAMPLE_TRANSCRIPTS[0].text);

  // Translation & Safety State
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<{
    en: string;
    sv: string;
    fr: string;
    keyLinguisticFocus?: string;
    translationDisclaimer: string;
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Review Queue State
  const [queue, setQueue] = useState<ScholarIngestionRecord[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  // Audio transcription
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadQueue();
    }
  }, [isOpen]);

  const loadQueue = async () => {
    setIsLoadingQueue(true);
    try {
      const res = await fetch('/api/admin/ingest-scholar');
      if (res.ok) {
        const data = (await res.json()) as { queue?: ScholarIngestionRecord[] };
        if (data.queue) {
          setQueue(data.queue);
        }
      }
    } catch (err) {
      console.warn('Could not load queue:', err);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const handleRunTranslation = async () => {
    if (!originalArabicRaw.trim()) return;
    setIsTranslating(true);
    setSaveStatus(null);

    try {
      const res = await fetch('/api/admin/ingest-scholar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview_translation',
          scholarName,
          surahNumber,
          ayahNumber,
          sourceReference,
          originalArabicRaw,
        }),
      });

      const data = (await res.json()) as {
        data?: {
          en: string;
          sv: string;
          fr: string;
          keyLinguisticFocus?: string;
          translationDisclaimer: string;
        };
        error?: string;
      };
      if (data.data) {
        setTranslationResult(data.data);
      } else {
        setSaveStatus(data.error || 'Translation failed');
      }
    } catch (err) {
      setSaveStatus(err instanceof Error ? err.message : 'Translation error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async (autoVerify = false) => {
    if (!originalArabicRaw.trim() || !translationResult) return;
    setIsSaving(true);

    const payload: ScholarIngestionPayload = {
      scholarName,
      workTitle,
      surahNumber,
      ayahNumber,
      sourceReference,
      sourceType: 'ai_translated_expert',
      sourceUrl,
      originalArabicRaw,
      translations: {
        en: translationResult.en,
        sv: translationResult.sv,
        fr: translationResult.fr,
        ar: originalArabicRaw,
      },
      translationDisclaimer: translationResult.translationDisclaimer,
      aiModel: 'gemini-3.8-flash',
    };

    try {
      const res = await fetch('/api/admin/ingest-scholar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: autoVerify ? 'save_verified' : 'save_pending',
          payload,
          reviewerName: autoVerify ? 'Theological Audit Committee' : undefined,
        }),
      });

      const data = (await res.json()) as { status?: string; error?: string };
      if (data.status === 'success') {
        setSaveStatus(
          autoVerify
            ? '✓ Verified & Published to Supabase!'
            : '✓ Saved as Pending Review in Supabase'
        );
        loadQueue();
      } else {
        setSaveStatus(data.error || 'Failed to save');
      }
    } catch (err) {
      setSaveStatus(err instanceof Error ? err.message : 'Save error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveQueueItem = async (ingestionId: string) => {
    try {
      const res = await fetch('/api/admin/ingest-scholar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          ingestionId,
          reviewerName: 'Theological Review Committee',
        }),
      });
      if (res.ok) {
        loadQueue();
      }
    } catch (err) {
      console.error('Error approving item:', err);
    }
  };

  const loadSample = (sample: (typeof SAMPLE_TRANSCRIPTS)[0]) => {
    setScholarName(sample.scholar);
    const preset = PRESET_SCHOLARS.find((p) => p.name === sample.scholar);
    if (preset) {
      setWorkTitle(preset.work);
    }
    setSurahNumber(sample.surah);
    setAyahNumber(sample.ayah);
    setSourceReference(sample.ref);
    setOriginalArabicRaw(sample.text);
    setTranslationResult(null);
    setSaveStatus(null);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#071813] border border-emerald-900/20 dark:border-emerald-800/40 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-emerald-900/30 flex items-center justify-between gap-4 bg-[#FAF8F5] dark:bg-[#0A1E17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                <span>Scholar Lecture Ingestion & Audit</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  Step 4
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Quranpedia Tafsir Al-Sha&apos;rawi (Book 18) synchronization &amp; grounded audit with strict AGENTS.md bounds
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 border-b border-slate-100 dark:border-emerald-900/30 bg-slate-50/50 dark:bg-emerald-950/20 flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('ingest')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ingest'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-900/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ingest &amp; Translate</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-900/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Theological Review Queue ({queue.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {activeTab === 'ingest' && (
            <div className="space-y-6">
              {/* Presets / Quick Loaders */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  Quick Load Authentic Transcripts
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {SAMPLE_TRANSCRIPTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => loadSample(sample)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium border border-emerald-900/15 dark:border-emerald-800/40 bg-[#FAF8F5] dark:bg-emerald-950/30 hover:border-emerald-600 transition-colors text-emerald-900 dark:text-emerald-200 cursor-pointer"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scholar and Ayah Alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Scholar Name
                  </label>
                  <select
                    value={scholarName}
                    onChange={(e) => {
                      setScholarName(e.target.value);
                      const match = PRESET_SCHOLARS.find((p) => p.name === e.target.value);
                      if (match) {
                        setWorkTitle(match.work);
                        setSourceReference(match.ref);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAF8F5] dark:bg-emerald-950/40 border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-100"
                  >
                    {PRESET_SCHOLARS.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Surah No.
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={114}
                    value={surahNumber}
                    onChange={(e) => setSurahNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAF8F5] dark:bg-emerald-950/40 border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ayah No.
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={286}
                    value={ayahNumber}
                    onChange={(e) => setAyahNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAF8F5] dark:bg-emerald-950/40 border border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-100"
                  />
                </div>
              </div>

              {/* Source Reference & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Source Citation / Video Episode
                  </label>
                  <input
                    type="text"
                    value={sourceReference}
                    onChange={(e) => setSourceReference(e.target.value)}
                    placeholder="e.g. Khawatir Al-Sha'rawi Episode #342"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-[#FAF8F5] dark:bg-emerald-950/40 border border-emerald-900/15 dark:border-emerald-800/40 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Archive URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://archive.org/..."
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-[#FAF8F5] dark:bg-emerald-950/40 border border-emerald-900/15 dark:border-emerald-800/40 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Original Spoken Arabic Transcript */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <span>Verbatim Spoken Arabic Transcript</span>
                    <span className="text-[10px] font-normal text-amber-600 dark:text-amber-400">
                      (Ground Truth · Zero Hallucination)
                    </span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {originalArabicRaw.length} chars
                  </span>
                </div>
                <textarea
                  dir="rtl"
                  lang="ar"
                  rows={4}
                  value={originalArabicRaw}
                  onChange={(e) => setOriginalArabicRaw(e.target.value)}
                  placeholder="الصوت المفرغ نصياً لكلام الشيخ باللغة العربية..."
                  className="w-full p-3.5 rounded-2xl text-sm font-arabic bg-amber-500/5 dark:bg-black/30 border border-amber-600/20 dark:border-emerald-800/40 text-emerald-950 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 leading-loose"
                />
              </div>

              {/* Action Button: Run Grounded Translation */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Enforces AGENTS.md negative constraints (No fatwas, strict translation only)</span>
                </div>

                <button
                  type="button"
                  onClick={handleRunTranslation}
                  disabled={isTranslating || !originalArabicRaw.trim()}
                  className="min-h-[42px] px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isTranslating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Translating via Gemini 3.8 Flash...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run Grounded Translation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preview Translation Results */}
              {translationResult && (
                <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/30 border border-emerald-900/15 dark:border-emerald-800/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-900/30 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                        Translation Preview Ready
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300">
                        gemini-3.8-flash
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave(false)}
                        disabled={isSaving}
                        className="px-3.5 py-1.5 rounded-xl border border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Save as Pending Review
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSave(true)}
                        disabled={isSaving}
                        className="px-4 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Verify &amp; Publish
                      </button>
                    </div>
                  </div>

                  {saveStatus && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs font-medium">
                      {saveStatus}
                    </div>
                  )}

                  {/* Multi-language previews */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-emerald-950/50 border border-emerald-900/10 dark:border-emerald-800/30 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        English (EN)
                      </span>
                      <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                        {translationResult.en}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-emerald-950/50 border border-emerald-900/10 dark:border-emerald-800/30 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Swedish (SV)
                      </span>
                      <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                        {translationResult.sv}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-emerald-950/50 border border-emerald-900/10 dark:border-emerald-800/30 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        French (FR)
                      </span>
                      <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                        {translationResult.fr}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono italic">
                    * {translationResult.translationDisclaimer}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-emerald-900/30">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ingested Commentaries &amp; Audit Queue
                </span>
                <button
                  type="button"
                  onClick={loadQueue}
                  className="text-xs text-emerald-800 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Queue</span>
                </button>
              </div>

              {isLoadingQueue ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading review queue...</span>
                </div>
              ) : queue.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No commentaries in queue. Use &ldquo;Ingest &amp; Translate&rdquo; to add lecture transcripts.
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((item) => {
                    const isVerified = item.verificationStatus === 'transcription_verified';
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                              {item.scholarName}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="text-xs font-mono text-amber-700 dark:text-amber-400">
                              Surah {item.surahNumber}:{item.ayahNumber}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="text-xs text-slate-500 font-mono">
                              {item.sourceReference}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isVerified ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending Review</span>
                              </span>
                            )}

                            {!isVerified && (
                              <button
                                type="button"
                                onClick={() => handleApproveQueueItem(item.id)}
                                className="px-3 py-1 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Approve &amp; Verify
                              </button>
                            )}
                          </div>
                        </div>

                        <p
                          dir="rtl"
                          className="font-arabic text-xs text-slate-800 dark:text-amber-50 bg-white/60 dark:bg-black/30 p-2.5 rounded-xl border border-slate-100 dark:border-emerald-900/30 line-clamp-2"
                        >
                          &ldquo;{item.originalArabicRaw}&rdquo;
                        </p>

                        {item.translations?.en && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                            &ldquo;{item.translations.en}&rdquo;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-emerald-900/30 bg-[#FAF8F5] dark:bg-[#0A1E17] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            AGENTS.md Level 3 Provenance Architecture
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
