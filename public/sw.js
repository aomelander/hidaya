// Hidaya Multi-Tier Offline Service Worker (v2)
// Caches App Shell, Verified Quranic Passages & Translations (en, sv, fr, ar),
// and Optional Per-Verse Audio Recitations for Offline Access.

const SHELL_CACHE = 'hidaya-shell-v2';
const PASSAGES_CACHE = 'hidaya-passages-v2';
const AUDIO_CACHE = 'hidaya-audio-v2';
const ALL_CACHES = [SHELL_CACHE, PASSAGES_CACHE, AUDIO_CACHE];

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
      caches.open(SHELL_CACHE).then((cache) => cache.addAll(STATIC_SHELL_ASSETS)),
      caches.open(PASSAGES_CACHE).then(async (cache) => {
        try {
          const response = await fetch(OFFLINE_PASSAGES_ENDPOINT);
          if (response && response.ok) {
            await cache.put(OFFLINE_PASSAGES_ENDPOINT, response.clone());
            const payload = await response.json();
            if (payload && Array.isArray(payload.passages)) {
              for (const verse of payload.passages) {
                const verseUrl = `/offline-data/verse/${encodeURIComponent(verse.id)}.json`;
                await cache.put(
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
          if (!ALL_CACHES.includes(key)) {
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
          await cache.put(
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
        return new Response(
          JSON.stringify({
            status: 'matched',
            source: 'offline_fallback',
            data: {
              selectedAyahIds: ['3:134', '94:5-6', '13:28'],
              reasoning: 'Offline Mode — Served from cached verified Quranic passages on your device.',
              reflectionPrompt: 'Take a quiet breath and reflect on the verses cached in your offline sanctuary.',
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

  // B. Audio Recitations & Stored Neural Audio (.mp3 / /api/ayah-audio/ / everyayah.com): Cache-First if already saved in AUDIO_CACHE
  if (
    url.pathname.endsWith('.mp3') ||
    url.pathname.startsWith('/api/ayah-audio/') ||
    url.hostname.includes('everyayah.com')
  ) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cachedAudio = await cache.match(request.url, { ignoreSearch: false });
        if (cachedAudio) {
          return cachedAudio;
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
              cache.put(request, netRes.clone());
            }
            return netRes;
          })
          .catch(() => cached);
        return cached || networkPromise;
      })
    );
    return;
  }

  // D. Google Fonts & Static Shell Assets: Stale-While-Revalidate in SHELL_CACHE
  event.respondWith(
    caches.open(SHELL_CACHE).then(async (cache) => {
      const cachedResponse = await cache.match(request);
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            (networkResponse.status === 200 || networkResponse.type === 'opaque')
          ) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
