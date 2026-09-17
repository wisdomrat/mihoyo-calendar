import test from 'node:test';
import assert from 'node:assert/strict';

import { computeDetailLayout } from '../src/components/v2/detailLayout.ts';

test('Genshin detail art uses the Remielle reference frame on desktop', () => {
  const genshin = computeDetailLayout({ width: 2048, height: 1024 }, 1440, 900, 'genshin');
  const remielle = computeDetailLayout({ width: 2128, height: 1324 }, 1440, 900, 'zzz');

  assert.equal(genshin.portraitWidth, remielle.portraitWidth);
  assert.ok(Math.abs(genshin.portraitHeight - remielle.portraitHeight) <= 1);
});

test('Genshin detail art uses the Remielle reference frame on mobile', () => {
  const genshin = computeDetailLayout({ width: 2048, height: 1024 }, 390, 844, 'genshin');
  const remielle = computeDetailLayout({ width: 2128, height: 1324 }, 390, 844, 'zzz');

  assert.equal(genshin.portraitWidth, remielle.portraitWidth);
  assert.ok(Math.abs(genshin.portraitHeight - remielle.portraitHeight) <= 1);
});

test('non-Genshin detail artwork keeps its source aspect ratio', () => {
  const layout = computeDetailLayout({ width: 2128, height: 1324 }, 1440, 900, 'zzz');

  assert.equal(layout.portraitWidth, 784);
  assert.equal(layout.portraitHeight, 488);
});
