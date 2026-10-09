"use client";

/**
 * @file useSpeechRecognition.ts
 * @description Browser-supported Web Speech API integration hook for voice input with:
 * 1. Native SpeechRecognition / webkitSpeechRecognition support (ar-SA, sv-SE, fr-FR, en-US)
 * 2. Streaming real-time interim results and final transcription dispatch
 * 3. Clear detection of voice availability and seamless fallback to typed search when unavailable
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Language } from '../types';
import { SPEECH_LANG_MAP } from '../components/VoiceSearchButton';
import { getDictionary } from '../lib/i18n/dictionaries';

interface UseSpeechRecognitionOptions {
  language: Language;
  onResult: (transcript: string) => void;
  onInterim?: (interim: string) => void;
}

export function useSpeechRecognition({ language, onResult, onInterim }: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');

  const [hasSpeechSupport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  });

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const toggleVoiceInput = useCallback(() => {
    if (typeof window === 'undefined') return;
    setSpeechError(null);

    // If already listening, stop recording
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const dict = getDictionary(language);
      setSpeechError(
        language === 'ar'
          ? 'التعرف الصوتي غير مدعوم في هذا المتصفح. يرجى استخدام البحث الكتابي أدناه.'
          : language === 'sv'
          ? 'Röstigenkänning stöds inte i denna webbläsare. Använd textbaserad sökning nedan.'
          : language === 'fr'
          ? 'La reconnaissance vocale n\'est pas prise en charge sur ce navigateur. Veuillez utiliser la recherche textuelle.'
          : 'Voice recognition is not supported in this browser. Please use typed search below.'
      );
      return;
    }

    try {
      latestTranscriptRef.current = '';
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = SPEECH_LANG_MAP[language] || 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            final += text;
          } else {
            interim += text;
          }
        }

        const currentText = (final || interim).trim();
        if (currentText) {
          latestTranscriptRef.current = currentText;
          onInterim?.(currentText);
        }

        if (final.trim()) {
          latestTranscriptRef.current = '';
          onResult(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        const errType = event?.error;

        if (
          errType === 'not-allowed' ||
          errType === 'permission-denied' ||
          errType === 'service-not-allowed'
        ) {
          setSpeechError(
            language === 'ar'
              ? 'تم حظر الميكروفون. يمكنك كتابة استفسارك مباشرة في حقل البحث.'
              : language === 'sv'
              ? 'Mikrofonen är inte tillgänglig. Du kan skriva din sökning direkt i sökfältet.'
              : language === 'fr'
              ? 'Microphone non autorisé. Vous pouvez saisir votre recherche directement dans le champ de texte.'
              : 'Microphone blocked or unavailable. You can type your search directly in the search bar.'
          );
        } else if (errType === 'no-speech') {
          if (!latestTranscriptRef.current) {
            setSpeechError(
              language === 'ar'
                ? 'لم يُسمع أي صوت. يمكنك التحدث ثانية أو كتابة استفسارك.'
                : language === 'sv'
                ? 'Inget tal uppfattades. Försök igen eller skriv din fråga.'
                : language === 'fr'
                ? 'Aucune voix détectée. Veuillez réessayer ou saisir votre recherche.'
                : 'No speech detected. Please speak closer to your mic or type your query.'
            );
          }
        } else if (errType !== 'aborted') {
          setSpeechError(
            language === 'ar'
              ? 'تعذر التعرف الصوتي. يرجى استخدام البحث الكتابي.'
              : language === 'sv'
              ? 'Röstinmatning misslyckades. Använd textbaserad sökning.'
              : language === 'fr'
              ? 'Échec de la saisie vocale. Utilisez la recherche textuelle.'
              : 'Voice recognition unavailable. Please use typed search.'
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (latestTranscriptRef.current) {
          onResult(latestTranscriptRef.current);
          latestTranscriptRef.current = '';
        }
      };

      recognition.start();
    } catch (err: any) {
      console.warn('[useSpeechRecognition] start error:', err);
      setIsListening(false);
      setSpeechError(
        language === 'ar'
          ? 'تعذر بدء التعرف الصوتي. يرجى استخدام البحث الكتابي.'
          : language === 'sv'
          ? 'Kunde inte starta röstigenkänning. Använd textbaserad sökning.'
          : language === 'fr'
          ? 'Impossible de démarrer la reconnaissance vocale. Utilisez la recherche textuelle.'
          : 'Could not start voice recognition. Please use typed search.'
      );
    }
  }, [language, isListening, onResult, onInterim, stopListening]);

  return {
    isListening,
    hasSpeechSupport,
    speechError,
    setSpeechError,
    toggleVoiceInput,
    stopListening,
  };
}
