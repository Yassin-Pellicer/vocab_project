import { ipcRenderer } from "electron";

export const windowControls = {
  minimize: async () => {
    return await ipcRenderer.invoke("window-minimize");
  },
  maximize: async () => {
    return await ipcRenderer.invoke("window-maximize");
  },
  close: async () => {
    return await ipcRenderer.invoke("window-close");
  },
};
