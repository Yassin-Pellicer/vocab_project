import { ipcRenderer } from "electron";

export const graph = {
  fetchGraph: async (route: string, name: string, uuid?: string) => {
    return await ipcRenderer.invoke("fetchGraph", route, name, uuid);
  },

  saveGraph: async (route: string, name: string, origin: Object, destination: Object) => {
    return await ipcRenderer.invoke("saveGraph", route, name, origin, destination);
  },

  deleteGraphEntry: async (route: string, name: string, uuid: string, word: string) => {
    return await ipcRenderer.invoke("deleteGraphEntry", route, name, uuid, word);
  }
};