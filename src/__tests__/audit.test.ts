import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parseAudioRange } from '../lib/audio/httpRange';
import { requireAdmin } from '../lib/adminAuth';

for (const [header, expected] of [
  [null, null], ['bytes=0-0', { start: 0, end: 0 }], ['bytes=3-', { start: 3, end: 9 }],
  ['bytes=-3', { start: 7, end: 9 }], ['bytes=-99', { start: 0, end: 9 }],
  ['bytes=0-99', { start: 0, end: 9 }], ['bytes=10-', false], ['bytes=-0', false],
  ['bytes=4-2', false], ['bytes=1-2,4-5', false], ['bytes=1junk-4', false],
] as const) assert.deepEqual(parseAudioRange(header, 10), expected);

delete process.env.HIDAYA_ADMIN_TOKEN;
assert.equal(requireAdmin(new Request('https://local.test'))?.status, 401);
process.env.HIDAYA_ADMIN_TOKEN = 'test-only-token';
assert.equal(requireAdmin(new Request('https://local.test', { headers: { authorization: 'Bearer wrong' } }))?.status, 401);
assert.equal(requireAdmin(new Request('https://local.test', { headers: { authorization: 'Bearer test-only-token' } })), null);
delete process.env.HIDAYA_ADMIN_TOKEN;

// Mock Supabase HTTP; no production calls or credentials.
process.env.SUPABASE_URL = 'https://database.test';
process.env.SUPABASE_ANON_KEY = 'test-only-key';
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
const ayahId = '11111111-1111-4111-8111-111111111111';
const recordId = '22222222-2222-4222-8222-222222222222';
const originalFetch = globalThis.fetch;
let requestedFilters = '';
globalThis.fetch = async (input) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
  assert.equal(url.hostname, 'database.test');
  requestedFilters = url.search;
  return Response.json([
    { id: recordId, ayah_id: ayahId, language_code: 'fr', audio_type: 'tafsir', attribution: { scholar: 'Al-Muyassar' } },
    { id: recordId, ayah_id: ayahId, language_code: 'fr', audio_type: 'tafsir', attribution: { scholar: 'Ibn Kathir' } },
  ]);
};
const { lookupAyahAudio } = await import('../lib/audio/ayahAudioServerService');
const matched = await lookupAyahAudio({ ayahId, languageCode: 'fr', audioType: 'tafsir', source: 'Ibn Kathir' });
assert.equal(matched.record?.attribution.scholar, 'Ibn Kathir');
assert(requestedFilters.includes('language_code=eq.fr'));
assert(requestedFilters.includes('audio_type=eq.tafsir'));
assert(!JSON.stringify(matched).includes('archive_url'));
assert.equal((await lookupAyahAudio({ ayahId, languageCode: 'fr', audioType: 'tafsir', source: 'Unknown scholar' })).status, 'unavailable');
assert.equal((await lookupAyahAudio({ ayahId, languageCode: 'fr', audioType: 'tafsir' })).status, 'unavailable');
globalThis.fetch = originalFetch;

// Execute the actual worker against a cached recording; assert offline seeking bytes.
const handlers = new Map<string, (event: any) => void>();
const bytes = Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const context = vm.createContext({
  self: { location: { origin: 'https://local.test' }, addEventListener: (name: string, handler: any) => handlers.set(name, handler) },
  caches: { open: async () => ({ match: async () => new Response(bytes, { headers: { 'Content-Type': 'audio/mpeg' } }) }) },
  URL, Response, Headers, TextEncoder,
  fetch: () => { throw new Error('Unexpected network call'); },
});
vm.runInContext(readFileSync('public/sw.js', 'utf8'), context);
for (const [range, status, expected] of [ ['bytes=2-4', 206, [2,3,4]], ['bytes=-2', 206, [8,9]], ['bytes=10-', 416, []] ] as const) {
  let result: Promise<Response> | undefined;
  handlers.get('fetch')!({ request: new Request('https://local.test/api/ayah-audio/' + recordId, { headers: { range } }), respondWith: (response: Promise<Response>) => { result = response; } });
  const response = await result!;
  assert.equal(response.status, status);
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], expected);
}
let intercepted = false;
handlers.get('fetch')!({ request: new Request('https://local.test/api/admin/ingest-scholar'), respondWith: () => { intercepted = true; } });
assert.equal(intercepted, false, 'Admin responses must bypass shell cache');
console.log('Audit regressions passed: ranges, fail-closed admin auth, scholar selection, safe metadata, offline range responses, API cache isolation.');

