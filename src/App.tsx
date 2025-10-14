import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import DictionaryPage from "./pages/DictionaryPage";
import TranslationGame from "./components/translationGame";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TranslationGame />} />
          <Route path="dictionary" element={<DictionaryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
