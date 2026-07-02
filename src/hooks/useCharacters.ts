import { useState, useEffect, useCallback } from 'react';
import type { Character } from '../types';
import charactersData from '../data/characters.json';
import {
  applyCharacterFilters,
  createEmptyGameFilters,
  extractManualCharacters,
  getFilterOptionsByGame,
  mergeCharacterCollections,
  normalizeCharacter,
  type FilterOptions,
  type ScopedFilterState,
} from '../utils/characterData';
import {
  normalizeFavoriteIds,
  resolveFavoriteCharacters,
  toggleFavoriteId,
} from '../utils/favorites.ts';

const STORAGE_KEY = 'mihoyo-calendar-characters-v5';
const LEGACY_STORAGE_KEYS = ['mihoyo-calendar-characters-v4'];
const LAST_SYNC_KEY = 'mihoyo-calendar-last-sync';
const DISPLAY_MODE_KEY = 'mihoyo-calendar-display-mode';
const WEEK_START_KEY = 'mihoyo-calendar-week-start';
const FILTERS_KEY = 'mihoyo-calendar-filters-v3';
const PORTRAIT_BACKGROUND_KEY = 'mihoyo-calendar-portrait-background';
const FAVORITES_KEY = 'mihoyo-calendar-favorite-ids-v1';
const LEGACY_FILTERS_KEY = 'mihoyo-calendar-filters-v2';
const GAME_IDS = ['genshin', 'hsr', 'zzz', 'honkai3'];

const ALL_CHARACTERS: Character[] = charactersData as Character[];

export type DisplayMode = 'avatar' | 'card' | 'compact';
export type WeekStart = 0 | 1;
export type { FilterOptions };
export type FilterState = ScopedFilterState;

function emptyFilterState(): FilterState {
  return {
    gameFilters: createEmptyGameFilters(GAME_IDS),
    showMissingInfo: true,
  };
}

function normalizeFilterState(value: unknown): FilterState {
  const fallback = emptyFilterState();
  if (!value || typeof value !== 'object') return fallback;

  const parsed = value as Partial<FilterState> & { elements?: string[]; rarities?: number[]; weapons?: string[]; regions?: string[] };
  if (!parsed.gameFilters || typeof parsed.gameFilters !== 'object') {
    return {
      ...fallback,
      showMissingInfo: parsed.showMissingInfo !== false,
    };
  }

  const gameFilters = createEmptyGameFilters(GAME_IDS);
  for (const gameId of GAME_IDS) {
    const incoming = parsed.gameFilters[gameId];
    gameFilters[gameId] = {
      elements: Array.isArray(incoming?.elements) ? incoming.elements : [],
      rarities: Array.isArray(incoming?.rarities) ? incoming.rarities : [],
      weapons: Array.isArray(incoming?.weapons) ? incoming.weapons : [],
      regions: Array.isArray(incoming?.regions) ? incoming.regions : [],
    };
  }

  return {
    gameFilters,
    showMissingInfo: parsed.showMissingInfo !== false,
  };
}

