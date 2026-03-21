import { Link, X } from 'lucide-react';
import { useSearchBar } from './hook';
import { TranslationEntry } from '@/types/translation-entry';

export type SearchBarProps = {
  placeholder?: string;
  onSearch?: (value: string, results: TranslationEntry[]) => void;
  debounceMs?: number;
  className?: string;
  showDropdown?: boolean;
  buttonLabel?: string;
  onWordSelect?: (word: TranslationEntry) => void;
  name?: string;
};

export const SearchBar = ({
  placeholder = 'Search for a word',
  onSearch = () => { },
  debounceMs = 300,
  className = '',
  showDropdown = true,
  buttonLabel = 'Link word',
  onWordSelect = () => { },
  name = "",
}: SearchBarProps) => {
  const {
    value,
    hasValue,
    searchResults,
    containerRef,
    isDropdownOpen,
    onChange,
    onClear,
    setIsFocused,
    handleKeyDown,
    handleWordClick,
  } = useSearchBar({
    onSearch,
    debounceMs,
    autoSearch: true,
    onWordSelect,
    showDropdown,
    name
  });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex flex-row items-center text-sm text-foreground">
        <button
          className="px-3 shrink-0 py-1 pr-8 rounded-full flex items-center gap-2 border border-border bg-card text-card-foreground hover:bg-accent transition"
        >
          <Link size={16} />
          {buttonLabel}
        </button>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="w-full text-sm pl-6 -ml-3 text-foreground bg-background focus:outline-none transition border-r border-y border-border py-1 rounded-r-2xl"
        />

        {hasValue && (
          <X
            size={16}
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground"
          />
        )}
      </div>
      {showDropdown && isDropdownOpen && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-75 overflow-y-auto">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
            Found {searchResults.length}{' '}
            {searchResults.length === 1 ? 'word' : 'words'}
          </div>

          {searchResults.slice(0, 50).map((word: TranslationEntry, index: number) => (
            <div
              key={`${word.pair[0]?.original?.word}-${index}`}
              onClick={() => handleWordClick(word)}
              className="px-4 py-2.5 hover:bg-muted/30 cursor-pointer border-b border-border last:border-b-0"
            >
              <div className="flex justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">
                    {word.pair[0]?.original?.word}
                  </div>
                  {!!word.pair[0]?.translations?.length && (
                    <div className="text-xs text-muted-foreground truncate">
                      {word.pair[0].translations.map(t => t.word).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
