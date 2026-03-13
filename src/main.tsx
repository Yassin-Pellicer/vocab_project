import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useConfigStore as useDictionaryStore } from "@/context/dictionary-context";
import { useConfigStore as usePreferencesStore } from "@/context/preferences-context";
import { useNotesStore } from "@/context/notes-context";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})

let syncing = false;
let syncQueued = false;

async function syncFromDisk() {
  if (syncing) {
    syncQueued = true;
    return;
  }

  syncing = true;
  try {
    usePreferencesStore.getState().loadConfig();
    await useDictionaryStore.getState().loadConfig();
    await useDictionaryStore.getState().loadAllTranslations();
  } finally {
    syncing = false;
    if (syncQueued) {
      syncQueued = false;
      syncFromDisk();
    }
  }
}

window.ipcRenderer.on("app-data-changed", () => {
  syncFromDisk();
});

async function syncNotesForActiveRoute() {
  if (window.location.pathname !== "/notes") return;
  const searchParams = new URLSearchParams(window.location.search);
  const route = searchParams.get("path") || "";
  const name = searchParams.get("name") || "";
  if (!route || !name) return;

  try {
    const tree = await window.api.fetchNoteIndex(route, name);
    useNotesStore.getState().setTree(tree);
    useNotesStore.getState().bumpReloadToken();
  } catch (error) {
    console.error("Failed to sync notes:", error);
  }
}

window.ipcRenderer.on("notes-changed", () => {
  syncNotesForActiveRoute();
});
