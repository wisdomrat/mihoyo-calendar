import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const characters = JSON.parse(fs.readFileSync('src/data/characters.json', 'utf8'));

test('bundled Nanoka-supported games include portrait artwork', () => {
  for (const game of ['genshin', 'hsr', 'zzz']) {
    const list = characters.filter(character => character.game === game);
    const missing = list.filter(character => !character.portrait);

    assert.ok(list.length > 0, `${game} has bundled characters`);
    assert.deepEqual(missing.map(character => character.name), [], `${game} characters missing portrait`);
  }
});

test('bundled Star Rail Topaz record uses Nanoka artwork', () => {
  const topaz = characters.find(character => character.game === 'hsr' && character.name === '托帕');

  assert.ok(topaz, 'Topaz exists');
  assert.equal(topaz.avatar, 'https://static.nanoka.cc/assets/hsr/avatarshopicon/1112.webp');
  assert.equal(topaz.portrait, 'https://static.nanoka.cc/assets/hsr/avatardrawcard/1112.webp');
});