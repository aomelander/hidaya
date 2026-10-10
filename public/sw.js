// Hidaya Multi-Tier Offline Service Worker (v2)
// Caches App Shell, Verified Quranic Passages & Translations (en, sv, fr, ar),
// and Optional Per-Verse Audio Recitations for Offline Access.

const SHELL_CACHE = 'hidaya-shell-v3';
const PASSAGES_CACHE = 'hidaya-passages-v3';
const AUDIO_CACHE = 'hidaya-audio-v3';
const METADATA_CACHE = 'hidaya-audio-metadata-v3';
const ALL_CACHES = [SHELL_CACHE, PASSAGES_CACHE, AUDIO_CACHE, METADATA_CACHE];
let metadataWrite = Promise.resolve();

// Serialize writes so concurrent refreshes cannot exceed the 10 MiB bucket budget.
let cacheWrite = Promise.resolve();
function boundedPut(cache, key, response) {
  const write = async () => {
    if (response.status !== 200 || !response.body) return;
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2 * 1024 * 1024) { await reader.cancel(); return; }
      chunks.push(value);
    }
    await cache.delete(key);
    const entries = [];
    let total = 0;
    for (const request of await cache.keys()) {
      const item = await cache.match(request);
      const bytes = Number(item?.headers.get('x-hidaya-bytes'));
      if (!Number.isSafeInteger(bytes) || bytes <= 0) { await cache.delete(request); continue; }
      entries.push({ request, bytes });
      total += bytes;
    }
    while (entries.length && (total + size > 10 * 1024 * 1024 || entries.length >= 1000)) {
      const oldest = entries.shift();
      await cache.delete(oldest.request);
      total -= oldest.bytes;
    }
    const headers = new Headers(response.headers);
    headers.delete('content-encoding');
    headers.set('content-length', String(size));
    headers.set('x-hidaya-bytes', String(size));
    await cache.put(key, new Response(new Blob(chunks), { headers }));
  };
  cacheWrite = cacheWrite.catch(() => {}).then(write);
  return cacheWrite;
}

const STATIC_SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

const OFFLINE_PASSAGES_ENDPOINT = '/api/offline-passages';

// 1. INSTALL: Precache App Shell + All Built-in Verified Quranic Passages & Translations
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then(async (cache) => { for (const url of STATIC_SHELL_ASSETS) await boundedPut(cache, url, await fetch(url)); }),
      caches.open(PASSAGES_CACHE).then(async (cache) => {
        try {
          const response = await fetch(OFFLINE_PASSAGES_ENDPOINT);
          if (response && response.ok) {
            await boundedPut(cache, OFFLINE_PASSAGES_ENDPOINT, response.clone());
            const payload = await response.json();
            if (payload && Array.isArray(payload.passages)) {
              for (const verse of payload.passages) {
                const verseUrl = `/offline-data/verse/${encodeURIComponent(verse.id)}.json`;
                await boundedPut(cache,
                  verseUrl,
                  new Response(JSON.stringify(verse), {
                    headers: { 'Content-Type': 'application/json' },
                  })
                );
              }
            }
          }
        } catch (err) {
          // Client-side OfflineCacheService will also sync QURAN_FIXTURES on mount
        }
      }),
    ])
  );
  self.skipWaiting();
});

// 2. ACTIVATE: Clean up legacy v1 caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key.startsWith('hidaya-') && !ALL_CACHES.includes(key)) {
            return caches.delete(key);
          }
          return Promise.resolve(true);
        })
      )
    )
  );
  self.clients.claim();
});

