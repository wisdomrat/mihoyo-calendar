import { GAMES } from '../utils/calendar';
import type { DisplayMode } from '../hooks/useCharacters';

interface HeaderProps {
  selectedGames: string[];
  onToggleGame: (gameId: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  syncProgress: string;
  lastSync: string | null;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
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
  onAddCharacter,
  onExport,
}: HeaderProps) => {
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
      </div>
    </header>
  );
};

export default Header;
