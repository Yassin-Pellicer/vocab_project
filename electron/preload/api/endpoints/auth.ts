import { ipcRenderer } from "electron";

export const auth = {
  deleteAccount: async (
    accessToken: string,
  ): Promise<{ success: boolean; [key: string]: unknown }> => {
    return await ipcRenderer.invoke("deleteAccount", accessToken);
  },
};
