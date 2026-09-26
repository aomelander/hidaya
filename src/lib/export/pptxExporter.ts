import pptxgen from 'pptxgenjs';
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
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const translationObj = verse.translations[language] || verse.translations.en;
  const langLabel = language === 'sv' ? 'Swedish' : language === 'fr' ? 'French' : 'English';

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

  slide1.addText(`Surah ${verse.surahNameTransliterated} (${verse.surahNameArabic}) • ${verse.id}`, {
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

  slide1.addText(`[Translation: ${translationObj.translator} (${langLabel})]`, {
    x: 1.0, y: 4.05, w: 8.0, h: 0.25,
    fontSize: 8.5, fontFace: 'Arial', color: '94A3B8', align: 'center',
  });

  slide1.addText('Source-grounded reflection companion. Not a fatwa authority.', {
    x: 0.8, y: 4.8, w: 8.4, h: 0.25,
    fontSize: 7.5, fontFace: 'Arial', color: '64748B', align: 'center',
  });

  // Slide 2: "From Quran to Life" Reflection Flow
  const slide2 = pptx.addSlide();
  slide2.background = { color: 'F8F9FA' };

  slide2.addShape(pptx.ShapeType.rect, {
    x: 0.4, y: 0.4, w: 9.2, h: 4.8,
    line: { color: 'CBD5E1', width: 1 }, fill: { color: 'FFFFFF' },
  });

  slide2.addText('FROM QURAN TO LIFE • PERSONAL CONTEMPLATION', {
    x: 0.8, y: 0.6, w: 8.4, h: 0.3,
    fontSize: 11, fontFace: 'Arial', color: '065F46', bold: true,
  });

  slide2.addText(`Passage: Surah ${verse.surahNameTransliterated} (${verse.id}) | Topics: ${verse.topics.slice(0, 3).join(', ')}`, {
    x: 0.8, y: 0.95, w: 8.4, h: 0.25,
    fontSize: 9, fontFace: 'Arial', color: '64748B',
  });

  // Step 1: Tafsir/Context (modified from earlier)
  const tafsirText = verse.tafsirCitations[0]?.text || '';
  slide2.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.35, w: 8.4, h: 0.95,
    fill: { color: 'F0FDF4' }, line: { color: 'BBF7D0', width: 0.75 },
  });
  slide2.addText(`1. CONTEXT & TAFSIR (${verse.tafsirCitations[0]?.scholar || 'Classical Source'})`, {
    x: 0.95, y: 1.45, w: 8.1, h: 0.25,
    fontSize: 9, bold: true, color: '166534',
  });
  slide2.addText(sanitizeText(tafsirText, 300), {
    x: 0.95, y: 1.7, w: 8.1, h: 0.55,
    fontSize: 8.5, color: '1E293B',
  });

  // Step 2: Reflect
  slide2.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 2.45, w: 8.4, h: 1.1,
    fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 0.75 },
  });
  slide2.addText('2. REFLECT (Self-Examination)', {
    x: 0.95, y: 2.55, w: 8.1, h: 0.25,
    fontSize: 9, bold: true, color: '1E40AF',
  });
  
  const reflectContent = reflection?.reflectNotes?.trim()
    ? `My Reflection: "${reflection.reflectNotes}"`
    : `Prompt: ${verse.reflectionFramework.reflectPrompt}`;
    
  slide2.addText(sanitizeText(reflectContent, 300), {
    x: 0.95, y: 2.8, w: 8.1, h: 0.7,
    fontSize: 8.5, color: '1E293B',
  });

  // Step 3: Apply
  slide2.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 3.7, w: 8.4, h: 1.1,
    fill: { color: 'FEF3C7' }, line: { color: 'FDE68A', width: 0.75 },
  });
  slide2.addText('3. APPLY (Actionable Daily Shift)', {
    x: 0.95, y: 3.8, w: 8.1, h: 0.25,
    fontSize: 9, bold: true, color: '92400E',
  });
  
  const applyContent = reflection?.applyNotes?.trim()
    ? `My Action Step: "${reflection.applyNotes}"`
    : `Action: ${verse.reflectionFramework.applyAction}`;
    
  slide2.addText(sanitizeText(applyContent, 300), {
    x: 0.95, y: 4.05, w: 8.1, h: 0.7,
    fontSize: 8.5, color: '1E293B',
  });

  // Footer
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  slide2.addText(`Recorded on ${dateStr} • Hidaya Quran Guidance`, {
    x: 0.8, y: 4.95, w: 8.4, h: 0.2,
    fontSize: 7.5, color: '94A3B8', align: 'right',
  });

  const filename = `Hidaya-Reflection-${verse.id.replace(':', '-')}.pptx`;
  await pptx.writeFile({ fileName: filename });
};
