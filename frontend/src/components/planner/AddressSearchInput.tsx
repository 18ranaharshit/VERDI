// Performance: Debounced autocomplete (400ms) - only fires API call when user pauses typing
import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { useAutocomplete } from '@/hooks/useRoutePlanner';
import type { AutocompleteSuggestion } from '@/types';

interface AddressSearchInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: AutocompleteSuggestion) => void;
  placeholder?: string;
}

export default function AddressSearchInput({ label, value, onChange, onSelect, placeholder }: AddressSearchInputProps) {
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 400ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.length >= 3) {
        setDebouncedQuery(value);
      } else {
        setDebouncedQuery('');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [value]);

  const { data: suggestions, isLoading } = useAutocomplete(debouncedQuery);

  useEffect(() => {
    if (suggestions && suggestions.length > 0 && isFocused) {
      setShowDropdown(true);
    }
  }, [suggestions, isFocused]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (suggestion: AutocompleteSuggestion) => {
    onChange(suggestion.shortName);
    onSelect(suggestion);
    setShowDropdown(false);
    setDebouncedQuery('');
  };

  return (
    <div className="relative">
      <label
        className={`absolute left-10 transition-all duration-200 pointer-events-none font-display font-semibold
          ${isFocused || value
            ? 'top-1 text-[10px] text-verdi-accent'
            : 'top-3.5 text-sm text-verdi-muted'
          }`}
      >
        {label}
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-verdi-muted" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={isFocused ? placeholder : ''}
          autoComplete="off"
          inputMode="search"
          className="w-full pl-10 pr-10 pt-5 pb-2 rounded-xl bg-white/90 dark:bg-[#022c22]/90
                     border border-verdi-border/50 text-base text-verdi-primary
                     placeholder:text-verdi-muted/50 shadow-sm
                     focus:outline-none focus:bg-white dark:focus:bg-[#022c22]
                     focus:border-verdi-accent focus:ring-1 focus:ring-verdi-glow
                     transition-all duration-200"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-verdi-muted animate-spin" />
        )}
        {value && !isLoading && (
          <button
            onClick={() => { onChange(''); setDebouncedQuery(''); setShowDropdown(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-verdi-muted hover:text-verdi-primary"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && suggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-[9999] mt-1 bg-white dark:bg-[#022c22]
                     rounded-xl shadow-xl border border-verdi-border max-h-60 overflow-y-auto"
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 border-b border-verdi-border/30 last:border-0
                         hover:bg-verdi-subtle transition-colors"
            >
              <p className="text-sm font-semibold text-verdi-primary">{s.shortName}</p>
              <p className="text-xs text-verdi-muted truncate">{s.displayName}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
