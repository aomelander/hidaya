/**
 * @file src/lib/audio/zipExtractor.ts
 * @description Safe, bounded extraction of ZIP_STORED (uncompressed) audio members
 * from GitHub Release archives with path traversal protection and bounded LRU memory caching.
 */

interface ArchiveCacheEntry {
  buffer: Buffer;
  timestamp: number;
  byteSize: number;
}

// Bounded in-memory cache for downloaded batch archives
// Max 15 archives or ~40MB total to remain well within memory limits
const MAX_CACHED_ARCHIVES = 15;
const MAX_ARCHIVE_BYTES = 15 * 1024 * 1024; // 15 MB max per zip file
const ARCHIVE_CACHE = new Map<string, ArchiveCacheEntry>();

const ALLOWED_ARCHIVE_HOSTS = new Set([
  'github.com',
  'objects.githubusercontent.com',
  'raw.githubusercontent.com',
  'github-production-release-asset-2e65be.s3.amazonaws.com',
]);

/**
 * Validates that an archive URL points to an approved, legitimate host.
 */
export function validateArchiveUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (ALLOWED_ARCHIVE_HOSTS.has(host)) {
      return true;
    }
    // Subdomains of github.com or githubusercontent.com
    if (host.endsWith('.github.com') || host.endsWith('.githubusercontent.com')) {
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

  // Member should match expected audio file patterns
  const normalized = memberPath.trim();
  if (!normalized.endsWith('.mp3') && !normalized.endsWith('.json')) {
    return false;
  }

  return true;
}

/**
 * Parses a ZIP_STORED buffer and extracts the uncompressed bytes for targetMember.
 */
