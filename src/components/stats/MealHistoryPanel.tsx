import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMealTemplates } from '@/hooks/useMealTemplates';
import { MealTemplate } from '@/types/food';
import { Ingredient } from '@/types/meal';
import { Star, Clock, Search, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface MealHistoryPanelProps {
  onSelectTemplate: (mealName: string, ingredients: Ingredient[]) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export const MealHistoryPanel: React.FC<MealHistoryPanelProps> = ({
  onSelectTemplate,
  isExpanded,
  onToggle,
}) => {
  const { templates, loading, toggleFavorite, deleteTemplate, getIngredientsFromTemplate } = useMealTemplates();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter(t =>
    t.meal_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favorites = filteredTemplates.filter(t => t.is_favorite);
  const recent = filteredTemplates.filter(t => !t.is_favorite);

  const handleSelect = (template: MealTemplate) => {
    const ingredients = getIngredientsFromTemplate(template);
    onSelectTemplate(template.meal_name, ingredients);
  };

  if (loading) {
    return (
      <div className="border border-dashed border-border/50 rounded-lg p-4">
        <div className="text-sm text-muted-foreground">Loading meal history...</div>
      </div>
    );
  }

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4 text-primary" />
          Quick Add from History
          <span className="text-muted-foreground">({templates.length})</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search past meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="max-h-[200px] overflow-y-auto space-y-1">
            {favorites.length > 0 && (
              <>
                <div className="text-xs font-medium text-muted-foreground px-1 py-1">
                  Favorites
                </div>
                {favorites.map(template => (
                  <MealTemplateRow
                    key={template.id}
                    template={template}
                    onSelect={() => handleSelect(template)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                    onDelete={() => deleteTemplate(template.id)}
                  />
                ))}
              </>
            )}

            {recent.length > 0 && (
              <>
                <div className="text-xs font-medium text-muted-foreground px-1 py-1 mt-2">
                  Recent
                </div>
                {recent.map(template => (
                  <MealTemplateRow
                    key={template.id}
                    template={template}
                    onSelect={() => handleSelect(template)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                    onDelete={() => deleteTemplate(template.id)}
                  />
                ))}
              </>
            )}

            {filteredTemplates.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No meals match your search
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface MealTemplateRowProps {
  template: MealTemplate;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

const MealTemplateRow: React.FC<MealTemplateRowProps> = ({
  template,
  onSelect,
  onToggleFavorite,
  onDelete,
}) => {
  return (
    <div className="group flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 text-left min-w-0"
      >
        <div className="font-medium text-sm truncate">{template.meal_name}</div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{Math.round(template.total_calories)} cal</span>
          <span className="text-success">P:{Math.round(template.total_protein)}g</span>
          <span>
            {formatDistanceToNow(new Date(template.last_used_at), { addSuffix: true })}
          </span>
        </div>
      </button>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Star
            className={cn(
              "h-4 w-4",
              template.is_favorite ? "fill-warning text-warning" : "text-muted-foreground"
            )}
          />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
