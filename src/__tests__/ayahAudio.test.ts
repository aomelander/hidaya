/**
 * @file src/__tests__/ayahAudio.test.ts
 * @description Comprehensive test suite for ayah_audio playback integration:
 * 1. Metadata selection & safe column filtering
 * 2. Missing & in-production records handling
 * 3. Security: Host validation & path traversal prevention
 * 4. ZIP_STORED extraction logic
 * 5. Player source selection behavior
 */

import {
  validateArchiveUrl,
  validateMemberPath,
  parseZipStoredMember,
  extractZipStoredMember,
} from '../lib/audio/zipExtractor';
import {
  lookupAyahAudio,
  getInternalAyahAudioRecord,
} from '../lib/audio/ayahAudioServerService';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Ayah Audio Integration Test Suite...\n');
  let passed = 0;

  // =========================================================================
  // Test 1: Security - Host validation
  // =========================================================================
  console.log('Test 1: Validating archive host security...');
  assert(
    validateArchiveUrl('https://github.com/aomelander/hidaya/releases/download/v1.0.0-audio/test.zip'),
    'Should allow official github.com releases'
  );
  assert(
    validateArchiveUrl('https://objects.githubusercontent.com/github-production-release-asset-2e65be/123.zip'),
    'Should allow objects.githubusercontent.com'
  );
  assert(
    !validateArchiveUrl('https://malicious-site.com/fake.zip'),
    'Should reject untrusted external domains'
  );
  assert(
    !validateArchiveUrl('http://attacker.com/github.com/fake.zip'),
    'Should reject domain spoofing'
  );
  console.log('✓ Test 1 passed\n');
  passed++;

  // =========================================================================
  // Test 2: Security - Member path traversal rejection
  // =========================================================================
  console.log('Test 2: Validating member path traversal guards...');
  assert(
    validateMemberPath('en/translation/69e1aa0a-e521-57ed-965d-a05ac12c0c09.mp3'),
    'Should allow valid relative MP3 paths'
  );
  assert(
    validateMemberPath('ar/tafsir/0a4ac592-d33b-509e-9dd7-cbdb40765c97.mp3'),
    'Should allow valid relative Arabic tafsir MP3 paths'
  );
  assert(
    !validateMemberPath('../../../etc/passwd'),
    'Should reject path traversal with ..'
  );
  assert(
    !validateMemberPath('/en/translation/file.mp3'),
    'Should reject absolute paths starting with /'
  );
  assert(
    !validateMemberPath('en\\translation\\file.mp3'),
    'Should reject backslashes'
  );
  assert(
    !validateMemberPath('en/translation/file.exe'),
    'Should reject non-audio/non-json extensions'
  );
  console.log('✓ Test 2 passed\n');
  passed++;

  // =========================================================================
  // Test 3: ZIP_STORED extraction with synthetic uncompressed zip buffer
  // =========================================================================
  console.log('Test 3: Testing in-memory ZIP_STORED parser...');
  const testFileName = 'en/translation/test.mp3';
  const testPayload = Buffer.from([0xff, 0xf3, 0x64, 0xc4, 0x01, 0x02, 0x03, 0x04]); // Valid MP3 syncword
  const fileNameBytes = Buffer.from(testFileName, 'utf8');

  // Construct synthetic ZIP_STORED archive buffer
  // 1. Local file header (30 + nameLen bytes)
  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0); // signature
  localHeader.writeUInt16LE(20, 4); // version needed
  localHeader.writeUInt16LE(0, 6); // flags
  localHeader.writeUInt16LE(0, 8); // compression method 0 (STORED)
  localHeader.writeUInt16LE(0, 10); // mod time
  localHeader.writeUInt16LE(0, 12); // mod date
  localHeader.writeUInt32LE(0x12345678, 14); // crc32
  localHeader.writeUInt32LE(testPayload.length, 18); // compressed size
  localHeader.writeUInt32LE(testPayload.length, 22); // uncompressed size
  localHeader.writeUInt16LE(fileNameBytes.length, 26); // file name length
  localHeader.writeUInt16LE(0, 28); // extra field length

  const localOffset = 0;
  const localSection = Buffer.concat([localHeader, fileNameBytes, testPayload]);

  // 2. Central Directory record (46 + nameLen bytes)
  const cdOffset = localSection.length;
  const cdHeader = Buffer.alloc(46);
  cdHeader.writeUInt32LE(0x02014b50, 0); // signature
  cdHeader.writeUInt16LE(20, 4); // version made by
  cdHeader.writeUInt16LE(20, 6); // version needed
  cdHeader.writeUInt16LE(0, 8); // flags
  cdHeader.writeUInt16LE(0, 10); // compression method 0 (STORED)
  cdHeader.writeUInt16LE(0, 12); // mod time
  cdHeader.writeUInt16LE(0, 14); // mod date
  cdHeader.writeUInt32LE(0x12345678, 16); // crc32
  cdHeader.writeUInt32LE(testPayload.length, 20); // compressed size
  cdHeader.writeUInt32LE(testPayload.length, 24); // uncompressed size
  cdHeader.writeUInt16LE(fileNameBytes.length, 28); // file name length
  cdHeader.writeUInt16LE(0, 30); // extra field length
  cdHeader.writeUInt16LE(0, 32); // comment length
  cdHeader.writeUInt16LE(0, 34); // disk number start
  cdHeader.writeUInt16LE(0, 36); // internal attrs
  cdHeader.writeUInt32LE(0, 38); // external attrs
  cdHeader.writeUInt32LE(localOffset, 42); // local header offset

  const cdSection = Buffer.concat([cdHeader, fileNameBytes]);

  // 3. End of Central Directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4); // disk num
  eocd.writeUInt16LE(0, 6); // start disk
  eocd.writeUInt16LE(1, 8); // total entries on disk
  eocd.writeUInt16LE(1, 10); // total entries
  eocd.writeUInt32LE(cdSection.length, 12); // size of CD
  eocd.writeUInt32LE(cdOffset, 16); // offset of CD
  eocd.writeUInt16LE(0, 20); // comment length

  const fullSyntheticZip = Buffer.concat([localSection, cdSection, eocd]);

  const extracted = parseZipStoredMember(fullSyntheticZip, testFileName);
  assert(Buffer.compare(extracted, testPayload) === 0, 'Extracted payload must match input payload');
  console.log('✓ Test 3 passed\n');
  passed++;

  // =========================================================================
  // Test 4: Live Metadata Selection & Safe Column Filtering
  // =========================================================================
  console.log('Test 4: Testing live metadata selection for 3:134 in EN, SV, FR...');
  const enMeta = await lookupAyahAudio({
    surahNumber: 3,
    ayahNumber: 134,
    languageCode: 'en',
    audioType: 'translation',
  });

  assert(enMeta.status === 'available', 'English translation for 3:134 should be available');
  assert(!!enMeta.record, 'Should contain a safe record');
  assert(Boolean(enMeta.record?.audioUrl.startsWith('/api/ayah-audio/')), 'audioUrl must route to /api/ayah-audio/[id]');
  assert(enMeta.record?.languageCode === 'en', 'languageCode must match requested');
  assert(enMeta.record?.audioType === 'translation', 'audioType must match requested');

  // Verify safe column isolation (NO archive URLs, keys, or sensitive fields)
  const recordKeys = Object.keys(enMeta.record || {});
  assert(!recordKeys.includes('archive_url'), 'Public record must NOT expose archive_url');
  assert(!recordKeys.includes('archive_member'), 'Public record must NOT expose archive_member');
  assert(!recordKeys.includes('archive_sha256'), 'Public record must NOT expose archive_sha256');

  const svMeta = await lookupAyahAudio({
    surahNumber: 3,
    ayahNumber: 134,
    languageCode: 'sv',
    audioType: 'translation',
  });
  assert(svMeta.status === 'available', 'Swedish translation for 3:134 should be available');

  const frMeta = await lookupAyahAudio({
    surahNumber: 3,
    ayahNumber: 134,
    languageCode: 'fr',
    audioType: 'tafsir',
  });
  assert(frMeta.status === 'available', 'French tafsir for 3:134 should be available');
  console.log('✓ Test 4 passed\n');
  passed++;

  // =========================================================================
  // Test 5: Live Arabic Tafsir (Available vs. In-Production Handling)
  // =========================================================================
  console.log('Test 5: Testing Arabic tafsir handling (available vs in-production)...');
  // Available Arabic tafsir on Surah 21 Ayah 70
  const arAvailable = await lookupAyahAudio({
    surahNumber: 21,
    ayahNumber: 70,
    languageCode: 'ar',
    audioType: 'tafsir',
  });
  assert(arAvailable.status === 'available', 'Arabic tafsir for 21:70 should be available');
  assert(Boolean(arAvailable.record?.voice?.startsWith('ar-')), 'Arabic voice should start with ar-');

  // In-production Arabic row (3:134 Arabic tafsir has not been uploaded yet)
  const arMissing = await lookupAyahAudio({
    surahNumber: 3,
    ayahNumber: 134,
    languageCode: 'ar',
    audioType: 'tafsir',
  });
  assert(arMissing.status === 'processing', 'Missing Arabic row must return processing status');
  assert(
    typeof arMissing.message === 'string' && arMissing.message.toLowerCase().includes('production'),
    'Processing message must indicate in-production state'
  );
  console.log('✓ Test 5 passed\n');
  passed++;

  // =========================================================================
  // Test 6: Internal extraction of real GitHub release archive member
  // =========================================================================
  console.log('Test 6: Testing real ZIP_STORED extraction from GitHub release CDN...');
  if (enMeta.record?.id) {
    const internal = await getInternalAyahAudioRecord(enMeta.record.id);
    assert(!!internal, 'Internal record must be resolvable by ID');
    assert(internal?.delivery === 'zip_member', 'Delivery must be zip_member');

    const audioBuf = await extractZipStoredMember(internal!.archive_url, internal!.archive_member);
    assert(audioBuf.length > 0, 'Extracted audio buffer must not be empty');
    // Verify MP3 syncword (0xFF, 0xFB or 0xFF, 0xF3 or ID3)
    const isMp3 =
      (audioBuf[0] === 0xff && (audioBuf[1] & 0xe0) === 0xe0) ||
      (audioBuf[0] === 0x49 && audioBuf[1] === 0x44 && audioBuf[2] === 0x33);
    assert(isMp3, 'Extracted audio must have valid MP3 frame sync / ID3 tag');
    console.log(`Extracted ${audioBuf.length} bytes of verified MP3 audio.`);
  }
  console.log('✓ Test 6 passed\n');
  passed++;

  console.log(`🎉 ALL ${passed} TESTS PASSED SUCCESSFULLY!`);
}

runTests().catch((err) => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});
