import type { Character, DateMode } from '../types';

// `short` 是日历格子里用的窄标签：完整名（崩坏：星穹铁道）在周视图的
// 单元格里会溢出，所以角色卡上的游戏标只用短名。
//
// `color` 同时充当两种角色：日历上的头像环 / 圆点 / 卡片左边框（需 ≥3:1），
// 以及 .modal-game-badge 的底色配 --accent-ink 深字（需 ≥4.5:1）。
// 全站暗色后星铁原本的 #6b5ce7 在徽章上只有 3.49~4.00:1，是四色里唯一不合格的，
// 提亮到 #9d90ff 后两种用法都在 5.8 以上；其余三色两项均达标，保持原值不动。
export const GAMES: Record<string, { name: string; short: string; color: string }> = {
  genshin: { name: '原神', short: '原神', color: '#4a90e2' },
  hsr: { name: '崩坏：星穹铁道', short: '星穹铁道', color: '#9d90ff' },
  zzz: { name: '绝区零', short: '绝区零', color: '#ff6b6b' },
  honkai3: { name: '崩坏3', short: '崩坏3', color: '#ff8cc8' },
};

// Games whose characters have no official birthday; they always show the
// release date regardless of the selected date mode. Star Rail characters
// currently carry manually-maintained placeholder birthdays, so treat the
// whole game as birthday-less.
const GAMES_WITHOUT_BIRTHDAY = new Set(['hsr']);

// Games with no recorded release dates across the whole roster (not just a
// single character). Honkai 3's BWIKI template carries no 实装日期, so the
// entire game currently has no release data.
const GAMES_WITHOUT_RELEASE = new Set(['honkai3']);

export function gameHasBirthday(gameId: string): boolean {
  return !GAMES_WITHOUT_BIRTHDAY.has(gameId);
}

export function gameHasRelease(gameId: string): boolean {
  return !GAMES_WITHOUT_RELEASE.has(gameId);
}

// Resolve which date mode actually applies to a game, falling back to whatever
// the game genuinely has: games without birthdays are forced to release mode,
// and games without release dates are forced back to birthday mode, so no game
// ever renders an empty calendar in some mode.
export function effectiveDateMode(gameId: string, mode: DateMode): DateMode {
  if (!gameHasBirthday(gameId)) return 'release';
  if (!gameHasRelease(gameId)) return 'birthday';
  return mode;
}

// Full filter label for a game, e.g. 原神角色生日 / 原神角色实装日.
// Games without an official birthday always read 实装日.
export function gameDateLabel(gameId: string, mode: DateMode): string {
  const name = getGameName(gameId);
  return `${name}角色${effectiveDateMode(gameId, mode) === 'release' ? '实装日' : '生日'}`;
}

// Extract the MM-DD key used to place a character on the calendar. Birthdays
// are already MM-DD; release dates are YYYY-MM-DD, so we slice off the year so
// a release "anniversary" recurs every year.
export function calendarDateKey(character: Character, mode: DateMode): string {
  if (effectiveDateMode(character.game, mode) === 'release') {
    return (character.releaseDate || '').slice(5); // MM-DD
  }
  return character.birthday || '';
}

// Human-readable date for a character under the given mode.
export function displayDate(character: Character, mode: DateMode): string {
  if (effectiveDateMode(character.game, mode) === 'release') {
    return formatReleaseDate(character.releaseDate);
  }
  return formatBirthday(character.birthday);
}

export function formatReleaseDate(releaseDate?: string): string {
  if (!releaseDate) return '';
  const [year, month, day] = releaseDate.split('-');
  if (!year || !month || !day) return '';
  return `${parseInt(year)}年${parseInt(month)}月${parseInt(day)}日`;
}

export function getGameColor(gameId: string): string {
  return GAMES[gameId]?.color || '#999';
}

export function getGameName(gameId: string): string {
  return GAMES[gameId]?.name || gameId;
}

export function getGameShortName(gameId: string): string {
  return GAMES[gameId]?.short || gameId;
}

export function formatBirthday(birthday: string): string {
  const [month, day] = birthday.split('-');
  return `${parseInt(month)}月${parseInt(day)}日`;
}

export function getCharactersByDate(characters: Character[], date: Date, mode: DateMode = 'birthday'): Character[] {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${month}-${day}`;
  return characters.filter(c => calendarDateKey(c, mode) === dateStr);
}
