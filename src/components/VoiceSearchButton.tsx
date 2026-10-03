"use client";

/**
 * @file src/components/VoiceSearchButton.tsx
 * @description Multilingual Voice Search button supporting Arabic (ar-SA), Swedish (sv-SE),
 * French (fr-FR), and English (en-US) via Web Speech API with RTL layout support and localized error feedback.
 */

import React, { useState, useCallback, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
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
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  locale,
  onTranscript,
  isListening: controlledListening,
  onToggleVoice,
  className = '',
}) => {
  const [internalListening, setInternalListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const dict = getDictionary(locale);
  const isListening = controlledListening !== undefined ? controlledListening : internalListening;

  const handleVoiceTrigger = useCallback(() => {
    setErrorMessage(null);

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
      setErrorMessage(dict.micUnsupported);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = SPEECH_LANG_MAP[locale] || 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setInternalListening(true);
        setErrorMessage(null);
      };

      recognition.onend = () => {
        setInternalListening(false);
      };

      recognition.onerror = (event: any) => {
        setInternalListening(false);
        if (event?.error === 'not-allowed' || event?.error === 'permission-denied') {
          setErrorMessage(dict.micDeniedError);
        } else if (event?.error === 'not-supported') {
          setErrorMessage(dict.micUnsupported);
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
      setErrorMessage(dict.micUnsupported);
    }
  }, [locale, dict, internalListening, onToggleVoice, onTranscript]);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleVoiceTrigger}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
        className={`min-h-[40px] min-w-[40px] p-2 rounded-xl flex items-center justify-center gap-1.5 rtl:space-x-reverse transition-all cursor-pointer ${
          isListening
            ? 'bg-red-500 text-white animate-pulse px-3'
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

      {errorMessage && (
        <div
          role="alert"
          className="absolute top-full mt-2 end-0 z-30 w-56 p-2 rounded-xl bg-red-50 dark:bg-red-950/90 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 text-xs flex items-center gap-1.5 shadow-lg"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
