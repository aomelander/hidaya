"use client";

import React, { useState, useRef } from 'react';
import { X, Download, Copy, Check, Share2, Sparkles, Image as ImageIcon, Palette } from 'lucide-react';
import { QuranVerseFixture, Language } from '../types';

interface VisualCardModalProps {
  verse: QuranVerseFixture | null;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

type CardTheme = 'sand' | 'emerald' | 'midnight';

export const VisualCardModal: React.FC<VisualCardModalProps> = ({
  verse,
  language,
  isOpen,
  onClose,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('sand');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardPreviewRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || !verse) return null;

  const translationObj = verse.translations[language] || verse.translations.en;

  const t = {
    en: {
      title: 'Shareable Quranic Contemplation Card',
      subtitle: 'Create a beautiful, distraction-free visual card to share with family or on social media.',
      themeSand: 'Warm Sand',
      themeEmerald: 'Sacred Emerald',
      themeMidnight: 'Deep Midnight',
      downloadPNG: 'Download Image (PNG)',
      copyImage: 'Copy Image',
      copyText: 'Copy Text',
      copiedText: 'Copied!',
      close: 'Close',
    },
    sv: {
      title: 'Delbart Quran-reflektionskort',
      subtitle: 'Skapa ett vackert, stilla visuellt kort att dela med familjen eller i sociala medier.',
      themeSand: 'Varm sand',
      themeEmerald: 'Helig smaragd',
      themeMidnight: 'Midnatt',
      downloadPNG: 'Ladda ner bild (PNG)',
      copyImage: 'Kopiera bild',
      copyText: 'Kopiera text',
      copiedText: 'Kopierat!',
      close: 'Stäng',
    },
    fr: {
      title: 'Carte de Méditation Coranique Partageable',
      subtitle: 'Créez une carte visuelle épurée et sacrée à partager avec vos proches ou sur vos réseaux.',
      themeSand: 'Sable chaud',
      themeEmerald: 'Émeraude sacrée',
      themeMidnight: 'Minuit profond',
      downloadPNG: 'Télécharger l\'image (PNG)',
      copyImage: 'Copier l\'image',
      copyText: 'Copier le texte',
      copiedText: 'Copié !',
      close: 'Fermer',
    },
  }[language];

  // Helper to draw canvas for PNG export
  const generateCanvasImage = async (): Promise<string | null> => {
    const canvas = document.createElement('canvas');
    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background color
    if (selectedTheme === 'emerald') {
      ctx.fillStyle = '#062B21';
    } else if (selectedTheme === 'midnight') {
      ctx.fillStyle = '#07140F';
    } else {
      ctx.fillStyle = '#FAF8F5';
    }
    ctx.fillRect(0, 0, width, height);

    // Decorative inner gold border
    ctx.lineWidth = 3;
    ctx.strokeStyle = selectedTheme === 'sand' ? '#D9770633' : '#F59E0B44';
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Header: Hidaya North Star
    ctx.fillStyle = selectedTheme === 'sand' ? '#064E3B' : '#6EE7B7';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('✦ HIDAYA — Quran Guidance for Your Moment', 70, 95);

    // Surah & Verse Badge
    const surahText = `Surah ${verse.surahNameTransliterated} (${verse.id})`;
    ctx.fillStyle = selectedTheme === 'sand' ? '#92400E' : '#FCD34D';
    ctx.font = '600 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(surahText, width - 70, 95);

    // Arabic Quranic Verse (Level 1)
    ctx.textAlign = 'center';
    ctx.fillStyle = selectedTheme === 'sand' ? '#042F24' : '#F0FDF4';
    ctx.font = '36px "Amiri", "Scheherazade New", "Traditional Arabic", serif';
    
    // Simple text wrapping helper
    const wrapText = (text: string, maxWidth: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      for (const w of words) {
        const testLine = currentLine ? `${currentLine} ${w}` : w;
        if (ctx.measureText(testLine).width < maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = w;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    const arabicLines = wrapText(verse.arabicText, width - 180);
    let yPos = 210;
    for (const line of arabicLines.slice(0, 3)) {
      ctx.fillText(line, width / 2, yPos);
      yPos += 52;
    }

    // Divider line
    yPos += 15;
    ctx.lineWidth = 1;
    ctx.strokeStyle = selectedTheme === 'sand' ? '#D1D5DB' : '#065F46';
    ctx.beginPath();
    ctx.moveTo(width / 2 - 150, yPos);
    ctx.lineTo(width / 2 + 150, yPos);
    ctx.stroke();
    yPos += 45;

    // Translation (Level 2)
    ctx.fillStyle = selectedTheme === 'sand' ? '#374151' : '#E5E7EB';
    ctx.font = 'italic 22px Georgia, Cambria, "Times New Roman", serif';
    const translationLines = wrapText(`“${translationObj.text}”`, width - 220);
    for (const line of translationLines.slice(0, 3)) {
      ctx.fillText(line, width / 2, yPos);
      yPos += 34;
    }

    // Footer Attribution
    ctx.fillStyle = selectedTheme === 'sand' ? '#6B7280' : '#9CA3AF';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Translation: ${translationObj.translator} • Verified Uthmani Medina Mushaf • hidaya.app`,
      width / 2,
      height - 65
    );

    return canvas.toDataURL('image/png');
  };

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      const dataUrl = await generateCanvasImage();
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.download = `Hidaya_Verse_${verse.id.replace(':', '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyImage = async () => {
    try {
      setIsGenerating(true);
      const dataUrl = await generateCanvasImage();
      if (!dataUrl) return;

      const res = await fetch(dataUrl);
      const blob = await res.blob();

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback to text copy
        handleCopyText();
      }
    } catch {
      handleCopyText();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    const text = `${verse.arabicText}\n\n"${translationObj.text}"\n— Surah ${verse.surahNameTransliterated} (${verse.id}) [${translationObj.translator}]\nReflected with Hidaya`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="visual-card-title"
    >
      <div className="bg-[#FAF8F5] dark:bg-[#071813] w-full max-w-3xl rounded-3xl shadow-2xl border border-emerald-900/20 dark:border-emerald-700/40 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-emerald-900/10 dark:border-emerald-800/30 flex items-center justify-between bg-white dark:bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="visual-card-title" className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-50">
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

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Theme Palette Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <Palette className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Card Aesthetic:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTheme('sand')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedTheme === 'sand'
                    ? 'bg-[#FAF8F5] text-emerald-950 border-amber-600 shadow-xs ring-2 ring-amber-500/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.themeSand}
              </button>
              <button
                onClick={() => setSelectedTheme('emerald')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedTheme === 'emerald'
                    ? 'bg-[#062B21] text-emerald-100 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-emerald-900/30 text-emerald-200 border-emerald-800 hover:bg-emerald-900/50'
                }`}
              >
                {t.themeEmerald}
              </button>
              <button
                onClick={() => setSelectedTheme('midnight')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedTheme === 'midnight'
                    ? 'bg-[#07140F] text-slate-100 border-emerald-400 shadow-xs ring-2 ring-emerald-400/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {t.themeMidnight}
              </button>
            </div>
          </div>

          {/* Card Live Preview Container */}
          <div
            ref={cardPreviewRef}
            className={`p-6 sm:p-8 rounded-3xl border transition-all shadow-xl space-y-6 ${
              selectedTheme === 'emerald'
                ? 'bg-[#062B21] border-emerald-600/40 text-emerald-50'
                : selectedTheme === 'midnight'
                ? 'bg-[#07140F] border-emerald-800/50 text-slate-100'
                : 'bg-[#FAF8F5] border-amber-600/20 text-slate-900'
            }`}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b pb-3 border-current/15">
              <div className="flex items-center gap-2">
                <span className="text-amber-500">✦</span>
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                  Hidaya
                </span>
                <span className="text-[11px] opacity-70">
                  • Quran Guidance
                </span>
              </div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Surah {verse.surahNameTransliterated} ({verse.id})
              </div>
            </div>

            {/* Arabic Uthmani Text */}
            <div className="py-2 text-center">
              <p
                dir="rtl"
                className="font-arabic text-2xl sm:text-3xl leading-loose font-normal text-amber-800 dark:text-amber-200"
              >
                {verse.arabicText}
              </p>
            </div>

            {/* Translation */}
            <div className="text-center max-w-xl mx-auto space-y-1">
              <p className="font-serif italic text-sm sm:text-base leading-relaxed opacity-95">
                &ldquo;{translationObj.text}&rdquo;
              </p>
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 pt-1">
                {translationObj.translator}
              </p>
            </div>

            {/* Card Footer */}
            <div className="pt-2 border-t border-current/15 flex items-center justify-between text-[10px] opacity-60">
              <span>Verified Uthmani Text • Tanzil Standard</span>
              <span>hidaya.app</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-emerald-900/10 dark:border-emerald-800/30 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-emerald-950/40">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-emerald-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.copiedText : t.copyText}</span>
            </button>
            <button
              onClick={handleCopyImage}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-emerald-800/30 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.copyImage}</span>
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Rendering...' : t.downloadPNG}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
