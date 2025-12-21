/**
 * Composant FilterPanel
 * 
 * Panneau de filtres pour la recherche de prestataires.
 * Peut être affiché en sidebar (desktop) ou drawer (mobile).
 */

import { useState, useEffect } from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';

import { cn } from '@/lib/utils';
import { PROFESSIONAL_CATEGORIES, BADGE_INFO } from '@/lib/constants';
import {
  Button,
  Checkbox,
  Label,
  Slider,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Badge,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui';
import type { SearchFilters, BadgeType } from '@/types';

// ==========================================
// TYPES
// ==========================================

interface FilterPanelProps {
  /** Filtres actuels */
  filters: SearchFilters;
  /** Callback quand les filtres changent */
  onFiltersChange: (filters: SearchFilters) => void;
  /** Classes additionnelles */
  className?: string;
}

// ==========================================
// COMPOSANT CONTENU DES FILTRES
// ==========================================

function FilterContent({
  filters,
  onFiltersChange,
  onReset,
}: {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onReset: () => void;
}) {
  // États locaux pour les sliders
  const [localMinRating, setLocalMinRating] = useState(filters.minRating || 0);
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || 500);

  // Synchroniser avec les filtres externes
  useEffect(() => {
    setLocalMinRating(filters.minRating || 0);
    setLocalMaxPrice(filters.maxPrice || 500);
  }, [filters.minRating, filters.maxPrice]);

  // Gérer le changement de catégorie
  const toggleCategory = (category: string) => {
    const current = filters.categories || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onFiltersChange({ ...filters, categories: updated });
  };

  // Gérer le changement de badge
  const toggleBadge = (badge: BadgeType) => {
    const current = filters.badges || [];
    const updated = current.includes(badge)
      ? current.filter((b) => b !== badge)
      : [...current, badge];
    onFiltersChange({ ...filters, badges: updated });
  };

  // Appliquer la note minimum
  const applyMinRating = () => {
    onFiltersChange({ ...filters, minRating: localMinRating });
  };

  // Appliquer le prix maximum
  const applyMaxPrice = () => {
    onFiltersChange({ ...filters, maxPrice: localMaxPrice });
  };

  // Compter les filtres actifs
  const activeFiltersCount =
    (filters.categories?.length || 0) +
    (filters.badges?.length || 0) +
    (filters.minRating && filters.minRating > 0 ? 1 : 0) +
    (filters.maxPrice && filters.maxPrice < 500 ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">Filtres</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      <Separator />

      {/* Sections de filtres */}
      <Accordion type="multiple" defaultValue={['categories', 'rating']} className="w-full">
        {/* Catégories */}
        <AccordionItem value="categories">
          <AccordionTrigger className="text-sm font-medium">
            Catégories
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-2 pt-2">
              {PROFESSIONAL_CATEGORIES.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category}`}
                    checked={(filters.categories || []).includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <Label
                    htmlFor={`cat-${category}`}
                    className="text-sm cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Note minimum */}
        <AccordionItem value="rating">
          <AccordionTrigger className="text-sm font-medium">
            Note minimum
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {localMinRating === 0 ? 'Toutes les notes' : `${localMinRating}+ étoiles`}
                </span>
                <span className="text-sm font-medium">{localMinRating}/5</span>
              </div>
              <Slider
                value={[localMinRating]}
                onValueChange={([value]) => setLocalMinRating(value)}
                onValueCommit={applyMinRating}
                min={0}
                max={5}
                step={0.5}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Prix maximum */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">
            Prix maximum
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {localMaxPrice >= 500 ? 'Tous les prix' : `Max ${localMaxPrice} €`}
                </span>
                <span className="text-sm font-medium">{localMaxPrice} €</span>
              </div>
              <Slider
                value={[localMaxPrice]}
                onValueChange={([value]) => setLocalMaxPrice(value)}
                onValueCommit={applyMaxPrice}
                min={10}
                max={500}
                step={10}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Badges */}
        <AccordionItem value="badges">
          <AccordionTrigger className="text-sm font-medium">
            Badges
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-2 pt-2">
              {(Object.keys(BADGE_INFO) as BadgeType[]).map((badge) => {
                const info = BADGE_INFO[badge];
                return (
                  <div key={badge} className="flex items-center space-x-2">
                    <Checkbox
                      id={`badge-${badge}`}
                      checked={(filters.badges || []).includes(badge)}
                      onCheckedChange={() => toggleBadge(badge)}
                    />
                    <Label
                      htmlFor={`badge-${badge}`}
                      className="text-sm cursor-pointer flex items-center gap-2"
                    >
                      <span>{info.icon}</span>
                      <span>{info.label}</span>
                    </Label>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

export function FilterPanel({ filters, onFiltersChange, className }: FilterPanelProps) {
  const handleReset = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    });
  };

  // Version Desktop (sidebar)
  const desktopContent = (
    <div className={cn('hidden lg:block w-64 shrink-0', className)}>
      <div className="sticky top-20 rounded-lg border bg-card p-4">
        <FilterContent
          filters={filters}
          onFiltersChange={onFiltersChange}
          onReset={handleReset}
        />
      </div>
    </div>
  );

  // Version Mobile (drawer)
  const mobileContent = (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
            {(filters.categories?.length || 0) + (filters.badges?.length || 0) > 0 && (
              <Badge variant="default" className="ml-2 text-xs">
                {(filters.categories?.length || 0) + (filters.badges?.length || 0)}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtres</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent
              filters={filters}
              onFiltersChange={onFiltersChange}
              onReset={handleReset}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <>
      {desktopContent}
      {mobileContent}
    </>
  );
}

export default FilterPanel;
