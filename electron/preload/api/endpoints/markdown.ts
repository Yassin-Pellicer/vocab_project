// Custom APIs for renderer
import { ipcRenderer } from "electron";

export const markdown = {
  fetchMarkdown: async (route: string, name: string) => {
    return await ipcRenderer.invoke("fetchMarkdown", route, name);
  },
};
