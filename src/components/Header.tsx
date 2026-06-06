import { GAMES } from '../utils/calendar';
import type { DisplayMode, WeekStart, FilterState } from '../hooks/useCharacters';

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
  filters: FilterState;
  filterOptions: {
    elements: string[];
    rarities: number[];
    weapons: string[];
    regions: string[];
  };
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onAddCharacter: () => void;
  onExport: () => void;
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
  filters,
  filterOptions,
  onFiltersChange,
  onAddCharacter,
  onExport,
}: HeaderProps) => {
  const toggleFilter = (type: keyof FilterState, value: string | number) => {
    const current = filters[type] as (string | number)[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({ [type]: updated });
  };

  const hasActiveFilters = 
    filters.elements.length > 0 ||
    filters.rarities.length > 0 ||
    filters.weapons.length > 0 ||
    filters.regions.length > 0;

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
              <button
                className={`display-mode-btn ${displayMode === 'avatar' ? 'active' : ''}`}
                onClick={() => onDisplayModeChange('avatar')}
                title="头像模式"
              >
                👤
              </button>
              <button
                className={`display-mode-btn ${displayMode === 'card' ? 'active' : ''}`}
                onClick={() => onDisplayModeChange('card')}
                title="卡片模式"
              >
                🃏
              </button>
              <button
                className={`display-mode-btn ${displayMode === 'compact' ? 'active' : ''}`}
                onClick={() => onDisplayModeChange('compact')}
                title="紧凑模式"
              >
                ≡
              </button>
            </div>
          </div>
          
          <div className="control-group">
            <span className="control-label">首天:</span>
            <div className="week-start-selector">
              <button
                className={`week-start-btn ${weekStart === 0 ? 'active' : ''}`}
                onClick={() => onWeekStartChange(0)}
                title="周日开始"
              >
                日
              </button>
              <button
                className={`week-start-btn ${weekStart === 1 ? 'active' : ''}`}
                onClick={() => onWeekStartChange(1)}
                title="周一开始"
              >
                一
              </button>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="action-btn add-btn" onClick={onAddCharacter} title="添加角色">
              ➕ 添加
            </button>
            <button className="action-btn export-btn" onClick={onExport} title="导出数据">
              📥 导出
            </button>
            <button 
              className="action-btn sync-btn"
              onClick={onSync}
              disabled={isSyncing}
              title="从Wiki更新数据"
            >
              {isSyncing ? '⏳' : '🔄'} 更新
            </button>
            {lastSync && (
              <span className="last-sync">
                {new Date(lastSync).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </div>
        
        <div className="advanced-filters">
          <div className="filter-section">
            <span className="filter-label">筛选:</span>
            
            <div className="filter-groups">
              <div className="filter-group">
                <span className="filter-group-label">元素:</span>
                <div className="filter-tags">
                  {filterOptions.elements.map(el => (
                    <button
                      key={el}
                      className={`filter-tag ${filters.elements.includes(el) ? 'active' : ''}`}
                      onClick={() => toggleFilter('elements', el)}
                    >
                      {el}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <span className="filter-group-label">稀有度:</span>
                <div className="filter-tags">
                  {filterOptions.rarities.map(rarity => (
                    <button
                      key={rarity}
                      className={`filter-tag ${filters.rarities.includes(rarity) ? 'active' : ''}`}
                      onClick={() => toggleFilter('rarities', rarity)}
                    >
                      {'★'.repeat(rarity)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <span className="filter-group-label">武器:</span>
                <div className="filter-tags filter-tags-scroll">
                  {filterOptions.weapons.map(weapon => (
                    <button
                      key={weapon}
                      className={`filter-tag ${filters.weapons.includes(weapon) ? 'active' : ''}`}
                      onClick={() => toggleFilter('weapons', weapon)}
                    >
                      {weapon}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <span className="filter-group-label">地区:</span>
                <div className="filter-tags filter-tags-scroll">
                  {filterOptions.regions.map(region => (
                    <button
                      key={region}
                      className={`filter-tag ${filters.regions.includes(region) ? 'active' : ''}`}
                      onClick={() => toggleFilter('regions', region)}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.showMissingInfo}
                  onChange={(e) => onFiltersChange({ showMissingInfo: e.target.checked })}
                />
                <span>显示信息不全的角色</span>
              </label>
              
              {hasActiveFilters && (
                <button 
                  className="filter-clear"
                  onClick={() => onFiltersChange({
                    elements: [],
                    rarities: [],
                    weapons: [],
                    regions: [],
                  })}
                >
                  清除筛选
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