function readCharactersFromStorage(key: string): Character[] {
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [selectedGames, setSelectedGames] = useState<string[]>(GAME_IDS);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('avatar');
  const [weekStart, setWeekStart] = useState<WeekStart>(0);
  const [portraitBackgroundEnabled, setPortraitBackgroundEnabled] = useState(false);
  const [filters, setFilters] = useState<FilterState>(() => emptyFilterState());
  const [favoriteCharacterIds, setFavoriteCharacterIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    const lastSyncTime = localStorage.getItem(LAST_SYNC_KEY);
    const savedMode = localStorage.getItem(DISPLAY_MODE_KEY) as DisplayMode | null;
    const savedWeekStart = localStorage.getItem(WEEK_START_KEY);
    const savedFilters = localStorage.getItem(FILTERS_KEY) || localStorage.getItem(LEGACY_FILTERS_KEY);
    const savedPortraitBackground = localStorage.getItem(PORTRAIT_BACKGROUND_KEY);
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);

    if (savedMode && ['avatar', 'card', 'compact'].includes(savedMode)) {
      setDisplayMode(savedMode);
    }
    if (savedWeekStart && (savedWeekStart === '0' || savedWeekStart === '1')) {
      setWeekStart(parseInt(savedWeekStart) as WeekStart);
    }
    if (savedPortraitBackground === 'true') {
      setPortraitBackgroundEnabled(true);
    }
    if (savedFilters) {
      try {
        setFilters(normalizeFilterState(JSON.parse(savedFilters)));
      } catch {
        setFilters(emptyFilterState());
      }
    }
    if (savedFavorites) {
      try {
        setFavoriteCharacterIds(normalizeFavoriteIds(JSON.parse(savedFavorites)));
      } catch {
        setFavoriteCharacterIds([]);
      }
    }

    const manualCharacters = [
      ...extractManualCharacters(readCharactersFromStorage(STORAGE_KEY)),
      ...LEGACY_STORAGE_KEYS.flatMap(key => extractManualCharacters(readCharactersFromStorage(key))),
    ];
    const initialData = mergeCharacterCollections(
      ALL_CHARACTERS.map(normalizeCharacter),
      manualCharacters.map(normalizeCharacter),
    );

    setCharacters(initialData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    for (const key of LEGACY_STORAGE_KEYS) localStorage.removeItem(key);

    if (lastSyncTime) setLastSync(lastSyncTime);
  }, []);

  useEffect(() => {
    if (characters.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    }
  }, [characters]);

  useEffect(() => {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteCharacterIds));
  }, [favoriteCharacterIds]);

  const fetchFromWiki = useCallback(async () => {
    setLoading(true);
    setSyncProgress('正在检查已发布数据...');

    const urls = [
      '/data/characters.json',
      `${import.meta.env.BASE_URL || '/'}data/characters.json`,
      './data/characters.json',
      '/mihoyo-calendar/data/characters.json',
    ];

    let success = false;

    for (const baseUrl of urls) {
      try {
        setSyncProgress(`正在尝试 ${baseUrl}...`);
        const cacheBuster = `?t=${Date.now()}`;
        const response = await fetch(`${baseUrl}${cacheBuster}`, {
          method: 'GET',
          cache: 'no-cache',
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setSyncProgress(`已获取 ${data.length} 个角色，正在合并...`);

            const merged = mergeCharacterCollections(
              characters.map(normalizeCharacter),
              data.map(normalizeCharacter),
              { preferIncoming: true },
            );

            setCharacters(merged);
            const now = new Date().toISOString();
            localStorage.setItem(LAST_SYNC_KEY, now);
            setLastSync(now);
            setSyncProgress(`更新完成：共 ${merged.length} 个角色。`);

            setTimeout(() => setSyncProgress(''), 3000);
            success = true;
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${baseUrl}:`, error);
      }
    }

    if (!success) {
      setSyncProgress('已发布数据不可用，继续使用本地内置数据。');
      setTimeout(() => setSyncProgress(''), 3000);
    }

    setLoading(false);
  }, [characters]);

  const addCharacter = useCallback((characterData: Omit<Character, 'id' | 'updatedAt' | 'source'>) => {
    const newCharacter: Character = {
      ...characterData,
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      source: 'manual',
      updatedAt: new Date().toISOString(),
    };
    setCharacters(prev => mergeCharacterCollections(prev, [normalizeCharacter(newCharacter)]));
  }, []);

  const editCharacter = useCallback((id: string, updates: Partial<Omit<Character, 'id' | 'updatedAt'>>) => {
    setCharacters(prev => prev.map(char =>
      char.id === id
        ? normalizeCharacter({ ...char, ...updates, updatedAt: new Date().toISOString() })
        : char,
    ));
  }, []);

  const removeCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(character => character.id !== id));
  }, []);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(characters, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `mihoyo-characters-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [characters]);

  const toggleGame = useCallback((gameId: string) => {
    setSelectedGames(prev =>
      prev.includes(gameId)
        ? prev.filter(game => game !== gameId)
        : [...prev, gameId],
    );
  }, []);

  const setMode = useCallback((mode: DisplayMode) => {
    setDisplayMode(mode);
    localStorage.setItem(DISPLAY_MODE_KEY, mode);
  }, []);

  const setWeekStartDay = useCallback((start: WeekStart) => {
    setWeekStart(start);
    localStorage.setItem(WEEK_START_KEY, String(start));
  }, []);

  const setPortraitBackground = useCallback((enabled: boolean) => {
    setPortraitBackgroundEnabled(enabled);
    localStorage.setItem(PORTRAIT_BACKGROUND_KEY, String(enabled));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => normalizeFilterState({ ...prev, ...newFilters }));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteCharacterIds(prev => toggleFavoriteId(prev, id));
  }, []);

  const favoriteCharacters = resolveFavoriteCharacters(favoriteCharacterIds, characters);
  const favoriteCount = favoriteCharacters.length;
  const filteredCharacters = applyCharacterFilters(characters, selectedGames, filters)
    .filter(character => !showFavoritesOnly || favoriteCharacterIds.includes(character.id));
  const filterOptionsByGame = getFilterOptionsByGame(characters);

  return {
    characters: filteredCharacters,
    allCharacters: characters,
    loading,
    syncProgress,
    lastSync,
    selectedGames,
    displayMode,
    weekStart,
    portraitBackgroundEnabled,
    favoriteCharacterIds,
    favoriteCharacters,
    favoriteCount,
    showFavoritesOnly,
    filters,
    filterOptionsByGame,
    fetchFromWiki,
    addCharacter,
    editCharacter,
    removeCharacter,
    exportData,
    toggleGame,
    setDisplayMode: setMode,
    setWeekStart: setWeekStartDay,
    setPortraitBackgroundEnabled: setPortraitBackground,
    toggleFavorite,
    setShowFavoritesOnly,
    updateFilters,
  };
}