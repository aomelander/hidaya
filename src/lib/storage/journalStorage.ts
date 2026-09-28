/**
 * @file journalStorage.ts
 * @description Local JSON backup and restore utility for user reflection journals and bookmarks.
 * Ensures data ownership remains entirely with the user on their own device.
 */

import { StorageService } from '../../services/storage';

export interface JournalBackupPayload {
  version: string;
  timestamp: string;
  bookmarks: string[];
  reflections: ReturnType<typeof StorageService.getReflections>;
}

export const JournalStorage = {
  /**
   * Generates a downloadable JSON backup containing all user bookmarks and reflections.
   * Prompts the browser's native file download dialog.
   */
  exportJournalBackup(): void {
    if (typeof window === 'undefined') return;

    try {
      const bookmarks = StorageService.getBookmarks();
      const reflections = StorageService.getReflections();

      const backupData: JournalBackupPayload = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        bookmarks,
        reflections,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      const datePart = new Date().toISOString().split('T')[0];
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', `hidaya_journal_backup_${datePart}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (err) {
      console.error('[JournalStorage] Failed to export journal backup:', err);
    }
  },

  /**
   * Imports and merges a backup JSON file into local storage.
   * Deduplicates bookmarks and merges reflections.
   *
   * @param jsonString Raw JSON string from the uploaded backup file
   * @returns boolean true if successfully parsed and restored, false on failure
   */
  importJournalBackup(jsonString: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const backupData = JSON.parse(jsonString) as JournalBackupPayload;

      if (!backupData || !Array.isArray(backupData.bookmarks) || typeof backupData.reflections !== 'object') {
        throw new Error('Invalid backup file schema: missing bookmarks or reflections');
      }

      // Merge bookmarks (avoid duplicates)
      const currentBookmarks = StorageService.getBookmarks();
      const newBookmarks = new Set([...currentBookmarks, ...backupData.bookmarks]);
      localStorage.setItem('hidaya_bookmarks', JSON.stringify(Array.from(newBookmarks)));

      // Merge reflections (union and overwrite with imported entries)
      const currentReflections = StorageService.getReflections();
      const mergedReflections = { ...currentReflections, ...backupData.reflections };
      localStorage.setItem('hidaya_reflections', JSON.stringify(mergedReflections));

      return true;
    } catch (err) {
      console.error('[JournalStorage] Failed to import journal backup:', err);
      return false;
    }
  },
};
