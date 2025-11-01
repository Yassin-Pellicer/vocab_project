// Custom APIs for renderer
import { TranslationEntry } from '@/types/translation-entry';
import { ipcRenderer } from 'electron';

export const translations = {
  requestTranslations: async (): Promise<Array<TranslationEntry> | undefined> => {
    return await ipcRenderer.invoke('loadTranslations');
  },

  addTranslation: async (entry: TranslationEntry, word: string, dictionary: string) => {
    return await ipcRenderer.invoke('addTranslation', entry, word, dictionary);
  },

  deleteTranslation: async (word: TranslationEntry) => {
    return await ipcRenderer.invoke('deleteTranslation', word);
  },

  createDictionary: async (route: string, name: string) => {
    return await ipcRenderer.invoke('createDictionary', route, name);
  },

  selectFolder: async (): Promise<string | null> => {
    return await ipcRenderer.invoke('selectFolder');
  }
};
