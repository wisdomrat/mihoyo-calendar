import React from 'react';
import { GAMES } from '../utils/calendar';

interface HeaderProps {
  selectedGames: string[];
  onToggleGame: (gameId: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  lastSync: string | null;
}

const Header: React.FC<HeaderProps> = ({ 
  selectedGames, 
  onToggleGame, 
  onSync, 
  isSyncing,
  lastSync 
}) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title">
          <h1>🎮 米哈游角色生日日历</h1>
          <p className="header-subtitle">追踪你喜爱的角色生日</p>
        </div>
        
        <div className="header-controls">
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
          
          <div className="sync-section">
            {lastSync && (
              <span className="last-sync">
                上次更新: {new Date(lastSync).toLocaleString('zh-CN')}
              </span>
            )}
            <button 
              className="sync-btn"
              onClick={onSync}
              disabled={isSyncing}
            >
              {isSyncing ? '⏳ 同步中...' : '🔄 更新数据'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
