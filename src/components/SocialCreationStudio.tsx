"use client";

/**
 * @file src/components/SocialCreationStudio.tsx
 * @description Integrated Social Media Creation Studio for the Universal VerseCard:
 * - Format 1: High-Resolution Square Image (1:1 — 1080x1080 for Instagram / X / Threads)
 * - Format 2: High-Resolution Story / Reel Image (9:16 — 1080x1920 for Instagram Stories / TikTok / WhatsApp)
 * - Format 3: Synchronized Video (WebM / MP4) with animated word-by-word highlighting & audio (Recitation + optional Translation/Tafsir)
 * - Format 4: Presentation Slide Deck (PowerPoint .pptx 16:9 & Printable PDF)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Image as ImageIcon,
  Video,
  Presentation,
  Download,
  Share2,
  Check,
  Loader2,
  Printer,
  Square,
  Smartphone,
} from 'lucide-react';
import { QuranVerseFixture, Language, UserReflection } from '../types';
import { ExportService } from '../services/exportService';

export interface SocialCreationStudioProps {
  verse: QuranVerseFixture;
  surahDisplayTitle: string;
  arabicText: string;
  translationText?: string;
  translatorName?: string;
  tafsirText?: string;
  tafsirScholar?: string;
  audioUrl?: string;
  language: Language;
  reflection?: UserReflection | null;
}

type StudioTab = 'image' | 'video' | 'presentation';
type ImageAspect = '1:1' | '9:16';
type CardTheme = 'emerald' | 'parchment' | 'midnight';

export const SocialCreationStudio: React.FC<SocialCreationStudioProps> = ({
  verse,
  surahDisplayTitle,
  arabicText,
  translationText = '',
  translatorName = '',
  tafsirText = '',
  tafsirScholar = '',
  audioUrl = '',
  language,
  reflection,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('image');
  const [aspect, setAspect] = useState<ImageAspect>('9:16');
  const [theme, setTheme] = useState<CardTheme>('emerald');
  const [includeTrans, setIncludeTrans] = useState(Boolean(translationText));
  const [includeTafsir, setIncludeTafsir] = useState(false);

  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);
  const [exportedNotice, setExportedNotice] = useState<string | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const labels = {
    fr: {
      title: 'Studio de Création & Partage Social',
      imageTab: 'Image (1:1 & 9:16)',
      videoTab: 'Vidéo + Audio',
      presTab: 'PowerPoint & PDF',
      squareFormat: 'Carré 1:1 (Post)',
      storyFormat: 'Story 9:16 (Reel)',
      themeEmerald: 'Sanctuaire Émeraude',
      themeParchment: 'Parchemin Doré',
      themeMidnight: 'Nuit Étoilée',
      incTranslation: 'Inclure la Traduction',
      incTafsir: 'Inclure un extrait du Tafsir',
      downloadImg: 'Télécharger l’image PNG',
      shareImg: 'Partager sur les réseaux',
      generateVideoBtn: 'Générer la vidéo récitée (WebM/MP4)',
      generatingVideo: 'Création de la vidéo en cours...',
      downloadVideoBtn: 'Télécharger la vidéo',
      exportPptxBtn: 'Télécharger PowerPoint (.pptx 16:9)',
      exportPdfBtn: 'Imprimer / Exporter PDF',
      savedMsg: 'Prêt et téléchargé !',
    },
    en: {
      title: 'Social Creation & Export Studio',
      imageTab: 'Image (1:1 & 9:16)',
      videoTab: 'Video + Audio',
      presTab: 'PowerPoint & PDF',
      squareFormat: 'Square 1:1 (Post)',
      storyFormat: 'Story 9:16 (Reel)',
      themeEmerald: 'Emerald Sanctuary',
      themeParchment: 'Warm Parchment',
      themeMidnight: 'Midnight Gold',
      incTranslation: 'Include Translation',
      incTafsir: 'Include Tafsir Excerpt',
      downloadImg: 'Download PNG Image',
      shareImg: 'Share to Socials',
      generateVideoBtn: 'Generate Recited Video (WebM/MP4)',
      generatingVideo: 'Rendering recited video...',
      downloadVideoBtn: 'Download Video',
      exportPptxBtn: 'Download PowerPoint (.pptx 16:9)',
      exportPdfBtn: 'Print / Export PDF',
      savedMsg: 'Ready & Downloaded!',
    },
    sv: {
      title: 'Skapa & Dela till Sociala Medier',
      imageTab: 'Bild (1:1 & 9:16)',
      videoTab: 'Video + Ljud',
      presTab: 'PowerPoint & PDF',
      squareFormat: 'Kvadrat 1:1 (Inlägg)',
      storyFormat: 'Story 9:16 (Reel)',
      themeEmerald: 'Smaragd',
      themeParchment: 'Pergament',
      themeMidnight: 'Midazol Guld',
      incTranslation: 'Inkludera översättning',
      incTafsir: 'Inkludera Tafsir-utdrag',
      downloadImg: 'Ladda ner PNG-bild',
      shareImg: 'Dela',
      generateVideoBtn: 'Skapa video med recitation',
      generatingVideo: 'Skapar video...',
      downloadVideoBtn: 'Ladda ner video',
      exportPptxBtn: 'Ladda ner PowerPoint (.pptx 16:9)',
      exportPdfBtn: 'Skriv ut / PDF',
      savedMsg: 'Nedladdad!',
    },
    ar: {
      title: 'استوديو التصميم والمشاركة الاجتماعية',
      imageTab: 'صورة (1:1 و 9:16)',
      videoTab: 'فيديو مع التلاوة',
      presTab: 'عرض تقديمي و PDF',
      squareFormat: 'مربع 1:1 (منشور)',
      storyFormat: 'قصة 9:16 (ستوري/ريلز)',
      themeEmerald: 'زمردي داكن',
      themeParchment: 'رقّذهبي دافئ',
      themeMidnight: 'ليلي مذهب',
      incTranslation: 'تضمين الترجمة',
      incTafsir: 'تضمين مقتطف التفسير',
      downloadImg: 'تحميل الصورة (PNG)',
      shareImg: 'مشاركة عبر الشبكات',
      generateVideoBtn: 'إنشاء فيديو بالتلاوة الصوتية',
      generatingVideo: 'جاري إنشاء الفيديو...',
      downloadVideoBtn: 'تحميل الفيديو',
      exportPptxBtn: 'تحميل عرض بوربوينت (.pptx)',
      exportPdfBtn: 'طباعة / تصدير PDF',
      savedMsg: 'تم التحميل بنجاح!',
    },
  }[language];

  const drawCardOnCanvas = useCallback(
    (canvas: HTMLCanvasElement, highlightRatio = -1) => {
      const width = 1080;
      const height = aspect === '1:1' ? 1080 : 1920;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background palette
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      if (theme === 'parchment') {
        grad.addColorStop(0, '#FBF8F1');
        grad.addColorStop(0.5, '#F7F0E2');
        grad.addColorStop(1, '#EFE5D0');
      } else if (theme === 'midnight') {
        grad.addColorStop(0, '#090D16');
        grad.addColorStop(0.5, '#0F172A');
        grad.addColorStop(1, '#020617');
      } else {
        grad.addColorStop(0, '#06281E');
        grad.addColorStop(0.5, '#0A1E17');
        grad.addColorStop(1, '#04120D');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const isLight = theme === 'parchment';
      // Border frame
      ctx.strokeStyle = isLight ? 'rgba(180, 83, 9, 0.28)' : 'rgba(244, 185, 0, 0.35)';
      ctx.lineWidth = 3;
      const pad = aspect === '1:1' ? 48 : 64;
      ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

      // Header
      ctx.textAlign = 'center';
      ctx.fillStyle = isLight ? '#006D53' : '#F4B900';
      ctx.font = 'bold 28px sans-serif';
      const topY = aspect === '1:1' ? 115 : 165;
      ctx.fillText('HIDAYA · هِدَايَة', width / 2, topY);

      ctx.fillStyle = isLight ? '#064E3B' : '#A7F3D0';
      ctx.font = '600 32px sans-serif';
      ctx.fillText(`${surahDisplayTitle} (${verse.id})`, width / 2, topY + 52);

      const wrapText = (text: string, maxWidth: number) => {
        const words = text.trim().split(/\s+/);
        const lines: string[] = [];
        let current = '';
        for (const w of words) {
          const test = current ? `${current} ${w}` : w;
          if (ctx.measureText(test).width > maxWidth && current) {
            lines.push(current);
            current = w;
          } else {
            current = test;
          }
        }
        if (current) lines.push(current);
        return lines;
      };

      // Arabic text
      ctx.font = aspect === '1:1' ? '44px serif' : '52px serif';
      const maxArabicLines = aspect === '1:1' ? 5 : 8;
      const arabicLines = wrapText(arabicText, width - 200).slice(0, maxArabicLines);
      let y = topY + (aspect === '1:1' ? 130 : 190);

      arabicLines.forEach((line, idx) => {
        const lineRatio = arabicLines.length > 0 ? idx / arabicLines.length : 0;
        const isHighlightedLine =
          highlightRatio >= 0 &&
          highlightRatio >= lineRatio &&
          highlightRatio < (idx + 1) / arabicLines.length;

        if (isHighlightedLine) {
          ctx.fillStyle = isLight ? 'rgba(244, 185, 0, 0.25)' : 'rgba(244, 185, 0, 0.2)';
          ctx.fillRect(100, y - 48, width - 200, 66);
        }

        ctx.fillStyle = isHighlightedLine
          ? isLight
            ? '#064E3B'
            : '#F4B900'
          : isLight
          ? '#06281E'
          : '#FFFBEB';
        ctx.fillText(line, width / 2, y);
        y += aspect === '1:1' ? 68 : 82;
      });

      // Divider
      y += 16;
      ctx.strokeStyle = isLight ? 'rgba(0, 109, 83, 0.25)' : 'rgba(244, 185, 0, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 140, y);
      ctx.lineTo(width / 2 + 140, y);
      ctx.stroke();

      // Translation
      if (includeTrans && translationText.trim().length > 0) {
        y += aspect === '1:1' ? 54 : 74;
        ctx.fillStyle = isLight ? '#1E293B' : '#ECFDF5';
        ctx.font = aspect === '1:1' ? 'italic 30px sans-serif' : 'italic 35px sans-serif';
        const maxTransLines = aspect === '1:1' ? 5 : 8;
        const transLines = wrapText(`"${translationText.trim()}"`, width - 200).slice(
          0,
          maxTransLines
        );
        for (const line of transLines) {
          ctx.fillText(line, width / 2, y);
          y += aspect === '1:1' ? 46 : 54;
        }
        if (translatorName) {
          y += 14;
          ctx.fillStyle = isLight ? '#006D53' : '#6EE7B7';
          ctx.font = '500 24px sans-serif';
          ctx.fillText(`— ${translatorName}`, width / 2, y);
        }
      }

      // Tafsir Excerpt
      if (includeTafsir && tafsirText.trim().length > 0) {
        y += aspect === '1:1' ? 46 : 64;
        ctx.fillStyle = isLight ? '#475569' : '#D1FAE5';
        ctx.font = '25px sans-serif';
        const maxTafsirLines = aspect === '1:1' ? 3 : 5;
        const tafLines = wrapText(tafsirText.trim(), width - 220).slice(0, maxTafsirLines);
        for (const line of tafLines) {
          ctx.fillText(line, width / 2, y);
          y += 38;
        }
        if (tafsirScholar) {
          y += 10;
          ctx.fillStyle = isLight ? '#B45309' : '#F4B900';
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText(`Tafsir ${tafsirScholar}`, width / 2, y);
        }
      }

      // Footer
      ctx.fillStyle = isLight ? 'rgba(6, 40, 30, 0.55)' : 'rgba(255, 251, 235, 0.55)';
      ctx.font = '24px sans-serif';
      ctx.fillText(
        'Verified Uthmani Script · Hidaya Sanctuary',
        width / 2,
        height - (aspect === '1:1' ? 75 : 110)
      );
    },
    [
      aspect,
      theme,
      surahDisplayTitle,
      verse.id,
      arabicText,
      includeTrans,
      translationText,
      translatorName,
      includeTafsir,
      tafsirText,
      tafsirScholar,
    ]
  );

  useEffect(() => {
    if (previewCanvasRef.current) {
      drawCardOnCanvas(previewCanvasRef.current, -1);
    }
  }, [drawCardOnCanvas, activeTab]);

  const handleDownloadImage = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    drawCardOnCanvas(canvas, -1);
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `hidaya-${verse.id.replace(':', '-')}-${aspect.replace(':', 'x')}.png`;
    link.href = dataUrl;
    link.click();
    setExportedNotice(labels.savedMsg);
    setTimeout(() => setExportedNotice(null), 2500);
  };

  const handleShareImage = async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    drawCardOnCanvas(canvas, -1);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `hidaya-${verse.id.replace(':', '-')}.png`, {
        type: 'image/png',
      });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: `Hidaya — ${surahDisplayTitle} (${verse.id})`,
            text: `${arabicText}\n\n${translationText}`,
            files: [file],
          });
          return;
        } catch {
          // Fallback to download
        }
      }
      handleDownloadImage();
    }, 'image/png');
  };

  const handleGenerateVideo = async () => {
    if (isGeneratingVideo) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    setIsGeneratingVideo(true);
    setVideoProgress(5);
    if (videoBlobUrl) {
      URL.revokeObjectURL(videoBlobUrl);
      setVideoBlobUrl(null);
    }

    try {
      const stream = canvas.captureStream(30);
      let audioCtx: AudioContext | null = null;
      let audioEl: HTMLAudioElement | null = null;

      if (audioUrl) {
        try {
          audioEl = new Audio(audioUrl);
          audioEl.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            if (!audioEl) return resolve();
            audioEl.oncanplaythrough = () => resolve();
            audioEl.onerror = () => reject(new Error('Audio load error'));
            setTimeout(resolve, 3500);
          });
          audioCtx = new AudioContext();
          const source = audioCtx.createMediaElementSource(audioEl);
          const dest = audioCtx.createMediaStreamDestination();
          source.connect(dest);
          source.connect(audioCtx.destination);
          dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
        } catch {
          // Proceed with silent animated canvas video if CORS prevents audio capture
          audioEl = null;
        }
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const totalDurationMs =
        audioEl && audioEl.duration && isFinite(audioEl.duration)
          ? Math.min(audioEl.duration * 1000, 15000)
          : 6000;

      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
        recorder.start(100);
        if (audioEl) {
          audioEl.play().catch(() => {});
        }

        const startTime = performance.now();
        const tick = (now: number) => {
          const elapsed = now - startTime;
          const ratio = Math.min(1, elapsed / totalDurationMs);
          setVideoProgress(Math.round(ratio * 100));
          drawCardOnCanvas(canvas, ratio);
          if (elapsed < totalDurationMs) {
            requestAnimationFrame(tick);
          } else {
            if (audioEl) audioEl.pause();
            if (recorder.state !== 'inactive') recorder.stop();
          }
        };
        requestAnimationFrame(tick);
      });

      if (audioCtx) {
        void audioCtx.close();
      }

      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setVideoBlobUrl(url);

      // Auto-download the generated video
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const link = document.createElement('a');
      link.href = url;
      link.download = `hidaya-video-${verse.id.replace(':', '-')}.${ext}`;
      link.click();
      setExportedNotice(labels.savedMsg);
      setTimeout(() => setExportedNotice(null), 3000);
    } catch (err) {
      console.warn('Video generation failed:', err);
    } finally {
      setIsGeneratingVideo(false);
      drawCardOnCanvas(canvas, -1);
    }
  };

  const handleExportPPTX = async () => {
    setIsExportingPPTX(true);
    try {
      await ExportService.exportToPPTX(verse, language, reflection);
      setExportedNotice(labels.savedMsg);
      setTimeout(() => setExportedNotice(null), 2500);
    } finally {
      setIsExportingPPTX(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F0E2] dark:bg-[#0C2920] border border-emerald-900/15 dark:border-emerald-800/40 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-[#F5F7F2]">
          {labels.title}
        </h3>

        {/* Studio Format Tabs */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'image'
                ? 'bg-[#006D53] text-white shadow-2xs'
                : 'text-slate-600 dark:text-[#9BAFA7]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{labels.imageTab}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'video'
                ? 'bg-[#006D53] text-white shadow-2xs'
                : 'text-slate-600 dark:text-[#9BAFA7]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>{labels.videoTab}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presentation')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'presentation'
                ? 'bg-[#006D53] text-white shadow-2xs'
                : 'text-slate-600 dark:text-[#9BAFA7]'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>{labels.presTab}</span>
          </button>
        </div>
      </div>

      {/* Customization Controls for Image & Video */}
      {(activeTab === 'image' || activeTab === 'video') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Live Canvas Preview */}
          <div className="flex justify-center bg-black/10 dark:bg-black/30 p-3 rounded-2xl">
            <canvas
              ref={previewCanvasRef}
              className={`rounded-xl shadow-md border border-amber-500/30 ${
                aspect === '1:1' ? 'w-56 h-56' : 'w-44 h-78'
              } object-contain`}
            />
          </div>

          {/* Aspect Ratio, Theme & Layer Toggles */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAspect('1:1')}
                className={`px-3 py-2 rounded-xl border font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  aspect === '1:1'
                    ? 'bg-[#006D53] text-white border-[#006D53]'
                    : 'bg-[#FBF8F1] dark:bg-[#082019] border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2]'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>{labels.squareFormat}</span>
              </button>
              <button
                type="button"
                onClick={() => setAspect('9:16')}
                className={`px-3 py-2 rounded-xl border font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  aspect === '9:16'
                    ? 'bg-[#006D53] text-white border-[#006D53]'
                    : 'bg-[#FBF8F1] dark:bg-[#082019] border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{labels.storyFormat}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'emerald', label: labels.themeEmerald },
                  { id: 'parchment', label: labels.themeParchment },
                  { id: 'midnight', label: labels.themeMidnight },
                ] as { id: CardTheme; label: string }[]
              ).map((tItem) => (
                <button
                  key={tItem.id}
                  type="button"
                  onClick={() => setTheme(tItem.id)}
                  className={`px-2.5 py-2 rounded-xl border font-semibold text-center truncate cursor-pointer ${
                    theme === tItem.id
                      ? 'bg-[#006D53] text-white border-[#006D53]'
                      : 'bg-[#FBF8F1] dark:bg-[#082019] border-emerald-900/15 dark:border-emerald-800/40 text-emerald-950 dark:text-[#F5F7F2]'
                  }`}
                >
                  {tItem.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              {translationText && (
                <button
                  type="button"
                  onClick={() => setIncludeTrans(!includeTrans)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold text-emerald-950 dark:text-[#F5F7F2]">
                    {labels.incTranslation}
                  </span>
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center ${
                      includeTrans ? 'bg-[#006D53] text-white' : 'border border-slate-400'
                    }`}
                  >
                    {includeTrans && <Check className="w-3 h-3" />}
                  </span>
                </button>
              )}

              {tafsirText && (
                <button
                  type="button"
                  onClick={() => setIncludeTafsir(!includeTafsir)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/10 dark:border-emerald-800/40 flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold text-emerald-950 dark:text-[#F5F7F2]">
                    {labels.incTafsir}
                  </span>
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center ${
                      includeTafsir ? 'bg-[#006D53] text-white' : 'border border-slate-400'
                    }`}
                  >
                    {includeTafsir && <Check className="w-3 h-3" />}
                  </span>
                </button>
              )}
            </div>

            {activeTab === 'image' ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="flex-1 min-h-[42px] px-4 py-2 rounded-xl bg-[#006D53] hover:bg-emerald-700 text-white font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{labels.downloadImg}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleShareImage()}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/15 dark:border-emerald-800/40 font-semibold text-emerald-950 dark:text-[#F5F7F2] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#006D53] dark:text-[#F4B900]" />
                  <span>{labels.shareImg}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => void handleGenerateVideo()}
                  disabled={isGeneratingVideo}
                  className="w-full min-h-[42px] px-4 py-2.5 rounded-xl bg-[#006D53] hover:bg-emerald-700 text-white font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {labels.generatingVideo} ({videoProgress}%)
                      </span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 text-[#F4B900]" />
                      <span>{labels.generateVideoBtn}</span>
                    </>
                  )}
                </button>
                {videoBlobUrl && !isGeneratingVideo && (
                  <a
                    href={videoBlobUrl}
                    download={`hidaya-video-${verse.id.replace(':', '-')}.webm`}
                    className="w-full min-h-[38px] px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-emerald-950 dark:text-[#F4B900] font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{labels.downloadVideoBtn}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Presentation Export Tab (PPTX 16:9 & PDF) */}
      {activeTab === 'presentation' && (
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => void handleExportPPTX()}
            disabled={isExportingPPTX}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#006D53] hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Presentation className="w-4 h-4 text-[#F4B900]" />
            <span>{isExportingPPTX ? '...' : labels.exportPptxBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => ExportService.exportToPDF()}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#FBF8F1] dark:bg-[#082019] border border-emerald-900/15 dark:border-emerald-800/40 text-xs sm:text-sm font-semibold text-emerald-950 dark:text-[#F5F7F2] inline-flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#006D53] dark:text-[#F4B900]" />
            <span>{labels.exportPdfBtn}</span>
          </button>
        </div>
      )}

      {exportedNotice && (
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006D53] dark:text-[#F4B900]">
          <Check className="w-4 h-4" />
          <span>{exportedNotice}</span>
        </div>
      )}
    </div>
  );
};
