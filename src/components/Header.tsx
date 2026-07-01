import { GAMES } from '../utils/calendar';
import type { DisplayMode, WeekStart, FilterState, FilterOptions } from '../hooks/useCharacters';

interface HeaderProps {
  selectedGames: string[];
  onToggleGame: (gameId: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  syncProgress: string;
  lastSync: string | null;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  weekStart: WeekStart;
  onWeekStartChange: (start: WeekStart) => void;
  portraitBackgroundEnabled: boolean;
  onPortraitBackgroundChange: (enabled: boolean) => void;
  filters: FilterState;
  filterOptionsByGame: Record<string, FilterOptions>;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onAddCharacter: () => void;
  onExport: () => void;
}

const FILTER_LABELS: Record<string, { elements: string; weapons: string; regions: string }> = {
  genshin: { elements: '元素', weapons: '武器', regions: '地区' },
  hsr: { elements: '属性', weapons: '命途', regions: '阵营' },
  zzz: { elements: '属性', weapons: '特性', regions: '阵营' },
  honkai3: { elements: '属性', weapons: '类型', regions: '组织' },
};

function emptyOptions(): FilterOptions {
  return { elements: [], rarities: [], weapons: [], regions: [] };
}

const Header = ({
  selectedGames,
  onToggleGame,
  onSync,
  isSyncing,
  syncProgress,
  lastSync,
  displayMode,
  onDisplayModeChange,
  weekStart,
  onWeekStartChange,
  portraitBackgroundEnabled,
  onPortraitBackgroundChange,
  filters,
  filterOptionsByGame,
  onFiltersChange,
  onAddCharacter,
  onExport,
}: HeaderProps) => {
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

  const clearFilters = () => {
    onFiltersChange({
      gameFilters: Object.fromEntries(
        Object.keys(GAMES).map(gameId => [gameId, emptyOptions()]),
      ),
    });
  };

  const hasActiveFilters = Object.values(filters.gameFilters).some(gameFilter =>
    gameFilter.elements.length > 0 ||
    gameFilter.rarities.length > 0 ||
    gameFilter.weapons.length > 0 ||
    gameFilter.regions.length > 0,
  );

  const renderFilterTags = (
    gameId: string,
    type: keyof FilterOptions,
    values: (string | number)[],
    renderValue: (value: string | number) => string = value => String(value),
  ) => {
    const selected = filters.gameFilters[gameId]?.[type] as (string | number)[] | undefined;
    if (values.length === 0) return null;

    return (
      <div className="filter-tags filter-tags-scroll">
        {values.map(value => (
          <button
            key={String(value)}
            className={`filter-tag ${selected?.includes(value) ? 'active' : ''}`}
            onClick={() => toggleGameFilter(gameId, type, value)}
          >
            {renderValue(value)}
          </button>
        ))}
      </div>
    );
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title">
          <h1>🎮 米哈游角色生日日历</h1>
          <p className="header-subtitle">追踪你喜爱的角色生日</p>
        </div>

        {syncProgress && (
          <div className="sync-progress-bar">
            <div className="sync-progress-text">{syncProgress}</div>
          </div>
        )}

        <div className="header-controls">
          <div className="control-group">
            <span className="control-label">游戏:</span>
            <div className="game-filters">
              {Object.entries(GAMES).map(([id, { name, color }]) => (
                <button
                  key={id}
                  className={`game-filter ${selectedGames.includes(id) ? 'active' : ''}`}
                  onClick={() => onToggleGame(id)}
                  style={{ '--game-color': color } as React.CSSProperties}
                >
                  <span className="game-indicator" style={{ backgroundColor: color }} />
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">展示:</span>
            <div className="display-modes">
              <button className={`display-mode-btn ${displayMode === 'avatar' ? 'active' : ''}`} onClick={() => onDisplayModeChange('avatar')} title="头像模式">👤</button>
              <button className={`display-mode-btn ${displayMode === 'card' ? 'active' : ''}`} onClick={() => onDisplayModeChange('card')} title="卡片模式">🃏</button>
              <button className={`display-mode-btn ${displayMode === 'compact' ? 'active' : ''}`} onClick={() => onDisplayModeChange('compact')} title="紧凑模式">≡</button>
              <button className={`display-mode-btn ${portraitBackgroundEnabled ? 'active' : ''}`} onClick={() => onPortraitBackgroundChange(!portraitBackgroundEnabled)} title="详情页立绘背景">▧</button>
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">首天:</span>
            <div className="week-start-selector">
              <button className={`week-start-btn ${weekStart === 0 ? 'active' : ''}`} onClick={() => onWeekStartChange(0)} title="周日开始">日</button>
              <button className={`week-start-btn ${weekStart === 1 ? 'active' : ''}`} onClick={() => onWeekStartChange(1)} title="周一开始">一</button>
            </div>
          </div>

          <div className="header-actions">
            <button className="action-btn add-btn" onClick={onAddCharacter} title="添加角色">➕ 添加</button>
            <button className="action-btn export-btn" onClick={onExport} title="导出数据">📥 导出</button>
            <button className="action-btn sync-btn" onClick={onSync} disabled={isSyncing} title="从已发布数据更新">
              {isSyncing ? '⏳' : '🔄'} 更新
            </button>
            {lastSync && <span className="last-sync">{new Date(lastSync).toLocaleDateString('zh-CN')}</span>}
          </div>
        </div>

        <div className="advanced-filters">
          <div className="filter-section">
            <div className="filter-heading-row">
              <span className="filter-label">筛选:</span>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.showMissingInfo}
                  onChange={(e) => onFiltersChange({ showMissingInfo: e.target.checked })}
                />
                <span>显示信息不全的角色</span>
              </label>
              {hasActiveFilters && <button className="filter-clear" onClick={clearFilters}>清除筛选</button>}
            </div>

            <div className="game-filter-groups">
              {Object.entries(GAMES)
                .filter(([gameId]) => selectedGames.includes(gameId))
                .map(([gameId, game]) => {
                  const options = filterOptionsByGame[gameId] || emptyOptions();
                  const labels = FILTER_LABELS[gameId] || FILTER_LABELS.genshin;

                  return (
                    <section key={gameId} className="game-filter-panel" style={{ '--game-color': game.color } as React.CSSProperties}>
                      <div className="game-filter-title">
                        <span className="game-indicator" style={{ backgroundColor: game.color }} />
                        {game.name}
                      </div>

                      <div className="filter-groups scoped">
                        <div className="filter-group">
                          <span className="filter-group-label">{labels.elements}</span>
                          {renderFilterTags(gameId, 'elements', options.elements)}
                        </div>

                        <div className="filter-group">
                          <span className="filter-group-label">稀有度</span>
                          {renderFilterTags(gameId, 'rarities', options.rarities, value => '★'.repeat(Number(value)))}
                        </div>

                        <div className="filter-group">
                          <span className="filter-group-label">{labels.weapons}</span>
                          {renderFilterTags(gameId, 'weapons', options.weapons)}
                        </div>

                        <div className="filter-group">
                          <span className="filter-group-label">{labels.regions}</span>
                          {renderFilterTags(gameId, 'regions', options.regions)}
                        </div>
                      </div>
                    </section>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
