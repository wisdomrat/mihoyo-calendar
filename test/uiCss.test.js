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

function mobileBlockFor(selector) {
  const mobileCss = css.slice(css.indexOf('@media (max-width: 768px)'));
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*');
  return mobileCss.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`))?.[1] || '';
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
test('mobile month grid columns cannot be widened by card or avatar content', () => {
  assert.equal(declarationValue(blockFor('.weekday-header'), 'grid-template-columns'), 'repeat(7, minmax(0, 1fr))');
  assert.equal(declarationValue(blockFor('.days-grid'), 'grid-template-columns'), 'repeat(7, minmax(0, 1fr))');
  assert.equal(declarationValue(blockFor('.day-cell'), 'min-width'), '0');
  assert.equal(declarationValue(blockFor('.day-characters'), 'min-width'), '0');
  assert.equal(declarationValue(blockFor('.day-character-card'), 'min-width'), '0');
  assert.equal(declarationValue(blockFor('.card-name'), 'min-width'), '0');
});
test('character detail rarity uses star glyph instead of asterisk', () => {
  const appSource = fs.readFileSync('src/App.tsx', 'utf8');

  assert.equal(appSource.includes("'*'.repeat(character.rarity)"), false);
  assert.equal(appSource.includes(String.raw`const RARITY_STAR = '\u2605';`), true);
  assert.match(appSource, /RARITY_STAR\.repeat\(character\.rarity\)/);
});

test('mobile card mode places character names below avatars', () => {
  const mobileCard = mobileBlockFor('.day-character-card');
  const mobileCardName = mobileBlockFor('.card-name');

  assert.equal(declarationValue(mobileCard, 'flex-direction'), 'column');
  assert.equal(declarationValue(mobileCard, 'align-items'), 'center');
  assert.equal(declarationValue(mobileCardName, 'text-align'), 'center');
  assert.equal(declarationValue(mobileCardName, 'width'), '100%');
});
