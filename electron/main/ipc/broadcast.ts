import { BrowserWindow } from "electron";

export function broadcastToAllWindows(channel: string, payload?: unknown) {
  for (const win of BrowserWindow.getAllWindows()) {
    if (win.isDestroyed()) continue;
    win.webContents.send(channel, payload);
  }
}

