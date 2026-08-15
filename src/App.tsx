import { useEffect, useState, type CSSProperties } from 'react';
import Calendar from './components/Calendar/Calendar';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import FilterBottomSheet from './components/FilterBottomSheet';
import AddCharacterModal from './components/AddCharacterModal';
import CharacterSearch from './components/CharacterSearch';
import Spotlight from './components/Spotlight';
import { Hero } from './components/Hero.tsx';
import { useCharacters, type DateMode } from './hooks/useCharacters';
import { useTheme } from './hooks/useTheme';
import type { Character, ViewMode } from './types';
import { calendarDateKey, displayDate, effectiveDateMode, getGameColor, getGameName, GAMES } from './utils/calendar';
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

function calendarMonthDate(character: Character, fallback: Date, dateMode: DateMode): Date {
  const key = calendarDateKey(character, dateMode);
  const match = key.match(/^(\d{2})-(\d{2})$/);
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
  motionEnabled,
  dateMode,
}: {
  character: Character | null;
  onClose: () => void;
  onEdit: (char: Character) => void;
  onToggleFavorite: (id: string) => void;
  onExportIcs: (character: Character) => void;
  isFavorite: boolean;
  portraitBackgroundEnabled: boolean;
  motionEnabled: boolean;
  dateMode: DateMode;
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
  const motionClassName = motionEnabled ? 'portrait-motion' : '';
  const portraitClassName = usePortraitBackground ? `with-portrait-bg game-${character.game} ${portraitLayout.className} ${artworkOnlyClassName} ${motionClassName}` : '';
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
              <span className="modal-info-label">{effectiveDateMode(character.game, dateMode) === 'release' ? '\u5b9e\u88c5\u65e5\u671f' : '\u751f\u65e5'}</span>
              <span className="modal-info-value">{displayDate(character, dateMode)}</span>
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
    motionEnabled,
    dateMode,
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
    setMotionEnabled,
    setDateMode,
    toggleFavorite,
    setShowFavoritesOnly,
    updateFilters,
  } = useCharacters();

  const { theme, mode: themeMode, setMode: setThemeMode } = useTheme(selectedCharacter, selectedGames);

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
    setCurrentDate(current => calendarMonthDate(character, current, dateMode));
  };

  const handleExportIcs = (charactersToExport: Character[], filename: string) => {
    const validCharacters = getCharactersWithValidBirthdays(charactersToExport, dateMode);
    if (validCharacters.length === 0) {
      setIcsStatus(dateMode === 'release' ? '\u6ca1\u6709\u53ef\u5bfc\u51fa\u7684\u6709\u6548\u5b9e\u88c5\u65e5\u671f\u3002' : '\u6ca1\u6709\u53ef\u5bfc\u51fa\u7684\u6709\u6548\u751f\u65e5\u3002');
      return;
    }

    downloadTextFile(filename, buildBirthdayIcs(validCharacters, { dateMode }), 'text/calendar;charset=utf-8');
    setIcsStatus(`\u5df2\u4e0b\u8f7d ${validCharacters.length} \u4e2a${dateMode === 'release' ? '\u5b9e\u88c5\u7eaa\u5ff5' : '\u751f\u65e5'}\u4e8b\u4ef6\u3002`);
    window.setTimeout(() => setIcsStatus(''), 3000);
  };

  // 临时预览：?theme=xxx 可强制覆盖主题，便于逐一截图审阅。
  const previewTheme = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('theme')
    : null;
  const appliedTheme = previewTheme || theme;

  // 为 Hero 轮播挑选代表角色：今天过生日的 + 未来7天内的，按日期排序，最多4个
  const heroCharacters = characters.length > 0 ? (() => {
    const today = new Date();

    // 收集今天和未来7天内的所有角色
    const upcomingChars = characters.filter(c => {
      const key = calendarDateKey(c, dateMode);
      const match = key.match(/^(\d{2})-(\d{2})$/);
      if (!match) return false;
      const charDate = new Date(today.getFullYear(), Number(match[1]) - 1, Number(match[2]));
      const diffDays = Math.floor((charDate.getTime() - today.getTime()) / 86400000);
      return diffDays >= 0 && diffDays <= 7; // 包括今天（diffDays=0）
    }).sort((a, b) => {
      // 按日期排序：今天的排最前面，然后是明天、后天...
      const keyA = calendarDateKey(a, dateMode);
      const keyB = calendarDateKey(b, dateMode);
      return keyA.localeCompare(keyB);
    }).slice(0, 4); // 最多4个

    if (upcomingChars.length > 0) return upcomingChars;

    // 兜底：如果未来7天内没有任何角色，每个游戏挑一个
    const byGame = new Map<string, Character>();
    for (const char of characters) {
      if (!byGame.has(char.game)) byGame.set(char.game, char);
    }
    return Array.from(byGame.values()).slice(0, 4);
  })() : [];

  return (
    <div className="app" data-theme={appliedTheme}>
      {/* Hero 首屏：轮播多个游戏的代表角色 */}
      {heroCharacters.length > 0 && (
        <Hero characters={heroCharacters} />
      )}

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
        motionEnabled={motionEnabled}
        onMotionChange={setMotionEnabled}
        dateMode={dateMode}
        onDateModeChange={setDateMode}
        themeMode={themeMode}
        onThemeModeChange={setThemeMode}
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
          dateMode={dateMode}
          onSelect={handleSearchSelect}
        />
        {icsStatus && <div className="ics-status" role="status">{icsStatus}</div>}
      </div>

      <Spotlight
        characters={characters}
        dateMode={dateMode}
        onSelect={handleSearchSelect}
      />

      <div className="app-body">
        <FilterSidebar
          collapsed={isFilterSidebarCollapsed}
          selectedGames={selectedGames}
          activeGameId={activeFilterGame}
          filters={filters}
          filterOptionsByGame={filterOptionsByGame}
          dateMode={dateMode}
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
            dateMode={dateMode}
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
        dateMode={dateMode}
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
        motionEnabled={motionEnabled}
        dateMode={dateMode}
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
