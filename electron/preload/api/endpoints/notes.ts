import { ipcRenderer } from "electron";
export const notes = {
  fetchNotes: async (route: string, name: string, uuid: string) => {
    return await ipcRenderer.invoke("fetchNotes", route, name, uuid);
  },

  fetchNoteIndex: async (route: string, name: string) => {
    return await ipcRenderer.invoke("fetchNoteIndex", route, name);
  },

  saveNoteIndex: async (route: string, name: string, currentConfig: Object) => {
    return await ipcRenderer.invoke(
      "saveNoteIndex",
      route,
      name,
      currentConfig,
    );
  },

  saveNotes: async (
    route: string,
    name: string,
    uuid: string,
    content: Object,
  ) => {
    return await ipcRenderer.invoke("saveNotes", route, name, uuid, content);
  },
};
