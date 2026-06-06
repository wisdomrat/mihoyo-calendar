import { useState, useEffect, useCallback } from 'react';
import type { Character } from '../types';
import charactersData from '../data/characters.json';

const STORAGE_KEY = 'mihoyo-calendar-characters-v4';
const LAST_SYNC_KEY = 'mihoyo-calendar-last-sync';
const DISPLAY_MODE_KEY = 'mihoyo-calendar-display-mode';

const ALL_CHARACTERS: Character[] = charactersData as Character[];

export type DisplayMode = 'avatar' | 'card' | 'compact';

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
      // Merge: prefer the one with more data
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
        // Keep existing id if it's manual, otherwise use new id
        map.set(key, { ...char, id: existing.source === 'manual' ? existing.id : char.id });
      }
    }
  }
  return Array.from(map.values());
}

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [selectedGames, setSelectedGames] = useState<string[]>(['genshin', 'hsr', 'zzz', 'honkai3']);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('avatar');

  // Load data on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const lastSyncTime = localStorage.getItem(LAST_SYNC_KEY);
    const savedMode = localStorage.getItem(DISPLAY_MODE_KEY) as DisplayMode | null;
    
    if (savedMode && ['avatar', 'card', 'compact'].includes(savedMode)) {
      setDisplayMode(savedMode);
    }
    
    let initialData: Character[];
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with builtin data and deduplicate
        initialData = deduplicate([...parsed, ...ALL_CHARACTERS]);
      } catch {
        initialData = deduplicate(ALL_CHARACTERS);
      }
    } else {
      initialData = deduplicate(ALL_CHARACTERS);
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

  const fetchFromWiki = useCallback(async () => {
    setLoading(true);
    setSyncProgress('正在检查远程数据...');
    
    try {
      // Try to fetch from remote
      setSyncProgress('正在获取远程数据...');
      
      // Add cache-busting parameter
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(`/data/characters.json${cacheBuster}`, {
        method: 'GET',
        cache: 'no-cache',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setSyncProgress(`获取到 ${data.length} 个角色，正在合并去重...`);
          
          // Merge and deduplicate
          const merged = deduplicate([...characters, ...data]);
          
          setCharacters(merged);
          const now = new Date().toISOString();
          localStorage.setItem(LAST_SYNC_KEY, now);
          setLastSync(now);
          setSyncProgress(`同步完成！共 ${merged.length} 个角色`);
          
          setTimeout(() => setSyncProgress(''), 3000);
          setLoading(false);
          return;
        }
      }
      
      setSyncProgress('远程数据为空或不可用');
      setTimeout(() => setSyncProgress(''), 3000);
    } catch (error) {
      console.error('Failed to fetch:', error);
      setSyncProgress('同步失败：' + (error instanceof Error ? error.message : '网络错误'));
      setTimeout(() => setSyncProgress(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [characters]);

  const addCharacter = useCallback((characterData: Omit<Character, 'id' | 'updatedAt' | 'source'>) => {
    const newCharacter: Character = {
      ...characterData,
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      source: 'manual',
      updatedAt: new Date().toISOString(),
    };
    setCharacters(prev => deduplicate([...prev, newCharacter]));
  }, []);

  const editCharacter = useCallback((id: string, updates: Partial<Omit<Character, 'id' | 'updatedAt'>>) => {
    setCharacters(prev => {
      const updated = prev.map(char => 
        char.id === id 
          ? { ...char, ...updates, updatedAt: new Date().toISOString() }
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

  const filteredCharacters = characters.filter(c => selectedGames.includes(c.game));

  return {
    characters: filteredCharacters,
    allCharacters: characters,
    loading,
    syncProgress,
    lastSync,
    selectedGames,
    displayMode,
    fetchFromWiki,
    addCharacter,
    editCharacter,
    removeCharacter,
    exportData,
    toggleGame,
    setDisplayMode: setMode,
  };
}
