/**
 * @file src/lib/audio/zipExtractor.ts
 * @description Safe, bounded HTTP Range extraction of ZIP_STORED (uncompressed) audio members
 * from GitHub Release archives with HTTPS-only redirect validation, path traversal protection,
 * central directory metadata caching, and bounded MP3 memory limits.
 */

export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

interface CentralDirectoryMemberEntry {
  compressionMethod: number;
  generalPurposeBitFlag: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

interface CachedCentralDirectory {
  resolvedUrl: string;
  archiveSize: number;
  members: Map<string, CentralDirectoryMemberEntry>;
  timestamp: number;
}

interface CachedMp3Entry {
  buffer: Buffer;
  timestamp: number;
  byteSize: number;
}

// Bounded memory limits for metadata and individual MP3 buffers (no 15 MB whole-archive limit)
export const EOCD_TAIL_BYTES = 65557; // 22-byte minimum EOCD + 65535-byte max comment
export const MAX_CENTRAL_DIRECTORY_BYTES = 8 * 1024 * 1024; // 8 MB max central directory metadata
export const MAX_MEMBER_AUDIO_BYTES = 20 * 1024 * 1024; // 20 MB max for a single MP3 member
export const MAX_LOCAL_HEADER_EXTRA_BYTES = 65536; // 64 KB max filename + extra field in local header
const MAX_REDIRECTS = 5;

const MAX_CACHED_CD_ARCHIVES = 30;
const CD_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const CD_CACHE = new Map<string, CachedCentralDirectory>();

const MAX_CACHED_MP3_ENTRIES = 24;
const MAX_CACHED_MP3_TOTAL_BYTES = 25 * 1024 * 1024; // 25 MB total across cached MP3s
const MP3_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MP3_CACHE = new Map<string, CachedMp3Entry>();
let currentMp3CacheBytes = 0;

const ALLOWED_ARCHIVE_HOSTS = new Set([
  'github.com',
  'objects.githubusercontent.com',
  'raw.githubusercontent.com',
  'release-assets.githubusercontent.com',
  'github-production-release-asset-2e65be.s3.amazonaws.com',
]);

export function clearZipExtractorCaches(): void {
  CD_CACHE.clear();
  MP3_CACHE.clear();
  currentMp3CacheBytes = 0;
}

/**
 * Validates that an archive URL uses HTTPS and points to a trusted GitHub release host.
 */
export function validateArchiveUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (ALLOWED_ARCHIVE_HOSTS.has(host)) {
      return true;
    }
    if (
      host.endsWith('.github.com') ||
      host.endsWith('.githubusercontent.com') ||
      (host.endsWith('.amazonaws.com') && host.includes('github-production-release-asset'))
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Validates that a member path is safe and does not attempt directory traversal.
 */
export function validateMemberPath(memberPath: string): boolean {
  if (!memberPath || typeof memberPath !== 'string') {
    return false;
  }

  // Reject backslashes, absolute paths, or path traversal components
  if (
    memberPath.includes('\\') ||
    memberPath.startsWith('/') ||
    memberPath.includes('..') ||
    memberPath.includes('\0')
  ) {
    return false;
  }

  const normalized = memberPath.trim();
  if (!normalized || normalized !== memberPath) {
    return false;
  }

  const segments = normalized.split('/');
  if (segments.some((seg) => !seg || seg === '.' || seg === '..')) {
    return false;
  }

  if (!normalized.endsWith('.mp3') && !normalized.endsWith('.json')) {
    return false;
  }

  return true;
}

/**
 * Parses HTTP Content-Range header (e.g., "bytes 100-199/50000000").
 */
export function parseContentRangeHeader(header: string | null): {
  start: number;
  end: number;
  total: number;
} | null {
  if (!header) return null;
  const match = /^bytes\s+(\d+)-(\d+)\/(\d+)$/i.exec(header.trim());
  if (!match) return null;

  const start = Number(match[1]);
  const end = Number(match[2]);
  const total = Number(match[3]);

  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    !Number.isSafeInteger(total) ||
    start < 0 ||
    end < start ||
    total <= end
  ) {
    return null;
  }

  return { start, end, total };
}

/**
 * Safely cancels a Response body stream without downloading the remaining payload.
 */
async function cancelResponseBody(res: Response): Promise<void> {
  try {
    if (res.body && typeof res.body.cancel === 'function') {
      await res.body.cancel();
    }
  } catch {
    // Ignore stream cancellation errors
  }
}

/**
 * Reads a response body with a strict byte ceiling, aborting immediately if exceeded.
 */
async function readBoundedResponseBuffer(
  res: Response,
  expectedLength: number,
  maxBytes: number
): Promise<Buffer> {
  if (expectedLength > maxBytes) {
    await cancelResponseBody(res);
    throw new Error(`Range response length ${expectedLength} exceeds maximum allowed ${maxBytes} bytes`);
  }

  const contentLengthHeader = res.headers.get('content-length');
  if (contentLengthHeader !== null) {
    const declaredLen = parseInt(contentLengthHeader, 10);
    if (!Number.isNaN(declaredLen) && declaredLen !== expectedLength) {
      await cancelResponseBody(res);
      throw new Error(
        `Range response Content-Length mismatch: declared ${declaredLen} bytes, expected ${expectedLength} bytes`
      );
    }
  }

  if (res.body && typeof res.body.getReader === 'function') {
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          received += value.byteLength;
          if (received > maxBytes || received > expectedLength) {
            await reader.cancel().catch(() => undefined);
            throw new Error(
              `Range stream exceeded expected byte count (${received} > ${expectedLength} bytes)`
            );
          }
          chunks.push(value);
        }
      }
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // Ignore
      }
    }

    const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    if (buffer.length !== expectedLength) {
      throw new Error(
        `Range response length mismatch: received ${buffer.length} bytes, expected ${expectedLength} bytes`
      );
    }
    return buffer;
  }

  const arrayBuf = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  if (buffer.length !== expectedLength) {
    throw new Error(
      `Range response length mismatch: received ${buffer.length} bytes, expected ${expectedLength} bytes`
    );
  }
  return buffer;
}

