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

const CHARACTER_ALIAS_GROUPS: Record<string, string[][]> = {
  hsr: [
    ['\u6258\u5e15', '\u6258\u5e15&\u8d26\u8d26', 'Topaz', 'Topaz & Numby'],
  ],
  zzz: [
    ['\u661f\u89c1\u96c5', '\u661f\u898b\u96c5', '\u96c5', 'Miyabi', 'Hoshimi Miyabi'],
    ['\u6d45\u7fbd\u60a0\u771f', '\u60a0\u771f', 'Harumasa', 'Asaba Harumasa'],
  ],
};

function normalizeKeyPart(value: string | undefined): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[\s·・'"“”‘’「」:：()（）[\]_-]/g, '')
    .trim();
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawValue of values) {
    const value = rawValue.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }

  return result;
}

function aliasPartsFor(game: string, parts: string[]): string[] {
  const expanded = [...parts];

  for (const group of CHARACTER_ALIAS_GROUPS[game] || []) {
    const normalizedGroup = group.map(value => normalizeKeyPart(value));
    if (normalizedGroup.some(part => parts.includes(part))) expanded.push(...normalizedGroup);
  }

  return uniqueStrings(expanded);
}

function characterKeys(character: Character): string[] {
  const parts = uniqueStrings([character.name, character.nameEn].map(value => normalizeKeyPart(value)).filter(Boolean));
  const aliases = aliasPartsFor(character.game, parts);

  return uniqueStrings(aliases.map(value => `${character.game}:${value}`));
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

function setCharacterForKeys(map: Map<string, Character>, character: Character, extraKeys: string[] = []): Character {
  const normalized = normalizeCharacter(character);

  for (const key of uniqueStrings([...extraKeys, ...characterKeys(normalized)])) {
    map.set(key, normalized);
  }

  return normalized;
}

export function mergeCharacterCollections(
  baseCharacters: Character[],
  incomingCharacters: Character[],
  options: { preferIncoming?: boolean } = {},
): Character[] {
  const preferIncoming = options.preferIncoming === true;
  const map = new Map<string, Character>();

  for (const rawCharacter of baseCharacters) {
    setCharacterForKeys(map, rawCharacter);
  }

  for (const rawCharacter of incomingCharacters) {
    const incoming = normalizeCharacter(rawCharacter);
    const incomingKeys = characterKeys(incoming);
    const existing = incomingKeys.map(key => map.get(key)).find((character): character is Character => Boolean(character));

    if (!existing) {
      setCharacterForKeys(map, incoming);
      continue;
    }

    const sharedKeys = [...characterKeys(existing), ...incomingKeys];
    const shouldReplace = completenessScore(incoming) > completenessScore(existing);
    if (shouldReplace && !preferIncoming) {
      setCharacterForKeys(map, { ...incoming, id: existing.source === 'manual' ? existing.id : incoming.id }, sharedKeys);
      continue;
    }

    setCharacterForKeys(map, mergeCharacter(existing, incoming, preferIncoming), sharedKeys);
  }

  return Array.from(new Set(map.values()));
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
