"use client";

/**
 * @file global-error.tsx
 * @description Global error boundary for Hidaya Next.js App Router.
 * Captures uncaught application errors and provides graceful recovery.
 */

import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-emerald-950/60 border border-emerald-900/10 dark:border-emerald-800/30 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            Something unexpected occurred
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            {error?.message || 'We encountered a momentary issue while loading the guidance portal.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry / Recover</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
