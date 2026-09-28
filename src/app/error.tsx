"use client";

/**
 * @file error.tsx
 * @description Route-level error boundary for the application page.
 */

import React, { useEffect } from 'react';
import { RefreshCw, Compass } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Hidaya ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-emerald-950/60 border border-emerald-900/10 dark:border-emerald-800/30 shadow-lg">
        <div className="w-12 h-12 rounded-full bg-emerald-800/10 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          Reflective Session Paused
        </h2>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          {error?.message || 'A transient issue occurred while processing the reflection.'}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Guidance</span>
        </button>
      </div>
    </div>
  );
}
