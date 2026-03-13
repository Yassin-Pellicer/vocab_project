import { ipcMain } from "electron";
import createWindow from "../../../window/window";

function normalizeRoute(route: unknown) {
  if (typeof route !== "string") return undefined;
  const trimmed = route.trim();
  if (!trimmed) return undefined;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export default function openNewWindow() {
  ipcMain.handle("window-open-new", (_event, route: unknown) => {
    createWindow(normalizeRoute(route), { hideSidebar: true });
  });
}
