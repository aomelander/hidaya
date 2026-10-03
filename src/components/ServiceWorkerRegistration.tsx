"use client";

/**
 * @file ServiceWorkerRegistration.tsx
 * @description Registers the Progressive Web App service worker on client mount
 * and triggers initial precaching of verified Quranic passages and translations.
 */

import { useEffect } from 'react';
import { OfflineCacheService } from '../services/offlineCacheService';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.location.protocol.startsWith('http')
    ) {
      const registerAndSync = async () => {
        try {
          await navigator.serviceWorker.register('/sw.js');
          await OfflineCacheService.precacheAllBuiltInPassages();
        } catch (err) {
          console.debug('[ServiceWorker] registration omitted or failed:', err);
        }
      };

      if (document.readyState === 'complete') {
        registerAndSync();
      } else {
        window.addEventListener('load', registerAndSync, { once: true });
      }
    }
  }, []);

  return null;
}
