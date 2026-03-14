import { useConfigStore as useDictionaryStore } from "@/context/dictionary-context";
import { useNotesStore } from "@/context/notes-context";
import { useConfigStore as usePreferencesStore } from "@/context/preferences-context";
import type { SidebarTree } from "@/types/sidebar-types";

type Unsubscribe = () => void;

const createQueuedRunner = (fn: () => Promise<void>) => {
  let running = false;
  let queued = false;

  const run = async () => {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    try {
      do {
        queued = false;
        await fn();
      } while (queued);
    } finally {
      running = false;
    }
  };

  return run;
};

async function syncFromDisk() {
  // Preferences are lightweight; run them first so UI settings apply quickly.
  usePreferencesStore.getState().loadConfig();
  await useDictionaryStore.getState().loadConfig();
  await useDictionaryStore.getState().loadAllTranslations();
}

async function syncNotesForActiveRoute() {
  if (window.location.pathname !== "/notes") return;

  const searchParams = new URLSearchParams(window.location.search);
  const route = searchParams.get("path") || "";
  const name = searchParams.get("name") || "";
  if (!route || !name) return;

  const tree = await window.api.fetchNoteIndex(route, name);
  const nextTree: SidebarTree = Array.isArray(tree) ? (tree as SidebarTree) : [];
  useNotesStore.getState().setTree(nextTree);
  useNotesStore.getState().bumpReloadToken();
}

export function initRendererIpcSync(): Unsubscribe {
  const runConfigSync = createQueuedRunner(async () => {
    try {
      await syncFromDisk();
    } catch (error) {
      console.error("Failed to sync from disk:", error);
    }
  });

  const runNotesSync = createQueuedRunner(async () => {
    try {
      await syncNotesForActiveRoute();
    } catch (error) {
      console.error("Failed to sync notes:", error);
    }
  });

  const onAppDataChanged = () => void runConfigSync();
  const onNotesChanged = () => void runNotesSync();
  const onMainProcessMessage = (_event: unknown, message: unknown) => {
    console.log(message);
  };

  window.ipcRenderer.on("main-process-message", onMainProcessMessage);
  window.ipcRenderer.on("app-data-changed", onAppDataChanged);
  window.ipcRenderer.on("notes-changed", onNotesChanged);

  return () => {
    window.ipcRenderer.off("main-process-message", onMainProcessMessage);
    window.ipcRenderer.off("app-data-changed", onAppDataChanged);
    window.ipcRenderer.off("notes-changed", onNotesChanged);
  };
}
