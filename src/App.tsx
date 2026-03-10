import DictionaryPage from "./pages/dictionary-page";
import MarkdownPage from "./pages/markdown-page";
import HomePage from "./pages/home-page";
import { BrowserRouter, useLocation } from "react-router-dom";
import { useConfigStore } from "./context/dictionary-context";
import { useConfigStore as usePreferencesStore } from "@/context/preferences-context";
import { MainLayout } from "./layouts";
import { useEffect, useRef } from "react";
import useThemeSync from "./hooks/useThemeSync";
import NotesPage from "./pages/notes-page";

function Pages() {
  const location = useLocation();
  const path = location.pathname;
  return (
    <>
      <div style={{ display: path === "/" ? "block" : "none" }}><HomePage /></div>
      <div style={{ display: path === "/dictionary" ? "block" : "none" }}><DictionaryPage /></div>
      <div style={{ display: path === "/markdown" ? "block" : "none" }}><MarkdownPage /></div>
      <div style={{ display: path === "/notes" ? "block" : "none" }}><NotesPage /></div>
    </>
  );
}

export default function App() {
  const loadConfig = useConfigStore((state: any) => state.loadConfig);
  const loadUserPreferences = usePreferencesStore((state: any) => state.loadConfig);
  const loadAllTranslations = useConfigStore((state: any) => state.loadAllTranslations);
  const dictionaryMetadata = useConfigStore((state: any) => state.dictionaryMetadata);
  const hasLoadedTranslations = useRef(false);
  useThemeSync();
  useEffect(() => { loadConfig(); }, []);
  useEffect(() => { loadUserPreferences(); }, []);
  useEffect(() => {
    if (Object.keys(dictionaryMetadata).length > 0 && !hasLoadedTranslations.current) {
      hasLoadedTranslations.current = true;
      loadAllTranslations();
    }
  }, [dictionaryMetadata]);
  return (
    <BrowserRouter>
      <MainLayout>
        <Pages />
      </MainLayout>
    </BrowserRouter>
  );
}