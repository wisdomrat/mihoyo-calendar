import type { Character } from '../types';

export const GAMES: Record<string, { name: string; color: string }> = {
  genshin: { name: '原神', color: '#4a90e2' },
  hsr: { name: '崩坏：星穹铁道', color: '#6b5ce7' },
  zzz: { name: '绝区零', color: '#ff6b6b' },
  honkai3: { name: '崩坏3', color: '#ff8cc8' },
};

export function getGameColor(gameId: string): string {
  return GAMES[gameId]?.color || '#999';
}

export function getGameName(gameId: string): string {
  return GAMES[gameId]?.name || gameId;
}

export function formatBirthday(birthday: string): string {
  const [month, day] = birthday.split('-');
  return `${parseInt(month)}月${parseInt(day)}日`;
}

export function getCharactersByDate(characters: Character[], date: Date): Character[] {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${month}-${day}`;
  return characters.filter(c => c.birthday === dateStr);
}
