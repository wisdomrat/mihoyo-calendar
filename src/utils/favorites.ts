type CharacterLike = { id: string };

export function normalizeFavoriteIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawId of ids) {
    const id = String(rawId || '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }

  return result;
}

export function toggleFavoriteId(ids: string[], id: string): string[] {
  const normalizedId = id.trim();
  if (!normalizedId) return normalizeFavoriteIds(ids);

  const normalizedIds = normalizeFavoriteIds(ids);
  if (normalizedIds.includes(normalizedId)) {
    return normalizedIds.filter(favoriteId => favoriteId !== normalizedId);
  }

  return [...normalizedIds, normalizedId];
}

export function resolveFavoriteCharacters<T extends CharacterLike>(ids: string[], characters: T[]): T[] {
  const byId = new Map(characters.map(character => [character.id, character]));
  return normalizeFavoriteIds(ids)
    .map(id => byId.get(id))
    .filter((character): character is T => Boolean(character));
}

export function isFavoriteCharacter(ids: string[], id: string): boolean {
  return normalizeFavoriteIds(ids).includes(id);
}
