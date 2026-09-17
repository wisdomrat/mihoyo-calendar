import type { DisplayMode, WeekStart } from '../../hooks/useCharacters';

interface Props {
  favoriteCount: number;
  showFavoritesOnly: boolean;
  onShowFavoritesOnlyChange: (show: boolean) => void;
  onSearchOpen: () => void;
  onFiltersOpen: () => void;
  onAddCharacter: () => void;
  onExportData: () => void;
  onExportIcs: () => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  weekStart: WeekStart;
  onWeekStartChange: (start: WeekStart) => void;
  portraitBackgroundEnabled: boolean;
  onPortraitBackgroundChange: (enabled: boolean) => void;
  motionEnabled: boolean;
  onMotionChange: (enabled: boolean) => void;
}

export default function WorkspaceHeader(props: Props) {
  return (
    <header className="v2-header">
      <div className="v2-brand">
        <strong>米哈游角色日历</strong>
        <span>MiHoYo Character Calendar</span>
      </div>

      <nav className="v2-primary-nav">
        <button
          aria-pressed={!props.showFavoritesOnly}
          onClick={() => props.onShowFavoritesOnlyChange(false)}
        >
          日历
        </button>
        <button
          aria-pressed={props.showFavoritesOnly}
          onClick={() => props.onShowFavoritesOnlyChange(true)}
        >
          收藏
          {props.favoriteCount > 0 && (
            <span className="v2-favorite-count">{props.favoriteCount}</span>
          )}
        </button>
        <button onClick={onSettingsOpen}>设置</button>
      </nav>

      <div className="v2-header-actions">
        <button
          className="v2-icon-button"
          onClick={props.onSearchOpen}
          aria-label="搜索角色"
          title="搜索角色"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
        <button
          className="v2-icon-button"
          onClick={props.onFiltersOpen}
          aria-label="筛选角色"
          title="筛选角色"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
        </button>
      </div>
    </header>
  );

  function onSettingsOpen() {
    // Settings dialog will be implemented
    alert('设置功能开发中');
  }
}
