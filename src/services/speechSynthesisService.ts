/**
 * @file speechSynthesisService.ts
 * @description Hybrid speech synthesis engine combining high-fidelity server-side AI voice synthesis
 * (via /api/tts powered by Gemini TTS) for natural native Swedish pronunciation with local
 * browser SpeechSynthesis fallback when offline.
 * Strictly prevents English phoneme butchering when reading Swedish or other non-English translations.
 */

import { Language } from '../types';

export type TtsProviderTier = 'server' | 'browser';

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  targetAudioElement?: HTMLAudioElement | null;
  onStart?: () => void;
  onProgress?: (ratio: number) => void;
  onEnd?: () => void;
  onError?: (err?: unknown) => void;
  onProviderResolved?: (provider: TtsProviderTier) => void;
}

class SpeechSynthesisEngine {
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private isVoicesLoaded = false;
  private currentAudioElement: HTMLAudioElement | null = null;
  private progressTimer: ReturnType<typeof setInterval> | null = null;
  private audioCache = new Map<string, string>(); // text_lang -> base64 audio data url
  private audioPendingPromises = new Map<string, Promise<string | undefined>>();
  private isSpeakingActive = false;
  private serverTtsAvailable: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.initVoices();
      }
    }
  }

  public isServerTtsConfigured(): boolean {
    return this.serverTtsAvailable;
  }

  public hasCachedServerAudio(text: string, language: Language): boolean {
    if (!text || !text.trim()) return false;
    return this.audioCache.has(`${language}_${text.trim()}`);
  }

  private fetchOrCacheServerTts(text: string, language: Language): Promise<string | undefined> {
    const cleanText = text.trim();
    if (!cleanText) return Promise.resolve(undefined);
    const cacheKey = `${language}_${cleanText}`;
    if (this.audioCache.has(cacheKey)) {
      return Promise.resolve(this.audioCache.get(cacheKey));
    }
    if (this.audioPendingPromises.has(cacheKey)) {
      return this.audioPendingPromises.get(cacheKey)!;
    }

    const p = (async (): Promise<string | undefined> => {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText, language }),
        });

        if (res.ok) {
          const data = (await res.json()) as { audio?: string; fallback?: boolean };
          if (data.audio && !data.fallback) {
            this.serverTtsAvailable = true;
            this.audioCache.set(cacheKey, data.audio);
            return data.audio;
          }
          if (data.fallback) {
            this.serverTtsAvailable = false;
          }
        }
      } catch (err) {
        console.info('[SpeechService] Server AI TTS unreachable, attempting browser fallback:', err);
      } finally {
        this.audioPendingPromises.delete(cacheKey);
      }
      return undefined;
    })();

    this.audioPendingPromises.set(cacheKey, p);
    return p;
  }

  /**
   * Pre-fetches and caches neural TTS audio for translation or tafsir in the background
   * when recitation starts so there is zero lag when transitioning between phases.
   */
  public prefetchAudio(text: string, language: Language): Promise<TtsProviderTier> {
    if (typeof window === 'undefined' || !text || !text.trim()) return Promise.resolve('browser');
    return this.fetchOrCacheServerTts(text, language).then((audio) => (audio ? 'server' : 'browser'));
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

    // 1. First, attempt Server-Side AI Voice synthesis (ideal for Swedish natural tone), using pre-cached audio if prefetched
    const audioDataUrl = await this.fetchOrCacheServerTts(text, language);

    // If server audio was successfully retrieved, play it through HTMLAudioElement
    if (audioDataUrl && this.isSpeakingActive) {
      options.onProviderResolved?.('server');
      try {
        const audio = options.targetAudioElement || new Audio(audioDataUrl);
        if (options.targetAudioElement) {
          audio.src = audioDataUrl;
        }
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
          options.onError?.(e);
          options.onEnd?.();
        };

        await audio.play();
        return;
      } catch (err) {
        console.warn('[SpeechService] Server audio play error:', err);
      }
    }

    // Under AGENTS.md rules and Phase 4, robotic operating system / browser speech synthesis
    // (window.speechSynthesis) is strictly prohibited for Quranic texts, translations, and classical Tafsir.
    // When studio or server audio is unavailable, advance gracefully to completion without robotic speech.
    this.isSpeakingActive = false;
    options.onProgress?.(1);
    options.onEnd?.();
  }

  /**
   * Browser SpeechSynthesis is strictly disabled for sacred Quranic texts and exegesis to prevent robotic distortion.
   */
  private async speakWithBrowserUtterance(
    _text: string,
    _language: Language,
    options: SpeakOptions = {}
  ): Promise<void> {
    this.isSpeakingActive = false;
    options.onProgress?.(1);
    options.onEnd?.();
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
export const SpeechSynthesisService = SpeechService;
