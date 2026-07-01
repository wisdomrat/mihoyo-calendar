import type { Character } from '../types';

export interface FilterOptions {
  elements: string[];
  rarities: number[];
  weapons: string[];
  regions: string[];
}

export interface ScopedFilterState {
  gameFilters: Record<string, FilterOptions>;
  showMissingInfo: boolean;
}

const EMPTY_FILTERS: FilterOptions = {
  elements: [],
  rarities: [],
  weapons: [],
  regions: [],
};

function normalizeKeyPart(value: string | undefined): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[\s·・'"“”‘’「」:：()（）[\]_-]/g, '')
    .trim();
}

function characterKey(character: Character): string {
  return `${character.game}:${normalizeKeyPart(character.name)}`;
}

function hasRealAvatar(character: Character): boolean {
  return Boolean(character.avatar && !character.avatar.includes('ui-avatars.com'));
}

function avatarScore(character: Character): number {
  if (!character.avatar) return 0;
  if (character.avatar.includes('ui-avatars.com')) return 1;
  if (character.avatar.includes('static.nanoka.cc')) return 5;
  if (character.avatar.includes('honeyhunterworld.com')) return 4;
  if (character.avatar.includes('wiki.biligame.com')) return 3;
  return 2;
}

function completenessScore(character: Character): number {
  let score = 0;
  if (hasRealAvatar(character)) score += avatarScore(character);
  if (character.birthday && character.birthday !== '??-??') score += 2;
  if (character.element) score += 1;
  if (character.weapon) score += 1;
  if (character.region) score += 1;
  if (character.rarity) score += 1;
  return score;
}

export function normalizeCharacter(character: Character): Character {
  return {
    ...character,
    element: character.element?.trim() || '',
    weapon: character.weapon?.trim() || '',
    region: character.region?.trim() || '',
    portrait: character.portrait?.trim() || '',
  };
}

function mergeCharacter(existing: Character, incoming: Character, preferIncoming: boolean): Character {
  const next = { ...existing };
  const incomingAvatarWins = preferIncoming
    ? hasRealAvatar(incoming) && incoming.avatar !== existing.avatar
    : avatarScore(incoming) > avatarScore(existing);

  if (incomingAvatarWins) next.avatar = incoming.avatar;
  if ((!next.birthday || next.birthday === '??-??') && incoming.birthday) next.birthday = incoming.birthday;
  if ((!next.nameEn || normalizeKeyPart(next.nameEn) === normalizeKeyPart(next.name)) && incoming.nameEn) next.nameEn = incoming.nameEn;
  if (incoming.portrait && incoming.portrait !== existing.portrait) next.portrait = incoming.portrait;
  if (!next.element && incoming.element) next.element = incoming.element;
  if (!next.weapon && incoming.weapon) next.weapon = incoming.weapon;
  if (!next.region && incoming.region) next.region = incoming.region;
  if (!next.rarity && incoming.rarity) next.rarity = incoming.rarity;
  next.updatedAt = incoming.updatedAt || next.updatedAt;

  return normalizeCharacter(next);
}

export function mergeCharacterCollections(
  baseCharacters: Character[],
  incomingCharacters: Character[],
  options: { preferIncoming?: boolean } = {},
): Character[] {
  const preferIncoming = options.preferIncoming === true;
  const map = new Map<string, Character>();

  for (const rawCharacter of baseCharacters) {
    const character = normalizeCharacter(rawCharacter);
    map.set(characterKey(character), character);
  }

  for (const rawCharacter of incomingCharacters) {
    const incoming = normalizeCharacter(rawCharacter);
    const key = characterKey(incoming);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, incoming);
      continue;
    }

    const shouldReplace = completenessScore(incoming) > completenessScore(existing);
    if (shouldReplace && !preferIncoming) {
      map.set(key, normalizeCharacter({ ...incoming, id: existing.source === 'manual' ? existing.id : incoming.id }));
      continue;
    }

    map.set(key, mergeCharacter(existing, incoming, preferIncoming));
  }

  return Array.from(map.values());
}

export function createEmptyFilterOptions(): FilterOptions {
  return {
    elements: [],
    rarities: [],
    weapons: [],
    regions: [],
  };
}

export function createEmptyGameFilters(gameIds: string[]): Record<string, FilterOptions> {
  return Object.fromEntries(gameIds.map(gameId => [gameId, createEmptyFilterOptions()]));
}

function getGameFilter(filters: ScopedFilterState, gameId: string): FilterOptions {
  return filters.gameFilters[gameId] || EMPTY_FILTERS;
}

export function applyCharacterFilters(
  characters: Character[],
  selectedGames: string[],
  filters: ScopedFilterState,
): Character[] {
  return characters.filter(character => {
    if (!selectedGames.includes(character.game)) return false;

    const hasMissingInfo = !character.element || !character.weapon || !character.region;
    if (hasMissingInfo && !filters.showMissingInfo) return false;

    const gameFilter = getGameFilter(filters, character.game);
    if (gameFilter.elements.length > 0 && (!character.element || !gameFilter.elements.includes(character.element))) return false;
    if (gameFilter.rarities.length > 0 && (!character.rarity || !gameFilter.rarities.includes(character.rarity))) return false;
    if (gameFilter.weapons.length > 0 && (!character.weapon || !gameFilter.weapons.includes(character.weapon))) return false;
    if (gameFilter.regions.length > 0 && (!character.region || !gameFilter.regions.includes(character.region))) return false;

    return true;
  });
}

export function getFilterOptionsByGame(characters: Character[]): Record<string, FilterOptions> {
  const result: Record<string, FilterOptions> = {};

  for (const character of characters) {
    result[character.game] ||= createEmptyFilterOptions();
    const options = result[character.game];
    if (character.element && !options.elements.includes(character.element)) options.elements.push(character.element);
    if (character.rarity && !options.rarities.includes(character.rarity)) options.rarities.push(character.rarity);
    if (character.weapon && !options.weapons.includes(character.weapon)) options.weapons.push(character.weapon);
    if (character.region && !options.regions.includes(character.region)) options.regions.push(character.region);
  }

  for (const options of Object.values(result)) {
    options.elements.sort();
    options.rarities.sort((a, b) => a - b);
    options.weapons.sort();
    options.regions.sort();
  }

  return result;
}

export function extractManualCharacters(characters: Character[]): Character[] {
  return characters.filter(character => character.source === 'manual');
}
