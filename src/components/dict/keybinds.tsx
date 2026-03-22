import { useCallback, useMemo } from "react";
import { useKeybinds } from "@/hooks/use-keybinds";
import { DictionaryContext } from "@/context/dictionary-context";
import type { TranslationEntry } from "@/types/translation-entry";

export function useDictionaryKeybinds({
  searchField,
  setSearchField,
  searchRef,
  addWordButtonRef,
  filteredWords,
  paginatedWords,
  handleLetterClick,
}: {
  searchField: string;
  setSearchField: (value: string) => void;
  searchRef: React.RefObject<HTMLInputElement>;
  addWordButtonRef: React.RefObject<HTMLButtonElement>;
  filteredWords: TranslationEntry[];
  paginatedWords: TranslationEntry[];
  handleLetterClick: (letter: string) => void;
}) {

  const setSelectedWord = DictionaryContext((state) => state.setSelectedWord);

  const actions = useMemo(
    () => ({
      "New Word": () => addWordButtonRef.current?.click(),
      "Quick Add": () => addWordButtonRef.current?.click(),
      Search: () => searchRef.current?.focus(),
    }),
    [addWordButtonRef, searchRef],
  );

  const onUnhandledKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isLetter = /^[a-zA-Z]$/.test(e.key);
      if (e.key === "F1") {
        setSelectedWord(
          filteredWords?.length ? filteredWords[0] : paginatedWords?.[0] || null,
        );
        return;
      }

      if (e.altKey && isLetter) {
        e.preventDefault();
        handleLetterClick(e.key.toUpperCase());
        return;
      }

      if (e.key === "Enter" && !e.altKey && e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        addWordButtonRef.current?.click();
        return;
      }

      if (isLetter && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        searchRef.current?.focus();
        setSearchField(searchField + e.key);
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setSearchField("");
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    },
    [
      addWordButtonRef,
      filteredWords,
      paginatedWords,
      handleLetterClick,
      searchField,
      searchRef,
      setSearchField,
      setSelectedWord,
    ],
  );

  useKeybinds({
    actions,
    onUnhandledKeyDown,
  });
}
