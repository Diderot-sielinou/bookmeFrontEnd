/**
 * SearchPage Component
 * 
 * Service provider search with filters and pagination.
 * Features:
 * - Text search
 * - Category filters
 * - Grid/List view toggle
 * - Pagination
 * - Loading states
 * - Empty/error states
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Grid, List, SlidersHorizontal, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useSearchPrestataires } from '@/hooks/usePrestataires';
import { Input, Button, Separator, Badge } from '@/components/ui';
import { LoadingState } from '@/components/ui/spinner';
import { EmptyState, ErrorState } from '@/components/shared';
import { PrestataireCard, FilterPanel } from '@/components/features/search';
import type { SearchFilters } from '@/types';

// ==========================================
// COMPONENT
// ==========================================

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter state
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || undefined,
    categories: searchParams.get('category') ? [searchParams.get('category')!] : undefined,
    page: 1,
    limit: 12,
  });
  
  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState(filters.query || '');

  // Fetch data
  const { data, isLoading, error, refetch } = useSearchPrestataires(filters);

  // Sync filters with URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.categories?.length) params.set('category', filters.categories[0]);
    if (filters.page && filters.page > 1) params.set('page', String(filters.page));
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, query: searchInput || undefined, page: 1 }));
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate active filters count
  const activeFiltersCount =
    (filters.categories?.length || 0) +
    (filters.badges?.length || 0) +
    (filters.minRating ? 1 : 0) +
    (filters.maxPrice && filters.maxPrice < 500 ? 1 : 0);

  const results = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="min-h-screen bg-background">
      {/* Search header */}
      <div className="bg-mint border-b">
        <div className="container px-4 py-8">
          <h1 className="text-3xl font-bold text-charcoal mb-4">
            Find a Service Provider
          </h1>
          
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, service, city..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button type="submit" size="lg">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Main content */}
      <div className="container px-4 py-8">
        <div className="flex gap-8">
          {/* Filter sidebar (desktop) */}
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          {/* Results */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* Mobile filter button */}
                <div className="lg:hidden">
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                  />
                </div>

                {/* Results count */}
                {meta && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{meta.total}</span> result{meta.total !== 1 ? 's' : ''}
                    {filters.query && (
                      <> for "<span className="font-medium">{filters.query}</span>"</>
                    )}
                  </p>
                )}

                {/* Active filter tags */}
                {activeFiltersCount > 0 && (
                  <div className="hidden sm:flex items-center gap-2">
                    {filters.categories?.map((cat) => (
                      <Badge key={cat} variant="secondary" className="gap-1">
                        {cat}
                        <button
                          onClick={() =>
                            handleFiltersChange({
                              ...filters,
                              categories: filters.categories?.filter((c) => c !== cat),
                            })
                          }
                          className="ml-1 hover:text-destructive"
                          aria-label={`Remove ${cat} filter`}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    
                    {activeFiltersCount > (filters.categories?.length || 0) && (
                      <button
                        onClick={() => setFilters({ page: 1, limit: 12 })}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Searching...</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <ErrorState
                title="Search Failed"
                message="Unable to load results. Please try again."
                onRetry={() => refetch()}
              />
            )}

            {/* Empty state */}
            {!isLoading && !error && results.length === 0 && (
              <EmptyState
                icon={SearchIcon}
                title="No Results Found"
                description="Try adjusting your search criteria or browse our categories."
                actionLabel="Reset Filters"
                onAction={() => setFilters({ page: 1, limit: 12 })}
              />
            )}

            {/* Results grid */}
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
                      Previous
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
                            aria-label={`Page ${page}`}
                            aria-current={page === meta.page ? 'page' : undefined}
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
                      Next
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