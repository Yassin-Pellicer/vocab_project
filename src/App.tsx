import useThemeSync from "./hooks/useThemeSync";

import { BrowserRouter } from "react-router-dom";
import { DictionaryContext } from "./context/dictionary-context";
import { PreferencesContext } from "@/context/preferences-context";
import { MainLayout } from "./layouts";
import { useEffect, useMemo, useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { InitialRouteFromHash, Pages } from "./hooks/use-page-memoization";

export default function App() {

  const hasLoadedTranslations = useRef(false);

  const dictionaryContext = DictionaryContext();
  const preferencesContext = PreferencesContext();

  const hideSidebar = useMemo(() => {
    const value = new URLSearchParams(window.location.search).get("hideSidebar");
    return value === "1" || value === "true";
  }, []);

  useEffect(() => {
    dictionaryContext.loadConfig();
  }, []);

  useEffect(() => {
    preferencesContext.loadConfig();
  }, []);

  useEffect(() => {
    if (
      Object.keys(dictionaryContext.dictionaryMetadata).length > 0 &&
      !hasLoadedTranslations.current
    ) {
      hasLoadedTranslations.current = true;
      void dictionaryContext.loadAllTranslations();
    }
  }, [dictionaryContext]);

  useThemeSync();

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
