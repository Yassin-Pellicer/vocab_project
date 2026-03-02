import { ipcMain, BrowserWindow } from "electron";

export default function minimizeWindow() {
  ipcMain.handle("window-minimize", () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.minimize();
  });
}
