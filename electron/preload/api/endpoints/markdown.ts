import { ipcRenderer } from "electron";
export const markdown = {
  fetchMarkdown: async (route: string, name: string) => {
    return await ipcRenderer.invoke("fetchMarkdown", route, name);
  },

  saveMarkdown: async (route: string, name: string, markdown: string) => {
    return await ipcRenderer.invoke("saveMarkdown", route, name, markdown);
  },
};