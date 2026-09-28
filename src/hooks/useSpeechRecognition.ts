"use client";

/**
 * @file useSpeechRecognition.ts
 * @description Custom hook for Web Speech API integration, with voice input lifecycle,
 * localized language adaptation, and gentle mock fallback for unsupported browsers.
 */

import { useState, useCallback } from 'react';
import { Language } from '../types';

interface UseSpeechRecognitionOptions {
  language: Language;
  onResult: (transcript: string) => void;
}

export function useSpeechRecognition({ language, onResult }: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  });

  const toggleVoiceInput = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      // Gentle simulation fallback for demonstration
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const sampleQuery =
          language === 'sv'
            ? 'Jag känner vrede och stress över orättvis kritik på jobbet'
            : language === 'fr'
            ? 'Je me sens en colère et submergé par les critiques au travail'
            : 'I feel angry and overwhelmed by unfair criticism at work';
        onResult(sampleQuery);
      }, 1400);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'sv' ? 'sv-SE' : language === 'fr' ? 'fr-FR' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            onResult(transcript);
          }
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('[useSpeechRecognition] Failed to start recognition:', err);
      setIsListening(false);
    }
  }, [language, onResult]);

  return {
    isListening,
    hasSpeechSupport,
    toggleVoiceInput,
  };
}
