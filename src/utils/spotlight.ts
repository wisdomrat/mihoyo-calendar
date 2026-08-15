import type { Character, DateMode } from '../types';
import { calendarDateKey } from './calendar';

// 今天起向前最多看多少天的“近期生日/实装”角色。
export const SPOTLIGHT_LOOKAHEAD_DAYS = 14;
export const SPOTLIGHT_MAX_SLIDES = 8;

function dayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}-${d}`;
}

// 收集从今天起 LOOKAHEAD_DAYS 内有纪念日的角色，按距离今天的先后排序。
export function collectUpcoming(characters: Character[], dateMode: DateMode, fromDate: Date): Character[] {
  const ordered: Character[] = [];
  const seen = new Set<string>();
  for (let offset = 0; offset <= SPOTLIGHT_LOOKAHEAD_DAYS; offset++) {
    const date = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() + offset);
    const key = dayKey(date);
    for (const char of characters) {
      if (seen.has(char.id)) continue;
      if (calendarDateKey(char, dateMode) === key) {
        seen.add(char.id);
        ordered.push(char);
      }
    }
    if (ordered.length >= SPOTLIGHT_MAX_SLIDES) break;
  }
  return ordered.slice(0, SPOTLIGHT_MAX_SLIDES);
}

export function spotlightOffsetLabel(char: Character, dateMode: DateMode, fromDate: Date): string {
  for (let offset = 0; offset <= SPOTLIGHT_LOOKAHEAD_DAYS; offset++) {
    const date = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() + offset);
    if (calendarDateKey(char, dateMode) === dayKey(date)) {
      if (offset === 0) return '今天';
      if (offset === 1) return '明天';
      return `${offset} 天后`;
    }
  }
  return '';
}
