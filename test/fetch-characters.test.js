import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyImageRole,
  buildImageCandidates,
  extractImageCandidatesFromWikitext,
  mergeData,
  normalizeNanokaCharacter,
  parseBwikiWikitext,
  selectBwikiRoleImages,
} from '../scripts/fetch-characters.js';

test('parseBwikiWikitext extracts birthday and profile fields from Chinese infobox text', () => {
  const info = parseBwikiWikitext(`{{\u89d2\u8272\u4fe1\u606f
|\u751f\u65e5 = 2\u670829\u65e5
|\u82f1\u6587\u540d = Bennett
|\u5143\u7d20\u5c5e\u6027 = \u706b
|\u6b66\u5668\u7c7b\u578b = \u5355\u624b\u5251
|\u7a00\u6709\u5ea6 = 4\u661f
|\u5730\u533a = \u8499\u5fb7
}}`);

  assert.deepEqual(info, {
    birthday: '02-29',
    nameEn: 'Bennett',
    element: '\u706b',
    weapon: '\u5355\u624b\u5251',
    rarity: 4,
    region: '\u8499\u5fb7',
  });
});

test('extractImageCandidatesFromWikitext finds explicit avatar and file references', () => {
  const candidates = extractImageCandidatesFromWikitext(`{{\u89d2\u8272\u4fe1\u606f
|\u5934\u50cf = \u5b89\u67cf\u5934\u50cf.png
|\u7acb\u7ed8 = \u5b89\u67cf\u7acb\u7ed8.png
}}
[[\u6587\u4ef6:\u5b89\u67cf\u8bc1\u4ef6\u7167.png|thumb]]`);

  assert.deepEqual(candidates, [
    '\u5b89\u67cf\u5934\u50cf.png',
    '\u5b89\u67cf\u7acb\u7ed8.png',
    '\u5b89\u67cf\u8bc1\u4ef6\u7167.png',
  ]);
});

test('buildImageCandidates prefers page-provided images before generic filename guesses', () => {
  const candidates = buildImageCandidates('\u5b89\u67cf', [
    '\u5b89\u67cf\u5934\u50cf.png',
    '\u5b89\u67cf\u7acb\u7ed8.png',
  ]);

  assert.deepEqual(candidates.slice(0, 5), [
    '\u5b89\u67cf\u5934\u50cf.png',
    '\u5b89\u67cf\u7acb\u7ed8.png',
    '\u5b89\u67cf.png',
    '\u5b89\u67cf\u8bc1\u4ef6\u7167.png',
    '\u5b89\u67cf\u5168\u8eab.png',
  ]);
});

