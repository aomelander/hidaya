/**
 * @file src/lib/db/ingestScholarTranscription.ts
 * @description CLI entrypoint delegating to the official Quranpedia Tafsir Al-Sha'rawi
 * (Book ID: 18) importer & synchronizer (`src/lib/db/importShaarawiQuranpedia.ts`).
 *
 * Usage:
 *   npx tsx src/lib/db/ingestScholarTranscription.ts
 *   npx tsx src/lib/db/ingestScholarTranscription.ts --purge
 *   npx tsx src/lib/db/ingestScholarTranscription.ts --verify
 */

import {
  importAndSyncShaarawiTafsir,
  verifyShaarawiRetrieval,
} from './importShaarawiQuranpedia';

const args = process.argv.slice(2);
const purgeFirst = args.includes('--purge');
const forceDownload = args.includes('--force-download');
const verifyOnly = args.includes('--verify');

(async () => {
  try {
    if (verifyOnly) {
      await verifyShaarawiRetrieval();
    } else {
      await importAndSyncShaarawiTafsir({ purgeFirst, forceDownload });
      await verifyShaarawiRetrieval();
    }
    process.exit(0);
  } catch (err) {
    console.error('Fatal error in Shaarawi ingestion:', err);
    process.exit(1);
  }
})();
