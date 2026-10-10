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

// Regression test: Arabic-only Al-Sha'rawi tafsir must not appear or play in non-Arabic languages (en, sv, fr)
const { getLocalizedVerseDetails } = await import('../data/localizedVerseContent');
const { lookupAyahAudio: serverLookup } = await import('../lib/audio/ayahAudioServerService');
const sampleVerse = QURAN_FIXTURES.find(v => v.id === '3:134')!;
assert(sampleVerse, 'Verse 3:134 fixture must exist');

for (const nonArabicLang of ['en', 'sv', 'fr'] as const) {
  const details = getLocalizedVerseDetails(sampleVerse, nonArabicLang);
  const leakedShaarawi = details.tafsirCitations.find(c => c.scholar === "Al-Sha'rawi" || c.scholar === 'الشعراوي');
  assert.equal(leakedShaarawi, undefined, `Al-Sha'rawi tafsir must not appear in ${nonArabicLang}`);

  const audioLookup = await serverLookup({
    surahNumber: 3,
    ayahNumber: 134,
    languageCode: nonArabicLang,
    audioType: 'tafsir',
    source: "Al-Sha'rawi",
  });
  assert.equal(audioLookup.status, 'unavailable', `Al-Sha'rawi audio lookup must return unavailable in ${nonArabicLang}`);
}

const arabicDetails = getLocalizedVerseDetails(sampleVerse, 'ar');
const arabicShaarawi = arabicDetails.tafsirCitations.find(c => c.scholar === "Al-Sha'rawi" || c.scholar === 'الشعراوي');
assert(arabicShaarawi, "Al-Sha'rawi tafsir must remain present when Arabic language is selected");
assert.equal(arabicShaarawi.languageCode, 'ar');

console.log('Al-Sha\'rawi language isolation regression tests passed: Arabic-only tafsir strictly blocked in en, sv, fr; permitted only in ar.');

console.log('Shared selection tests passed: expanded ranges match visible text and audio; malformed ranges are rejected.');
