import { useState, useEffect, useCallback } from 'react';
import type { Character } from '../types';
import charactersData from '../data/characters.json';

const STORAGE_KEY = 'mihoyo-calendar-characters-v4';
const LAST_SYNC_KEY = 'mihoyo-calendar-last-sync';
const DISPLAY_MODE_KEY = 'mihoyo-calendar-display-mode';
const WEEK_START_KEY = 'mihoyo-calendar-week-start';
const FILTERS_KEY = 'mihoyo-calendar-filters-v2';

const ALL_CHARACTERS: Character[] = charactersData as Character[];

export type DisplayMode = 'avatar' | 'card' | 'compact';
export type WeekStart = 0 | 1; // 0 = Sunday, 1 = Monday

export interface FilterOptions {
  elements: string[];
  rarities: number[];
  weapons: string[];
  regions: string[];
}

export interface FilterState extends FilterOptions {
  showMissingInfo: boolean;
}

// Create unique key from name and game
function getCharKey(name: string, game: string): string {
  return `${name}-${game}`;
}

// Deduplicate characters using name+game as key
function deduplicate(chars: Character[]): Character[] {
  const map = new Map<string, Character>();
  for (const char of chars) {
    const key = getCharKey(char.name, char.game);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, char);
    } else {
      const hasAvatar = (c: Character) => c.avatar && !c.avatar.includes('ui-avatars.com');
      const score = (c: Character) => {
        let s = 0;
        if (hasAvatar(c)) s += 3;
        if (c.birthday && c.birthday !== '??-??') s += 2;
        if (c.element) s += 1;
        if (c.weapon) s += 1;
        if (c.region) s += 1;
        return s;
      };
      if (score(char) > score(existing)) {
        map.set(key, { ...char, id: existing.source === 'manual' ? existing.id : char.id });
      }
    }
  }
  return Array.from(map.values());
}

// Normalize empty values
function normalizeChar(char: Character): Character {
  return {
    ...char,
    element: char.element?.trim() || '',
    weapon: char.weapon?.trim() || '',
    region: char.region?.trim() || '',
  };
}

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [selectedGames, setSelectedGames] = useState<string[]>(['genshin', 'hsr', 'zzz', 'honkai3']);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('avatar');
  const [weekStart, setWeekStart] = useState<WeekStart>(0);
  const [filters, setFilters] = useState<FilterState>({
    elements: [],
    rarities: [],
    weapons: [],
    regions: [],
    showMissingInfo: true,
  });

  // Load data on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const lastSyncTime = localStorage.getItem(LAST_SYNC_KEY);
    const savedMode = localStorage.getItem(DISPLAY_MODE_KEY) as DisplayMode | null;
    const savedWeekStart = localStorage.getItem(WEEK_START_KEY);
    const savedFilters = localStorage.getItem(FILTERS_KEY);
    
    if (savedMode && ['avatar', 'card', 'compact'].includes(savedMode)) {
      setDisplayMode(savedMode);
    }
    if (savedWeekStart && (savedWeekStart === '0' || savedWeekStart === '1')) {
      setWeekStart(parseInt(savedWeekStart) as WeekStart);
    }
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setFilters({
          elements: parsed.elements || [],
          rarities: parsed.rarities || [],
          weapons: parsed.weapons || [],
          regions: parsed.regions || [],
          showMissingInfo: parsed.showMissingInfo !== false,
        });
      } catch {}
    }
    
    let initialData: Character[];
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        initialData = deduplicate([...parsed, ...ALL_CHARACTERS]).map(normalizeChar);
      } catch {
        initialData = deduplicate(ALL_CHARACTERS).map(normalizeChar);
      }
    } else {
      initialData = deduplicate(ALL_CHARACTERS).map(normalizeChar);
    }
    
    setCharacters(initialData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    
    if (lastSyncTime) {
      setLastSync(lastSyncTime);
    }
  }, []);

  // Save to localStorage when characters change
  useEffect(() => {
    if (characters.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    }
  }, [characters]);

  // Save filters
  useEffect(() => {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }, [filters]);

  const fetchFromWiki = useCallback(async () => {
    setLoading(true);
    setSyncProgress('正在检查远程数据...');
    
    const urls = [
      '/data/characters.json',
      `${import.meta.env.BASE_URL || '/'}data/characters.json`,
      './data/characters.json',
      '/mihoyo-calendar/data/characters.json',
    ];
    
    let success = false;
    
    for (const baseUrl of urls) {
      try {
        setSyncProgress(`正在尝试获取: ${baseUrl}...`);
        const cacheBuster = `?t=${Date.now()}`;
        const response = await fetch(`${baseUrl}${cacheBuster}`, {
          method: 'GET',
          cache: 'no-cache',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setSyncProgress(`获取到 ${data.length} 个角色，正在合并去重...`);
            
            const merged = deduplicate([...characters, ...data.map(normalizeChar)]);
            
            setCharacters(merged);
            const now = new Date().toISOString();
            localStorage.setItem(LAST_SYNC_KEY, now);
            setLastSync(now);
            setSyncProgress(`同步完成！共 ${merged.length} 个角色`);
            
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
      setSyncProgress('远程数据为空或不可用，已使用本地数据');
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
    setCharacters(prev => deduplicate([...prev, normalizeChar(newCharacter)]));
  }, []);

  const editCharacter = useCallback((id: string, updates: Partial<Omit<Character, 'id' | 'updatedAt'>>) => {
    setCharacters(prev => {
      const updated = prev.map(char => 
        char.id === id 
          ? normalizeChar({ ...char, ...updates, updatedAt: new Date().toISOString() })
          : char
      );
      return deduplicate(updated);
    });
  }, []);

  const removeCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  }, []);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(characters, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mihoyo-characters-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [characters]);

  const toggleGame = useCallback((gameId: string) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(g => g !== gameId)
        : [...prev, gameId]
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

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Apply all filters
  const filteredCharacters = characters.filter(c => {
    if (!selectedGames.includes(c.game)) return false;
    
    const hasMissingInfo = !c.element || !c.weapon || !c.region;
    if (hasMissingInfo && !filters.showMissingInfo) return false;
    
    if (filters.elements.length > 0 && (!c.element || !filters.elements.includes(c.element))) return false;
    if (filters.rarities.length > 0 && (!c.rarity || !filters.rarities.includes(c.rarity))) return false;
    if (filters.weapons.length > 0 && (!c.weapon || !filters.weapons.includes(c.weapon))) return false;
    if (filters.regions.length > 0 && (!c.region || !filters.regions.includes(c.region))) return false;
    
    return true;
  });

  // Get unique filter options
  const filterOptions = {
    elements: Array.from(new Set(characters.map(c => c.element).filter((v): v is string => !!v))).sort(),
    rarities: Array.from(new Set(characters.map(c => c.rarity).filter((v): v is number => !!v))).sort((a, b) => a - b),
    weapons: Array.from(new Set(characters.map(c => c.weapon).filter((v): v is string => !!v))).sort(),
    regions: Array.from(new Set(characters.map(c => c.region).filter((v): v is string => !!v))).sort(),
  };

  return {
    characters: filteredCharacters,
    allCharacters: characters,
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
    removeCharacter,
    exportData,
    toggleGame,
    setDisplayMode: setMode,
    setWeekStart: setWeekStartDay,
    updateFilters,
  };
}
