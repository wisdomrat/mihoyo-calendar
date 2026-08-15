import { useEffect, useMemo, useState } from 'react';
import type { Character } from '../types';
import { GAMES } from '../utils/calendar';

// 'neutral' 是未聚焦时的统一中性主题；其余值与 GAMES 的 id 一一对应。
export type ThemeId = 'neutral' | keyof typeof GAMES;
// follow-neutral：未选中时用中性主题；follow-character：始终跟随当前选中角色所属游戏。
export type ThemeMode = 'follow-neutral' | 'follow-character';

const THEME_MODE_KEY = 'mihoyo-calendar-theme-mode';
const GAME_IDS = new Set(Object.keys(GAMES));

export function isGameTheme(value: unknown): value is ThemeId {
  return typeof value === 'string' && (value === 'neutral' || GAME_IDS.has(value));
}

export function normalizeThemeMode(value: unknown): ThemeMode {
  return value === 'follow-character' ? 'follow-character' : 'follow-neutral';
}

function readStoredThemeMode(): ThemeMode {
  try {
    return normalizeThemeMode(window.localStorage.getItem(THEME_MODE_KEY));
  } catch {
    return 'follow-neutral';
  }
}

// Resolve which game the theme should follow when聚焦，优先级：
// 1) 当前选中的角色；2) 仅剩一个游戏被勾选时的那个游戏；3) 最近浏览的角色。
export function resolveFollowedGame(
  selected: Character | null,
  selectedGames: string[],
  lastBrowsedGame: string | null,
): ThemeId | null {
  if (selected && GAME_IDS.has(selected.game)) return selected.game;
  if (selectedGames.length === 1 && GAME_IDS.has(selectedGames[0])) return selectedGames[0];
  if (lastBrowsedGame && GAME_IDS.has(lastBrowsedGame)) return lastBrowsedGame;
  return null;
}

export function useTheme(
  selectedCharacter: Character | null,
  selectedGames: string[],
) {
  const [mode, setMode] = useState<ThemeMode>(readStoredThemeMode);
  const [lastBrowsedGame, setLastBrowsedGame] = useState<string | null>(null);

  // 记录最近浏览的角色所属游戏，作为 follow-character 模式失去选中后的回落。
  // 在渲染期对比前值再更新（React 支持的“derived state from props”写法），避免 effect 里 setState。
  const [prevSelected, setPrevSelected] = useState<Character | null>(null);
  if (selectedCharacter !== prevSelected) {
    setPrevSelected(selectedCharacter);
    if (selectedCharacter && GAME_IDS.has(selectedCharacter.game)) {
      setLastBrowsedGame(selectedCharacter.game);
    }
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_MODE_KEY, mode);
    } catch {
      /* ignore storage failures */
    }
  }, [mode]);

  const theme: ThemeId = useMemo(() => {
    const followed = resolveFollowedGame(selectedCharacter, selectedGames, lastBrowsedGame);
    if (mode === 'follow-character') {
      // follow-character：能确定游戏就跟随，否则回落中性。
      return followed ?? 'neutral';
    }
    // follow-neutral：仅在“单游戏聚焦”（选中角色或只剩一个游戏）时染色，否则保持中性。
    const singleFocus =
      (selectedCharacter && GAME_IDS.has(selectedCharacter.game) && selectedCharacter.game) ||
      (selectedGames.length === 1 && GAME_IDS.has(selectedGames[0]) ? selectedGames[0] : null);
    return singleFocus ?? 'neutral';
  }, [mode, selectedCharacter, selectedGames, lastBrowsedGame]);

  return { theme, mode, setMode };
}
