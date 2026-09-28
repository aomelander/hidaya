/**
 * @file speechSynthesisService.ts
 * @description Advanced browser SpeechSynthesis engine with dynamic high-quality voice selection,
 * natural cadence calibration, and strict single-language isolation.
 * Prevents language-mixing (e.g. English text sent to Swedish TTS engine) and eliminates robotic artifacts.
 */

import { Language } from '../types';

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: unknown) => void;
}

class SpeechSynthesisEngine {
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private isVoicesLoaded = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
    }
  }

  private initVoices(): void {
    const loadVoices = () => {
      this.cachedVoices = window.speechSynthesis.getVoices();
      if (this.cachedVoices.length > 0) {
        this.isVoicesLoaded = true;
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Asynchronously retrieves available voices, waiting briefly if not immediately ready.
   */
  public async getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }

    if (this.isVoicesLoaded && this.cachedVoices.length > 0) {
      return this.cachedVoices;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      this.cachedVoices = voices;
      this.isVoicesLoaded = true;
      return voices;
    }

    // Wait for voiceschanged event (up to 300ms)
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(window.speechSynthesis.getVoices());
      }, 300);

      window.speechSynthesis.onvoiceschanged = () => {
        clearTimeout(timeout);
        this.cachedVoices = window.speechSynthesis.getVoices();
        this.isVoicesLoaded = true;
        resolve(this.cachedVoices);
      };
    });
  }

  /**
   * Resolves the highest quality native voice matching the specified target language.
   * Prefers natural, neural, or enhanced operating system voices over robotic defaults.
   */
  public async getBestVoice(language: Language): Promise<SpeechSynthesisVoice | null> {
    const voices = await this.getAvailableVoices();
    if (!voices || voices.length === 0) return null;

    const targetPrefix =
      language === 'sv' ? 'sv' : language === 'fr' ? 'fr' : language === 'ar' ? 'ar' : 'en';

    const matchingVoices = voices.filter((v) =>
      v.lang.toLowerCase().startsWith(targetPrefix)
    );

    if (matchingVoices.length === 0) {
      return null;
    }

    // Quality ranking keywords
    const preferredKeywords = [
      'natural',
      'enhanced',
      'premium',
      'google',
      'siri',
      'alva',
      'oskar',
      'audrey',
      'thomas',
      'tarik',
      'maged',
      'laila',
      'samantha',
    ];

    const bestVoice = matchingVoices.find((v) => {
      const name = v.name.toLowerCase();
      return preferredKeywords.some((kw) => name.includes(kw));
    });

    return bestVoice || matchingVoices[0];
  }

  /**
   * Detects if the given text appears to be primarily English.
   * Used for guardrails against feeding English text to non-English TTS voices.
   */
  public isPrimarilyEnglish(text: string): boolean {
    if (!text || text.trim().length === 0) return false;
    // Check for common English stop words
    const englishWordMatches = text.match(/\b(the|and|who|with|from|which|what|your|how|where|reflect|understand|action|into)\b/gi);
    return !!englishWordMatches && englishWordMatches.length >= 2;
  }

  /**
   * Speaks text with strict language consistency and natural cadence.
   * If text is detected as mismatched with active language, speech is skipped safely
   * to avoid humiliating phoneme butchering.
   */
  public async speak(
    text: string,
    language: Language,
    options: SpeakOptions = {}
  ): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options.onEnd?.();
      return;
    }

    if (!text || !text.trim()) {
      options.onEnd?.();
      return;
    }

    // In Arabic mode, authentic Quran audio is prioritized; TTS only speaks if explicitly Arabic text
    if (language === 'ar') {
      const isArabicChar = /[\u0600-\u06FF]/.test(text);
      if (!isArabicChar) {
        // Refuse to play non-Arabic English text into Arabic voice
        options.onEnd?.();
        return;
      }
    }

    // In Swedish or French mode, strictly forbid playing English text into the TTS engine
    if ((language === 'sv' || language === 'fr') && this.isPrimarilyEnglish(text)) {
      console.warn(`[SpeechEngine] Suppressing mismatched English speech text in '${language}' mode.`);
      options.onEnd?.();
      return;
    }

    try {
      this.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = await this.getBestVoice(language);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang =
          language === 'sv'
            ? 'sv-SE'
            : language === 'fr'
            ? 'fr-FR'
            : language === 'ar'
            ? 'ar-SA'
            : 'en-US';
      }

      // Natural, contemplative pacing (0.92 is calm and dignified)
      utterance.rate = options.rate ?? 0.92;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      utterance.onstart = () => {
        options.onStart?.();
      };

      utterance.onend = () => {
        options.onEnd?.();
      };

      utterance.onerror = (err) => {
        console.debug('[SpeechEngine] Utterance error or cancelled:', err);
        options.onError?.(err);
        options.onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('[SpeechEngine] Failed to speak text:', err);
      options.onError?.(err);
      options.onEnd?.();
    }
  }

  /**
   * Immediately stops any active speech.
   */
  public cancel(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const SpeechService = new SpeechSynthesisEngine();
