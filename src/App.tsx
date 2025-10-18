import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import TranslationGame from "./components/translationGame";
import DictionaryPage from "./pages/DictionaryPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DictionaryPage />} />
          <Route path="dictionary" element={<DictionaryPage />} />
          <Route path="translation" element={<TranslationGame />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
