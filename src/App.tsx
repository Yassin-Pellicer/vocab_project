import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import DictionaryPage from "./pages/dictionary-page";
import TranslationGamePage from "./pages/translation-game-page";
import React from "react";
import useConfigStore from "./context/dictionary-context";
import MarkdownPage from "./pages/markdown-page";

function App() {
  React.useEffect(() => {
    useConfigStore.getState().loadConfig();
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/markdown" element={<MarkdownPage />} />
          <Route path="/translation" element={<TranslationGamePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
