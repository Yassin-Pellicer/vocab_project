import { useLocation, useSearchParams } from "react-router-dom";
import { useConfigStore } from "@/context/dictionary-context";

export function useBreadcrumbNavigation() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data, selectedWord } = useConfigStore();

  const name = searchParams.get("name") || "";
  const path = searchParams.get("path") || "";

  const dictionaryName = data.navMain.find((item) =>
    item.items?.some((subItem) => {
      const itemParams = new URLSearchParams(subItem.url.split("?")[1]);
      return itemParams.get("name") === name;
    }),
  )?.title;

  const getCurrentPage = () => {
    if (location.pathname === "/dictionary") return "Dictionary";
    if (location.pathname === "/translation") return "Translate";
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

  return { breadcrumbItems };
}
