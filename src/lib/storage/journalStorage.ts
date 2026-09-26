import { StorageService } from '../../services/storage';

export const JournalStorage = {
  exportJournalBackup: (): void => {
    try {
      const bookmarks = StorageService.getBookmarks();
      const reflections = StorageService.getReflections();
      
      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        bookmarks,
        reflections,
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `hidaya_journal_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (err) {
      console.error('Failed to export journal backup', err);
    }
  },

  importJournalBackup: (jsonString: string): boolean => {
    try {
      const backupData = JSON.parse(jsonString);
      
      if (!backupData.bookmarks || !backupData.reflections) {
        throw new Error('Invalid backup file format');
      }

      // Merge bookmarks (avoid duplicates)
      const currentBookmarks = StorageService.getBookmarks();
      const newBookmarks = new Set([...currentBookmarks, ...backupData.bookmarks]);
      localStorage.setItem('hidaya_bookmarks', JSON.stringify(Array.from(newBookmarks)));

      // Merge reflections (prefer newer or just overwrite for simplicity, here we merge and overwrite)
      const currentReflections = StorageService.getReflections();
      const mergedReflections = { ...currentReflections, ...backupData.reflections };
      localStorage.setItem('hidaya_reflections', JSON.stringify(mergedReflections));

      return true;
    } catch (err) {
      console.error('Failed to import journal backup', err);
      return false;
    }
  }
};
