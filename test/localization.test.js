import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const visibleUiFiles = [
  'src/App.tsx',
  'src/components/Header.tsx',
  'src/components/CharacterSearch.tsx',
  'src/hooks/useCharacters.ts',
];

const forbiddenVisibleText = [
  'MiHoYo Birthday Calendar',
  'Track character birthdays across games',
  '>Search<',
  'Search character, game, birthday...',
  'No matches',
  '>Birthday<',
  '>Rarity<',
  '>Element<',
  '>Weapon / Path<',
  '>Region / Faction<',
  "'Favorite'",
  "'Unfavorite'",
  '>Favorite<',
  '>Unfavorite<',
  'No valid birthdays to export.',
  'Downloaded ',
  'Checking published data...',
  'Trying ',
  'Fetched ',
  'Update complete:',
  'Export JSON data',
  'Update published data',
];

test('new visible UI text remains localized in Chinese', () => {
  const combinedSource = visibleUiFiles
    .map(file => fs.readFileSync(file, 'utf8'))
    .join('\n');

  for (const text of forbiddenVisibleText) {
    assert.equal(combinedSource.includes(text), false, `found English UI text: ${text}`);
  }
});
