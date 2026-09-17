import { useState, useCallback } from 'react';
import type { Character, ViewMode, DateMode } from '../../types';
import type { ScopedFilterState, FilterOptions } from '../../utils/characterData';
import type { DisplayMode, WeekStart } from '../../hooks/useCharacters';
import { getCharactersByDate } from '../../utils/calendar';
import { resolveAffiliation } from '../../data/affiliations';
import { workspaceProfile } from './profiles';
import WorkspaceHeader from './WorkspaceHeader';
import WorkspaceStage from './WorkspaceStage';
import WorkspaceCalendar from './WorkspaceCalendar';
import WorkspaceDialog from './WorkspaceDialog';
import WorkspaceFilters from './WorkspaceFilters';
import WorkspaceCharacterDetail from './WorkspaceCharacterDetail';
import WorkspaceHero from './WorkspaceHero';
import CharacterSearch from '../CharacterSearch';
import '../../styles/v2/workspace.css';

interface CalendarWorkspaceV2Props {
  'data-theme'?: string;
  style?: React.CSSProperties;
  themeId: string;
  // Data
  characters: Character[];
  allCharacters: Character[];
  selectedGames: string[];
  dateMode: DateMode;
  setDateMode: (mode: DateMode) => void;
  weekStart: WeekStart;
  setWeekStart: (start: WeekStart) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  portraitBackgroundEnabled: boolean;
  setPortraitBackgroundEnabled: (enabled: boolean) => void;
  motionEnabled: boolean;
  setMotionEnabled: (enabled: boolean) => void;
  favoriteCharacterIds: string[];
  showFavoritesOnly: boolean;
  filters: ScopedFilterState;
  filterOptionsByGame: Record<string, FilterOptions>;
  currentDate: Date;
  view: ViewMode;
  selectedCharacter: Character | null;
  // Callbacks
  onDateChange: (date: Date) => void;
  onViewChange: (view: ViewMode) => void;
  onCharacterSelect: (character: Character) => void;
  toggleGame: (gameId: string) => void;
  updateFilters: (filters: Partial<ScopedFilterState>) => void;
  setShowFavoritesOnly: (show: boolean) => void;
  toggleFavorite: (id: string) => void;
  onEditCharacter: (character: Character) => void;
  onExportIcs: (character: Character) => void;
  onAddCharacter: () => void;
  onExportData: () => void;
  onExportAllIcs: () => void;
}

