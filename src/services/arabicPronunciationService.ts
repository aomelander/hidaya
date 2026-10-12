/**
 * @file src/services/arabicPronunciationService.ts
 * @description Duolingo-style 100% client-side native Arabic voice verification (`ar-SA`)
 * using the browser's `SpeechRecognition` / `webkitSpeechRecognition` API (`0 €` server cost).
 * Strips Arabic Harakat/diacritics and normalizes Alef/Ya/Ta-Marbuta variants so that
 * user recitation matches the canonical Uthmani words progressively in real time.
 */

export interface VoiceVerificationController {
  stop: () => void;
  isSupported: boolean;
}

/**
 * Normalizes an Arabic word for phonetic comparison by removing Harakat, Tatweel,
 * Quranic pause/stop symbols, and unifying Alef/Hamza/Ya/Ta-Marbuta forms.
 */
export function normalizeArabicWordForMatch(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '') // Strip Harakat, Maddah, Dagger Alif, Tatweel & Tajweed marks
    .replace(/[إأآٱٲٳ]/g, 'ا') // Normalize Alef variants
    .replace(/[ىئ]/g, 'ي')     // Normalize Alif Maqsura / Ya
    .replace(/ؤ/g, 'و')        // Normalize Waw with Hamza
    .replace(/ة/g, 'ه')        // Normalize Ta Marbuta to Ha for pause/recitation flexibility
    .replace(/[^\u0621-\u064A]/g, '')
    .trim();
}

/**
 * Checks whether two Arabic words match after Harakat & orthographic normalization,
 * including common Uthmani vs Imlai spelling differences (e.g., omitted dagger alif).
 */
export function isArabicWordMatch(targetUthmani: string, spokenWord: string): boolean {
  const normTarget = normalizeArabicWordForMatch(targetUthmani);
  const normSpoken = normalizeArabicWordForMatch(spokenWord);
  if (!normTarget || !normSpoken) return false;
  if (normTarget === normSpoken) return true;

  // Handle Uthmani words where Alef is written as dagger alif (omitted in normalized Uthmani)
  // vs standard Imlai returned by SpeechRecognition (e.g. رحمن vs رحمان, هذا vs هاذا, ذلك vs ذالك)
  const targetNoAlef = normTarget.replace(/ا/g, '');
  const spokenNoAlef = normSpoken.replace(/ا/g, '');
  if (targetNoAlef.length >= 2 && targetNoAlef === spokenNoAlef) {
    return true;
  }

  return false;
}

/**
 * Returns true if the current browser supports Web Speech API SpeechRecognition.
 * (Returns false on LG WebOS Smart TVs without mic/SpeechRecognition support.)
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

/**
 * Starts continuous Arabic (`ar-SA`) speech recognition and matches spoken words
 * sequentially against `targetArabicWords`.
 */
export function startArabicVoiceVerification(params: {
  targetArabicWords: string[];
  initialMatchedIndex?: number;
  onWordMatched: (matchedUpToIndex: number, spokenTranscript: string) => void;
  onTranscriptUpdate?: (transcript: string) => void;
  onComplete?: () => void;
  onError?: (errorMsg: string) => void;
}): VoiceVerificationController {
  const {
    targetArabicWords,
    initialMatchedIndex = -1,
    onWordMatched,
    onTranscriptUpdate,
    onComplete,
    onError,
  } = params;

  if (!isSpeechRecognitionSupported()) {
    onError?.('SpeechRecognition not supported on this device');
    return { stop: () => {}, isSupported: false };
  }

  const SpeechRecognitionCtor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognitionCtor();
  recognition.lang = 'ar-SA';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;

  let currentTargetIdx = initialMatchedIndex + 1;
  let stopped = false;

  recognition.onresult = (event: any) => {
    if (stopped) return;
    let combinedTranscript = '';
    for (let i = 0; i < event.results.length; i++) {
      combinedTranscript += ' ' + event.results[i][0].transcript;
    }
    const cleanTranscript = combinedTranscript.trim();
    onTranscriptUpdate?.(cleanTranscript);

    const spokenTokens = cleanTranscript.split(/\s+/).filter(Boolean);
    for (const token of spokenTokens) {
      if (currentTargetIdx >= targetArabicWords.length) break;
      if (isArabicWordMatch(targetArabicWords[currentTargetIdx], token)) {
        onWordMatched(currentTargetIdx, cleanTranscript);
        currentTargetIdx++;
      }
    }

    if (currentTargetIdx >= targetArabicWords.length && targetArabicWords.length > 0) {
      stopped = true;
      try {
        recognition.stop();
      } catch {
        // Ignore stop error
      }
      onComplete?.();
    }
  };

  recognition.onerror = (event: any) => {
    if (stopped) return;
    if (event?.error && event.error !== 'no-speech' && event.error !== 'aborted') {
      onError?.(String(event.error));
    }
  };

  recognition.onend = () => {
    // Ended naturally
  };

  try {
    recognition.start();
  } catch (err: any) {
    onError?.(err?.message || 'Failed to start microphone');
  }

  return {
    isSupported: true,
    stop: () => {
      stopped = true;
      try {
        recognition.stop();
      } catch {
        // Ignore stop errors
      }
    },
  };
}
