import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import DictionaryPage from "./pages/dictionary-page";
import TranslationGamePage from "./pages/translation-game-page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DictionaryPage />} />
          <Route path="dictionary" element={<DictionaryPage />} />
          <Route path="translation" element={<TranslationGamePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
