import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createClearedGameFilters,
  getActiveFilterCount,
  getScopedFilterSections,
  resolveActiveFilterGame,
} from '../src/utils/filterUi.ts';

test('getScopedFilterSections returns only the active game options', () => {
  const sections = getScopedFilterSections('genshin', {
    genshin: {
      elements: ['火'],
      rarities: [4, 5],
      weapons: ['单手剑'],
      regions: ['蒙德'],
    },
    hsr: {
      elements: ['火'],
      rarities: [5],
      weapons: ['虚无'],
      regions: ['星穹列车'],
    },
  });

  assert.deepEqual(sections.map(section => section.label), ['元素', '稀有度', '武器', '地区']);
  assert.deepEqual(sections.find(section => section.type === 'weapons')?.values, ['单手剑']);
  assert.equal(sections.some(section => section.values.includes('虚无')), false);
});

test('resolveActiveFilterGame moves to the next selected game when current game is deselected', () => {
  assert.equal(resolveActiveFilterGame('genshin', ['hsr', 'zzz'], ['genshin', 'hsr', 'zzz']), 'hsr');
  assert.equal(resolveActiveFilterGame('zzz', ['hsr', 'zzz'], ['genshin', 'hsr', 'zzz']), 'zzz');
  assert.equal(resolveActiveFilterGame('genshin', [], ['genshin', 'hsr', 'zzz']), 'genshin');
});

test('createClearedGameFilters resets every game filter group', () => {
  const cleared = createClearedGameFilters(['genshin', 'hsr']);

  assert.deepEqual(cleared, {
    genshin: { elements: [], rarities: [], weapons: [], regions: [] },
    hsr: { elements: [], rarities: [], weapons: [], regions: [] },
  });
});

test('getActiveFilterCount counts scoped filters and hidden missing-info rows', () => {
  const count = getActiveFilterCount({
    showMissingInfo: false,
    gameFilters: {
      genshin: { elements: ['火'], rarities: [5], weapons: [], regions: [] },
      hsr: { elements: [], rarities: [], weapons: ['虚无'], regions: ['星穹列车'] },
    },
  });

  assert.equal(count, 5);
});
