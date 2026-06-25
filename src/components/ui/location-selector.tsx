import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { searchLocations, type IndianLocation } from "@/data/indianLocations";

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const LocationSelector = ({ value, onChange, placeholder = "Search city or state...", className = "" }: LocationSelectorProps) => {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<IndianLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const prevValueRef = useRef(value);
  useEffect(() => {
    prevValueRef.current = value;
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    const matches = searchLocations(val);
    setResults(matches);
    setIsOpen(matches.length > 0);
    setHighlightIndex(-1);
  };

  const handleSelect = (loc: IndianLocation) => {
    setQuery(loc.label);
    onChange(loc.city);
    setIsOpen(false);
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(results[highlightIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
      <Input
        placeholder={placeholder}
        className="pl-10"
        value={value === prevValueRef.current ? query : (value || "")}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => { if (query.length >= 2) { setResults(searchLocations(query)); setIsOpen(true); } }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((loc, idx) => (
            <button
              key={`${loc.city}-${loc.state}`}
              type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-accent/10 flex items-center gap-2 transition-colors ${
                idx === highlightIndex ? "bg-accent/10" : ""
              }`}
              onClick={() => handleSelect(loc)}
            >
              <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span>
                <span className="font-medium">{loc.city}</span>
                <span className="text-muted-foreground">, {loc.state}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