export default function CalendarWorkspaceV2(props: CalendarWorkspaceV2Props) {
  const {
    'data-theme': dataTheme,
    style,
    themeId,
    characters,
    allCharacters,
    selectedGames,
    dateMode,
    setDateMode,
    weekStart,
    setWeekStart,
    displayMode,
    setDisplayMode,
    portraitBackgroundEnabled,
    setPortraitBackgroundEnabled,
    motionEnabled,
    setMotionEnabled,
    favoriteCharacterIds,
    showFavoritesOnly,
    filters,
    filterOptionsByGame,
    currentDate,
    view,
    onDateChange,
    onViewChange,
    onCharacterSelect,
    toggleGame,
    updateFilters,
    setShowFavoritesOnly,
    toggleFavorite,
    onEditCharacter,
    onExportIcs,
    onAddCharacter,
    onExportData,
    onExportAllIcs,
  } = props;

  // Stage character - use today's first character or first in list
  const [stageCharacter, setStageCharacter] = useState<Character | null>(() => {
    if (characters.length === 0) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayChars = getCharactersByDate(characters, today, dateMode);
    return todayChars.length > 0 ? todayChars[0] : characters[0];
  });

  // Halo position state
  const [haloPosition, setHaloPosition] = useState<{ x: number; y: number } | null>(null);

  // Dialog state
  const [showFilters, setShowFilters] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [heroCharacter, setHeroCharacter] = useState<Character | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilterGame, setActiveFilterGame] = useState(selectedGames[0] || 'genshin');

  // Apply workspace profile
  const profile = workspaceProfile(
    stageCharacter || undefined,
    themeId as 'neutral' | 'mondstadt' | 'liyue' | 'inazuma' | 'sumeru' | 'fontaine' | 'natlan' | 'snezhnaya',
    null
  );

  // Merge style with halo position
  const workspaceStyle = {
    ...style,
    ...profile.style,
    ...(haloPosition && {
      '--v2-halo-x': `${haloPosition.x}px`,
      '--v2-halo-y': `${haloPosition.y}px`,
    }),
  } as React.CSSProperties;

  const stageAffiliation = stageCharacter ? resolveAffiliation(stageCharacter) : null;

  const activeFilters = Object.values(filters.gameFilters).flatMap(f =>
    [...f.elements, ...f.weapons, ...f.rarities.map(r => `${r}星`)]
  );
  const filterSummary = activeFilters.length > 0 ? `已筛选 ${activeFilters.length} 项` : '';

  const handleStagePosition = useCallback((x: number, y: number) => {
    setHaloPosition({ x, y });
  }, []);

  const handleStageClick = useCallback(() => {
    if (!stageCharacter) return;
    setShowDetail(false);
    setHeroCharacter(stageCharacter);
  }, [stageCharacter]);

  const handleCharacterClick = (character: Character) => {
    setStageCharacter(character);
    onCharacterSelect(character);
    setShowDetail(true);
  };

  const handleSearchSelect = (character: Character) => {
    const charDate = dateMode === 'release' && character.releaseDate
      ? new Date(character.releaseDate)
      : character.birthday
      ? new Date(new Date().getFullYear(), parseInt(character.birthday.split('-')[0]) - 1, parseInt(character.birthday.split('-')[1]))
      : new Date();
    onDateChange(charDate);
    setStageCharacter(character);
    onCharacterSelect(character);
    setShowSearch(false);
    setShowDetail(true);
  };

  return (
    <div className="v2-workspace" data-theme={dataTheme} style={workspaceStyle}>
      <div className="v2-scene-field" aria-hidden="true" />

      <WorkspaceHeader
        favoriteCount={favoriteCharacterIds.length}
        showFavoritesOnly={showFavoritesOnly}
        onShowFavoritesOnlyChange={setShowFavoritesOnly}
        onSearchOpen={() => setShowSearch(true)}
        onFiltersOpen={() => setShowFilters(true)}
        onAddCharacter={onAddCharacter}
        onExportData={onExportData}
        onExportIcs={onExportAllIcs}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
        weekStart={weekStart}
        onWeekStartChange={setWeekStart}
        portraitBackgroundEnabled={portraitBackgroundEnabled}
        onPortraitBackgroundChange={setPortraitBackgroundEnabled}
        motionEnabled={motionEnabled}
        onMotionChange={setMotionEnabled}
      />

      <div className="v2-body">
        {stageCharacter && (
          <WorkspaceStage
            character={stageCharacter}
            affiliation={stageAffiliation}
            dateMode={dateMode}
            onCharacterClick={handleStageClick}
            onStagePosition={handleStagePosition}
          />
        )}

        <WorkspaceCalendar
          characters={characters}
          currentDate={currentDate}
          view={view}
          dateMode={dateMode}
          weekStart={weekStart}
          displayMode={displayMode}
          summary={filterSummary}
          onDateChange={onDateChange}
          onViewChange={onViewChange}
          onDateModeChange={setDateMode}
          onCharacterClick={handleCharacterClick}
          onFilters={() => setShowFilters(true)}
        />
      </div>

      {showFilters && (
        <WorkspaceFilters
          selectedGames={selectedGames}
          filters={filters}
          filterOptionsByGame={filterOptionsByGame}
          activeGameId={activeFilterGame}
          showFavoritesOnly={showFavoritesOnly}
          onClose={() => setShowFilters(false)}
          onActiveGameChange={setActiveFilterGame}
          onToggleGame={toggleGame}
          onFiltersChange={updateFilters}
          onClearFilters={() => updateFilters({
            gameFilters: Object.fromEntries(
              Object.keys(filterOptionsByGame).map(game => [game, { elements: [], rarities: [], weapons: [], regions: [] }])
            ),
            showMissingInfo: true,
          })}
          onShowFavoritesOnlyChange={setShowFavoritesOnly}
        />
      )}

      {showSearch && (
        <WorkspaceDialog title="搜索角色" onClose={() => setShowSearch(false)}>
          <CharacterSearch
            characters={allCharacters}
            favoriteCharacterIds={favoriteCharacterIds}
            dateMode={dateMode}
            onSelect={handleSearchSelect}
          />
        </WorkspaceDialog>
      )}

      {showDetail && stageCharacter && (
        <WorkspaceCharacterDetail
          character={stageCharacter}
          dateMode={dateMode}
          isFavorite={favoriteCharacterIds.includes(stageCharacter.id)}
          portraitBackgroundEnabled={portraitBackgroundEnabled}
          motionEnabled={motionEnabled}
          onClose={() => setShowDetail(false)}
          onToggleFavorite={() => toggleFavorite(stageCharacter.id)}
          onEdit={() => onEditCharacter(stageCharacter)}
          onExportIcs={() => onExportIcs(stageCharacter)}
        />
      )}

      {heroCharacter && (
        <WorkspaceHero
          character={heroCharacter}
          affiliation={resolveAffiliation(heroCharacter)}
          dateMode={dateMode}
          onClose={() => setHeroCharacter(null)}
        />
      )}
    </div>
  );
}
