/**
 * Page de recherche de prestataires
 * 
 * Affiche les résultats de recherche avec filtres et pagination.
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Grid, List, SlidersHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useSearchPrestataires } from '@/hooks/usePrestataires';
import { Input, Button, Separator, Badge } from '@/components/ui';
import { LoadingState } from '@/components/ui/spinner';
import { EmptyState, ErrorState } from '@/components/shared';
import { PrestataireCard, FilterPanel } from '@/components/features/search';
import type { SearchFilters } from '@/types';

// ==========================================
// COMPOSANT
// ==========================================

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // État des filtres
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || undefined,
    categories: searchParams.get('category') ? [searchParams.get('category')!] : undefined,
    page: 1,
    limit: 12,
  });
  
  // État de l'affichage
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState(filters.query || '');

  // Query
  const { data, isLoading, error, refetch } = useSearchPrestataires(filters);

  // Synchroniser les filtres avec l'URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.categories?.length) params.set('category', filters.categories[0]);
    if (filters.page && filters.page > 1) params.set('page', String(filters.page));
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Gérer la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, query: searchInput || undefined, page: 1 }));
  };

  // Gérer les changements de filtres
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Gérer la pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculer les filtres actifs
  const activeFiltersCount =
    (filters.categories?.length || 0) +
    (filters.badges?.length || 0) +
    (filters.minRating ? 1 : 0) +
    (filters.maxPrice && filters.maxPrice < 500 ? 1 : 0);

  const results = data?.data || [];
  const meta = data?.meta;
  // console.log(`resulta SearchPage ${JSON.stringify(results)} et ${meta}`)

  return (
    <div className="min-h-screen bg-background">
      {/* Header de recherche */}
      <div className="bg-mint border-b">
        <div className="container px-4 py-8">
          <h1 className="text-3xl font-bold text-charcoal mb-4">
            Trouver un prestataire
          </h1>
          
          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par nom, service, ville..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button type="submit" size="lg">
              Rechercher
            </Button>
          </form>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container px-4 py-8">
        <div className="flex gap-8">
          {/* Filtres (sidebar desktop) */}
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          {/* Résultats */}
          <div className="flex-1">
            {/* Barre d'outils */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* Filtres mobile */}
                <div className="lg:hidden">
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                  />
                </div>

                {/* Compteur de résultats */}
                {meta && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{meta.total}</span> résultats
                    {filters.query && (
                      <> pour "<span className="font-medium">{filters.query}</span>"</>
                    )}
                  </p>
                )}

                {/* Tags de filtres actifs */}
                {activeFiltersCount > 0 && (
                  <div className="hidden sm:flex items-center gap-2">
                    {filters.categories?.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {cat}
                        <button
                          onClick={() =>
                            handleFiltersChange({
                              ...filters,
                              categories: filters.categories?.filter((c) => c !== cat),
                            })
                          }
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Options d'affichage */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* États */}
            {isLoading && <LoadingState message="Recherche en cours..." />}

            {error && (
              <ErrorState
                title="Erreur de recherche"
                message="Impossible de charger les résultats. Veuillez réessayer."
                onRetry={() => refetch()}
              />
            )}

            {!isLoading && !error && results.length === 0 && (
              <EmptyState
                icon={SearchIcon}
                title="Aucun résultat"
                description="Essayez de modifier vos critères de recherche ou explorez nos catégories."
                actionLabel="Réinitialiser les filtres"
                onAction={() => setFilters({ page: 1, limit: 12 })}
              />
            )}

            {/* Grille de résultats */}
            {!isLoading && !error && results.length > 0 && (
              <>
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'flex flex-col gap-4'
                  )}
                >
                  {results.map((prestataire) => (
                    <PrestataireCard
                      key={prestataire.id}
                      prestataire={prestataire}
                      className={viewMode === 'list' ? 'flex-row' : ''}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={meta.page === 1}
                      onClick={() => handlePageChange(meta.page - 1)}
                    >
                      Précédent
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, meta.totalPages))].map((_, i) => {
                        let page: number;
                        if (meta.totalPages <= 5) {
                          page = i + 1;
                        } else if (meta.page <= 3) {
                          page = i + 1;
                        } else if (meta.page >= meta.totalPages - 2) {
                          page = meta.totalPages - 4 + i;
                        } else {
                          page = meta.page - 2 + i;
                        }

                        return (
                          <Button
                            key={page}
                            variant={page === meta.page ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      disabled={meta.page === meta.totalPages}
                      onClick={() => handlePageChange(meta.page + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
