import { ipcRenderer } from "electron";
export const markdown = {
  fetchMarkdown: async (route: string, name: string, uuid: string) => {
    return await ipcRenderer.invoke("fetchMarkdown", route, name, uuid);
  },

  saveMarkdown: async (route: string, name: string, uuid: string, markdown: string) => {
    return await ipcRenderer.invoke("saveMarkdown", route, name, uuid, markdown);
  },
};