/**
 * @file src/config/audioConfig.ts
 * @description Centralized Audio Configuration for Hidaya.
 * Isolates audio endpoints, CDN hosts, caching budgets, and preloading policies.
 * Keeps GitHub Releases and EveryAyah as functional defaults with zero required credentials,
 * while allowing drop-in CDN proxying if desired.
 */

export interface AudioHostConfig {
  /** Base URL for Quran recitation (EveryAyah CDN) */
  recitationBaseUrl: string;
  /** Primary GitHub release asset repository */
  githubRepo: string;
  /** Optional dedicated audio CDN mirror base URL (e.g. Cloudflare Worker or Fastly proxy) */
  cdnMirrorBaseUrl?: string;
  /** Request timeout for audio metadata in milliseconds */
  metadataTimeoutMs: number;
  /** Request timeout for audio stream chunks in milliseconds */
  streamTimeoutMs: number;
  /** Maximum number of retry attempts on transient network failures */
  maxRetries: number;
  /** In-memory metadata cache TTL in milliseconds */
  metadataCacheTtlMs: number;
  /** In-memory Central Directory cache TTL in milliseconds */
  centralDirectoryCacheTtlMs: number;
  /** In-memory MP3 member cache TTL in milliseconds */
  mp3CacheTtlMs: number;
  /** Maximum cached MP3 byte ceiling across all in-memory entries (25 MB) */
  maxMp3CacheBytes: number;
}

export const AUDIO_CONFIG: AudioHostConfig = {
  recitationBaseUrl: 'https://everyayah.com/data',
  githubRepo: 'aomelander/hidaya',
  cdnMirrorBaseUrl: process.env.NEXT_PUBLIC_AUDIO_CDN_URL || undefined,
  metadataTimeoutMs: 6000,
  streamTimeoutMs: 12000,
  maxRetries: 1,
  metadataCacheTtlMs: 15 * 60 * 1000, // 15 minutes
  centralDirectoryCacheTtlMs: 30 * 60 * 1000, // 30 minutes
  mp3CacheTtlMs: 10 * 60 * 1000, // 10 minutes
  maxMp3CacheBytes: 25 * 1024 * 1024, // 25 MB
};

/**
 * Resolves the effective stream URL for a GitHub release archive asset.
 * If a CDN mirror base URL is configured, routes through the CDN; otherwise uses GitHub.
 */
export function resolveArchiveUrl(archiveUrl: string): string {
  if (!AUDIO_CONFIG.cdnMirrorBaseUrl) {
    return archiveUrl;
  }
  try {
    const parsed = new URL(archiveUrl);
    // Rewrites https://github.com/aomelander/hidaya/releases/download/... to CDN mirror
    if (parsed.hostname === 'github.com' && parsed.pathname.includes('/releases/download/')) {
      const cdnBase = AUDIO_CONFIG.cdnMirrorBaseUrl.replace(/\/+$/, '');
      return `${cdnBase}${parsed.pathname}`;
    }
    return archiveUrl;
  } catch {
    return archiveUrl;
  }
}
