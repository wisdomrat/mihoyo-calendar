import GameScopedFilters from './GameScopedFilters';
import { getActiveFilterCount } from '../utils/filterUi';
import type { FilterOptions, FilterState } from '../hooks/useCharacters';

interface FilterSidebarProps {
  collapsed: boolean;
  selectedGames: string[];
  activeGameId: string;
  filters: FilterState;
  filterOptionsByGame: Record<string, FilterOptions>;
  onToggleCollapsed: () => void;
  onToggleGame: (gameId: string) => void;
  onActiveGameChange: (gameId: string) => void;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
}

const FilterSidebar = ({
  collapsed,
  selectedGames,
  activeGameId,
  filters,
  filterOptionsByGame,
  onToggleCollapsed,
  onToggleGame,
  onActiveGameChange,
  onFiltersChange,
  onClearFilters,
}: FilterSidebarProps) => {
  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <aside className={`filter-sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="筛选栏">
      <button
        className="filter-sidebar-toggle"
        onClick={onToggleCollapsed}
        title={collapsed ? '展开筛选栏' : '收起筛选栏'}
        aria-label={collapsed ? '展开筛选栏' : '收起筛选栏'}
      >
        {collapsed ? '›' : '‹'}
      </button>

      {collapsed ? (
        <div className="filter-sidebar-rail" aria-hidden="true">
          <span className="filter-rail-icon">筛</span>
          {activeFilterCount > 0 && <span className="filter-count-badge">{activeFilterCount}</span>}
        </div>
      ) : (
        <>
          <div className="filter-sidebar-header">
            <h2>筛选</h2>
            {activeFilterCount > 0 && <span className="filter-count-badge">{activeFilterCount}</span>}
          </div>

          <GameScopedFilters
            selectedGames={selectedGames}
            activeGameId={activeGameId}
            filters={filters}
            filterOptionsByGame={filterOptionsByGame}
            onToggleGame={onToggleGame}
            onActiveGameChange={onActiveGameChange}
            onFiltersChange={onFiltersChange}
            onClearFilters={onClearFilters}
          />
        </>
      )}
    </aside>
  );
};

export default FilterSidebar;
