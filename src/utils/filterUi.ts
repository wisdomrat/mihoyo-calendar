import type { FilterOptions, ScopedFilterState } from './characterData';

export const FILTER_LABELS: Record<string, { elements: string; weapons: string; regions: string }> = {
  genshin: { elements: '元素', weapons: '武器', regions: '地区' },
  hsr: { elements: '属性', weapons: '命途', regions: '阵营' },
  zzz: { elements: '属性', weapons: '特性', regions: '阵营' },
  honkai3: { elements: '属性', weapons: '类型', regions: '组织' },
};

export type FilterSection = {
  type: keyof FilterOptions;
  label: string;
  values: (string | number)[];
};

function emptyOptions(): FilterOptions {
  return { elements: [], rarities: [], weapons: [], regions: [] };
}

export function createClearedGameFilters(gameIds: string[]): Record<string, FilterOptions> {
  return Object.fromEntries(gameIds.map(gameId => [gameId, emptyOptions()]));
}

export function getActiveFilterCount(filters: ScopedFilterState): number {
  const scopedCount = Object.values(filters.gameFilters).reduce((count, gameFilter) => (
    count +
    gameFilter.elements.length +
    gameFilter.rarities.length +
    gameFilter.weapons.length +
    gameFilter.regions.length
  ), 0);

  return scopedCount + (filters.showMissingInfo ? 0 : 1);
}

export function getScopedFilterSections(
  gameId: string,
  filterOptionsByGame: Record<string, FilterOptions>,
): FilterSection[] {
  const options = filterOptionsByGame[gameId] || emptyOptions();
  const labels = FILTER_LABELS[gameId] || FILTER_LABELS.genshin;

  return [
    { type: 'elements', label: labels.elements, values: options.elements },
    { type: 'rarities', label: '稀有度', values: options.rarities },
    { type: 'weapons', label: labels.weapons, values: options.weapons },
    { type: 'regions', label: labels.regions, values: options.regions },
  ];
}

export function resolveActiveFilterGame(
  currentGameId: string,
  selectedGames: string[],
  gameOrder: string[],
): string {
  if (selectedGames.includes(currentGameId)) return currentGameId;
  return gameOrder.find(gameId => selectedGames.includes(gameId)) || gameOrder[0] || currentGameId;
}