/**
 * Executes an HTTPS request with manual redirect following so every redirect target is
 * validated against trusted GitHub release hosts before following it.
 */
async function fetchWithValidatedRedirects(
  initialUrl: string,
  rangeHeaderValue: string,
  maxBytes: number,
  fetchImpl: FetchLike
): Promise<{
  buffer: Buffer;
  contentRange: { start: number; end: number; total: number };
  resolvedUrl: string;
}> {
  let currentUrl = initialUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    if (!validateArchiveUrl(currentUrl)) {
      throw new Error(`Untrusted or non-HTTPS archive URL: ${currentUrl}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetchImpl(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          Range: rangeHeaderValue,
          'User-Agent': 'Hidaya-Audio-Resolver/2.0',
        },
      });

      // Handle 3xx redirects manually and validate every target host + HTTPS scheme
      if (res.status >= 300 && res.status < 400) {
        await cancelResponseBody(res);
        const location = res.headers.get('location');
        if (!location) {
          throw new Error(`Archive redirect missing Location header from ${currentUrl}`);
        }
        const nextUrl = new URL(location, currentUrl).toString();
        if (!validateArchiveUrl(nextUrl)) {
          throw new Error(`Untrusted redirect host or non-HTTPS redirect target: ${nextUrl}`);
        }
        currentUrl = nextUrl;
        continue;
      }

      // If the server ignores Range and returns 200 OK, cancel immediately without downloading the archive
      if (res.status === 200) {
        await cancelResponseBody(res);
        throw new Error('Archive server ignored HTTP Range request (returned HTTP 200 instead of 206 Partial Content)');
      }

      if (res.status !== 206) {
        await cancelResponseBody(res);
        throw new Error(`Unexpected HTTP status ${res.status} for Range request (${rangeHeaderValue})`);
      }

      const contentRange = parseContentRangeHeader(res.headers.get('content-range'));
      if (!contentRange) {
        await cancelResponseBody(res);
        throw new Error(`Missing or invalid Content-Range header: ${res.headers.get('content-range') || 'none'}`);
      }

      const expectedLength = contentRange.end - contentRange.start + 1;
      const buffer = await readBoundedResponseBuffer(res, expectedLength, maxBytes);

      return {
        buffer,
        contentRange,
        resolvedUrl: currentUrl,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(`Too many redirects while fetching archive: ${initialUrl}`);
}

/**
 * Fetches an exact inclusive byte range `bytes=start-end` and validates that the returned
 * Content-Range matches `start`, `end`, and `expectedTotal` (if known).
 */
async function fetchExactByteRange(
  url: string,
  start: number,
  end: number,
  expectedTotal: number | undefined,
  maxBytes: number,
  fetchImpl: FetchLike
): Promise<{
  buffer: Buffer;
  totalSize: number;
  resolvedUrl: string;
}> {
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start) {
    throw new Error(`Invalid byte range requested: ${start}-${end}`);
  }

  const expectedLength = end - start + 1;
  if (expectedLength > maxBytes) {
    throw new Error(`Requested range ${expectedLength} bytes exceeds limit ${maxBytes} bytes`);
  }

  const { buffer, contentRange, resolvedUrl } = await fetchWithValidatedRedirects(
    url,
    `bytes=${start}-${end}`,
    maxBytes,
    fetchImpl
  );

  if (contentRange.start !== start || contentRange.end !== end) {
    throw new Error(
      `Content-Range bounds mismatch: requested ${start}-${end}, received ${contentRange.start}-${contentRange.end}`
    );
  }

  if (expectedTotal !== undefined && contentRange.total !== expectedTotal) {
    throw new Error(
      `Archive total size changed unexpectedly: expected ${expectedTotal}, received ${contentRange.total}`
    );
  }

  return {
    buffer,
    totalSize: contentRange.total,
    resolvedUrl,
  };
}

/**
 * Locates and parses the End of Central Directory (EOCD) record from a tail buffer.
 */
function parseEocdFromTail(
  tailBuffer: Buffer,
  tailStartOffset: number,
  archiveTotalSize: number
): {
  cdCount: number;
  cdSize: number;
  cdOffset: number;
} {
  if (tailBuffer.length < 22) {
    throw new Error('Malformed ZIP archive: tail buffer is smaller than 22-byte EOCD minimum');
  }

  let eocdPos = -1;
  const minPos = Math.max(0, tailBuffer.length - EOCD_TAIL_BYTES);
  for (let i = tailBuffer.length - 22; i >= minPos; i--) {
    if (tailBuffer.readUInt32LE(i) === 0x06054b50) {
      const commentLen = tailBuffer.readUInt16LE(i + 20);
      if (i + 22 + commentLen <= tailBuffer.length) {
        eocdPos = i;
        break;
      }
    }
  }

  if (eocdPos === -1) {
    throw new Error('Invalid archive: End of Central Directory (EOCD) record not found');
  }

  // Check for ZIP64 End of Central Directory Locator (0x07064b50) immediately preceding EOCD
  if (eocdPos >= 20 && tailBuffer.readUInt32LE(eocdPos - 20) === 0x07064b50) {
    throw new Error('Unsupported ZIP64 archive: ZIP64 locator detected');
  }

  const diskNumber = tailBuffer.readUInt16LE(eocdPos + 4);
  const cdStartDisk = tailBuffer.readUInt16LE(eocdPos + 6);
  const cdDiskEntries = tailBuffer.readUInt16LE(eocdPos + 8);
  const cdCount = tailBuffer.readUInt16LE(eocdPos + 10);
  const cdSize = tailBuffer.readUInt32LE(eocdPos + 12);
  const cdOffset = tailBuffer.readUInt32LE(eocdPos + 16);

  if (
    diskNumber === 0xffff ||
    cdStartDisk === 0xffff ||
    cdDiskEntries === 0xffff ||
    cdCount === 0xffff ||
    cdSize === 0xffffffff ||
    cdOffset === 0xffffffff
  ) {
    throw new Error('Unsupported ZIP64 archive: 64-bit central directory fields are not supported');
  }

  if (diskNumber !== 0 || cdStartDisk !== 0 || cdDiskEntries !== cdCount) {
    throw new Error('Unsupported multi-disk ZIP archive');
  }

  if (cdSize > MAX_CENTRAL_DIRECTORY_BYTES) {
    throw new Error(
      `Central Directory size (${cdSize} bytes) exceeds metadata memory limit (${MAX_CENTRAL_DIRECTORY_BYTES} bytes)`
    );
  }

  const eocdAbsoluteOffset = tailStartOffset + eocdPos;
  if (cdOffset + cdSize > eocdAbsoluteOffset || cdOffset + cdSize > archiveTotalSize) {
    throw new Error('Malformed ZIP archive: Central Directory bounds exceed EOCD offset');
  }

  return { cdCount, cdSize, cdOffset };
}

/**
 * Parses Central Directory entries into a lookup map of member paths to offsets and sizes.
 */
function parseCentralDirectoryBuffer(
  cdBuffer: Buffer,
  cdCount: number,
  cdOffset: number,
  archiveTotalSize: number
): Map<string, CentralDirectoryMemberEntry> {
  const members = new Map<string, CentralDirectoryMemberEntry>();
  let cursor = 0;

  for (let i = 0; i < cdCount; i++) {
    if (cursor + 46 > cdBuffer.length) {
      throw new Error('Corrupt archive: Central Directory entry header truncated');
    }

    const sig = cdBuffer.readUInt32LE(cursor);
    if (sig !== 0x02014b50) {
      throw new Error(`Corrupt archive: Invalid Central Directory signature at offset ${cursor}`);
    }

    const generalPurposeBitFlag = cdBuffer.readUInt16LE(cursor + 8);
    const compressionMethod = cdBuffer.readUInt16LE(cursor + 10);
    const compressedSize = cdBuffer.readUInt32LE(cursor + 20);
    const uncompressedSize = cdBuffer.readUInt32LE(cursor + 24);
    const fileNameLen = cdBuffer.readUInt16LE(cursor + 28);
    const extraLen = cdBuffer.readUInt16LE(cursor + 30);
    const commentLen = cdBuffer.readUInt16LE(cursor + 32);
    const diskNumStart = cdBuffer.readUInt16LE(cursor + 34);
    const localHeaderOffset = cdBuffer.readUInt32LE(cursor + 42);

    const entryEnd = cursor + 46 + fileNameLen + extraLen + commentLen;
    if (entryEnd > cdBuffer.length) {
      throw new Error('Corrupt archive: Central Directory variable fields extend past buffer');
    }

    if (
      compressedSize === 0xffffffff ||
      uncompressedSize === 0xffffffff ||
      localHeaderOffset === 0xffffffff ||
      diskNumStart === 0xffff
    ) {
      throw new Error('Unsupported ZIP64 archive: entry uses 64-bit sizes or offsets');
    }

    if (localHeaderOffset >= cdOffset || localHeaderOffset + 30 > archiveTotalSize) {
      throw new Error(`Corrupt archive: Invalid local header offset ${localHeaderOffset}`);
    }

    const fileName = cdBuffer.toString('utf8', cursor + 46, cursor + 46 + fileNameLen);
    members.set(fileName, {
      compressionMethod,
      generalPurposeBitFlag,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
    });

    cursor = entryEnd;
  }

  return members;
}

/**
 * Validates a member entry's flags, compression, and sizes.
 */
function validateMemberEntryMetadata(
  fileName: string,
  entry: CentralDirectoryMemberEntry,
  cdOffset: number
): void {
  // Bit 0 of general purpose bit flag indicates encryption
  if ((entry.generalPurposeBitFlag & 0x0001) !== 0) {
    throw new Error(`Unsupported encrypted ZIP member "${fileName}"`);
  }

  if (entry.compressionMethod !== 0) {
    throw new Error(
      `Unsupported compression method ${entry.compressionMethod} for member "${fileName}". Only ZIP_STORED (method 0) is supported.`
    );
  }

  if (entry.compressedSize !== entry.uncompressedSize) {
    throw new Error(
      `Corrupt ZIP_STORED member "${fileName}": compressed size (${entry.compressedSize}) does not match uncompressed size (${entry.uncompressedSize})`
    );
  }

  if (entry.uncompressedSize <= 0) {
    throw new Error(`Invalid empty audio member "${fileName}"`);
  }

  if (entry.uncompressedSize > MAX_MEMBER_AUDIO_BYTES) {
    throw new Error(
      `Member "${fileName}" size (${entry.uncompressedSize} bytes) exceeds maximum allowed MP3 size (${MAX_MEMBER_AUDIO_BYTES} bytes)`
    );
  }

  if (entry.localHeaderOffset + 30 + entry.uncompressedSize > cdOffset) {
    throw new Error(`Corrupt archive: Member "${fileName}" overlaps Central Directory`);
  }
}

/**
 * Parses an in-memory ZIP_STORED buffer and extracts the uncompressed bytes for targetMember.
 * Preserved for unit testing and small buffer validation.
 */
export function parseZipStoredMember(zipBuffer: Buffer, targetMember: string): Buffer {
  if (!validateMemberPath(targetMember)) {
    throw new Error(`Invalid member path or traversal attempt: ${targetMember}`);
  }

  if (zipBuffer.length < 22) {
    throw new Error('Archive buffer is too small to be a valid ZIP');
  }

  const tailLen = Math.min(zipBuffer.length, EOCD_TAIL_BYTES);
  const tailStart = zipBuffer.length - tailLen;
  const tailBuffer = zipBuffer.subarray(tailStart);

  const { cdCount, cdSize, cdOffset } = parseEocdFromTail(
    tailBuffer,
    tailStart,
    zipBuffer.length
  );

  const cdBuffer = zipBuffer.subarray(cdOffset, cdOffset + cdSize);
  const members = parseCentralDirectoryBuffer(cdBuffer, cdCount, cdOffset, zipBuffer.length);

  const entry = members.get(targetMember);
  if (!entry) {
    throw new Error(`Member "${targetMember}" not found in archive`);
  }

  validateMemberEntryMetadata(targetMember, entry, cdOffset);

  if (entry.localHeaderOffset + 30 > zipBuffer.length) {
    throw new Error('Corrupt archive: Local file header offset out of bounds');
  }

  const localSig = zipBuffer.readUInt32LE(entry.localHeaderOffset);
  if (localSig !== 0x04034b50) {
    throw new Error(
      `Corrupt archive: Invalid Local File Header signature at offset ${entry.localHeaderOffset}`
    );
  }

  const localFlags = zipBuffer.readUInt16LE(entry.localHeaderOffset + 6);
  const localMethod = zipBuffer.readUInt16LE(entry.localHeaderOffset + 8);
  if ((localFlags & 0x0001) !== 0) {
    throw new Error(`Unsupported encrypted ZIP member "${targetMember}"`);
  }
  if (localMethod !== 0) {
    throw new Error(
      `Unsupported compression method ${localMethod} in local header for "${targetMember}"`
    );
  }

  const localNameLen = zipBuffer.readUInt16LE(entry.localHeaderOffset + 26);
  const localExtraLen = zipBuffer.readUInt16LE(entry.localHeaderOffset + 28);
  const dataStart = entry.localHeaderOffset + 30 + localNameLen + localExtraLen;
  const dataEnd = dataStart + entry.uncompressedSize;

  if (dataEnd > cdOffset || dataEnd > zipBuffer.length) {
    throw new Error('Corrupt archive: Member data extends past end of archive buffer');
  }

  return Buffer.from(zipBuffer.subarray(dataStart, dataEnd));
}

/**
 * Fetches the final up-to-65,557 bytes of an archive to locate the EOCD record.
 * First attempts a standard suffix range (`bytes=-65557`).
 * If the CDN returns HTTP 501 (Not Implemented / Unsupported client range on suffix bytes, e.g. Varnish/Fastly),
 * it queries a single byte (`bytes=0-0`) to discover the total archive size from Content-Range,
 * then fetches the exact closed tail range `bytes=(total-65557)-(total-1)`.
 * If the server ignores Range (HTTP 200), response is cancelled immediately without buffering.
 */
async function fetchArchiveTail(
  archiveUrl: string,
  fetchImpl: FetchLike
): Promise<{
  buffer: Buffer;
  contentRange: { start: number; end: number; total: number };
  resolvedUrl: string;
}> {
  try {
    return await fetchWithValidatedRedirects(
      archiveUrl,
      `bytes=-${EOCD_TAIL_BYTES}`,
      EOCD_TAIL_BYTES,
      fetchImpl
    );
  } catch (err: any) {
    const isSuffixUnsupported =
      err?.message && (err.message.includes('501') || err.message.includes('400'));
    if (!isSuffixUnsupported) {
      throw err;
    }

    // Single-byte probe to discover archive size via Content-Range: bytes 0-0/total
    const probe = await fetchWithValidatedRedirects(
      archiveUrl,
      'bytes=0-0',
      1,
      fetchImpl
    );

    const archiveTotal = probe.contentRange.total;
    if (!archiveTotal || archiveTotal <= 0) {
      throw new Error('Unable to determine archive total size from Content-Range probe');
    }

    const tailStart = Math.max(0, archiveTotal - EOCD_TAIL_BYTES);
    const tailEnd = archiveTotal - 1;

    const tail = await fetchExactByteRange(
      probe.resolvedUrl,
      tailStart,
      tailEnd,
      archiveTotal,
      EOCD_TAIL_BYTES,
      fetchImpl
    );

    return {
      buffer: tail.buffer,
      contentRange: {
        start: tailStart,
        end: tailEnd,
        total: archiveTotal,
      },
      resolvedUrl: tail.resolvedUrl,
    };
  }
}

/**
 * Resolves the Central Directory index for a remote ZIP archive using HTTP Range requests:
 * 1. Fetches the final 65,557 bytes (`bytes=-65557` or probed tail range) to locate EOCD.
 * 2. If the Central Directory is already fully contained in the tail buffer, parses it directly.
 * 3. Otherwise fetches the exact Central Directory byte range (`bytes=cdOffset-cdEnd`).
 */
async function getOrFetchCentralDirectory(
  archiveUrl: string,
  fetchImpl: FetchLike
): Promise<CachedCentralDirectory> {
  const now = Date.now();
  const cached = CD_CACHE.get(archiveUrl);
  if (cached && now - cached.timestamp < CD_CACHE_TTL_MS && fetchImpl === fetch) {
    return cached;
  }

  // Step 1: Fetch final up-to-65,557 bytes
  const {
    buffer: tailBuffer,
    contentRange: tailRange,
    resolvedUrl,
  } = await fetchArchiveTail(archiveUrl, fetchImpl);

  const archiveSize = tailRange.total;
  const tailStartOffset = tailRange.start;

  if (tailRange.end !== archiveSize - 1) {
    throw new Error(
      `Invalid tail Content-Range: expected range ending at ${archiveSize - 1}, got ${tailRange.end}`
    );
  }

  const { cdCount, cdSize, cdOffset } = parseEocdFromTail(
    tailBuffer,
    tailStartOffset,
    archiveSize
  );

  // Step 2: Check whether the Central Directory is already inside the fetched tail slice
  let cdBuffer: Buffer;
  if (cdOffset >= tailStartOffset && cdOffset + cdSize <= tailRange.end + 1) {
    const relativeStart = cdOffset - tailStartOffset;
    cdBuffer = tailBuffer.subarray(relativeStart, relativeStart + cdSize);
  } else {
    // Fetch the Central Directory range explicitly
    const cdEnd = cdOffset + cdSize - 1;
    const fetchedCd = await fetchExactByteRange(
      resolvedUrl,
      cdOffset,
      cdEnd,
      archiveSize,
      MAX_CENTRAL_DIRECTORY_BYTES,
      fetchImpl
    );
    cdBuffer = fetchedCd.buffer;
  }

  const members = parseCentralDirectoryBuffer(cdBuffer, cdCount, cdOffset, archiveSize);

  const entry: CachedCentralDirectory = {
    resolvedUrl,
    archiveSize,
    members,
    timestamp: now,
  };

  if (fetchImpl === fetch) {
    while (CD_CACHE.size >= MAX_CACHED_CD_ARCHIVES || [...CD_CACHE.values()].reduce((sum, item) => sum + JSON.stringify([...item.members]).length * 2, 0) + JSON.stringify([...members]).length * 2 > 16 * 1024 * 1024) {
      if (!CD_CACHE.size) break;
      const oldestKey = CD_CACHE.keys().next().value;
      if (oldestKey) CD_CACHE.delete(oldestKey);
    }
    if (JSON.stringify([...members]).length * 2 <= 16 * 1024 * 1024) CD_CACHE.set(archiveUrl, entry);
  }

  return entry;
}

/**
 * Extracts a ZIP_STORED member audio stream from a GitHub Release archive URL using HTTP Range requests.
 * Never downloads the entire ZIP archive.
 *
 * @param archiveUrl - HTTPS GitHub release asset URL
 * @param memberPath - Relative member path within the archive (e.g. 'en/tafsir/[id].mp3')
 * @param customFetch - Optional custom fetch implementation for unit testing
 * @returns Promise resolving to extracted MP3 audio Buffer
 */
export async function extractZipStoredMember(
  archiveUrl: string,
  memberPath: string,
  customFetch?: FetchLike
): Promise<Buffer> {
  if (!validateArchiveUrl(archiveUrl)) {
    throw new Error(`Untrusted or non-HTTPS archive host: ${archiveUrl}`);
  }

  if (!validateMemberPath(memberPath)) {
    throw new Error(`Invalid member path or traversal attempt: ${memberPath}`);
  }

  const fetchImpl: FetchLike = customFetch || fetch;
  const cacheKey = `${archiveUrl}::${memberPath}`;
  const now = Date.now();

  if (!customFetch) {
    const cachedMp3 = MP3_CACHE.get(cacheKey);
    if (cachedMp3 && now - cachedMp3.timestamp < MP3_CACHE_TTL_MS) {
      return cachedMp3.buffer;
    }
  }

  // 1. Locate Central Directory via HTTP Range
  const cdIndex = await getOrFetchCentralDirectory(archiveUrl, fetchImpl);
  const memberEntry = cdIndex.members.get(memberPath);
  if (!memberEntry) {
    throw new Error(`Member "${memberPath}" not found in archive`);
  }

  validateMemberEntryMetadata(memberPath, memberEntry, cdIndex.archiveSize);

  // 2. Fetch the 30-byte Local File Header for this member to read exact variable header lengths
  const localHeaderStart = memberEntry.localHeaderOffset;
  const localHeaderEnd = localHeaderStart + 30 - 1;

  const { buffer: localHeaderBuf } = await fetchExactByteRange(
    cdIndex.resolvedUrl,
    localHeaderStart,
    localHeaderEnd,
    cdIndex.archiveSize,
    30,
    fetchImpl
  );

  const localSig = localHeaderBuf.readUInt32LE(0);
  if (localSig !== 0x04034b50) {
    throw new Error(
      `Corrupt archive: Invalid Local File Header signature at offset ${localHeaderStart}`
    );
  }

  const localFlags = localHeaderBuf.readUInt16LE(6);
  const localMethod = localHeaderBuf.readUInt16LE(8);
  if ((localFlags & 0x0001) !== 0) {
    throw new Error(`Unsupported encrypted ZIP member "${memberPath}"`);
  }
  if (localMethod !== 0) {
    throw new Error(
      `Unsupported compression method ${localMethod} in local header for "${memberPath}"`
    );
  }

  const localNameLen = localHeaderBuf.readUInt16LE(26);
  const localExtraLen = localHeaderBuf.readUInt16LE(28);

  if (localNameLen + localExtraLen > MAX_LOCAL_HEADER_EXTRA_BYTES) {
    throw new Error(`Corrupt archive: Local header variable length too large (${localNameLen + localExtraLen} bytes)`);
  }

  // 3. Fetch only the member's uncompressed MP3 bytes
  const dataStart = localHeaderStart + 30 + localNameLen + localExtraLen;
  const dataEnd = dataStart + memberEntry.uncompressedSize - 1;

  if (dataEnd >= cdIndex.archiveSize) {
    throw new Error(`Corrupt archive: Member "${memberPath}" data range extends past archive size`);
  }

  const { buffer: memberBuffer } = await fetchExactByteRange(
    cdIndex.resolvedUrl,
    dataStart,
    dataEnd,
    cdIndex.archiveSize,
    MAX_MEMBER_AUDIO_BYTES,
    fetchImpl
  );

  // 4. Validate that extracted audio starts with MPEG frame header or ID3 tag
  if (memberBuffer.length < 4) {
    throw new Error('Extracted member is too small to be valid audio');
  }

  const isMp3Sync = memberBuffer[0] === 0xff && (memberBuffer[1] & 0xe0) === 0xe0;
  const isId3 =
    memberBuffer[0] === 0x49 && memberBuffer[1] === 0x44 && memberBuffer[2] === 0x33; // 'ID3'

  if (!isMp3Sync && !isId3) {
    throw new Error(
      `Extracted audio member does not start with valid MP3 frame sync or ID3 header (0x${memberBuffer
        .subarray(0, 4)
        .toString('hex')})`
    );
  }

  // 5. Cache bounded individual MP3 buffer
  if (!customFetch) {
    const previous = MP3_CACHE.get(cacheKey);
    if (previous) { currentMp3CacheBytes -= previous.byteSize; MP3_CACHE.delete(cacheKey); }
    while (
      (MP3_CACHE.size >= MAX_CACHED_MP3_ENTRIES ||
        currentMp3CacheBytes + memberBuffer.length > MAX_CACHED_MP3_TOTAL_BYTES) &&
      MP3_CACHE.size > 0
    ) {
      const oldestKey = MP3_CACHE.keys().next().value;
      if (!oldestKey) break;
      const removed = MP3_CACHE.get(oldestKey);
      if (removed) {
        currentMp3CacheBytes = Math.max(0, currentMp3CacheBytes - removed.byteSize);
      }
      MP3_CACHE.delete(oldestKey);
    }

    if (memberBuffer.length <= MAX_CACHED_MP3_TOTAL_BYTES) {
      MP3_CACHE.set(cacheKey, {
        buffer: memberBuffer,
        timestamp: now,
        byteSize: memberBuffer.length,
      });
      currentMp3CacheBytes += memberBuffer.length;
    }
  }

  return memberBuffer;
}
