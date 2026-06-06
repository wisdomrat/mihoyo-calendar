import { useState, useEffect, useCallback } from 'react';
import type { Character } from '../types';
import charactersData from '../data/characters.json';

const STORAGE_KEY = 'mihoyo-calendar-characters-v3';
const LAST_SYNC_KEY = 'mihoyo-calendar-last-sync';
const DISPLAY_MODE_KEY = 'mihoyo-calendar-display-mode';

// Use imported JSON data as base
const ALL_CHARACTERS: Character[] = charactersData as Character[];

export type DisplayMode = 'avatar' | 'card' | 'compact';

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
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // If local data has fewer characters than built-in, merge them
        if (parsed.length < ALL_CHARACTERS.length) {
          console.log(`Merging character data: local ${parsed.length} + builtin ${ALL_CHARACTERS.length}`);
          // Keep local additions, add missing builtin characters
          const localIds = new Set(parsed.map((c: Character) => c.id));
          const merged = [...parsed];
          for (const char of ALL_CHARACTERS) {
            if (!localIds.has(char.id)) {
              merged.push(char);
            }
          }
          setCharacters(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } else {
          setCharacters(parsed);
        }
      } catch {
        setCharacters(ALL_CHARACTERS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ALL_CHARACTERS));
      }
    } else {
      setCharacters(ALL_CHARACTERS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ALL_CHARACTERS));
    }
    
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
    setSyncProgress('正在检查Wiki数据...');
    
    try {
      // Try to fetch from public/data/characters.json first (updated by GitHub Actions)
      setSyncProgress('正在获取远程数据...');
      const response = await fetch('/data/characters.json');
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setSyncProgress(`获取到 ${data.length} 个角色，正在合并...`);
          
          // Merge strategy: keep local characters that don't exist in remote
          const remoteIds = new Set(data.map((c: Character) => c.id));
          const localOnly = characters.filter(c => !remoteIds.has(c.id));
          
          const merged = [...data, ...localOnly];
          
          setCharacters(merged);
          const now = new Date().toISOString();
          localStorage.setItem(LAST_SYNC_KEY, now);
          setLastSync(now);
          setSyncProgress('同步完成！');
          
          // Clear progress after 3 seconds
          setTimeout(() => setSyncProgress(''), 3000);
          setLoading(false);
          return;
        }
      }
      
      setSyncProgress('无法获取远程数据，使用本地数据');
      setTimeout(() => setSyncProgress(''), 3000);
    } catch (error) {
      console.error('Failed to fetch character data:', error);
      setSyncProgress('同步失败：网络错误');
      setTimeout(() => setSyncProgress(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [characters]);

  const addCharacter = useCallback((characterData: Omit<Character, 'id' | 'updatedAt' | 'source'>) => {
    const newCharacter: Character = {
      ...characterData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: 'manual',
      updatedAt: new Date().toISOString(),
    };
    setCharacters(prev => [...prev, newCharacter]);
  }, []);

  const editCharacter = useCallback((id: string, updates: Partial<Omit<Character, 'id' | 'updatedAt'>>) => {
    setCharacters(prev => 
      prev.map(char => 
        char.id === id 
          ? { ...char, ...updates, updatedAt: new Date().toISOString() }
          : char
      )
    );
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
