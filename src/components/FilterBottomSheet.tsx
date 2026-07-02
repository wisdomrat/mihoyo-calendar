import GameScopedFilters from './GameScopedFilters';
import { getActiveFilterCount } from '../utils/filterUi';
import type { FilterOptions, FilterState } from '../hooks/useCharacters';

interface FilterBottomSheetProps {
  isOpen: boolean;
  selectedGames: string[];
  activeGameId: string;
  filters: FilterState;
  filterOptionsByGame: Record<string, FilterOptions>;
  onClose: () => void;
  onToggleGame: (gameId: string) => void;
  onActiveGameChange: (gameId: string) => void;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
}

const FilterBottomSheet = ({
  isOpen,
  selectedGames,
  activeGameId,
  filters,
  filterOptionsByGame,
  onClose,
  onToggleGame,
  onActiveGameChange,
  onFiltersChange,
  onClearFilters,
}: FilterBottomSheetProps) => {
  if (!isOpen) return null;

  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <div className="filter-sheet-overlay" onClick={onClose}>
      <section className="filter-bottom-sheet" aria-label="筛选面板" onClick={event => event.stopPropagation()}>
        <div className="filter-sheet-header">
          <h2>筛选</h2>
          <button className="filter-sheet-close" onClick={onClose} aria-label="关闭筛选面板">×</button>
        </div>

        <div className="filter-sheet-body">
          <GameScopedFilters
            selectedGames={selectedGames}
            activeGameId={activeGameId}
            filters={filters}
            filterOptionsByGame={filterOptionsByGame}
            onToggleGame={onToggleGame}
            onActiveGameChange={onActiveGameChange}
            onFiltersChange={onFiltersChange}
            onClearFilters={onClearFilters}
            showClearAction={false}
          />
        </div>

        <div className="filter-sheet-footer">
          <button className="filter-clear" onClick={onClearFilters} disabled={activeFilterCount === 0}>清除筛选</button>
          <button className="action-btn apply-filter-btn" onClick={onClose}>应用</button>
        </div>
      </section>
    </div>
  );
};

export default FilterBottomSheet;