test('mergeData upgrades placeholder avatars without dropping existing characters', () => {
  const existing = [
    {
      id: 'amber-genshin',
      name: '\u5b89\u67cf',
      game: 'genshin',
      birthday: '08-10',
      avatar: 'https://ui-avatars.com/api/?name=A',
      source: 'manual',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];
  const fetched = [
    {
      id: 'amber-genshin',
      name: '\u5b89\u67cf',
      game: 'genshin',
      birthday: '08-10',
      avatar: 'https://wiki.biligame.com/ys/Special:FilePath/%E5%AE%89%E6%9F%8F%E5%A4%B4%E5%83%8F.png',
      nameEn: 'Amber',
      element: '\u706b',
      weapon: '\u5f13',
      region: '\u8499\u5fb7',
      source: 'wiki',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const merged = mergeData(existing, fetched);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].avatar, fetched[0].avatar);
  assert.equal(merged[0].source, 'manual');
  assert.equal(merged[0].nameEn, 'Amber');
});

test('mergeData does not add new fetched characters without birthdays', () => {
  const merged = mergeData([], [
    {
      id: 'nanoka-hsr-9999',
      name: 'New Character',
      nameEn: 'New Character',
      game: 'hsr',
      avatar: 'https://static.nanoka.cc/assets/hsr/avatarshopicon/9999.webp',
      source: 'nanoka',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]);

  assert.equal(merged.length, 0);
});

test('classifyImageRole distinguishes square avatars from vertical portraits', () => {
  assert.equal(classifyImageRole({ width: 100, height: 100, url: 'https://example.com/avatar.webp' }), 'avatar');
  assert.equal(classifyImageRole({ width: 800, height: 1400, url: 'https://example.com/portrait.webp' }), 'portrait');
});

test('classifyImageRole uses path rules when dimensions are unavailable', () => {
  assert.equal(classifyImageRole({ url: 'https://static.nanoka.cc/assets/zzz/IconRoleCircle01.webp' }), 'avatar');
  assert.equal(classifyImageRole({ url: 'https://zzz.honeyhunterworld.com/img/character/1011-char_icon_100.webp' }), 'avatar');
  assert.equal(classifyImageRole({ url: 'https://static.nanoka.cc/assets/zzz/IconRole01.webp' }), 'portrait');
});

test('normalizeNanokaCharacter stores ZZZ circle art as avatar and role art as portrait', () => {
  const character = normalizeNanokaCharacter('zzz', '1011', {
    icon: 'IconRole01',
    rank: 3,
    type: 2,
    element: 203,
    en: 'Anby',
    zh: '\u5b89\u6bd4',
  });

  assert.equal(character.avatar, 'https://static.nanoka.cc/assets/zzz/IconRoleCircle01.webp');
  assert.equal(character.portrait, 'https://static.nanoka.cc/assets/zzz/IconRole01.webp');
});

test('normalizeNanokaCharacter stores Genshin gacha art as portrait', () => {
  const amber = normalizeNanokaCharacter('genshin', '10000021', {
    icon: 'UI_AvatarIcon_Ambor',
    birth: [8, 10],
    rank: 'QUALITY_PURPLE',
    weapon: 'WEAPON_BOW',
    element: 'Fire',
    en: 'Amber',
    zh: '\u5b89\u67cf',
  });
  const skirk = normalizeNanokaCharacter('genshin', '10000114', {
    icon: 'UI_AvatarIcon_SkirkNew',
    birth: [11, 5],
    rank: 'QUALITY_ORANGE',
    weapon: 'WEAPON_SWORD_ONE_HAND',
    element: 'Cryo',
    en: 'Skirk',
    zh: '\u4e1d\u67ef\u514b',
  });

  assert.equal(amber.avatar, 'https://static.nanoka.cc/assets/gi/UI_AvatarIcon_Ambor.webp');
  assert.equal(amber.portrait, 'https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_Ambor.webp');
  assert.equal(skirk.avatar, 'https://static.nanoka.cc/assets/gi/UI_AvatarIcon_SkirkNew.webp');
  assert.equal(skirk.portrait, 'https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_SkirkNew.webp');
});

test('normalizeNanokaCharacter stores Star Rail drawcard art as portrait', () => {
  const character = normalizeNanokaCharacter('hsr', '1001', {
    rank: 'CombatPowerAvatarRarityType4',
    damageType: 'Ice',
    baseType: 'Knight',
    en: 'March 7th',
    zh: '\u4e09\u6708\u4e03',
  });

  assert.equal(character.avatar, 'https://static.nanoka.cc/assets/hsr/avatarshopicon/1001.webp');
  assert.equal(character.portrait, 'https://static.nanoka.cc/assets/hsr/avatardrawcard/1001.webp');
});
test('mergeData preserves and upgrades portrait artwork', () => {
  const merged = mergeData([
    {
      id: 'anby-zzz',
      name: '\u5b89\u6bd4',
      nameEn: 'Anby',
      game: 'zzz',
      birthday: '02-20',
      avatar: 'https://ui-avatars.com/api/?name=A',
      source: 'manual',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ], [
    {
      id: 'nanoka-zzz-1011',
      name: '\u5b89\u6bd4',
      nameEn: 'Anby',
      game: 'zzz',
      birthday: '',
      avatar: 'https://static.nanoka.cc/assets/zzz/IconRoleCircle01.webp',
      portrait: 'https://static.nanoka.cc/assets/zzz/IconRole01.webp',
      source: 'nanoka',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  ]);

  assert.equal(merged[0].avatar, 'https://static.nanoka.cc/assets/zzz/IconRoleCircle01.webp');
  assert.equal(merged[0].portrait, 'https://static.nanoka.cc/assets/zzz/IconRole01.webp');
});

test('mergeData merges Star Rail Topaz aliases into the canonical manual record', () => {
  const merged = mergeData([
    {
      id: 'topaz-hsr',
      name: '\u6258\u5e15',
      nameEn: 'Topaz',
      game: 'hsr',
      birthday: '08-29',
      avatar: 'https://ui-avatars.com/api/?name=T',
      source: 'manual',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'nanoka-hsr-1112',
      name: '\u6258\u5e15&\u8d26\u8d26',
      nameEn: 'Topaz & Numby',
      game: 'hsr',
      birthday: '',
      avatar: 'https://static.nanoka.cc/assets/hsr/avatarshopicon/1112.webp',
      portrait: 'https://static.nanoka.cc/assets/hsr/avatardrawcard/1112.webp',
      source: 'nanoka',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  ], []);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].name, '\u6258\u5e15');
  assert.equal(merged[0].birthday, '08-29');
  assert.equal(merged[0].avatar, 'https://static.nanoka.cc/assets/hsr/avatarshopicon/1112.webp');
  assert.equal(merged[0].portrait, 'https://static.nanoka.cc/assets/hsr/avatardrawcard/1112.webp');
});
test('mergeData merges ZZZ short-name aliases into canonical manual records', () => {
  const merged = mergeData([
    {
      id: 'miyabi-zzz',
      name: '\u661f\u89c1\u96c5',
      nameEn: 'Miyabi',
      game: 'zzz',
      birthday: '04-03',
      avatar: 'https://ui-avatars.com/api/?name=M',
      source: 'manual',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '\u96c5-zzz',
      name: '\u96c5',
      nameEn: 'Hoshimi Miyabi',
      game: 'zzz',
      birthday: '06-19',
      avatar: 'https://static.nanoka.cc/assets/zzz/IconRoleCircle13.webp',
      portrait: 'https://static.nanoka.cc/assets/zzz/IconRole13.webp',
      source: 'nanoka',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  ], []);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].name, '\u661f\u89c1\u96c5');
  assert.equal(merged[0].birthday, '06-19');
  assert.equal(merged[0].avatar, 'https://static.nanoka.cc/assets/zzz/IconRoleCircle13.webp');
  assert.equal(merged[0].portrait, 'https://static.nanoka.cc/assets/zzz/IconRole13.webp');
});

test('mergeData removes known invalid manual-only ZZZ records', () => {
  const merged = mergeData([
    {
      id: 'taiyin-zzz',
      name: '\u4e91\u5cbf\u5c71\u00b7\u6cf0\u97f3',
      nameEn: 'Taiyin',
      game: 'zzz',
      birthday: '10-10',
      avatar: 'https://ui-avatars.com/api/?name=T',
      source: 'manual',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ], []);

  assert.equal(merged.length, 0);
});
test('selectBwikiRoleImages chooses Honkai3 avatar and portrait without using stigma images', () => {
  const images = [
    { name: '\u85aa\u708e\u4e4b\u5f8b\u8005\u5934\u50cf.png', url: 'https://example.com/avatar.png', width: 140, height: 120 },
    { name: '\u85aa\u708e\u4e4b\u5f8b\u8005\u7acb\u7ed8.png', url: 'https://example.com/portrait.png', width: 1198, height: 1151 },
    { name: '\u85aa\u708e\u4e4b\u5f8b\u8005\uff08\u4e0a\uff09.png', url: 'https://example.com/stigma.png', width: 720, height: 720 },
  ];

  assert.deepEqual(selectBwikiRoleImages('\u85aa\u708e\u4e4b\u5f8b\u8005', images), {
    avatar: 'https://example.com/avatar.png',
    portrait: 'https://example.com/portrait.png',
  });
});

test('selectBwikiRoleImages uses exact Honkai3 role image as portrait fallback', () => {
  const images = [
    { name: '\u7a7a\u4e4b\u5f8b\u8005.png', url: 'https://example.com/role.png', width: 700, height: 660 },
    { name: '\u7a7a\u4e4b\u5f8b\u8005\u5934\u50cf.png', url: 'https://example.com/avatar.png', width: 140, height: 120 },
  ];

  assert.deepEqual(selectBwikiRoleImages('\u7a7a\u4e4b\u5f8b\u8005', images), {
    avatar: 'https://example.com/avatar.png',
    portrait: 'https://example.com/role.png',
  });
});

test('selectBwikiRoleImages ignores Honkai3 stigma-only image sets', () => {
  const images = [
    { name: '\u742a\u4e9a\u5a1c\u00b7\u5361\u65af\u5170\u5a1c\uff08\u4e0a\uff09\uff08\u4e0a\uff09.png', url: 'https://example.com/top.png', width: 720, height: 720 },
    { name: '\u742a\u4e9a\u5a1c\u00b7\u5361\u65af\u5170\u5a1c\uff08\u4e2d\uff09\uff08\u4e2d\uff09.png', url: 'https://example.com/mid.png', width: 720, height: 720 },
    { name: '\u742a\u4e9a\u5a1c\u00b7\u5361\u65af\u5170\u5a1c\uff08\u4e0b\uff09\uff08\u4e0b\uff09.png', url: 'https://example.com/bottom.png', width: 720, height: 720 },
  ];

  assert.deepEqual(selectBwikiRoleImages('\u742a\u4e9a\u5a1c\u00b7\u5361\u65af\u5170\u5a1c', images), {
    avatar: '',
    portrait: '',
  });
});
