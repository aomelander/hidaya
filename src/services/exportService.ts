import { QuranVerseFixture, UserReflection, Language } from '../types';
import { exportSessionToPPTX } from '../lib/export/pptxExporter';

export const ExportService = {
  async exportToPPTX(
    verse: QuranVerseFixture,
    language: Language,
    reflection?: UserReflection | null
  ): Promise<void> {
    await exportSessionToPPTX(verse, language, reflection);
  },

  exportToPDF(): void {
    // Triggers client-side print layout styled specifically for reflection cards
    window.print();
  },
};
