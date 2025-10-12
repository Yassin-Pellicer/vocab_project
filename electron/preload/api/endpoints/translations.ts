// Custom APIs for renderer
import { ipcRenderer } from 'electron';

export const translations = {
  requestTranslations: async (): Promise<Record<string, string> | undefined> => {
    return await ipcRenderer.invoke('loadTranslations');
  }
};