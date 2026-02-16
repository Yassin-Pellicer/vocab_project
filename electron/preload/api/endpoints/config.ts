import { ipcRenderer } from "electron";

export const config = {
  moveDictionary: async (
    dictId: string,
    newRoute: string
  ): Promise<{ success: boolean; oldRoute: string; newRoute: string }> => {
    return await ipcRenderer.invoke("moveDictionary", dictId, newRoute);
  },
};