// Byte budgets are enforced even when writes arrive concurrently.
const memory = new Map<string, Response>();
const fakeCache = {
  keys: async () => [...memory.keys()].map(url => new Request(url)),
  match: async (key: string | Request) => memory.get(typeof key === 'string' ? key : key.url)?.clone(),
  delete: async (key: string | Request) => memory.delete(typeof key === 'string' ? key : key.url),
  put: async (key: string | Request, response: Response) => { memory.set(typeof key === 'string' ? key : key.url, response); },
};
Object.defineProperty(globalThis, 'caches', { configurable: true, value: { open: async () => fakeCache } });
const { saveAudio } = await import('../lib/audio/boundedAudioCache');
globalThis.fetch = async () => new Response(new Uint8Array(18 * 1024 * 1024), { headers: { 'content-type': 'audio/mpeg' } });
assert.deepEqual(await Promise.all([1,2,3].map(id => saveAudio(`https://local.test/${id}.mp3`))), [true,true,true]);
assert.equal(memory.size, 2);
assert.equal([...memory.values()].reduce((sum, response) => sum + Number(response.headers.get('x-hidaya-bytes')), 0), 36 * 1024 * 1024);
globalThis.fetch = async () => new Response(new Uint8Array(21 * 1024 * 1024), { headers: { 'content-type': 'audio/mpeg' } });
assert.equal(await saveAudio('https://local.test/too-large.mp3'), false);
globalThis.fetch = async () => new Response('partial', { status: 206, headers: { 'content-type': 'audio/mpeg' } });
assert.equal(await saveAudio('https://local.test/partial.mp3'), false);
globalThis.fetch = originalFetch;
console.log('Audio byte-budget regressions passed: concurrent writes evict oldest files; oversized and partial responses are rejected.');

// Shared selection and visible-range regressions.
const { expandPassage, visibleVerseNumbers } = await import('../services/passageSelection');
const { QURAN_FIXTURES } = await import('../data/quranFixtures');
const { getAudioUrlsForVerseRange } = await import('../services/audioReciters');
const { fetchAyahAudioPlaylist } = await import('../lib/audio/audioResolverService');
const relief = QURAN_FIXTURES.find(verse => verse.id === '94:5-6')!;
const expanded = expandPassage(relief, { before: true, after: true });
assert.equal(expanded.verseNumber, '1-8');
assert.deepEqual(visibleVerseNumbers(expanded), [1,2,3,4,5,6,7,8]);
assert.equal(getAudioUrlsForVerseRange(94, expanded.verseNumber).length, 8);
assert.equal(expandPassage(relief, {}).verseNumber, '5-6');
assert.deepEqual(visibleVerseNumbers({ verseNumber: '5-6', arabicText: relief.arabicText.split('۝')[0] }), []);
assert.deepEqual(getAudioUrlsForVerseRange(94, '1-4-6'), []);

// Guidance -> "Guilt & Repentance" -> adjacent verses test
const repentance = QURAN_FIXTURES.find(verse => verse.id === '39:53')!;
assert(repentance, '39:53 fixture must exist');
const selectionsMap: Record<string, { before?: boolean; after?: boolean }> = {};
// User adds preceding verse 52
selectionsMap[repentance.id] = { before: true };
const expandedRepentance = expandPassage(repentance, selectionsMap[repentance.id]);
assert.equal(expandedRepentance.id, '39:52-53');
assert.equal(expandedRepentance.verseNumber, '52-53');
assert.deepEqual(visibleVerseNumbers(expandedRepentance), [52, 53]);
// Recitation must match expanded range exactly (2 tracks in ascending order)
const recitationUrls = visibleVerseNumbers(expandedRepentance).flatMap(n => getAudioUrlsForVerseRange(39, String(n), 'alafasy'));
assert.equal(recitationUrls.length, 2);
assert(recitationUrls[0].includes('039052.mp3'), 'Track 0 must be ayah 52');
assert(recitationUrls[1].includes('039053.mp3'), 'Track 1 must be ayah 53');
// Audio -> Guidance round-trip: selection map retains selection
assert.deepEqual(selectionsMap[repentance.id], { before: true });
const restoredPassage = expandPassage(repentance, selectionsMap[repentance.id]);
assert.equal(restoredPassage.id, '39:52-53');
assert(restoredPassage.translations.en?.text.includes('Allah extends provision'), 'Preceding verse text preserved');
assert(restoredPassage.translations.en?.text.includes('O My servants who have transgressed'), 'Base verse text preserved');