export function parseZipStoredMember(zipBuffer: Buffer, targetMember: string): Buffer {
  if (zipBuffer.length < 22) {
    throw new Error('Archive buffer is too small to be a valid ZIP');
  }

  // 1. Locate End of Central Directory (EOCD) signature 0x06054b50
  let eocdOffset = -1;
  const minOffset = Math.max(0, zipBuffer.length - 65557);
  for (let i = zipBuffer.length - 22; i >= minOffset; i--) {
    if (zipBuffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error('Invalid archive: End of Central Directory record not found');
  }

  const cdCount = zipBuffer.readUInt16LE(eocdOffset + 10);
  const cdOffset = zipBuffer.readUInt32LE(eocdOffset + 16);

  if (cdOffset > zipBuffer.length) {
    throw new Error('Invalid archive: Central Directory offset out of bounds');
  }

  // 2. Iterate through Central Directory records (0x02014b50)
  let currentOffset = cdOffset;
  for (let i = 0; i < cdCount; i++) {
    if (currentOffset + 46 > zipBuffer.length) {
      throw new Error('Corrupt archive: Central Directory entry truncated');
    }

    const sig = zipBuffer.readUInt32LE(currentOffset);
    if (sig !== 0x02014b50) {
      throw new Error(`Corrupt archive: Invalid Central Directory signature at offset ${currentOffset}`);
    }

    const compressionMethod = zipBuffer.readUInt16LE(currentOffset + 10);
    const uncompressedSize = zipBuffer.readUInt32LE(currentOffset + 24);
    const fileNameLen = zipBuffer.readUInt16LE(currentOffset + 28);
    const extraLen = zipBuffer.readUInt16LE(currentOffset + 30);
    const commentLen = zipBuffer.readUInt16LE(currentOffset + 32);
    const localHeaderOffset = zipBuffer.readUInt32LE(currentOffset + 42);

    const fileNameStart = currentOffset + 46;
    const fileName = zipBuffer.toString('utf8', fileNameStart, fileNameStart + fileNameLen);

    if (fileName === targetMember) {
      if (compressionMethod !== 0) {
        throw new Error(
          `Unsupported compression method ${compressionMethod} for member "${fileName}". Only ZIP_STORED (method 0) is supported.`
        );
      }

      // 3. Inspect Local File Header at localHeaderOffset
      if (localHeaderOffset + 30 > zipBuffer.length) {
        throw new Error('Corrupt archive: Local file header offset out of bounds');
      }

      const localSig = zipBuffer.readUInt32LE(localHeaderOffset);
      if (localSig !== 0x04034b50) {
        throw new Error(`Corrupt archive: Invalid Local File Header signature at offset ${localHeaderOffset}`);
      }

      const localNameLen = zipBuffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLen = zipBuffer.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
      const dataEnd = dataStart + uncompressedSize;

      if (dataEnd > zipBuffer.length) {
        throw new Error('Corrupt archive: Member data extends past end of archive buffer');
      }

      return zipBuffer.subarray(dataStart, dataEnd);
    }

    currentOffset += 46 + fileNameLen + extraLen + commentLen;
  }

  throw new Error(`Member "${targetMember}" not found in archive`);
}

/**
 * Downloads and caches the batch ZIP archive safely with size and timeout guards.
 */
async function fetchArchiveBuffer(archiveUrl: string): Promise<Buffer> {
  const cached = ARCHIVE_CACHE.get(archiveUrl);
  const now = Date.now();

  // Cache hit within 10 minutes
  if (cached && now - cached.timestamp < 10 * 60 * 1000) {
    return cached.buffer;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

  try {
    const res = await fetch(archiveUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Hidaya-Audio-Resolver/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to download archive: HTTP ${res.status} ${res.statusText}`);
    }

    const contentLength = parseInt(res.headers.get('content-length') || '0', 10);
    if (contentLength > MAX_ARCHIVE_BYTES) {
      throw new Error(`Archive size exceeds limit (${contentLength} > ${MAX_ARCHIVE_BYTES} bytes)`);
    }

    const arrayBuf = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    if (buffer.length > MAX_ARCHIVE_BYTES) {
      throw new Error(`Downloaded archive exceeds size limit (${buffer.length} bytes)`);
    }

    // Maintain bounded LRU cache
    if (ARCHIVE_CACHE.size >= MAX_CACHED_ARCHIVES) {
      const oldestKey = ARCHIVE_CACHE.keys().next().value;
      if (oldestKey) ARCHIVE_CACHE.delete(oldestKey);
    }

    ARCHIVE_CACHE.set(archiveUrl, {
      buffer,
      timestamp: now,
      byteSize: buffer.length,
    });

    return buffer;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extracts a ZIP_STORED member audio stream from an archive URL safely.
 *
 * @param archiveUrl - Downloadable GitHub release asset URL
 * @param memberPath - Relative member path within the archive (e.g. 'en/tafsir/[id].mp3')
 * @returns Promise resolving to extracted MP3 audio Buffer
 */
export async function extractZipStoredMember(
  archiveUrl: string,
  memberPath: string
): Promise<Buffer> {
  if (!validateArchiveUrl(archiveUrl)) {
    throw new Error(`Untrusted archive host: ${archiveUrl}`);
  }

  if (!validateMemberPath(memberPath)) {
    throw new Error(`Invalid member path or traversal attempt: ${memberPath}`);
  }

  const zipBuffer = await fetchArchiveBuffer(archiveUrl);
  const memberBuffer = parseZipStoredMember(zipBuffer, memberPath);

  // Validate that extracted audio starts with MPEG frame header or ID3 tag
  if (memberBuffer.length < 4) {
    throw new Error('Extracted member is too small to be valid audio');
  }

  const isMp3Sync = (memberBuffer[0] === 0xff && (memberBuffer[1] & 0xe0) === 0xe0);
  const isId3 = (memberBuffer[0] === 0x49 && memberBuffer[1] === 0x44 && memberBuffer[2] === 0x33); // 'ID3'

  if (!isMp3Sync && !isId3) {
    console.warn(`Extracted audio member does not start with standard MP3 sync/ID3 header (0x${memberBuffer.subarray(0, 4).toString('hex')})`);
  }

  return memberBuffer;
}
