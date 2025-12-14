
import { ipcRenderer } from "electron";
export const conjugation = {
  fetchConjugation: async (route: string, name: string, uuid?: string) => {
    return await ipcRenderer.invoke("fetchConjugation", route, name, uuid);
  },

  saveConjugation: async (route: string, name: string, uuid:string, conjugation: Object) => {
    return await ipcRenderer.invoke("saveConjugation", route, name, uuid, conjugation);
  },
};