// 3. MESSAGE: Handle explicit passage & audio cache commands from client UI
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === 'CACHE_PASSAGES' && Array.isArray(data.passages)) {
    event.waitUntil(
      caches.open(PASSAGES_CACHE).then(async (cache) => {
        for (const verse of data.passages) {
          if (!verse || !verse.id) continue;
          const verseUrl = `/offline-data/verse/${encodeURIComponent(verse.id)}.json`;
          await boundedPut(cache,
            verseUrl,
            new Response(JSON.stringify(verse), {
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      })
    );
  }
});

// 4. FETCH: Intelligent multi-bucket routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // A. Handle POST /api/guidance offline fallback using cached passages
  if (request.method === 'POST' && url.pathname.startsWith('/api/guidance')) {
    event.respondWith(
      fetch(request.clone()).catch(async () => {
        const body = await request.clone().json().catch(() => ({}));
        const language = url.searchParams.get('lang') || body.language || body.lang || 'en';
        const message = ({ en: 'Offline: saved Quranic passages', sv: 'Offline: sparade koranverser', fr: 'Hors ligne : passages coraniques enregistrés', ar: 'دون اتصال: آيات قرآنية محفوظة' })[language] || '';
        return new Response(
          JSON.stringify({
            status: 'matched',
            source: 'offline_fallback',
            data: {
              selectedAyahIds: ['3:134', '94:5-6', '13:28'],
              reasoning: message,
              reflectionPrompt: '',
            },
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Only intercept GET requests beyond this point
  if (request.method !== 'GET') return;

  if (url.origin === self.location.origin && url.pathname === '/api/ayah-audio/metadata') {
    event.respondWith((async () => {
      const cache = await caches.open(METADATA_CACHE);
      try {
        const response = await fetch(request);
        const body = await response.clone().text();
        if (response.ok && new TextEncoder().encode(body).length <= 8192) {
          metadataWrite = metadataWrite.catch(() => {}).then(async () => {
            await cache.delete(request);
            const keys = await cache.keys();
            while (keys.length >= 100) await cache.delete(keys.shift());
            await boundedPut(cache, request, response.clone());
          });
          await metadataWrite;
        }
        return response;
      } catch {
        return (await cache.match(request)) || Response.json({ status: 'unavailable' });
      }
    })());
    return;
  }

  // B. Audio Recitations & Stored Neural Audio (.mp3 / /api/ayah-audio/[id] / everyayah.com): Cache-First if already saved in AUDIO_CACHE
  if (
    url.pathname.endsWith('.mp3') ||
    (url.pathname.startsWith('/api/ayah-audio/') && !url.pathname.includes('/metadata')) ||
    url.hostname === 'everyayah.com'
  ) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cachedAudio = await cache.match(request.url, { ignoreSearch: false });
        if (cachedAudio) {
          const header = request.headers.get('range');
          if (!header) return cachedAudio;
          const body = await cachedAudio.arrayBuffer();
          const match = /^bytes=(\d*)-(\d*)$/.exec(header);
          const size = body.byteLength;
          const start = match?.[1] ? Number(match[1]) : Math.max(0, size - Number(match?.[2]));
          const end = match?.[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
          if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start || (!match[1] && Number(match[2]) === 0)) {
            return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
          }
          const headers = new Headers(cachedAudio.headers);
          headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
          headers.set('Content-Length', String(end - start + 1));
          headers.set('Accept-Ranges', 'bytes');
          return new Response(body.slice(start, end + 1), { status: 206, headers });
        }
        return fetch(request);
      })
    );
    return;
  }

  // C. Offline Passages JSON & Virtual Verse Records: Cache-First with background refresh
  if (
    url.pathname === OFFLINE_PASSAGES_ENDPOINT ||
    url.pathname.startsWith('/offline-data/verse/')
  ) {
    event.respondWith(
      caches.open(PASSAGES_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((netRes) => {
            if (netRes && netRes.ok) {
              return boundedPut(cache, request, netRes.clone()).then(() => netRes);
            }
            return netRes;
          })
          .catch(() => cached);
        event.waitUntil(networkPromise.then(() => undefined));
        return cached || networkPromise;
      })
    );
    return;
  }

  // Cache only known shell resources. API responses must never enter this cache.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (!STATIC_SHELL_ASSETS.includes(url.pathname) && !(/^\/(?:_next|assets)\/.*\.(?:js|css|woff2?|png|svg|ico)$/.test(url.pathname))) return;
  event.respondWith(caches.open(SHELL_CACHE).then(async (cache) => {
    try {
      const response = await fetch(request);
      if (response.status === 200 && Number(response.headers.get('content-length')) <= 2 * 1024 * 1024) {
        const body = await response.clone().arrayBuffer();
        if (body.byteLength <= 2 * 1024 * 1024) await boundedPut(cache, request, response.clone());
      }
      return response;
    } catch {
      return (await cache.match(request)) || new Response('Offline', { status: 503 });
    }
  }));
});
