import { QuranVerseFixture, Language } from '../types';

export interface PassageSelection { before?: boolean; after?: boolean }

/** Never infer playable verses whose text is absent from the displayed passage. */
export function visibleVerseNumbers(verse: Pick<QuranVerseFixture, 'verseNumber' | 'arabicText'>): number[] {
  const match = /^(\d+)(?:-(\d+))?$/.exec(verse.verseNumber.trim());
  if (!match) return [];
  const start = Number(match[1]);
  const end = Number(match[2] || match[1]);
  const parts = verse.arabicText.split('۝').map(part => part.replace(/[\u0660-\u0669\s]/g, '')).filter(Boolean);
  if (start < 1 || end > 286 || end < start || parts.length !== end - start + 1) return [];
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function expandPassage(verse: QuranVerseFixture, selection: PassageSelection = {}): QuranVerseFixture {
  const before = selection.before ? verse.surroundingVerses?.before : undefined;
  const after = selection.after ? verse.surroundingVerses?.after : undefined;
  if (!before && !after) return verse;
  const blocks = [...(before ? [before] : []), verse, ...(after ? [after] : [])];
  const numbers = blocks.flatMap(visibleVerseNumbers);
  const allValid = blocks.every(block => visibleVerseNumbers(block).length > 0);
  const contiguous = allValid && numbers.every((number, index) => !index || number === numbers[index - 1] + 1);
  const verseNumber = contiguous ? `${numbers[0]}-${numbers[numbers.length - 1]}` : blocks.map(block => block.verseNumber).join(', ');
  const translations = { ...verse.translations };
  for (const language of ['en', 'sv', 'fr', 'ar'] as Language[]) {
    const base = verse.translations[language];
    if (!base) continue;
    const texts = [...(before ? [before.translations[language]] : []), base.text, ...(after ? [after.translations[language]] : [])];
    translations[language] = { ...base, text: texts.every(text => text?.trim()) ? texts.join(' ') : '' };
  }
  return { ...verse, id: `${verse.surahNumber}:${verseNumber}`, verseNumber, arabicText: blocks.map(block => block.arabicText).join(' ۝ '), translations, transliteration: '' };
}
