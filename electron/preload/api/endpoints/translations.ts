// Custom APIs for renderer
import { TranslationEntry } from '@/types/translation-entry';
import { ipcRenderer } from 'electron';

export const translations = {
  requestTranslations: async (route: string, name: string): Promise<Array<TranslationEntry> | undefined> => {
    return await ipcRenderer.invoke('loadTranslations', route, name);
  },

  addTranslation: async (entry: TranslationEntry, word: string, route: string, name: string) => {
    return await ipcRenderer.invoke('addTranslation', entry, word, route, name);
  },

  deleteTranslation: async (word: TranslationEntry, route: string, name: string) => {
    return await ipcRenderer.invoke('deleteTranslation', word, route, name);
  },
  
  createDictionary: async (route: string, name: string) => {
    return await ipcRenderer.invoke('createDictionary', route, name);
  },

  selectFolder: async (): Promise<string | null> => {
    return await ipcRenderer.invoke('selectFolder');
  },

  loadConfig: async () => {
    return await ipcRenderer.invoke('loadConfig');
  }
};
