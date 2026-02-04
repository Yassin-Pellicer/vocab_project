import TranslationGamePage from "./pages/translation-game-page";
import DictionaryPage from "./pages/dictionary-page";
import MarkdownPage from "./pages/markdown-page";
import HomePage from "./pages/home-page";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useConfigStore } from "./context/dictionary-context";
import { MainLayout } from "./layouts";
import { useEffect } from "react";
import ConfigPage from "./pages/config-page";

function App() {
  const loadConfig = useConfigStore(state => state.loadConfig);
  const loadAllTranslations = useConfigStore(state => state.loadAllTranslations);
  const dictionaryMetadata = useConfigStore(state => state.dictionaryMetadata);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

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
          <Route path="/config" element={<ConfigPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
