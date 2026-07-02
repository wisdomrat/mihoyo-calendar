import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isFavoriteCharacter,
  normalizeFavoriteIds,
  resolveFavoriteCharacters,
  toggleFavoriteId,
} from '../src/utils/favorites.ts';

test('normalizeFavoriteIds removes duplicates and blank ids', () => {
  assert.deepEqual(normalizeFavoriteIds(['amber', '', 'amber', ' himeko ']), ['amber', 'himeko']);
});

test('toggleFavoriteId adds and removes ids', () => {
  assert.deepEqual(toggleFavoriteId(['amber'], 'himeko'), ['amber', 'himeko']);
  assert.deepEqual(toggleFavoriteId(['amber', 'himeko'], 'amber'), ['himeko']);
});

test('resolveFavoriteCharacters returns only known characters in favorite order', () => {
  const favorites = resolveFavoriteCharacters(
    ['missing', 'amber', 'himeko'],
    [{ id: 'himeko', name: 'Himeko' }, { id: 'amber', name: 'Amber' }],
  );

  assert.deepEqual(favorites.map(character => character.id), ['amber', 'himeko']);
});

test('isFavoriteCharacter checks normalized favorite ids', () => {
  assert.equal(isFavoriteCharacter(['amber', 'himeko'], 'amber'), true);
  assert.equal(isFavoriteCharacter(['amber', 'himeko'], 'missing'), false);
});
