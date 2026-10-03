"use client";

/**
 * @file src/hooks/useOfflineStatus.ts
 * @description React hook tracking browser online/offline connectivity,
 * offline cache statistics (passages + audio), and PWA installability.
 */

import { useState, useEffect, useCallback } from 'react';
import { OfflineCacheService, OfflineCacheStats } from '../services/offlineCacheService';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [stats, setStats] = useState<OfflineCacheStats>({
    cachedPassagesCount: 18,
    cachedAudioCount: 0,
    isOfflineReady: true,
  });
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  const refreshStats = useCallback(async () => {
    const latest = await OfflineCacheService.getCacheStats();
    setStats(latest);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    // Precache all built-in passages & translations on initial mount
    OfflineCacheService.precacheAllBuiltInPassages().then(setStats);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleCacheUpdated = () => {
      refreshStats();
    };
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('hidaya-offline-cache-updated', handleCacheUpdated);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('hidaya-offline-cache-updated', handleCacheUpdated);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [refreshStats]);

  const installPWA = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  return {
    isOnline,
    stats,
    refreshStats,
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    installPWA,
  };
}
