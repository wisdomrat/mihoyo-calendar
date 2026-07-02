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
  onExportIcs: () => void;
  favoriteCount: number;
  showFavoritesOnly: boolean;
  onShowFavoritesOnlyChange: (enabled: boolean) => void;
}

const TEXT = {
  title: '\u7c73\u54c8\u6e38\u89d2\u8272\u751f\u65e5\u5386',
  subtitle: '\u8ffd\u8e2a\u4f60\u559c\u6b22\u7684\u89d2\u8272\u751f\u65e5',
  filters: '\u7b5b\u9009',
  view: '\u5c55\u793a:',
  avatar: '\u5934\u50cf',
  avatarTitle: '\u5934\u50cf\u6a21\u5f0f',
  card: '\u5361\u7247',
  cardTitle: '\u5361\u7247\u6a21\u5f0f',
  compact: '\u7d27\u51d1',
  compactTitle: '\u7d27\u51d1\u6a21\u5f0f',
  art: '\u7acb\u7ed8',
  artTitle: '\u8be6\u60c5\u7acb\u7ed8\u80cc\u666f',
  week: '\u9996\u65e5:',
  sunday: '\u65e5',
  sundayTitle: '\u5468\u65e5\u5f00\u59cb',
  monday: '\u4e00',
  mondayTitle: '\u5468\u4e00\u5f00\u59cb',
  openFilters: '\u6253\u5f00\u7b5b\u9009',
  add: '\u6dfb\u52a0',
  addTitle: '\u6dfb\u52a0\u89d2\u8272',
  localFavoritesOnly: '\u53ea\u663e\u793a\u672c\u673a\u6536\u85cf',
  favorites: '\u6536\u85cf',
  downloadIcs: '\u4e0b\u8f7d\u751f\u65e5\u65e5\u5386 ICS',
  calendar: '\u65e5\u5386',
  exportTitle: '\u5bfc\u51fa JSON \u6570\u636e',
  export: '\u5bfc\u51fa',
  updateTitle: '\u66f4\u65b0\u5df2\u53d1\u5e03\u6570\u636e',
  updating: '\u66f4\u65b0\u4e2d',
  update: '\u66f4\u65b0',
};

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
  onExportIcs,
  favoriteCount,
  showFavoritesOnly,
  onShowFavoritesOnlyChange,
}: HeaderProps) => {
  const filterButtonLabel = activeFilterCount > 0 ? `${TEXT.filters} ${activeFilterCount}` : TEXT.filters;

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title">
          <h1>{TEXT.title}</h1>
          <p className="header-subtitle">{TEXT.subtitle}</p>
        </div>

        {syncProgress && (
          <div className="sync-progress-bar">
            <div className="sync-progress-text">{syncProgress}</div>
          </div>
        )}

        <div className="header-controls">
          <div className="control-group">
            <span className="control-label">{TEXT.view}</span>
            <div className="display-modes">
              <button className={`display-mode-btn ${displayMode === 'avatar' ? 'active' : ''}`} onClick={() => onDisplayModeChange('avatar')} title={TEXT.avatarTitle}>{TEXT.avatar}</button>
              <button className={`display-mode-btn ${displayMode === 'card' ? 'active' : ''}`} onClick={() => onDisplayModeChange('card')} title={TEXT.cardTitle}>{TEXT.card}</button>
              <button className={`display-mode-btn ${displayMode === 'compact' ? 'active' : ''}`} onClick={() => onDisplayModeChange('compact')} title={TEXT.compactTitle}>{TEXT.compact}</button>
              <button className={`display-mode-btn ${portraitBackgroundEnabled ? 'active' : ''}`} onClick={() => onPortraitBackgroundChange(!portraitBackgroundEnabled)} title={TEXT.artTitle}>{TEXT.art}</button>
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">{TEXT.week}</span>
            <div className="week-start-selector">
              <button className={`week-start-btn ${weekStart === 0 ? 'active' : ''}`} onClick={() => onWeekStartChange(0)} title={TEXT.sundayTitle}>{TEXT.sunday}</button>
              <button className={`week-start-btn ${weekStart === 1 ? 'active' : ''}`} onClick={() => onWeekStartChange(1)} title={TEXT.mondayTitle}>{TEXT.monday}</button>
            </div>
          </div>

          <div className="header-actions">
            <button className="action-btn filter-entry-btn" onClick={onOpenFilters} aria-label={TEXT.openFilters}>
              {filterButtonLabel}
            </button>
            <button className="action-btn add-btn" onClick={onAddCharacter} title={TEXT.addTitle}>{TEXT.add}</button>
            <button
              className={`action-btn favorite-filter-btn ${showFavoritesOnly ? 'active' : ''}`}
              onClick={() => onShowFavoritesOnlyChange(!showFavoritesOnly)}
              aria-pressed={showFavoritesOnly}
              title={TEXT.localFavoritesOnly}
            >
              {TEXT.favorites} {favoriteCount}
            </button>
            <button className="action-btn ics-btn" onClick={onExportIcs} title={TEXT.downloadIcs}>{TEXT.calendar}</button>
            <button className="action-btn export-btn" onClick={onExport} title={TEXT.exportTitle}>{TEXT.export}</button>
            <button className="action-btn sync-btn" onClick={onSync} disabled={isSyncing} title={TEXT.updateTitle}>
              {isSyncing ? TEXT.updating : TEXT.update}
            </button>
            {lastSync && <span className="last-sync">{new Date(lastSync).toLocaleDateString('zh-CN')}</span>}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;