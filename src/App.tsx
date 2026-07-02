import { useEffect, useState, type CSSProperties } from 'react';
import Calendar from './components/Calendar/Calendar';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import FilterBottomSheet from './components/FilterBottomSheet';
import AddCharacterModal from './components/AddCharacterModal';
import { useCharacters } from './hooks/useCharacters';
import type { Character, ViewMode } from './types';
import { formatBirthday, getGameColor, getGameName, GAMES } from './utils/calendar';
import { getPortraitModalLayout, type PortraitDimensions } from './utils/portraitLayout';
import {
  createClearedGameFilters,
  getActiveFilterCount,
  resolveActiveFilterGame,
} from './utils/filterUi';

const GAME_IDS = Object.keys(GAMES);

function CharacterModal({ character, onClose, onEdit, portraitBackgroundEnabled }: {
  character: Character | null;
  onClose: () => void;
  onEdit: (char: Character) => void;
  portraitBackgroundEnabled: boolean;
}) {
  const [portraitDimensions, setPortraitDimensions] = useState<PortraitDimensions | null>(null);
  const [isArtworkOnly, setIsArtworkOnly] = useState(false);

  useEffect(() => {
    if (!character?.portrait || !portraitBackgroundEnabled) {
      setPortraitDimensions(null);
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!cancelled) {
        setPortraitDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      }
    };
    image.onerror = () => {
      if (!cancelled) setPortraitDimensions(null);
    };
    image.src = character.portrait;

    return () => {
      cancelled = true;
    };
  }, [character?.portrait, portraitBackgroundEnabled]);

  useEffect(() => {
    setIsArtworkOnly(false);
  }, [character?.id, portraitBackgroundEnabled]);

  if (!character) return null;

  const usePortraitBackground = portraitBackgroundEnabled && Boolean(character.portrait);
  const portraitLayout = getPortraitModalLayout(portraitDimensions, isArtworkOnly ? 'artwork' : 'detail', character.game);
  const artworkOnlyClassName = isArtworkOnly ? 'portrait-artwork-only' : '';
  const portraitClassName = usePortraitBackground ? `with-portrait-bg game-${character.game} ${portraitLayout.className} ${artworkOnlyClassName}` : '';
  const modalStyle = usePortraitBackground
    ? ({ '--portrait-bg': `url(${character.portrait})`, ...portraitLayout.style } as CSSProperties)
    : undefined;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${portraitClassName}`}
        onClick={e => e.stopPropagation()}
        style={modalStyle}
      >
        <button className="modal-close" onClick={onClose}>×</button>
        {usePortraitBackground && (
          <button
            className="modal-portrait-toggle"
            type="button"
            onClick={() => setIsArtworkOnly(current => !current)}
            aria-pressed={isArtworkOnly}
            title={isArtworkOnly ? '\u663e\u793a\u6587\u5b57' : '\u9690\u85cf\u6587\u5b57'}
          >
            {isArtworkOnly ? '\u663e\u793a\u6587\u5b57' : '\u7eaf\u7acb\u7ed8'}
          </button>
        )}

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
  const [isFilterSidebarCollapsed, setIsFilterSidebarCollapsed] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeFilterGame, setActiveFilterGame] = useState(GAME_IDS[0]);

  const {
    characters,
    loading,
    syncProgress,
    lastSync,
    selectedGames,
    displayMode,
    weekStart,
    portraitBackgroundEnabled,
    filters,
    filterOptionsByGame,
    fetchFromWiki,
    addCharacter,
    editCharacter,
    exportData,
    toggleGame,
    setDisplayMode,
    setWeekStart,
    setPortraitBackgroundEnabled,
    updateFilters,
  } = useCharacters();

  useEffect(() => {
    const nextActiveGame = resolveActiveFilterGame(activeFilterGame, selectedGames, GAME_IDS);
    if (nextActiveGame !== activeFilterGame) {
      setActiveFilterGame(nextActiveGame);
    }
  }, [activeFilterGame, selectedGames]);

  const activeFilterCount = getActiveFilterCount(filters);

  const handleClearFilters = () => {
    updateFilters({
      gameFilters: createClearedGameFilters(GAME_IDS),
      showMissingInfo: true,
    });
  };

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
        onSync={fetchFromWiki}
        isSyncing={loading}
        syncProgress={syncProgress}
        lastSync={lastSync}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
        weekStart={weekStart}
        onWeekStartChange={setWeekStart}
        portraitBackgroundEnabled={portraitBackgroundEnabled}
        onPortraitBackgroundChange={setPortraitBackgroundEnabled}
        activeFilterCount={activeFilterCount}
        onOpenFilters={() => setIsMobileFilterOpen(true)}
        onAddCharacter={() => {
          setEditingCharacter(null);
          setShowAddModal(true);
        }}
        onExport={exportData}
      />

      <div className="app-body">
        <FilterSidebar
          collapsed={isFilterSidebarCollapsed}
          selectedGames={selectedGames}
          activeGameId={activeFilterGame}
          filters={filters}
          filterOptionsByGame={filterOptionsByGame}
          onToggleCollapsed={() => setIsFilterSidebarCollapsed(collapsed => !collapsed)}
          onToggleGame={toggleGame}
          onActiveGameChange={setActiveFilterGame}
          onFiltersChange={updateFilters}
          onClearFilters={handleClearFilters}
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
      </div>

      <FilterBottomSheet
        isOpen={isMobileFilterOpen}
        selectedGames={selectedGames}
        activeGameId={activeFilterGame}
        filters={filters}
        filterOptionsByGame={filterOptionsByGame}
        onClose={() => setIsMobileFilterOpen(false)}
        onToggleGame={toggleGame}
        onActiveGameChange={setActiveFilterGame}
        onFiltersChange={updateFilters}
        onClearFilters={handleClearFilters}
      />

      <CharacterModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        onEdit={handleEdit}
        portraitBackgroundEnabled={portraitBackgroundEnabled}
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
