import Dictionary from "@/components/dict";
import HomePage from "@/pages/home-page";
import MarkdownPage from "@/pages/markdown-page";
import NotesPage from "@/pages/notes-page";
import TranslationGamePage from "@/pages/translation-game-page";
import { DictionaryContext } from "@/context/dictionary-context";

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  const currentName = new URLSearchParams(location.search).get("name") || "";
  const dictionaryMetadata = DictionaryContext((s) => s.dictionaryMetadata);

  return (
    <div className="h-full min-h-0">
      <div className="h-full min-h-0" style={{ display: path === "/" ? "block" : "none" }}><HomePage /></div>
      {Object.entries(dictionaryMetadata).map(([key, dict]) => (
        <div
          key={key}
          className="h-full min-h-0"
          style={{ display: path === "/dictionary" && currentName === key ? "block" : "none" }}
        >
          <Dictionary route={dict.route} name={key} />
        </div>
      ))}
      <div className="h-full min-h-0" style={{ display: path === "/markdown" ? "block" : "none" }}><MarkdownPage /></div>
      <div className="h-full min-h-0" style={{ display: path === "/notes" ? "block" : "none" }}><NotesPage /></div>
      <div className="h-full min-h-0" style={{ display: path === "/translation" ? "block" : "none" }}><TranslationGamePage /></div>
    </div>
  );
}

export { InitialRouteFromHash, Pages }
  
