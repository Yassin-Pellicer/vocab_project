// Custom APIs for renderer
import { TranslationEntry } from '@/types/translation-entry';
import { ipcRenderer } from 'electron';

export const translations = {
  requestTranslations: async (): Promise<Array<TranslationEntry> | undefined> => {
    return await ipcRenderer.invoke('loadTranslations');
  },

  // Add a new translation entry (write)
  addTranslation: async (entry: TranslationEntry) => {
    return await ipcRenderer.invoke('addTranslation', entry);
  }
};
