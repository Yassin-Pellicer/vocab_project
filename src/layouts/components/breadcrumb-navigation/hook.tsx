import { useLocation, useSearchParams } from "react-router-dom";
import { DictionaryContext } from "@/context/dictionary-context";
import { NotesContext } from "@/context/notes-context";

export function useBreadcrumbNavigation() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { sidebarNavigationData, selectedWordByDict } = DictionaryContext();
  const { itemsFromRouteRecursive } = NotesContext();

  const name = searchParams.get("name") || "";
  const path = searchParams.get("path") || "";
  const selectedWord = selectedWordByDict[name] ?? null;

  const dictionaryName = sidebarNavigationData.navMain.find((item) =>
    item.items?.some((subItem) => {
      if(!subItem.url) {
        return false;
      }
      const itemParams = new URLSearchParams(subItem.url.split("?")[1]);
      return itemParams.get("name") === name;
    }),
  )?.title;

  const getCurrentPage = () => {
    if (location.pathname === "/dictionary") return "Dictionary";
    if (location.pathname === "/translation") return "Translate";
    if (location.pathname === "/notes") return "Notes";
    if (location.pathname === "/markdown" && selectedWord)
      return selectedWord.pair[0].original.word;
    return null;
  };

  const currentPage = getCurrentPage();
  const dictionaryUrl = `/dictionary?name=${encodeURIComponent(name)}&path=${encodeURIComponent(path)}`;

  const breadcrumbItems = [];

  if (dictionaryName && currentPage) {
    breadcrumbItems.push({ label: dictionaryName, url: dictionaryUrl });

    if (location.pathname === "/markdown") {
      breadcrumbItems.push({ label: "Dictionary", url: dictionaryUrl });
    }

    breadcrumbItems.push({ label: currentPage, url: null });
  }

  if (location.pathname === "/notes") {
    const items = itemsFromRouteRecursive();
    items?.forEach((element) => {
      breadcrumbItems.push({ label: element.title, url: null });
    });
  }

  return { breadcrumbItems };
}
