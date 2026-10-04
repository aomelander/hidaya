"use client";

/**
 * @file useSpeechRecognition.ts
 * @description Custom hook for Web Speech API integration, with voice input lifecycle,
 * streaming interim transcriptions in real time, and localized language adaptation (ar-SA, sv-SE, fr-FR, en-US).
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
  const [hasSpeechSupport, setHasSpeechSupport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  });

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

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  }, []);

  const toggleVoiceInput = useCallback(() => {
    if (typeof window === 'undefined') return;
    setSpeechError(null);
    const dict = getDictionary(language);

    // If already listening, stop recording immediately and let onend finalize
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      const unsupportedMsg =
        language === 'ar'
          ? 'متصفحك لا يدعم التعرف الصوتي المباشر'
          : language === 'sv'
          ? 'Webbläsaren stöder inte röstigenkänning'
          : language === 'fr'
          ? 'Votre navigateur ne prend pas en charge la reconnaissance vocale'
          : 'Your browser does not support Web Speech recognition';
      setSpeechError(unsupportedMsg);
      return;
    }

    try {
      latestTranscriptRef.current = '';
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = SPEECH_LANG_MAP[language] || 'en-US';
      recognition.interimResults = true; // Stream words in real-time as user speaks
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
          latestTranscriptRef.current = ''; // Consumed
          onResult(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        const errType = event?.error;

        if (errType === 'not-allowed' || errType === 'permission-denied' || errType === 'service-not-allowed') {
          setSpeechError(
            language === 'ar'
              ? 'تم حظر الميكروفون (في إعدادات المتصفح أو إطار المعاينة). يمكنك تجربة العبارة النموذجية بالأسفل.'
              : language === 'sv'
              ? 'Mikrofonen är blockerad i webbläsaren eller förhandsgranskningsfönstret. Du kan testa med exempelsökning.'
              : language === 'fr'
              ? 'Microphone bloqué dans le navigateur ou la prévisualisation. Vous pouvez tester avec une phrase exemple.'
              : 'Microphone blocked by browser or preview iframe. You can test with a sample voice search below.'
          );
        } else if (errType === 'no-speech') {
          if (!latestTranscriptRef.current) {
            setSpeechError(
              language === 'ar'
                ? 'لم يُسمع أي صوت. تحدث بوضوح بالقرب من الميكروفون.'
                : language === 'sv'
                ? 'Inget tal uppfattades. Försök tala närmare mikrofonen.'
                : language === 'fr'
                ? 'Aucune voix détectée. Veuillez parler plus près du micro.'
                : 'No speech detected. Please speak closer to your microphone.'
            );
          }
        } else if (errType === 'audio-capture') {
          setSpeechError(
            language === 'ar'
              ? 'تعذر العثور على ميكروفون متصل بجهازك.'
              : language === 'sv'
              ? 'Ingen mikrofon hittades på enheten.'
              : language === 'fr'
              ? 'Aucun microphone détecté sur votre appareil.'
              : 'No microphone found on your device.'
          );
        } else if (errType === 'network') {
          setSpeechError(
            language === 'ar'
              ? 'خطأ في الاتصال بخدمة التعرف الصوتي.'
              : language === 'sv'
              ? 'Nätverksfel vid röstigenkänning.'
              : language === 'fr'
              ? 'Erreur réseau lors de la reconnaissance vocale.'
              : 'Speech recognition network error.'
          );
        } else if (errType !== 'aborted') {
          setSpeechError(event?.error || 'Speech recognition error');
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
      console.warn('[useSpeechRecognition] Failed to start recognition:', err);
      setIsListening(false);
      setSpeechError(dict.micUnsupported);
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
