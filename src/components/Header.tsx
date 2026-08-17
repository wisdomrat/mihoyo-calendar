import type { ReactNode } from 'react';
import type { DisplayMode, WeekStart, DateMode } from '../hooks/useCharacters';
import type { ThemeMode } from '../hooks/useTheme';

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
  motionEnabled: boolean;
  onMotionChange: (enabled: boolean) => void;
  dateMode: DateMode;
  onDateModeChange: (mode: DateMode) => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
  onAddCharacter: () => void;
  onExport: () => void;
  onExportIcs: () => void;
  favoriteCount: number;
  showFavoritesOnly: boolean;
  onShowFavoritesOnlyChange: (enabled: boolean) => void;
  // 搜索框并进标题行：省掉一整条独立带子，顶栏内容更多但总高更矮。
  // 用插槽而不是把 CharacterSearch 的一堆 props 透传进来。
  searchSlot?: ReactNode;
  statusSlot?: ReactNode;
}

const TEXT = {
  title: '\u7c73\u54c8\u6e38\u89d2\u8272\u751f\u65e5\u65e5\u5386',
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
  artTitle: '\u8be6\u60c5\u7acb\u7ed8\u80cc\u666f\uff08\u70b9\u51fb\u5207\u6362\u4e3a\u7eaf\u8272\u80cc\u666f\uff09',
  solid: '\u7eaf\u8272',
  solidTitle: '\u7eaf\u8272\u80cc\u666f\uff08\u70b9\u51fb\u5207\u6362\u4e3a\u7acb\u7ed8\u80cc\u666f\uff09',
  motion: '\u52a8\u6001',
  motionTitle: '\u5f00\u542f\u52a8\u6001\u7acb\u7ed8\u6548\u679c\uff08\u70b9\u51fb\u5173\u95ed\uff09',
  motionOff: '\u9759\u6001',
  motionOffTitle: '\u5173\u95ed\u52a8\u6001\u7acb\u7ed8\u6548\u679c\uff08\u70b9\u51fb\u5f00\u542f\uff09',
  birthday: '\u751f\u65e5',
  birthdayTitle: '\u663e\u793a\u89d2\u8272\u751f\u65e5\uff08\u70b9\u51fb\u5207\u6362\u4e3a\u5b9e\u88c5\u65e5\u671f\uff09',
  release: '\u5b9e\u88c5',
  releaseTitle: '\u663e\u793a\u89d2\u8272\u9996\u6b21\u5b9e\u88c5\u65e5\u671f\uff08\u70b9\u51fb\u5207\u6362\u4e3a\u751f\u65e5\uff09',
  themeNeutral: '\u4e2d\u6027\u4e3b\u9898',
  themeNeutralTitle: '\u672a\u9009\u4e2d\u89d2\u8272\u65f6\u4f7f\u7528\u7edf\u4e00\u4e2d\u6027\u4e3b\u9898\uff08\u70b9\u51fb\u5207\u6362\u4e3a\u8ddf\u968f\u89d2\u8272\uff09',
  themeFollow: '\u8ddf\u968f\u89d2\u8272',
  themeFollowTitle: '\u754c\u9762\u4e3b\u9898\u59cb\u7ec8\u8ddf\u968f\u5f53\u524d\u9009\u4e2d\u89d2\u8272\u7684\u6e38\u620f\uff08\u70b9\u51fb\u5207\u6362\u4e3a\u4e2d\u6027\u4e3b\u9898\uff09',
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
  motionEnabled,
  onMotionChange,
  dateMode,
  onDateModeChange,
  themeMode,
  onThemeModeChange,
  activeFilterCount,
  onOpenFilters,
  onAddCharacter,
  onExport,
  onExportIcs,
  favoriteCount,
  showFavoritesOnly,
  onShowFavoritesOnlyChange,
  searchSlot,
  statusSlot,
}: HeaderProps) => {
  const filterButtonLabel = activeFilterCount > 0 ? `${TEXT.filters} ${activeFilterCount}` : TEXT.filters;

  return (
    <header className="app-header">
      <div className="header-content">
        {/* 第一行：标题 + 搜索 + 唯一的主操作 */}
        <div className="header-titlerow">
          <div className="header-title">
            <h1>{TEXT.title}</h1>
            <p className="header-subtitle">{TEXT.subtitle}</p>
          </div>
          {searchSlot && <div className="header-search">{searchSlot}</div>}
          <button className="action-btn add-btn" onClick={onAddCharacter} title={TEXT.addTitle}>{TEXT.add}</button>
        </div>

        {syncProgress && (
          <div className="sync-progress-bar">
            <div className="sync-progress-text">{syncProgress}</div>
          </div>
        )}
        {statusSlot}

        {/* 第二行：设置全部装进一条工具栏（内部用 1px 竖线分组），动作留在右侧。
            原来 13 个控件各自带描边，眼睛数不清有几组；现在描边只剩工具栏一圈。 */}
        <div className="header-controls">
          <div className="control-bar">
            <div className="control-group">
              <span className="control-label">{TEXT.view}</span>
              {/* 三选一互斥 */}
              <div className="segmented-group" role="group" aria-label={TEXT.view}>
                <button className={`display-mode-btn ${displayMode === 'avatar' ? 'active' : ''}`} onClick={() => onDisplayModeChange('avatar')} title={TEXT.avatarTitle}>{TEXT.avatar}</button>
                <button className={`display-mode-btn ${displayMode === 'card' ? 'active' : ''}`} onClick={() => onDisplayModeChange('card')} title={TEXT.cardTitle}>{TEXT.card}</button>
                <button className={`display-mode-btn ${displayMode === 'compact' ? 'active' : ''}`} onClick={() => onDisplayModeChange('compact')} title={TEXT.compactTitle}>{TEXT.compact}</button>
              </div>
            </div>

            {/* 二态开关组：显示的是「当前值」而非「可选项」，所以用小圆点而不是选中块，
                和左边三选一在视觉上分开 */}
            <div className="control-group control-group--toggles">
              <button
                className="toggle-btn"
                onClick={() => onPortraitBackgroundChange(!portraitBackgroundEnabled)}
                title={portraitBackgroundEnabled ? TEXT.solidTitle : TEXT.artTitle}
                aria-pressed={portraitBackgroundEnabled}
              >
                {portraitBackgroundEnabled ? TEXT.art : TEXT.solid}
              </button>
              <button
                className="toggle-btn"
                onClick={() => onDateModeChange(dateMode === 'release' ? 'birthday' : 'release')}
                title={dateMode === 'release' ? TEXT.releaseTitle : TEXT.birthdayTitle}
                aria-pressed={dateMode === 'release'}
              >
                {dateMode === 'release' ? TEXT.release : TEXT.birthday}
              </button>
              <button
                className="toggle-btn"
                onClick={() => onThemeModeChange(themeMode === 'follow-character' ? 'follow-neutral' : 'follow-character')}
                title={themeMode === 'follow-character' ? TEXT.themeFollowTitle : TEXT.themeNeutralTitle}
                aria-pressed={themeMode === 'follow-character'}
              >
                {themeMode === 'follow-character' ? TEXT.themeFollow : TEXT.themeNeutral}
              </button>
              <button
                className="toggle-btn"
                onClick={() => onMotionChange(!motionEnabled)}
                title={motionEnabled ? TEXT.motionTitle : TEXT.motionOffTitle}
                aria-pressed={motionEnabled}
              >
                {motionEnabled ? TEXT.motion : TEXT.motionOff}
              </button>
            </div>

            <div className="control-group week-group">
              <span className="control-label">{TEXT.week}</span>
              <div className="week-start-selector">
                <button className={`week-start-btn ${weekStart === 0 ? 'active' : ''}`} onClick={() => onWeekStartChange(0)} title={TEXT.sundayTitle}>{TEXT.sunday}</button>
                <button className={`week-start-btn ${weekStart === 1 ? 'active' : ''}`} onClick={() => onWeekStartChange(1)} title={TEXT.mondayTitle}>{TEXT.monday}</button>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button className="action-btn filter-entry-btn" onClick={onOpenFilters} aria-label={TEXT.openFilters}>
              {filterButtonLabel}
            </button>
            <button
              className={`action-btn favorite-filter-btn ${showFavoritesOnly ? 'active' : ''}`}
              onClick={() => onShowFavoritesOnlyChange(!showFavoritesOnly)}
              aria-pressed={showFavoritesOnly}
              title={TEXT.localFavoritesOnly}
            >
              {TEXT.favorites} {favoriteCount}
            </button>
            {/* 数据操作（低频）：一道分隔线之后收成安静的 ghost 按钮 */}
            <div className="header-actions-data">
              <button className="action-btn ics-btn" onClick={onExportIcs} title={TEXT.downloadIcs}>{TEXT.calendar}</button>
              <button className="action-btn export-btn" onClick={onExport} title={TEXT.exportTitle}>{TEXT.export}</button>
              <button className="action-btn sync-btn" onClick={onSync} disabled={isSyncing} title={TEXT.updateTitle}>
                {isSyncing ? TEXT.updating : TEXT.update}
              </button>
              {lastSync && <span className="last-sync">{new Date(lastSync).toLocaleDateString('zh-CN')}</span>}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;