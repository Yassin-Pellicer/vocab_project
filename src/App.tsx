import TranslationGamePage from "./pages/translation-game-page";
import DictionaryPage from "./pages/dictionary-page";
import MarkdownPage from "./pages/markdown-page";
import HomePage from "./pages/home-page";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useConfigStore } from "./context/dictionary-context";
import { useConfigStore as usePreferencesStore } from "@/context/preferences-context";
import { MainLayout } from "./layouts";
import { useEffect } from "react";
import useThemeSync from "./hooks/useThemeSync";

function App() {
  const loadConfig = useConfigStore((state: any) => state.loadConfig);
  const loadUserPreferences = usePreferencesStore((state: any) => state.loadConfig);
  const loadAllTranslations = useConfigStore((state: any) => state.loadAllTranslations);
  const dictionaryMetadata = useConfigStore((state: any) => state.dictionaryMetadata);

  useThemeSync();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    loadUserPreferences();
  }, [loadUserPreferences]);

  useEffect(() => {
    if (Object.keys(dictionaryMetadata).length > 0) {
      loadAllTranslations();
    }
  }, [dictionaryMetadata, loadAllTranslations]);

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/markdown" element={<MarkdownPage />} />
          <Route path="/translation" element={<TranslationGamePage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
