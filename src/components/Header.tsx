import type { DisplayMode, WeekStart } from '../hooks/useCharacters';

interface HeaderProps {
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
  activeFilterCount: number;
  onOpenFilters: () => void;
  onAddCharacter: () => void;
  onExport: () => void;
}

const Header = ({
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
  activeFilterCount,
  onOpenFilters,
  onAddCharacter,
  onExport,
}: HeaderProps) => {
  const filterButtonLabel = activeFilterCount > 0 ? `筛选 ${activeFilterCount}` : '筛选';

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
            <button className="action-btn filter-entry-btn" onClick={onOpenFilters} aria-label="打开筛选面板">
              ◫ {filterButtonLabel}
            </button>
            <button className="action-btn add-btn" onClick={onAddCharacter} title="添加角色">➕ 添加</button>
            <button className="action-btn export-btn" onClick={onExport} title="导出数据">📥 导出</button>
            <button className="action-btn sync-btn" onClick={onSync} disabled={isSyncing} title="从已发布数据更新">
              {isSyncing ? '⏳' : '🔄'} 更新
            </button>
            {lastSync && <span className="last-sync">{new Date(lastSync).toLocaleDateString('zh-CN')}</span>}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
