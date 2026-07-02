import type { CSSProperties } from 'react';
import { GAMES } from '../utils/calendar';
import {
  getActiveFilterCount,
  getScopedFilterSections,
} from '../utils/filterUi';
import type { FilterOptions, FilterState } from '../hooks/useCharacters';

interface GameScopedFiltersProps {
  selectedGames: string[];
  activeGameId: string;
  filters: FilterState;
  filterOptionsByGame: Record<string, FilterOptions>;
  onToggleGame: (gameId: string) => void;
  onActiveGameChange: (gameId: string) => void;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  showClearAction?: boolean;
}

function emptyOptions(): FilterOptions {
  return { elements: [], rarities: [], weapons: [], regions: [] };
}

function renderFilterValue(type: keyof FilterOptions, value: string | number): string {
  if (type === 'rarities') return '★'.repeat(Number(value));
  return String(value);
}

const GameScopedFilters = ({
  selectedGames,
  activeGameId,
  filters,
  filterOptionsByGame,
  onToggleGame,
  onActiveGameChange,
  onFiltersChange,
  onClearFilters,
  showClearAction = true,
}: GameScopedFiltersProps) => {
  const activeFilterCount = getActiveFilterCount(filters);
  const activeGame = GAMES[activeGameId] ? activeGameId : Object.keys(GAMES)[0];
  const activeGameMeta = GAMES[activeGame];
  const sections = getScopedFilterSections(activeGame, filterOptionsByGame);

  const handleGameClick = (gameId: string) => {
    const isSelected = selectedGames.includes(gameId);
    const isActive = activeGame === gameId;

    if (!isSelected) {
      onToggleGame(gameId);
      onActiveGameChange(gameId);
      return;
    }

    if (!isActive) {
      onActiveGameChange(gameId);
      return;
    }

    onToggleGame(gameId);
  };

  const toggleGameFilter = (gameId: string, type: keyof FilterOptions, value: string | number) => {
    const currentGameFilters = filters.gameFilters[gameId] || emptyOptions();
    const current = currentGameFilters[type] as (string | number)[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];

    onFiltersChange({
      gameFilters: {
        ...filters.gameFilters,
        [gameId]: {
          ...currentGameFilters,
          [type]: updated,
        },
      },
    });
  };

  return (
    <div className="filter-section game-scoped-filter">
      <div className="filter-heading-row">
        <span className="filter-label">筛选:</span>
        <span className="active-filter-summary">
          {activeFilterCount > 0 ? `${activeFilterCount} 项已启用` : '无筛选'}
        </span>
        {showClearAction && activeFilterCount > 0 && (
          <button className="filter-clear" onClick={onClearFilters}>清除筛选</button>
        )}
      </div>

      <div className="filter-game-selector" aria-label="游戏筛选">
        {Object.entries(GAMES).map(([gameId, game]) => {
          const isSelected = selectedGames.includes(gameId);
          const isActive = activeGame === gameId;

          return (
            <button
              key={gameId}
              className={`game-filter ${isSelected ? 'active' : ''} ${isActive ? 'current' : ''}`}
              onClick={() => handleGameClick(gameId)}
              aria-pressed={isSelected}
              title={isActive && isSelected ? '再次点击隐藏该游戏' : '切换游戏筛选'}
              style={{ '--game-color': game.color } as CSSProperties}
            >
              <span className="game-indicator" style={{ backgroundColor: game.color }} />
              {game.name}
            </button>
          );
        })}
      </div>

      <label className="filter-checkbox">
        <input
          type="checkbox"
          checked={filters.showMissingInfo}
          onChange={event => onFiltersChange({ showMissingInfo: event.target.checked })}
        />
        <span>显示信息不全的角色</span>
      </label>

      <section className="game-filter-panel active-game-panel" style={{ '--game-color': activeGameMeta.color } as CSSProperties}>
        <div className="game-filter-title">
          <span className="game-indicator" style={{ backgroundColor: activeGameMeta.color }} />
          {activeGameMeta.name}
        </div>

        <div className="filter-groups scoped">
          {sections.map(section => {
            const selected = filters.gameFilters[activeGame]?.[section.type] as (string | number)[] | undefined;
            if (section.values.length === 0) return null;

            return (
              <div className="filter-group" key={section.type}>
                <span className="filter-group-label">{section.label}</span>
                <div className="filter-tags filter-tags-scroll">
                  {section.values.map(value => (
                    <button
                      key={String(value)}
                      className={`filter-tag ${selected?.includes(value) ? 'active' : ''}`}
                      onClick={() => toggleGameFilter(activeGame, section.type, value)}
                    >
                      {renderFilterValue(section.type, value)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default GameScopedFilters;
