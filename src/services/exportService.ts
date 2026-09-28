/**
 * @file exportService.ts
 * @description Service orchestrating presentation exports (PowerPoint PPTX) and print-friendly PDF generation
 * for the 4-step "From Quran to Life" reflection framework.
 */

import { QuranVerseFixture, UserReflection, Language } from '../types';
import { exportSessionToPPTX } from '../lib/export/pptxExporter';

export const ExportService = {
  /**
   * Generates and downloads a structured 3-slide PPTX deck with sacred verse card,
   * linguistic context, and personal reflection pillars.
   *
   * @param verse Quran verse fixture
   * @param language Active language translation
   * @param reflection Optional user's reflection notes
   */
  async exportToPPTX(
    verse: QuranVerseFixture,
    language: Language,
    reflection?: UserReflection | null
  ): Promise<void> {
    try {
      await exportSessionToPPTX(verse, language, reflection);
    } catch (err) {
      console.error('[ExportService] Failed to export presentation deck:', err);
      throw err;
    }
  },

  /**
   * Triggers the client-side print layout styled specifically for printable study cards and halaqahs.
   */
  exportToPDF(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  },
};
