"use client";

/**
 * @file src/components/VoiceSearchButton.tsx
 * @description Multilingual Voice Search button supporting Arabic (ar-SA), Swedish (sv-SE),
 * French (fr-FR), and English (en-US) via Web Speech API with RTL layout support and localized error feedback.
 */

import React, { useState, useCallback, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Sparkles, X } from 'lucide-react';
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
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  locale,
  onTranscript,
  isListening: controlledListening,
  onToggleVoice,
  className = '',
  errorMessage: externalErrorMessage,
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

  const handleSampleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    const sample =
      locale === 'ar'
        ? 'الصبر والسكينة عند نزول البلاء والهم'
        : locale === 'sv'
        ? 'tålamod vid svårigheter och sorg'
        : locale === 'fr'
        ? 'la patience face aux épreuves et la tristesse'
        : 'patience in times of hardship and grief';
    onTranscript?.(sample);
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleVoiceTrigger}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        className={`min-h-[40px] min-w-[40px] p-2 rounded-xl flex items-center justify-center gap-1.5 rtl:space-x-reverse transition-all cursor-pointer shrink-0 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse px-3 shadow-md shadow-red-500/20'
            : 'text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-900/10'
        } ${className}`}
        title={isListening ? dict.voiceSearchActive : dict.searchPlaceholder}
        aria-label={isListening ? dict.voiceSearchActive : dict.searchButton}
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
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              {locale === 'ar'
                ? 'يمكنك تجربة محاكاة الإدخال الصوتي بعبارة نموذجية مباشرة:'
                : locale === 'sv'
                ? 'Du kan testa röstsökning direkt med en förvald reflektionsfras:'
                : locale === 'fr'
                ? 'Vous pouvez tester directement avec une requête vocale exemplaire :'
                : 'You can test voice search with a sample reflection query:'}
            </p>
            <button
              type="button"
              onClick={handleSampleClick}
              className="w-full py-1.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {locale === 'ar'
                  ? 'تجربة استفسار صوتي نموذجي'
                  : locale === 'sv'
                  ? 'Testa med exempelreflektion'
                  : locale === 'fr'
                  ? 'Essayer avec un exemple'
                  : 'Try sample voice query'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
