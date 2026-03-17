import DictionaryPage from "./pages/dictionary-page";
import MarkdownPage from "./pages/markdown-page";
import HomePage from "./pages/home-page";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { useConfigStore } from "./context/dictionary-context";
import { useConfigStore as usePreferencesStore } from "@/context/preferences-context";
import { MainLayout } from "./layouts";
import { useEffect, useMemo, useRef } from "react";
import useThemeSync from "./hooks/useThemeSync";
import NotesPage from "./pages/notes-page";
import { Toaster } from "@/components/ui/sonner";
import { ChatWidget } from "./components/chat/chat-widget";

function InitialRouteFromHash() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const decoded = decodeURIComponent(hash.replace(/^#/, ""));
    if (!decoded.startsWith("/")) return;

    navigate(decoded, { replace: true });
  }, [navigate]);

  return null;
}

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
  const hideSidebar = useMemo(() => {
    const value = new URLSearchParams(window.location.search).get("hideSidebar");
    return value === "1" || value === "true";
  }, []);

  const loadConfig = useConfigStore((state) => state.loadConfig);
  const loadUserPreferences = usePreferencesStore((state) => state.loadConfig);
  const loadAllTranslations = useConfigStore((state) => state.loadAllTranslations);
  const dictionaryMetadata = useConfigStore((state) => state.dictionaryMetadata);
  const hasLoadedTranslations = useRef(false);
  useThemeSync();
  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);
  useEffect(() => {
    loadUserPreferences();
  }, [loadUserPreferences]);
  useEffect(() => {
    if (Object.keys(dictionaryMetadata).length > 0 && !hasLoadedTranslations.current) {
      hasLoadedTranslations.current = true;
      void loadAllTranslations();
    }
  }, [dictionaryMetadata, loadAllTranslations]);
  return (
    <BrowserRouter>
      <InitialRouteFromHash />
      <Toaster position="top-center" richColors closeButton />
      <MainLayout hideSidebar={hideSidebar}>
        <Pages />
      </MainLayout>
    </BrowserRouter>
  );
}
