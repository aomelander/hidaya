"use client";

/**
 * @file src/components/VoiceSearchButton.tsx
 * @description Multilingual Voice Search button supporting Arabic (ar-SA), Swedish (sv-SE),
 * French (fr-FR), and English (en-US) via Web Speech API with RTL layout support and localized error feedback.
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Mic, MicOff, AlertCircle, Sparkles, X, Keyboard } from 'lucide-react';
import { Locale, getDictionary } from '../lib/i18n/dictionaries';

export const SPEECH_LANG_MAP: Record<Locale, string> = {
  ar: 'ar-SA',
  sv: 'sv-SE',
  fr: 'fr-FR',
  en: 'en-US',
};

export interface VoiceSearchButtonProps {
  locale: Locale;
  onTranscript?: (transcript: string) => void;
  isListening?: boolean;
  onToggleVoice?: () => void;
  className?: string;
  errorMessage?: string | null;
  onOfferTypedSearch?: () => void;
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  locale,
  onTranscript,
  isListening: controlledListening,
  onToggleVoice,
  className = '',
  errorMessage: externalErrorMessage,
  onOfferTypedSearch,
}) => {
  const [internalListening, setInternalListening] = useState(false);
  const [internalErrorMessage, setInternalErrorMessage] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const recognitionRef = useRef<any>(null);

  const dict = getDictionary(locale);
  const isListening = controlledListening !== undefined ? controlledListening : internalListening;
  const activeError = !isDismissed ? externalErrorMessage || internalErrorMessage : null;

  const handleVoiceTrigger = useCallback(() => {
    setIsDismissed(false);
    setInternalErrorMessage(null);

    if (onToggleVoice) {
      onToggleVoice();
      return;
    }

    if (typeof window === 'undefined') return;

    if (internalListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop error
      }
      setInternalListening(false);
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setInternalErrorMessage(dict.micUnsupported);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = SPEECH_LANG_MAP[locale] || 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setInternalListening(true);
        setInternalErrorMessage(null);
      };

      recognition.onend = () => {
        setInternalListening(false);
      };

      recognition.onerror = (event: any) => {
        setInternalListening(false);
        if (event?.error === 'not-allowed' || event?.error === 'permission-denied') {
          setInternalErrorMessage(dict.micDeniedError);
        } else if (event?.error === 'not-supported') {
          setInternalErrorMessage(dict.micUnsupported);
        }
      };

      recognition.onresult = (event: any) => {
        if (event?.results?.[0]?.[0]?.transcript) {
          const transcript = event.results[0][0].transcript;
          onTranscript?.(transcript);
        }
      };

      recognition.start();
    } catch {
      setInternalListening(false);
      setInternalErrorMessage(dict.micUnsupported);
    }
  }, [locale, dict, internalListening, onToggleVoice, onTranscript]);

  const sampleQueries = useMemo(() => {
    if (locale === 'ar') {
      return [
        { label: 'الصبر والسكينة عند الشدائد', query: 'الصبر والسكينة عند نزول البلاء والهم' },
        { label: 'التوكل وتفريج الكرب', query: 'الرجاء والتوكل على الله عند ضيق الرزق' },
        { label: 'الرحمة ومغفرة الذنوب', query: 'آيات التوبة وسعة رحمة الله ومغفرة الذنوب' },
      ];
    }
    if (locale === 'sv') {
      return [
        { label: 'Tålamod vid svårigheter', query: 'tålamod vid svårigheter och sorg' },
        { label: 'Hopp och förtröstan', query: 'hopp och tillit till Gud i prövningar' },
        { label: 'Barmhärtighet och förlåtelse', query: 'Guds barmhärtighet och förlåtelse' },
      ];
    }
    if (locale === 'fr') {
      return [
        { label: 'Patience dans l\'épreuve', query: 'la patience face aux épreuves et la tristesse' },
        { label: 'Espoir et confiance', query: 'l\'espoir et la confiance en Dieu' },
        { label: 'Miséricorde et pardon', query: 'la miséricorde divine et le pardon des péchés' },
      ];
    }
    return [
      { label: 'Patience in hardship', query: 'patience in times of hardship and grief' },
      { label: 'Hope and trust in God', query: 'hope and trust in God during difficulty' },
      { label: 'Mercy and forgiveness', query: 'divine mercy and seeking forgiveness' },
    ];
  }, [locale]);

  const handleSelectQuery = (query: string) => {
    setIsDismissed(true);
    onTranscript?.(query);
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleVoiceTrigger}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        className={`min-h-[40px] min-w-[40px] p-2 rounded-xl flex items-center justify-center gap-1.5 rtl:space-x-reverse transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse px-3 shadow-md shadow-red-500/20'
            : 'text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-900/10'
        } ${className}`}
        title={isListening ? dict.voiceSearchActive : dict.voiceSearchButton}
        aria-label={isListening ? dict.voiceSearchActive : dict.voiceSearchButton}
        aria-pressed={isListening}
      >
        {isListening ? (
          <>
            <MicOff className="w-5 h-5 shrink-0" />
            <span className="text-xs font-semibold whitespace-nowrap ms-1 me-1 hidden sm:inline">
              {dict.voiceSearchActive}
            </span>
          </>
        ) : (
          <Mic className="w-5 h-5 shrink-0" />
        )}
      </button>

      {activeError && (
        <div
          role="alert"
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
          className="absolute top-full mt-2 end-0 z-40 w-72 sm:w-80 p-3 rounded-2xl bg-amber-50 dark:bg-[#14231E] border border-amber-300/80 dark:border-emerald-600/40 text-amber-950 dark:text-emerald-100 text-xs shadow-xl space-y-2 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <p className="font-semibold text-xs leading-snug">{activeError}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-1 border-t border-amber-200/50 dark:border-emerald-800/40 flex flex-col gap-1.5">
            {onOfferTypedSearch && (
              <button
                type="button"
                onClick={() => {
                  setIsDismissed(true);
                  onOfferTypedSearch();
                }}
                className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>
                  {locale === 'ar'
                    ? 'استخدم البحث الكتابي'
                    : locale === 'sv'
                    ? 'Skriv din sökning'
                    : locale === 'fr'
                    ? 'Saisir par écrit'
                    : 'Use Typed Search'}
                </span>
              </button>
            )}

            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              {locale === 'ar'
                ? 'أو اختر أحد الاستفسارات النموذجية:'
                : locale === 'sv'
                ? 'Eller välj en förvald reflektionsfras:'
                : locale === 'fr'
                ? 'Ou choisissez une phrase exemplaire :'
                : 'Or choose a sample reflection query:'}
            </p>
            <div className="flex flex-col gap-1 pt-1">
              {sampleQueries.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuery(item.query)}
                  className="w-full text-start py-1 px-2.5 rounded-lg bg-emerald-950/5 dark:bg-emerald-950/40 hover:bg-emerald-800 hover:text-white dark:hover:bg-emerald-700 text-[11px] font-medium flex items-center justify-between gap-1 transition cursor-pointer border border-emerald-900/10 dark:border-emerald-800/40"
                >
                  <span className="truncate">{item.label}</span>
                  <Sparkles className="w-3 h-3 shrink-0 opacity-70" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
