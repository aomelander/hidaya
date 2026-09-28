"use client";

/**
 * @file ServiceWorkerRegistration.tsx
 * @description Registers the Progressive Web App service worker on client mount,
 * avoiding React 19 script-tag rendering warnings.
 */

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.location.protocol.startsWith('http')
    ) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.debug('[ServiceWorker] registration omitted or failed:', err);
        });
      });
    }
  }, []);

  return null;
}
