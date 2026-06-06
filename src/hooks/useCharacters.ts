import { useState, useEffect, useCallback } from 'react';
import type { Character } from '../types';

const STORAGE_KEY = 'mihoyo-calendar-characters';
const LAST_SYNC_KEY = 'mihoyo-calendar-last-sync';

// Default/demo data for initial load
const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 'amber-genshin',
    name: '安柏',
    nameEn: 'Amber',
    game: 'genshin',
    birthday: '08-10',
    avatar: 'https://upload-os-bbs.mihoyo.com/game_record/genshin/character_image/UI_AvatarIcon_Ambor@2x.png',
    rarity: 4,
    element: '火',
    weapon: '弓',
    region: '蒙德',
    source: 'manual',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'barbara-genshin',
    name: '芭芭拉',
    nameEn: 'Barbara',
    game: 'genshin',
    birthday: '07-05',
    avatar: 'https://upload-os-bbs.mihoyo.com/game_record/genshin/character_image/UI_AvatarIcon_Barbara@2x.png',
    rarity: 4,
    element: '水',
    weapon: '法器',
    region: '蒙德',
    source: 'manual',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'kafka-hsr',
    name: '卡芙卡',
    nameEn: 'Kafka',
    game: 'hsr',
    birthday: '08-25',
    rarity: 5,
    element: '雷',
    source: 'manual',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ellen-zzz',
    name: '艾莲',
    nameEn: 'Ellen',
    game: 'zzz',
    birthday: '01-17',
    rarity: 5,
    source: 'manual',
    updatedAt: new Date().toISOString(),
  },
];

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [selectedGames, setSelectedGames] = useState<string[]>(['genshin', 'hsr', 'zzz', 'honkai3']);

  // Load characters from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const lastSyncTime = localStorage.getItem(LAST_SYNC_KEY);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCharacters(parsed);
      } catch {
        setCharacters(DEFAULT_CHARACTERS);
      }
    } else {
      setCharacters(DEFAULT_CHARACTERS);
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
          setCharacters(data);
          const now = new Date().toISOString();
          localStorage.setItem(LAST_SYNC_KEY, now);
          setLastSync(now);
          setLoading(false);
          return;
        }
      }
      
      // If no data file, use current characters
      console.log('No external data found, using local data');
    } catch (error) {
      console.error('Failed to fetch character data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCharacter = useCallback((character: Omit<Character, 'id' | 'updatedAt'>) => {
    const newCharacter: Character = {
      ...character,
      id: `${character.nameEn.toLowerCase().replace(/\s+/g, '-')}-${character.game}`,
      updatedAt: new Date().toISOString(),
    };
    setCharacters(prev => [...prev, newCharacter]);
  }, []);

  const removeCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  }, []);

  const toggleGame = useCallback((gameId: string) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(g => g !== gameId)
        : [...prev, gameId]
    );
  }, []);

  const filteredCharacters = characters.filter(c => selectedGames.includes(c.game));

  return {
    characters: filteredCharacters,
    allCharacters: characters,
    loading,
    lastSync,
    selectedGames,
    fetchFromWiki,
    addCharacter,
    removeCharacter,
    toggleGame,
  };
}
