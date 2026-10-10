const CACHE = 'hidaya-audio-v3';
const MAX_ENTRY = 20 * 1024 * 1024;
const MAX_TOTAL = 50 * 1024 * 1024;
let pending = Promise.resolve();

export async function saveAudio(url: string): Promise<boolean> {
  const save = async () => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (response.status !== 200 || !response.body || !response.headers.get('content-type')?.startsWith('audio/')) return false;
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_ENTRY) { await reader.cancel(); return false; }
        chunks.push(value);
      }
      if (!size) return false;
      const body = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
      const cache = await caches.open(CACHE);
      await cache.delete(url);
      let total = 0;
      const entries: { request: Request; size: number }[] = [];
      for (const request of await cache.keys()) {
        const item = await cache.match(request);
        const bytes = Number(item?.headers.get('x-hidaya-bytes'));
        if (!Number.isSafeInteger(bytes) || bytes <= 0) { await cache.delete(request); continue; }
        total += bytes;
        entries.push({ request, size: bytes });
      }
      while (total + size > MAX_TOTAL && entries.length) {
        const oldest = entries.shift()!;
        await cache.delete(oldest.request);
        total -= oldest.size;
      }
      const headers = new Headers(response.headers);
      headers.delete('content-encoding');
      headers.set('content-length', String(size));
      headers.set('x-hidaya-bytes', String(size));
      await cache.put(url, new Response(body, { headers }));
      return true;
    } catch { return false; }
  };
  if (navigator.locks) return navigator.locks.request('hidaya-audio-cache', save);
  let result = false;
  pending = pending.then(async () => { result = await save(); });
  await pending;
  return result;
}
