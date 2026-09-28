"use client";

/**
 * @file Footer.tsx
 * @description Sacred ethical footer displaying Surah Al-Isra (17:105) and theological boundary disclaimer.
 */

import React from 'react';
import { Language } from '../types';

interface FooterProps {
  language?: Language;
}

export const Footer: React.FC<FooterProps> = ({ language = 'en' }) => {
  return (
    <footer className="mt-16 pt-8 border-t border-emerald-900/10 dark:border-emerald-800/30 text-center space-y-3 no-print">
      <div className="flex items-center justify-center gap-2">
        <span className="font-arabic text-amber-700 dark:text-amber-400 text-lg">
          وَبِالْحَقِّ أَنزَلْنَاهُ وَبِالْحَقِّ نَزَلَ
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
        &ldquo;And with the truth We have sent it down, and with the truth it has descended.&rdquo; (Al-Isra 17:105)
      </p>
      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        {language === 'ar'
          ? 'هداية دليل إرشادي إلى المصادر القرآنية والتفاسير المأثورة، وليست سلطة إفتاء أو جهة أحكام قضائية.'
          : language === 'sv'
          ? 'Hidaya är en guide till Quraniska källor, ej en fatwa-tjänst eller religiös domstol.'
          : language === 'fr'
          ? 'Hidaya est un guide vers les sources coraniques, et non une autorité de fatwa ou de juridiction.'
          : 'Hidaya is a guide to Quranic sources, not a religious authority or fatwa service.'}
      </p>
    </footer>
  );
};
