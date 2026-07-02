import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyCharacterFilters,
  createEmptyGameFilters,
  getFilterOptionsByGame,
  mergeCharacterCollections,
} from '../src/utils/characterData.ts';

const baseCharacter = {
  id: 'amber-genshin',
  name: '安柏',
  nameEn: 'Amber',
  game: 'genshin',
  birthday: '08-10',
  rarity: 4,
  element: '火',
  weapon: '弓',
  region: '蒙德',
  source: 'manual',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

test('mergeCharacterCollections replaces stale local avatars with trusted remote avatars', () => {
  const stale = {
    ...baseCharacter,
    avatar: 'https://old.example.invalid/amber.png',
  };
  const remote = {
    ...baseCharacter,
    id: 'nanoka-genshin-10000021',
    source: 'nanoka',
    avatar: 'https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Ambor.webp',
  };

  const merged = mergeCharacterCollections([stale], [remote], { preferIncoming: true });

  assert.equal(merged.length, 1);
  assert.equal(merged[0].avatar, remote.avatar);
  assert.equal(merged[0].id, stale.id);
});

test('applyCharacterFilters scopes secondary filters by game', () => {
  const characters = [
    { ...baseCharacter, id: 'amber-genshin', game: 'genshin', element: '火', weapon: '弓' },
    { ...baseCharacter, id: 'himeko-hsr', name: '姬子', nameEn: 'Himeko', game: 'hsr', element: '火', weapon: '智识', region: '星穹列车' },
  ];
  const gameFilters = createEmptyGameFilters(['genshin', 'hsr']);
  gameFilters.genshin.elements = ['火'];

  const filtered = applyCharacterFilters(characters, ['genshin', 'hsr'], {
    gameFilters,
    showMissingInfo: true,
  });

  assert.deepEqual(filtered.map(c => c.id), ['amber-genshin', 'himeko-hsr']);

  gameFilters.hsr.weapons = ['虚无'];
  const filteredWithHsrPath = applyCharacterFilters(characters, ['genshin', 'hsr'], {
    gameFilters,
    showMissingInfo: true,
  });

  assert.deepEqual(filteredWithHsrPath.map(c => c.id), ['amber-genshin']);
});

test('getFilterOptionsByGame keeps per-game option lists separate', () => {
  const options = getFilterOptionsByGame([
    { ...baseCharacter, game: 'genshin', element: '火', weapon: '弓', region: '蒙德' },
    { ...baseCharacter, id: 'himeko-hsr', game: 'hsr', element: '火', weapon: '智识', region: '星穹列车' },
  ]);

  assert.deepEqual(options.genshin.weapons, ['弓']);
  assert.deepEqual(options.hsr.weapons, ['智识']);
});
test('mergeCharacterCollections preserves incoming portrait artwork', () => {
  const merged = mergeCharacterCollections([baseCharacter], [{
    ...baseCharacter,
    source: 'nanoka',
    portrait: 'https://static.nanoka.cc/assets/zzz/IconRole01.webp',
  }], { preferIncoming: true });

  assert.equal(merged[0].portrait, 'https://static.nanoka.cc/assets/zzz/IconRole01.webp');
});
test('mergeCharacterCollections merges Star Rail Topaz aliases from cached manual data', () => {
  const cachedTopaz = {
    id: 'topaz-hsr',
    name: '托帕',
    nameEn: 'Topaz',
    game: 'hsr',
    birthday: '08-29',
    avatar: 'https://ui-avatars.com/api/?name=T',
    source: 'manual',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
  const bundledTopaz = {
    id: 'nanoka-hsr-1112',
    name: '托帕&账账',
    nameEn: 'Topaz & Numby',
    game: 'hsr',
    birthday: '',
    avatar: 'https://static.nanoka.cc/assets/hsr/avatarshopicon/1112.webp',
    portrait: 'https://static.nanoka.cc/assets/hsr/avatardrawcard/1112.webp',
    source: 'nanoka',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };

  const merged = mergeCharacterCollections([bundledTopaz], [cachedTopaz]);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].name, '托帕&账账');
  assert.equal(merged[0].birthday, '08-29');
  assert.equal(merged[0].avatar, bundledTopaz.avatar);
  assert.equal(merged[0].portrait, bundledTopaz.portrait);
});
