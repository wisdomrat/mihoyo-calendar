import type { CSSProperties } from 'react';
import { GAMES, effectiveDateMode, gameHasBirthday, gameHasRelease, gameDateLabel } from '../utils/calendar';
import {
  getActiveFilterCount,
  getScopedFilterSections,
} from '../utils/filterUi';
import type { FilterOptions, FilterState, DateMode } from '../hooks/useCharacters';

interface GameScopedFiltersProps {
  selectedGames: string[];
  activeGameId: string;
  filters: FilterState;
  filterOptionsByGame: Record<string, FilterOptions>;
  dateMode?: DateMode;
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
  dateMode = 'birthday',
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
  // 标题后缀随日期模式变化：原神角色生日 / 原神角色实装日；无生日游戏恒为实装日
  const activeGameDateLabel = gameDateLabel(activeGame, dateMode);
  // 整游戏缺某一项时提示（与当前模式无关）：
  //  - 星穹铁道：官方未公开生日 → 恒用实装日
  //  - 崩坏3：暂未收录实装日期 → 恒用生日
  const lacksBirthday = !gameHasBirthday(activeGame);
  const lacksRelease = !gameHasRelease(activeGame);

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
          const dateSuffix = effectiveDateMode(gameId, dateMode) === 'release' ? '实装日' : '生日';

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
              <span className="game-filter-text">
                <span className="game-filter-name">{game.name}</span>
                <span className="game-filter-suffix">角色{dateSuffix}</span>
              </span>
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
          {activeGameDateLabel}
        </div>

        {lacksBirthday && (
          <p className="game-filter-date-notice">
            {activeGameMeta.name}角色未公开生日，以其首次实装时间代替展示，敬请留意。
          </p>
        )}
        {lacksRelease && (
          <p className="game-filter-date-notice">
            {activeGameMeta.name}角色暂未收录首次实装日期，仍以角色生日展示，敬请留意。
          </p>
        )}

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
