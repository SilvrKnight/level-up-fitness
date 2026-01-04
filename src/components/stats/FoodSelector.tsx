import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { FoodItem } from '@/types/food';
import { useFoodItems } from '@/hooks/useFoodItems';
import { Check, Database, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FoodSelectorProps {
  value: string;
  onSelect: (food: FoodItem | null, customName?: string) => void;
  placeholder?: string;
}

export const FoodSelector: React.FC<FoodSelectorProps> = ({
  value,
  onSelect,
  placeholder = 'Search food database...',
}) => {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const { searchFoods, loading } = useFoodItems();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = searchFoods(query);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleSelect = (food: FoodItem) => {
    setQuery(food.name);
    setIsOpen(false);
    onSelect(food);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setIsOpen(true);
    
    // If user clears input or types something not in DB
    if (!newValue.trim()) {
      onSelect(null, '');
    } else {
      // Check if it matches a food exactly
      const exactMatch = results.find(
        f => f.name.toLowerCase() === newValue.toLowerCase()
      );
      if (exactMatch) {
        onSelect(exactMatch);
      } else {
        // Custom food - will need AI or manual entry
        onSelect(null, newValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
    if (e.key === 'Enter' && results.length > 0 && isOpen) {
      e.preventDefault();
      handleSelect(results[0]);
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <Input
        ref={inputRef}
        value={query}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="font-medium"
      />
      
      {isOpen && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-[240px] overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>No match found. Will use AI estimation.</span>
              </div>
            </div>
          ) : (
            results.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => handleSelect(food)}
                className={cn(
                  "w-full px-3 py-2 text-left hover:bg-muted/50 flex items-center justify-between gap-2 transition-colors",
                  query.toLowerCase() === food.name.toLowerCase() && "bg-muted/30"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Database className="h-3.5 w-3.5 text-success shrink-0" />
                  <span className="font-medium truncate">{food.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  <span>{food.calories_per_100g} cal</span>
                  <span className="text-success">P:{food.protein_per_100g}</span>
                  {query.toLowerCase() === food.name.toLowerCase() && (
                    <Check className="h-4 w-4 text-success" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
