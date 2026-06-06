import { useState } from 'react';
import Calendar from './components/Calendar/Calendar';
import Header from './components/Header';
import { useCharacters } from './hooks/useCharacters';
import type { Character, ViewMode } from './types';
import { formatBirthday, getGameColor, getGameName } from './utils/calendar';

function CharacterModal({ character, onClose }: { character: Character | null; onClose: () => void }) {
  if (!character) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header" style={{ backgroundColor: getGameColor(character.game) }}>
          {character.avatar ? (
            <img 
              src={character.avatar} 
              alt={character.name}
              className="modal-avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="modal-avatar-placeholder">{character.name[0]}</div>
          )}
        </div>
        
        <div className="modal-body">
          <h2 className="modal-name">
            {character.name}
            <span className="modal-name-en">{character.nameEn}</span>
          </h2>
          
          <div className="modal-game-badge" style={{ backgroundColor: getGameColor(character.game) }}>
            {getGameName(character.game)}
          </div>
          
          <div className="modal-info-grid">
            <div className="modal-info-item">
              <span className="modal-info-label">生日</span>
              <span className="modal-info-value">{formatBirthday(character.birthday)}</span>
            </div>
            
            {character.rarity && (
              <div className="modal-info-item">
                <span className="modal-info-label">稀有度</span>
                <span className="modal-info-value">{'★'.repeat(character.rarity)}</span>
              </div>
            )}
            
            {character.element && (
              <div className="modal-info-item">
                <span className="modal-info-label">元素/属性</span>
                <span className="modal-info-value">{character.element}</span>
              </div>
            )}
            
            {character.weapon && (
              <div className="modal-info-item">
                <span className="modal-info-label">武器类型</span>
                <span className="modal-info-value">{character.weapon}</span>
              </div>
            )}
            
            {character.region && (
              <div className="modal-info-item">
                <span className="modal-info-label">地区</span>
                <span className="modal-info-value">{character.region}</span>
              </div>
            )}
          </div>
          
          <div className="modal-source">
            数据来源: {character.source === 'wiki' ? 'Wiki API' : '手动添加'}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('month');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  const {
    characters,
    loading,
    lastSync,
    selectedGames,
    fetchFromWiki,
    toggleGame,
  } = useCharacters();

  return (
    <div className="app">
      <Header
        selectedGames={selectedGames}
        onToggleGame={toggleGame}
        onSync={fetchFromWiki}
        isSyncing={loading}
        lastSync={lastSync}
      />
      
      <main className="app-main">
        <Calendar
          characters={characters}
          view={view}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onViewChange={setView}
          onCharacterClick={setSelectedCharacter}
        />
      </main>
      
      <CharacterModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
      />
    </div>
  );
}

export default App;
