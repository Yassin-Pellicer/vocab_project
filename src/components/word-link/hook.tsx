import { useState, useEffect, useRef, useMemo } from 'react';
import { TranslationEntry } from '@/types/translation-entry';
import { useConfigStore } from '@/context/dictionary-context';

export const useSearchBar = ({
  onSearch,
  debounceMs = 300,
  autoSearch = true,
  onWordSelect,
  showDropdown = true,
  name = "",
}: {
  onSearch?: (value: string, results: TranslationEntry[]) => void;
  debounceMs?: number;
  autoSearch?: boolean;
  onWordSelect?: (word: TranslationEntry) => void;
  showDropdown?: boolean;
  name?: string;
} = {}) => {
  const {
    dictionaries,
    selectedLetter,
    selectedTypes,
    setSelectedLetter,
  } = useConfigStore();

  const [localValue, setLocalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const list = dictionaries[name] || [];

  const searchResults = useMemo(() => {
    if (!list?.length) return [];
    const term = localValue.trim().toLowerCase();
    let results = list.filter(word =>
      word.pair.some(p =>
        term === ''
          ? p.original?.word
            ?.toUpperCase()
            .startsWith(selectedLetter?.toUpperCase?.())
          : p.original?.word.toLowerCase().includes(term) ||
          p.translations?.some(t => t.word.toLowerCase().includes(term))
      )
    );
    if (selectedTypes.length) {
      results = results.filter(
        w => w.type && selectedTypes.includes(w.type)
      );
    }
    return results.sort((a, b) =>
      a.pair[0].original.word.localeCompare(b.pair[0].original.word)
    );
  }, [localValue, list, selectedLetter, selectedTypes]);

  useEffect(() => {
    if (localValue && searchResults.length && isFocused && showDropdown) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [localValue, searchResults.length, isFocused, showDropdown]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const onChange = (value: string) => {
    setLocalValue(value);
    if (value && selectedLetter) setSelectedLetter('');
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (autoSearch) {
      debounceTimerRef.current = setTimeout(() => {
        onSearch?.(value, searchResults);
      }, debounceMs);
    }
  };

  const onClear = () => {
    setLocalValue('');
    onSearch?.('', list ?? []);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchResults[0]) {
      onWordSelect?.(searchResults[0]);
      setIsDropdownOpen(false);
    }
    if (e.key === 'Escape') {
      onClear();
      setIsDropdownOpen(false);
      e.currentTarget.blur();
    }
  };

  const handleWordClick = (word: TranslationEntry) => {
    onWordSelect?.(word);
    console.log(word.pair[0].original.word)
    setIsDropdownOpen(false);
    onClear();
  };

  return {
    value: localValue,
    hasValue: !!localValue.trim(),
    searchResults,
    isDropdownOpen,
    containerRef,
    isFocused,
    setIsFocused,
    onChange,
    onClear,
    handleKeyDown,
    handleWordClick,
  };
};
