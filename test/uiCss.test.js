import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('src/index.css', 'utf8');

function blockFor(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*');
  return css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`))?.[1] || '';
}

function declarationValue(block, property) {
  return block.match(new RegExp(`${property}\\s*:\\s*([^;]+);`))?.[1]?.trim();
}

test('portrait modal keeps artwork below transparent overlay and readable content', () => {
  const modalLayer = blockFor('.modal-content');
  const imageLayer = blockFor('.modal-content.with-portrait-bg::before');
  const overlayLayer = blockFor('.modal-content.with-portrait-bg::after');
  const contentLayer = blockFor(`.modal-content.with-portrait-bg .modal-close,
.modal-content.with-portrait-bg .modal-portrait-toggle`);

  assert.equal(declarationValue(modalLayer, 'max-width'), 'var(--portrait-modal-width, 400px)');
  assert.equal(declarationValue(imageLayer, 'z-index'), '0');
  assert.equal(declarationValue(imageLayer, 'background-size'), 'var(--portrait-size, auto 94%)');
  assert.equal(declarationValue(overlayLayer, 'z-index'), '1');
  assert.equal(declarationValue(overlayLayer, 'background'), 'transparent');
  assert.equal(declarationValue(contentLayer, 'z-index'), '3');
});

test('portrait modal does not force Genshin or Star Rail into wide contain fallback', () => {
  const defaultImageLayer = blockFor('.modal-content.with-portrait-bg::before');
  const appSource = fs.readFileSync('src/App.tsx', 'utf8');

  assert.equal(declarationValue(defaultImageLayer, 'background-position'), 'var(--portrait-position, right bottom)');
  assert.equal(blockFor('.modal-content.with-portrait-bg.game-genshin'), '');
  assert.equal(blockFor('.modal-content.with-portrait-bg.game-hsr'), '');
  assert.match(appSource, /game-\$\{character\.game\}/);
});

test('artwork-only portrait mode hides text and sizes the modal from image ratio', () => {
  const artworkLayer = blockFor('.modal-content.portrait-artwork-only');
  const hiddenTextLayer = blockFor(`.modal-content.portrait-artwork-only .modal-header,
.modal-content.portrait-artwork-only .modal-body`);
  const controlLayer = blockFor(`.modal-content.portrait-artwork-only .modal-close,
.modal-content.portrait-artwork-only .modal-portrait-toggle`);
  const appSource = fs.readFileSync('src/App.tsx', 'utf8');

  assert.equal(declarationValue(artworkLayer, 'aspect-ratio'), 'var(--portrait-aspect-ratio, 1 / 1)');
  assert.equal(declarationValue(artworkLayer, 'max-height'), '90vh');
  assert.equal(declarationValue(hiddenTextLayer, 'display'), 'none');
  assert.equal(declarationValue(controlLayer, 'z-index'), '3');
  assert.match(appSource, /getPortraitModalLayout\(portraitDimensions, isArtworkOnly \? 'artwork' : 'detail', character\.game\)/);
  assert.match(appSource, /portrait-artwork-only/);
  assert.match(appSource, /setIsArtworkOnly/);
});