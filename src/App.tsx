import { useEffect, useState, type CSSProperties } from 'react';
import Calendar from './components/Calendar/Calendar';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import FilterBottomSheet from './components/FilterBottomSheet';
import AddCharacterModal from './components/AddCharacterModal';
import CharacterSearch from './components/CharacterSearch';
import { useCharacters } from './hooks/useCharacters';
import type { Character, ViewMode } from './types';
import { formatBirthday, getGameColor, getGameName, GAMES } from './utils/calendar';
import { getPortraitModalLayout, type PortraitDimensions } from './utils/portraitLayout';
import {
  createClearedGameFilters,
  getActiveFilterCount,
  resolveActiveFilterGame,
} from './utils/filterUi';
import { buildBirthdayIcs, getCharactersWithValidBirthdays } from './utils/ics.ts';
import { isFavoriteCharacter } from './utils/favorites.ts';

const GAME_IDS = Object.keys(GAMES);
const RARITY_STAR = '\u2605';

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function birthdayMonthDate(character: Character, fallback: Date): Date {
  const match = character.birthday.match(/^(\d{2})-(\d{2})$/);
  if (!match) return fallback;
  const month = Number(match[1]);
  if (month < 1 || month > 12) return fallback;
  return new Date(fallback.getFullYear(), month - 1, 1);
}

function CharacterModal({
  character,
  onClose,
  onEdit,
  onToggleFavorite,
  onExportIcs,
  isFavorite,
  portraitBackgroundEnabled,
}: {
  character: Character | null;
  onClose: () => void;
  onEdit: (char: Character) => void;
  onToggleFavorite: (id: string) => void;
  onExportIcs: (character: Character) => void;
  isFavorite: boolean;
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
        onClick={event => event.stopPropagation()}
        style={modalStyle}
      >
        <button className="modal-close" onClick={onClose}>x</button>
        {usePortraitBackground && (
          <button
            className="modal-portrait-toggle"
            type="button"
            onClick={() => setIsArtworkOnly(current => !current)}
            aria-pressed={isArtworkOnly}
            title={isArtworkOnly ? '\u663e\u793a\u8be6\u60c5' : '\u4ec5\u770b\u7acb\u7ed8'}
          >
            {isArtworkOnly ? '\u8be6\u60c5' : '\u7acb\u7ed8'}
          </button>
        )}

        <div className="modal-header" style={{ backgroundColor: getGameColor(character.game) }}>
          {character.avatar ? (
            <img
              src={character.avatar}
              alt={character.name}
              className="modal-avatar"
              onError={(event) => {
                (event.target as HTMLImageElement).style.display = 'none';
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
              <span className="modal-info-label">{'\u751f\u65e5'}</span>
              <span className="modal-info-value">{formatBirthday(character.birthday)}</span>
            </div>

            {character.rarity && (
              <div className="modal-info-item">
                <span className="modal-info-label">{'\u7a00\u6709\u5ea6'}</span>
                <span className="modal-info-value">{RARITY_STAR.repeat(character.rarity)}</span>
              </div>
            )}

            {character.element && (
              <div className="modal-info-item">
                <span className="modal-info-label">{'\u5143\u7d20'}</span>
                <span className="modal-info-value">{character.element}</span>
              </div>
            )}

            {character.weapon && (
              <div className="modal-info-item">
                <span className="modal-info-label">{'\u6b66\u5668 / \u547d\u9014'}</span>
                <span className="modal-info-value">{character.weapon}</span>
              </div>
            )}

            {character.region && (
              <div className="modal-info-item">
                <span className="modal-info-label">{'\u5730\u533a / \u9635\u8425'}</span>
                <span className="modal-info-value">{character.region}</span>
              </div>
            )}
          </div>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => onToggleFavorite(character.id)}>
              {isFavorite ? '\u53d6\u6d88\u6536\u85cf' : '\u6536\u85cf'}
            </button>
            <button className="btn-secondary" onClick={() => onExportIcs(character)}>{'\u65e5\u5386'}</button>
            <button className="btn-edit" onClick={() => onEdit(character)}>{'\u7f16\u8f91'}</button>
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
  const [icsStatus, setIcsStatus] = useState('');

  const {
    characters,
    allCharacters,
    loading,
    syncProgress,
    lastSync,
    selectedGames,
    displayMode,
    weekStart,
    portraitBackgroundEnabled,
    favoriteCharacterIds,
    favoriteCount,
    showFavoritesOnly,
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
    toggleFavorite,
    setShowFavoritesOnly,
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

  const handleSearchSelect = (character: Character) => {
    setSelectedCharacter(character);
    setCurrentDate(current => birthdayMonthDate(character, current));
  };

  const handleExportIcs = (charactersToExport: Character[], filename: string) => {
    const validCharacters = getCharactersWithValidBirthdays(charactersToExport);
    if (validCharacters.length === 0) {
      setIcsStatus('\u6ca1\u6709\u53ef\u5bfc\u51fa\u7684\u6709\u6548\u751f\u65e5\u3002');
      return;
    }

    downloadTextFile(filename, buildBirthdayIcs(validCharacters), 'text/calendar;charset=utf-8');
    setIcsStatus(`\u5df2\u4e0b\u8f7d ${validCharacters.length} \u4e2a\u751f\u65e5\u4e8b\u4ef6\u3002`);
    window.setTimeout(() => setIcsStatus(''), 3000);
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
        onExportIcs={() => handleExportIcs(allCharacters, `mihoyo-birthdays-${new Date().toISOString().split('T')[0]}.ics`)}
        favoriteCount={favoriteCount}
        showFavoritesOnly={showFavoritesOnly}
        onShowFavoritesOnlyChange={setShowFavoritesOnly}
      />

      <div className="search-shell">
        <CharacterSearch
          characters={allCharacters}
          favoriteCharacterIds={favoriteCharacterIds}
          onSelect={handleSearchSelect}
        />
        {icsStatus && <div className="ics-status" role="status">{icsStatus}</div>}
      </div>

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
        onToggleFavorite={toggleFavorite}
        onExportIcs={character => handleExportIcs([character], `${character.id}-birthday.ics`)}
        isFavorite={selectedCharacter ? isFavoriteCharacter(favoriteCharacterIds, selectedCharacter.id) : false}
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
