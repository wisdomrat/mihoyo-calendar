import { GAMES } from '../utils/calendar';
import type { DisplayMode } from '../hooks/useCharacters';

interface HeaderProps {
  selectedGames: string[];
  onToggleGame: (gameId: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  lastSync: string | null;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
}

const Header = ({ 
  selectedGames, 
  onToggleGame, 
  onSync, 
  isSyncing,
  lastSync,
  displayMode,
  onDisplayModeChange,
}: HeaderProps) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title">
          <h1>🎮 米哈游角色生日日历</h1>
          <p className="header-subtitle">追踪你喜爱的角色生日 · 共234位角色</p>
        </div>
        
        <div className="header-controls">
          <div className="control-group">
            <span className="control-label">游戏筛选:</span>
            <div className="game-filters">
              {Object.entries(GAMES).map(([id, { name, color }]) => (
                <button
                  key={id}
                  className={`game-filter ${selectedGames.includes(id) ? 'active' : ''}`}
                  onClick={() => onToggleGame(id)}
                  style={{ 
                    '--game-color': color,
                  } as React.CSSProperties}
                >
                  <span 
                    className="game-indicator" 
                    style={{ backgroundColor: color }}
                  />
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
          
          <div className="sync-section">
            {lastSync && (
              <span className="last-sync">
                更新: {new Date(lastSync).toLocaleDateString('zh-CN')}
              </span>
            )}
            <button 
              className="sync-btn"
              onClick={onSync}
              disabled={isSyncing}
            >
              {isSyncing ? '⏳' : '🔄'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
