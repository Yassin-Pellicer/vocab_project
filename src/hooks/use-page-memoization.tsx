import DictionaryPage from "@/pages/dictionary-page";
import HomePage from "@/pages/home-page";
import MarkdownPage from "@/pages/markdown-page";
import NotesPage from "@/pages/notes-page";

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

  return (
    <>
      <div style={{ display: path === "/" ? "block" : "none" }}><HomePage /></div>
      <div style={{ display: path === "/dictionary" ? "block" : "none" }}><DictionaryPage /></div>
      <div style={{ display: path === "/markdown" ? "block" : "none" }}><MarkdownPage /></div>
      <div style={{ display: path === "/notes" ? "block" : "none" }}><NotesPage /></div>
    </>
  );
}

export { InitialRouteFromHash, Pages }
  