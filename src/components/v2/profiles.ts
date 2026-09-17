import type { CSSProperties } from 'react';
import type { Character } from '../../types';
import { ALL_AFFILIATIONS, resolveAffiliation, type Affiliation } from '../../data/affiliations';
import type { ThemeId } from '../../hooks/useTheme';

// Keep the approved neutral and Sumeru palettes as references.
const baseProfiles = {
  neutral: ['#080b17', '#17182d', '#27213b', '125,117,208', '17,20,38', '158,160,194', '9,12,24', '#c3b7da'],
  sumeru: ['#07171a', '#102529', '#27213b', '81,232,202', '14,32,35', '131,243,215', '7,18,20', '#a2e7d0'],
  fontaine: ['#0c1420', '#172631', '#312538', '115,168,218', '17,28,41', '151,187,215', '9,17,30', '#b5d7e9'],
  genshin: ['#10141e', '#182229', '#2c2737', '121,171,180', '19,27,35', '161,196,199', '12,18,26', '#b0d7cc'],
  hsr: ['#101220', '#242132', '#2f2438', '154,131,203', '25,24,39', '182,162,216', '17,15,27', '#d0b7de'],
  zzz: ['#11191c', '#24272b', '#302437', '163,122,144', '27,29,34', '188,163,170', '18,20,26', '#e7c1bc'],
  honkai3: ['#19131c', '#29202b', '#292b38', '196,126,163', '32,23,33', '211,164,192', '23,14,24', '#ecc0d6'],
};

type Rgb = [number, number, number];

function rgb(hex: string): Rgb {
  return [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16)) as Rgb;
}

function mix(color: Rgb, target: Rgb, amount: number): Rgb {
  return color.map((value, index) => Math.round(value + (target[index] - value) * amount)) as Rgb;
}

function cssColor(color: Rgb) {
  return `rgb(${color.join(',')})`;
}

function affiliationProfile(affiliation: Affiliation) {
  const key = rgb(affiliation.colors.key);
  const accent = rgb(affiliation.colors.accent);
  // Lift dark faction colors before using them as light sources. A dark blue
  // or red needs a pale component to read as light, just as Sumeru's mint does.
  const light = mix(key, [240, 246, 255], 0.32);
  const ambient = mix([17, 23, 36], rgb(affiliation.colors.deep), 0.3);

  return [
    cssColor(mix(ambient, key, 0.06)),
    cssColor(mix(ambient, key, 0.16)),
    cssColor(mix(ambient, accent, 0.12)),
    light.join(','),
    mix(ambient, key, 0.06).join(','),
    mix([232, 238, 246], light, 0.18).join(','),
    ambient.join(','),
    cssColor(mix(accent, [240, 246, 255], 0.62)),
  ];
}

// Every existing region/faction gets its own lighting; unknown affiliations
// still use the catalog's game fallback instead of borrowing another game.
const profiles: Record<string, readonly string[]> = {
  ...baseProfiles,
  ...Object.fromEntries(ALL_AFFILIATIONS.map(affiliation => [affiliation.id, affiliationProfile(affiliation)])),
  'genshin-sumeru': baseProfiles.sumeru,
};
profiles.fontaine = profiles['genshin-fontaine'];

export function workspaceProfile(character: Character | undefined, theme: ThemeId, forced?: string | null) {
  const affiliation = character ? resolveAffiliation(character) : null;
  let key = affiliation?.game === theme ? affiliation.id : theme;
  if (forced && Object.hasOwn(profiles, forced)) key = forced;
  if (!Object.hasOwn(profiles, key)) key = 'neutral';
  const values = profiles[key];
  const names = ['start', 'mid', 'end', 'halo', 'surface', 'edge', 'deep', 'accent'];
  const isSumeru = key === 'sumeru' || key === 'genshin-sumeru';
  const isNeutral = key === 'neutral';
  const fill = affiliation && key === affiliation.id
    ? mix(rgb(affiliation.colors.accent), [240, 246, 255], 0.32).join(',')
    : values[5];

  return {
    key,
    affiliation,
    style: {
      ...Object.fromEntries(names.map((name, i) => [`--v2-${name}`, values[i]])),
      '--v2-fill': fill,
      '--v2-stage-glow': isSumeru ? 0 : isNeutral ? 0.14 : 0.28,
      '--v2-stage-fill': isSumeru ? 0 : isNeutral ? 0.06 : 0.12,
      '--v2-scene-fill': isSumeru || isNeutral ? 0 : 0.08,
    } as CSSProperties,
  };
}
