/**
 * @file speechSynthesisService.ts
 * @description Hybrid speech synthesis engine combining high-fidelity server-side AI voice synthesis
 * (via /api/tts powered by Gemini TTS) for natural native Swedish pronunciation with local
 * browser SpeechSynthesis fallback when offline.
 * Strictly prevents English phoneme butchering when reading Swedish or other non-English translations.
 */

import { Language } from '../types';

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onProgress?: (ratio: number) => void;
  onEnd?: () => void;
  onError?: (err?: unknown) => void;
}

class SpeechSynthesisEngine {
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private isVoicesLoaded = false;
  private currentAudioElement: HTMLAudioElement | null = null;
  private progressTimer: ReturnType<typeof setInterval> | null = null;
  private audioCache = new Map<string, string>(); // text_lang -> base64 audio data url
  private isSpeakingActive = false;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.initVoices();
      }
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
   * Ensures Swedish text is NEVER matched with an English voice.
   */
  public async getBestVoice(language: Language): Promise<SpeechSynthesisVoice | null> {
    const voices = await this.getAvailableVoices();
    if (!voices || voices.length === 0) return null;

    const targetPrefix =
      language === 'sv' ? 'sv' : language === 'fr' ? 'fr' : language === 'ar' ? 'ar' : 'en';

    const matchingVoices = voices.filter((v) => {
      const langLower = v.lang.toLowerCase().replace('_', '-');
      return (
        langLower.startsWith(targetPrefix) ||
        (language === 'sv' && (v.name.toLowerCase().includes('swedish') || v.name.toLowerCase().includes('svensk'))) ||
        (language === 'fr' && (v.name.toLowerCase().includes('french') || v.name.toLowerCase().includes('français')))
      );
    });

    if (matchingVoices.length === 0) {
      // Crucial: Return null instead of falling back to default English voice when language is not English
      if (language !== 'en') {
        return null;
      }
      return voices[0] || null;
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
      'klara',
      'astrid',
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
   * Speaks text prioritizing server-side AI voice synthesis for natural Swedish/multilingual audio.
   * Gracefully falls back to browser TTS if offline or if API is unconfigured.
   */
  public async speak(
    text: string,
    language: Language,
    options: SpeakOptions = {}
  ): Promise<void> {
    if (typeof window === 'undefined') {
      options.onEnd?.();
      return;
    }

    if (!text || !text.trim()) {
      options.onEnd?.();
      return;
    }

    // Stop any existing speech or audio
    this.cancel();
    this.isSpeakingActive = true;

    // In Arabic mode, authentic studio recitation is prioritized over TTS
    if (language === 'ar') {
      const isArabicChar = /[\u0600-\u06FF]/.test(text);
      if (!isArabicChar) {
        this.isSpeakingActive = false;
        options.onEnd?.();
        return;
      }
    }

    // 1. First, attempt Server-Side AI Voice synthesis (ideal for Swedish natural tone)
    const cacheKey = `${language}_${text.trim()}`;
    let audioDataUrl = this.audioCache.get(cacheKey);

    if (!audioDataUrl) {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.trim(), language }),
        });

        if (res.ok) {
          const data = (await res.json()) as { audio?: string; fallback?: boolean };
          if (data.audio && !data.fallback) {
            audioDataUrl = data.audio;
            this.audioCache.set(cacheKey, audioDataUrl);
          }
        }
      } catch (err) {
        console.info('[SpeechService] Server AI TTS unreachable, attempting browser fallback:', err);
      }
    }

    // If server audio was successfully retrieved, play it through HTMLAudioElement
    if (audioDataUrl && this.isSpeakingActive) {
      try {
        const audio = new Audio(audioDataUrl);
        this.currentAudioElement = audio;

        audio.onplay = () => {
          options.onStart?.();
          options.onProgress?.(0);
        };

        audio.ontimeupdate = () => {
          if (audio.duration && audio.duration > 0) {
            const ratio = Math.min(1, Math.max(0, audio.currentTime / audio.duration));
            options.onProgress?.(ratio);
          }
        };

        audio.onended = () => {
          options.onProgress?.(1);
          this.isSpeakingActive = false;
          this.currentAudioElement = null;
          options.onEnd?.();
        };

        audio.onerror = (e) => {
          console.warn('[SpeechService] HTML5 Audio playback error:', e);
          this.isSpeakingActive = false;
          this.currentAudioElement = null;
          // Fall back to browser utterance
          this.speakWithBrowserUtterance(text, language, options);
        };

        await audio.play();
        return;
      } catch (err) {
        console.warn('[SpeechService] Audio play error, falling back to browser SpeechSynthesis:', err);
      }
    }

    // 2. Fallback to Browser SpeechSynthesis with strict language enforcement
    if (this.isSpeakingActive) {
      this.speakWithBrowserUtterance(text, language, options);
    }
  }

  /**
   * Safe browser speech utterance fallback with strict native voice requirements.
   */
  private async speakWithBrowserUtterance(
    text: string,
    language: Language,
    options: SpeakOptions = {}
  ): Promise<void> {
    if (!('speechSynthesis' in window)) {
      this.isSpeakingActive = false;
      options.onEnd?.();
      return;
    }

    try {
      const voice = await this.getBestVoice(language);

      // CRITICAL GUARDRAIL: If language is Swedish and no Swedish voice is installed on the device,
      // DO NOT pass Swedish text to an English TTS engine (this causes horrific English phoneme reading).
      if (language === 'sv' && !voice) {
        console.warn(
          '[SpeechService] No native Swedish voice found in browser. Suppressing playback to prevent English butchering.'
        );
        this.isSpeakingActive = false;
        options.onError?.(
          new Error('Ingen svensk röst hittades på din enhet. Aktivera svenskt talspråk i webbläsarens inställningar.')
        );
        options.onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);

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

      const rate = options.rate ?? 0.92;
      utterance.rate = rate;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      const totalChars = Math.max(1, text.length);
      const wordsCount = Math.max(1, text.trim().split(/\s+/).length);
      // Estimate duration (~360ms per word at rate 1.0) for smooth pacing fallback if onboundary doesn't fire
      const estimatedDurationMs = Math.max(1200, (wordsCount * 370) / Math.max(0.5, rate));
      let startTime = Date.now();
      let boundaryFired = false;

      const clearTimer = () => {
        if (this.progressTimer) {
          clearInterval(this.progressTimer);
          this.progressTimer = null;
        }
      };

      utterance.onstart = () => {
        startTime = Date.now();
        options.onStart?.();
        options.onProgress?.(0);
        clearTimer();
        this.progressTimer = setInterval(() => {
          if (!this.isSpeakingActive) {
            clearTimer();
            return;
          }
          if (!boundaryFired) {
            const elapsed = Date.now() - startTime;
            const estRatio = Math.min(0.98, Math.max(0, elapsed / estimatedDurationMs));
            options.onProgress?.(estRatio);
          }
        }, 70);
      };

      utterance.onboundary = (event) => {
        if (typeof event.charIndex === 'number') {
          boundaryFired = true;
          const ratio = Math.min(1, Math.max(0, event.charIndex / totalChars));
          options.onProgress?.(ratio);
        }
      };

      utterance.onend = () => {
        clearTimer();
        options.onProgress?.(1);
        this.isSpeakingActive = false;
        options.onEnd?.();
      };

      utterance.onerror = (err) => {
        clearTimer();
        this.isSpeakingActive = false;
        options.onError?.(err);
        options.onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      this.isSpeakingActive = false;
      console.error('[SpeechService] Browser TTS failed:', err);
      options.onError?.(err);
      options.onEnd?.();
    }
  }

  /**
   * Immediately stops any active speech or server audio playback.
   */
  public cancel(): void {
    this.isSpeakingActive = false;

    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }

    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // Ignore pause errors
      }
      this.currentAudioElement = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore cancel errors
      }
    }
  }

  /**
   * Returns whether speech is currently playing.
   */
  public isSpeaking(): boolean {
    return (
      this.isSpeakingActive ||
      (typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        window.speechSynthesis.speaking)
    );
  }
}

export const SpeechService = new SpeechSynthesisEngine();
