import { ipcMain, BrowserWindow } from "electron";

export default function closeWindow() {
  ipcMain.handle("window-close", () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.close();
  });
}
