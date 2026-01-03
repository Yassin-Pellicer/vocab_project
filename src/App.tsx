import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import DictionaryPage from "./pages/dictionary-page";
import TranslationGamePage from "./pages/translation-game-page";
import HomePage from "./pages/home-page";
import { useEffect } from "react";
import MarkdownPage from "./pages/markdown-page";
import { useConfigStore } from "./context/dictionary-context";

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
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/markdown" element={<MarkdownPage />} />
          <Route path="/translation" element={<TranslationGamePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
