import test from 'node:test';
import assert from 'node:assert/strict';

import { getPortraitModalLayout } from '../src/utils/portraitLayout.ts';

test('wide portrait artwork uses compact filled framing in detail mode', () => {
  const layout = getPortraitModalLayout({ width: 2048, height: 1024 });

  assert.equal(layout.className, 'portrait-layout-landscape');
  assert.equal(layout.style['--portrait-modal-width'], 'min(440px, 94vw)');
  assert.equal(layout.style['--portrait-size'], 'cover');
  assert.equal(layout.style['--portrait-position'], 'center center');
  assert.equal(layout.style['--portrait-aspect-ratio'], undefined);
});

test('wide portrait artwork uses image ratio and full containment in artwork-only mode', () => {
  const layout = getPortraitModalLayout({ width: 2048, height: 1024 }, 'artwork');

  assert.equal(layout.className, 'portrait-layout-landscape');
  assert.equal(layout.style['--portrait-modal-width'], 'min(820px, 96vw)');
  assert.equal(layout.style['--portrait-size'], 'contain');
  assert.equal(layout.style['--portrait-position'], 'center center');
  assert.equal(layout.style['--portrait-aspect-ratio'], '2048 / 1024');
});


test('Genshin wide artwork-only layout enlarges character art instead of containing the full landscape canvas', () => {
  const layout = getPortraitModalLayout({ width: 2048, height: 1024 }, 'artwork', 'genshin');

  assert.equal(layout.className, 'portrait-layout-landscape portrait-layout-genshin-artwork');
  assert.equal(layout.style['--portrait-modal-width'], 'min(620px, 94vw)');
  assert.equal(layout.style['--portrait-size'], 'auto 96%');
  assert.equal(layout.style['--portrait-position'], 'center center');
  assert.equal(layout.style['--portrait-aspect-ratio'], '4 / 5');
});
test('square portrait artwork centers instead of leaning right in detail mode', () => {
  const layout = getPortraitModalLayout({ width: 2048, height: 2048 });

  assert.equal(layout.className, 'portrait-layout-square');
  assert.equal(layout.style['--portrait-modal-width'], 'min(440px, 94vw)');
  assert.equal(layout.style['--portrait-size'], 'cover');
  assert.equal(layout.style['--portrait-position'], 'center center');
});

test('vertical portrait artwork keeps the compact modal framing', () => {
  const layout = getPortraitModalLayout({ width: 1416, height: 1908 });

  assert.equal(layout.className, 'portrait-layout-vertical');
  assert.equal(layout.style['--portrait-modal-width'], '400px');
  assert.equal(layout.style['--portrait-size'], 'auto 94%');
  assert.equal(layout.style['--portrait-position'], 'right bottom');
});

test('missing portrait dimensions keep CSS fallback values', () => {
  const layout = getPortraitModalLayout(null);

  assert.equal(layout.className, 'portrait-layout-pending');
  assert.deepEqual(layout.style, {});
});