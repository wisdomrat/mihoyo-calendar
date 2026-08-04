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
  assert.equal(layout.style['--portrait-modal-width'], 'min(1400px, 96vw, 160vh)');
  assert.equal(layout.style['--portrait-size'], 'contain');
  assert.equal(layout.style['--portrait-position'], 'center center');
  assert.equal(layout.style['--portrait-aspect-ratio'], '2048 / 1024');
});


test('Genshin wide artwork-only layout uses a 4/5 frame on mobile and exposes the real ratio for desktop', () => {
  const layout = getPortraitModalLayout({ width: 2048, height: 1024 }, 'artwork', 'genshin');

  assert.equal(layout.className, 'portrait-layout-landscape portrait-layout-genshin-artwork');
  // Mobile: 4/5 portrait frame with height-driven sizing so flat artwork reads large.
  assert.equal(layout.style['--portrait-modal-width'], 'min(620px, 94vw)');
  assert.equal(layout.style['--portrait-size'], 'auto 96%');
  assert.equal(layout.style['--portrait-position'], 'center center');
  assert.equal(layout.style['--portrait-aspect-ratio'], '4 / 5');
  // Desktop CSS media query swaps to the real ratio + contain, driven by this var.
  assert.equal(layout.style['--portrait-aspect-ratio-desktop'], '2048 / 1024');
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

test('ZZZ vertical portrait artwork centres horizontally in detail mode', () => {
  const layout = getPortraitModalLayout({ width: 891, height: 1999 }, 'detail', 'zzz');

  assert.equal(layout.className, 'portrait-layout-vertical');
  assert.equal(layout.style['--portrait-modal-width'], '400px');
  assert.equal(layout.style['--portrait-size'], 'auto 94%');
  assert.equal(layout.style['--portrait-position'], 'center bottom');
});

test('missing portrait dimensions keep CSS fallback values', () => {
  const layout = getPortraitModalLayout(null);

  assert.equal(layout.className, 'portrait-layout-pending');
  assert.deepEqual(layout.style, {});
});