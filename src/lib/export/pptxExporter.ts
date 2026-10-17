import { QuranVerseFixture, UserReflection, Language } from '../../types';

// Helper to prevent layout breaks from exceedingly long texts
const sanitizeText = (text: string | undefined | null, maxLength = 800) => {
  if (!text) return '';
  const clean = text.replace(/[\r\n]+/g, ' ').trim();
  return clean.length > maxLength ? clean.substring(0, maxLength) + '...' : clean;
};

export const exportSessionToPPTX = async (
  verse: QuranVerseFixture,
  language: Language,
  reflection?: UserReflection | null
): Promise<void> => {
  const { default: pptxgen } = await import('pptxgenjs');
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const translationObj = verse.translations[language] || verse.translations.en;
  const langLabel = language === 'sv' ? 'Swedish' : language === 'fr' ? 'French' : 'English';
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // Slide 1: Sacred Verse Card
  const slide1 = pptx.addSlide();
  slide1.background = { color: '0A1F18' };

  slide1.addShape(pptx.ShapeType.rect, {
    x: 0.4, y: 0.4, w: 9.2, h: 4.8,
    line: { color: 'C8A45D', width: 1.5 },
    fill: { color: '0D2820' },
  });

  slide1.addText('HIDAYA • QURAN GUIDANCE & REFLECTION', {
    x: 0.8, y: 0.65, w: 8.4, h: 0.35,
    fontSize: 10, fontFace: 'Arial', color: 'C8A45D', bold: true, align: 'center',
  });

  slide1.addText(`Surah ${verse.surahNameTransliterated} (${verse.surahNameArabic}) • Ayah ${verse.verseNumber}`, {
    x: 0.8, y: 1.0, w: 8.4, h: 0.4,
    fontSize: 14, fontFace: 'Arial', color: 'FFFFFF', bold: true, align: 'center',
  });

  slide1.addText(sanitizeText(verse.arabicText), {
    x: 0.8, y: 1.5, w: 8.4, h: 1.3,
    fontSize: 18, fontFace: 'Arial', color: 'FDFCF7', align: 'center',
  });

  slide1.addText(`"${sanitizeText(translationObj.text)}"`, {
    x: 1.0, y: 2.9, w: 8.0, h: 1.1,
    fontSize: 12, fontFace: 'Arial', color: 'E2E8F0', italic: true, align: 'center',
  });

  slide1.addText(`[Level 2 Translation: ${translationObj.translator} (${langLabel})]`, {
    x: 1.0, y: 4.05, w: 8.0, h: 0.25,
    fontSize: 8.5, fontFace: 'Arial', color: '94A3B8', align: 'center',
  });

  slide1.addText('Source-grounded reflection companion. Not a religious authority.', {
    x: 0.8, y: 4.8, w: 8.4, h: 0.25,
    fontSize: 7.5, fontFace: 'Arial', color: '64748B', align: 'center',
  });

  const filename = `Hidaya-Reflection-${verse.id.replace(':', '-')}.pptx`;
  await pptx.writeFile({ fileName: filename });
};

