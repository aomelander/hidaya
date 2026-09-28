"use client";

/**
 * @file not-found.tsx
 * @description 404 page for unmatched routes in Hidaya.
 */

import React from 'react';
import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-emerald-950/60 border border-emerald-900/10 dark:border-emerald-800/30 shadow-lg">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          Page Not Found
        </h2>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          The contemplation path you requested could not be located.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Guidance</span>
        </Link>
      </div>
    </div>
  );
}
