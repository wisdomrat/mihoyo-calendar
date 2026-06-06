import { useState } from 'react';
import Calendar from './components/Calendar/Calendar';
import Header from './components/Header';
import AddCharacterModal from './components/AddCharacterModal';
import { useCharacters } from './hooks/useCharacters';
import type { Character, ViewMode } from './types';
import { formatBirthday, getGameColor, getGameName } from './utils/calendar';

function CharacterModal({ character, onClose, onEdit }: { 
  character: Character | null; 
  onClose: () => void;
  onEdit: (char: Character) => void;
}) {
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
          
          <div className="modal-actions">
            <button className="btn-edit" onClick={() => onEdit(character)}>编辑</button>
            <div className="modal-source">
              来源: {character.source === 'wiki' ? 'Wiki API' : '手动添加'}
            </div>
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
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const {
    characters,
    loading,
    syncProgress,
    lastSync,
    selectedGames,
    displayMode,
    weekStart,
    filters,
    filterOptions,
    fetchFromWiki,
    addCharacter,
    editCharacter,
    exportData,
    toggleGame,
    setDisplayMode,
    setWeekStart,
    updateFilters,
  } = useCharacters();

  const handleSaveCharacter = (data: Parameters<typeof addCharacter>[0]) => {
    if (editingCharacter) {
      editCharacter(editingCharacter.id, data);
      setEditingCharacter(null);
    } else {
      addCharacter(data);
    }
  };

  const handleEdit = (character: Character) => {
    setSelectedCharacter(null);
    setEditingCharacter(character);
    setShowAddModal(true);
  };

  return (
    <div className="app">
      <Header
        selectedGames={selectedGames}
        onToggleGame={toggleGame}
        onSync={fetchFromWiki}
        isSyncing={loading}
        syncProgress={syncProgress}
        lastSync={lastSync}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
        weekStart={weekStart}
        onWeekStartChange={setWeekStart}
        filters={filters}
        filterOptions={filterOptions}
        onFiltersChange={updateFilters}
        onAddCharacter={() => {
          setEditingCharacter(null);
          setShowAddModal(true);
        }}
        onExport={exportData}
      />
      
      <main className="app-main">
        <Calendar
          characters={characters}
          view={view}
          currentDate={currentDate}
          displayMode={displayMode}
          weekStart={weekStart}
          onDateChange={setCurrentDate}
          onViewChange={setView}
          onCharacterClick={setSelectedCharacter}
        />
      </main>
      
      <CharacterModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        onEdit={handleEdit}
      />
      
      <AddCharacterModal
        isOpen={showAddModal}
        editingCharacter={editingCharacter}
        onClose={() => {
          setShowAddModal(false);
          setEditingCharacter(null);
        }}
        onSave={handleSaveCharacter}
      />
    </div>
  );
}

export default App;
