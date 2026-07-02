import test from 'node:test';
import assert from 'node:assert/strict';

import { searchCharacters } from '../src/utils/characterSearch.ts';

const characters = [
  {
    id: 'amber',
    name: 'Amber',
    nameEn: 'Amber',
    game: 'genshin',
    birthday: '08-10',
    element: 'Pyro',
    weapon: 'Bow',
    region: 'Mondstadt',
    source: 'test',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'himeko',
    name: 'Himeko',
    nameEn: 'Himeko',
    game: 'hsr',
    birthday: '09-27',
    element: 'Fire',
    weapon: 'Erudition',
    region: 'Astral Express',
    source: 'test',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'firefly',
    name: 'Firefly',
    nameEn: 'Firefly',
    game: 'hsr',
    birthday: '06-18',
    element: 'Fire',
    weapon: 'Destruction',
    region: 'Stellaron Hunters',
    source: 'test',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

test('searchCharacters matches name, game, birthday, and metadata fields', () => {
  assert.equal(searchCharacters('amb', characters)[0].character.id, 'amber');
  assert.equal(searchCharacters('hsr', characters)[0].character.id, 'himeko');
  assert.equal(searchCharacters('09-27', characters)[0].character.id, 'himeko');
  assert.equal(searchCharacters('mondstadt', characters)[0].character.id, 'amber');
});

test('searchCharacters ranks prefix name matches before metadata-only matches', () => {
  const results = searchCharacters('fire', characters);

  assert.equal(results[0].character.id, 'firefly');
  assert.equal(results[1].character.id, 'himeko');
});

test('searchCharacters limits visible results and returns matched fields', () => {
  const results = searchCharacters('h', characters, { limit: 2 });

  assert.equal(results.length, 2);
  assert.ok(results[0].matchedFields.length > 0);
});