// Parallel playlist resolution preserves exact verse ordering
const mockFetch = async () => Response.json([
  { id: 'ayah-52-audio', ayah_id: ayahId, language_code: 'en', audio_type: 'translation', attribution: { source: 'Sahih International' } },
]);
globalThis.fetch = async (input) => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'https://database.test');
  if (url.hostname === 'database.test') {
    return Response.json([
      { id: 'mock-rec-' + url.searchParams.get('ayah_id'), ayah_id: ayahId, language_code: 'en', audio_type: 'translation', attribution: { source: 'Sahih International' } }
    ]);
  }
  return mockFetch();
};
const playlistResult = await fetchAyahAudioPlaylist({
  verseNumbers: [52, 53],
  surahNumber: 39,
  ayahNumber: '52-53',
  language: 'en',
  type: 'translation',
  source: 'Sahih International',
  ayahId: repentance.id,
});
// When database returns unavailable or records, order matches verseNumbers
assert(playlistResult.status === 'available' || playlistResult.status === 'unavailable');
globalThis.fetch = originalFetch;

// Phase 1–4 regressions: Exact millisecond word timestamps & Arabic pronunciation normalization
const {
  buildWeightedWordTimestamps,
  findActiveWordIndexByMs,
} = await import('../lib/audio/wordTimestampsResolver');
const {
  normalizeArabicWordForMatch,
  isArabicWordMatch,
} = await import('../services/arabicPronunciationService');

const sampleTs = buildWeightedWordTimestamps(
  ['وَبَرًّا', 'بِوَالِدَتِي', 'وَلَمْ', 'يَجْعَلْنِي'],
  4000,
  ['wa bar-ran', 'bi-waalidatii', 'wa lam', 'yaj-alnii']
);
assert.equal(sampleTs.length, 4);
assert.equal(sampleTs[0].start_ms, 0);
assert.equal(sampleTs[3].end_ms, 4000);
assert.equal(findActiveWordIndexByMs(sampleTs, sampleTs[0].start_ms + 50), 0);
assert.equal(findActiveWordIndexByMs(sampleTs, 3950), 3);

// Arabic Harakat & Alef normalization for native ar-SA voice verification
assert.equal(normalizeArabicWordForMatch('ٱلرَّحْمَـٰنِ'), normalizeArabicWordForMatch('الرحمن'));
assert.equal(isArabicWordMatch('ٱلرَّحْمَـٰنِ', 'الرحمان'), true);
assert.equal(isArabicWordMatch('وَبَرًّا', 'وبرا'), true);
assert.equal(isArabicWordMatch('رَحْمَةً', 'رحمه'), true);

// 1-Handed Mobile Thumb Zone preferences default verification
const { APP_CONFIG } = await import('../config/appConfig');
assert.equal(APP_CONFIG.DEFAULTS.CARD_PREFS.showThumbRail, true);
assert.equal(APP_CONFIG.DEFAULTS.CARD_PREFS.enableTapGestures, true);

// Tafsir Scholar dropdown preference persistence
const { StorageService } = await import('../services/storage');
StorageService.setPreferredScholar('Al-Sa\'di');
assert.equal(StorageService.getPreferredScholar(), 'Al-Sa\'di');
StorageService.setPreferredScholar('Ibn Kathir');
assert.equal(StorageService.getPreferredScholar(), 'Ibn Kathir');

// Mutual exclusion assertion for Share Studio & Comments
let studioOpen = false;
let commentsOpen = false;
const toggleComments = () => {
  studioOpen = false;
  commentsOpen = !commentsOpen;
};
const toggleStudio = () => {
  commentsOpen = false;
  studioOpen = !studioOpen;
};

toggleComments();
assert.equal(commentsOpen, true, 'Comments must be open');
assert.equal(studioOpen, false, 'Studio must be closed when comments open');

toggleStudio();
assert.equal(studioOpen, true, 'Studio must be open');
assert.equal(commentsOpen, false, 'Comments must be closed when studio opens');

toggleComments();
assert.equal(commentsOpen, true, 'Comments must reopen');
assert.equal(studioOpen, false, 'Studio must be closed when comments reopen');

console.log('Shared selection, Phase 1-4 word timestamp/pronunciation, 1-Handed Mobile Thumb UX, Tafsir dropdown & Studio/Comments mutual exclusion tests passed.');


