import { Link, X } from 'lucide-react';
import { useSearchBar } from './hook';
import { TranslationEntry } from '@/types/translation-entry';


export const SearchBar = ({
  placeholder = 'Search for a word',
  onSearch = () => {},
  debounceMs = 300,
  className = '',
  showDropdown = true,
  buttonLabel = 'Link word',
  onWordSelect = (_word: TranslationEntry) => {},
}) => {
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
  });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex flex-row items-center text-sm text-gray-500">
        <button
          className="px-3 shrink-0 py-1 rounded-full flex items-center gap-2 outline outline-gray-300"
        >
          <Link size={16}/>
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
          className="w-full text-sm pl-6 ml-[-12px] outline-gray-300 text-gray-700 focus:outline-none transition border-r border-y py-1 rounded-r-2xl"
        />

        {hasValue && (
          <X
            size={16}
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
          />
        )}
      </div>
      {showDropdown && isDropdownOpen && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
          <div className="px-3 py-2 text-xs text-gray-500 border-b">
            Found {searchResults.length}{' '}
            {searchResults.length === 1 ? 'word' : 'words'}
          </div>

          {searchResults.slice(0, 50).map((word, index) => (
            <div
              key={`${word.pair[0]?.original?.word}-${index}`}
              onClick={() => handleWordClick(word)}
              className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
            >
              <div className="flex justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {word.pair[0]?.original?.word}
                  </div>
                  {!!word.pair[0]?.translations?.length && (
                    <div className="text-xs text-gray-600 truncate">
                      {word.pair[0].translations.map(t => t.word).join(', ')}
                    </div>
                  )}
                </div>

                {word.type && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                    {word.type}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
