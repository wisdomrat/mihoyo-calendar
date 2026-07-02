import type { Character } from '../types';
import { getGameName } from './calendar.ts';

export interface CharacterSearchResult {
  character: Character;
  matchedFields: string[];
}

export interface CharacterSearchOptions {
  limit?: number;
}

const DEFAULT_LIMIT = 8;

function normalizeSearchText(value: string | undefined): string {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function fieldEntries(character: Character): Array<[string, string | undefined]> {
  return [
    ['name', character.name],
    ['nameEn', character.nameEn],
    ['game', character.game],
    ['game', getGameName(character.game)],
    ['birthday', character.birthday],
    ['element', character.element],
    ['weapon', character.weapon],
    ['region', character.region],
  ];
}

function scoreMatch(field: string, normalizedValue: string, query: string): number {
  if (!normalizedValue.includes(query)) return 0;
  const isName = field === 'name' || field === 'nameEn';
  if (normalizedValue === query) return isName ? 100 : 70;
  if (normalizedValue.startsWith(query)) return isName ? 90 : 60;
  return isName ? 55 : 35;
}

export function searchCharacters(
  query: string,
  characters: Character[],
  options: CharacterSearchOptions = {},
): CharacterSearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const scoredResults = characters
    .map((character, index) => {
      let score = 0;
      const matchedFields: string[] = [];

      for (const [field, value] of fieldEntries(character)) {
        const normalizedValue = normalizeSearchText(value);
        const fieldScore = scoreMatch(field, normalizedValue, normalizedQuery);
        if (fieldScore > 0) {
          score = Math.max(score, fieldScore);
          if (!matchedFields.includes(field)) matchedFields.push(field);
        }
      }

      return { character, matchedFields, score, index };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  return scoredResults
    .slice(0, options.limit ?? DEFAULT_LIMIT)
    .map(({ character, matchedFields }) => ({ character, matchedFields }));
}
