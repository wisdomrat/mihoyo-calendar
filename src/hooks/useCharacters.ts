import { useState, useEffect, useCallback } from 'react';
import type { Character } from '../types';
import charactersData from '../data/characters.json';

const STORAGE_KEY = 'mihoyo-calendar-characters-v2';
const LAST_SYNC_KEY = 'mihoyo-calendar-last-sync';
const DISPLAY_MODE_KEY = 'mihoyo-calendar-display-mode';

// Use imported JSON data (234 characters) instead of hardcoded 6
const ALL_CHARACTERS: Character[] = charactersData as Character[];

export type DisplayMode = 'avatar' | 'card' | 'compact';

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
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
        // If local data has fewer characters than built-in, use built-in
        if (parsed.length < ALL_CHARACTERS.length) {
          console.log(`Updating character data: ${parsed.length} → ${ALL_CHARACTERS.length}`);
          setCharacters(ALL_CHARACTERS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(ALL_CHARACTERS));
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
    try {
      // Try to fetch from public/data/characters.json first
      const response = await fetch('/data/characters.json');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Only update if fetched data has more characters
          if (data.length >= characters.length) {
            setCharacters(data);
            const now = new Date().toISOString();
            localStorage.setItem(LAST_SYNC_KEY, now);
            setLastSync(now);
          }
          setLoading(false);
          return;
        }
      }
      
      // If no external data found, use current characters
      console.log('No external data found, using local data');
    } catch (error) {
      console.error('Failed to fetch character data:', error);
    } finally {
      setLoading(false);
    }
  }, [characters.length]);

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
    lastSync,
    selectedGames,
    displayMode,
    fetchFromWiki,
    toggleGame,
    setDisplayMode: setMode,
  };
}
