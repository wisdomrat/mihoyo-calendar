// ============================================================
// 归属解析统一入口 + 配色报告生成
// ============================================================

import type { Character } from '../types/index.ts';
import type { Affiliation } from './affiliations-genshin.ts';
import {
  GENSHIN_AFFILIATIONS,
  resolveGenshinAffiliation,
} from './affiliations-genshin.ts';
import {
  ZZZ_AFFILIATIONS,
  resolveZzzAffiliation,
} from './affiliations-zzz.ts';

/**
 * 星铁 / 崩坏3 的阵营尚未细分，先给每个游戏一个通用兜底。
 * 必须存在：否则 resolveAffiliation 的两级兜底会一路落到 genshin-other，
 * 让星铁角色顶着「提瓦特大陆」显示（原神的世界名），属于硬伤。
 */
const PLACEHOLDER_AFFILIATIONS: readonly Affiliation[] = [
  {
    id: 'hsr-other',
    game: 'hsr',
    name: '星穹铁道',
    nameEn: 'Star Rail',
    tagline: '开拓群星之海',
    ink: 1,
    colors: {
      key:    '#4a5fd9',  // 星海蓝
      accent: '#8ab4f8',  // 列车冷光
      deep:   '#0c1020',  // 宇宙深空
    },
    bg: null,
    source: '星穹铁道官网主视觉；待细分星球/阵营后替换',
  },
  {
    id: 'honkai3-other',
    game: 'honkai3',
    name: '崩坏世界',
    nameEn: 'Honkai Impact 3rd',
    tagline: '女武神的战场',
    ink: 1,
    colors: {
      key:    '#e87bb0',  // 女武神粉
      accent: '#f4b8d4',  // 圣痕微光
      deep:   '#1f0f1a',  // 崩坏暗面
    },
    bg: null,
    source: '崩坏3 官网主视觉；待细分阵营（天命/逆熵…）后替换',
  },
];

/** 全部归属（原神 + 绝区零 + 星铁占位 + 崩坏3占位） */
export const ALL_AFFILIATIONS: readonly Affiliation[] = [
  ...GENSHIN_AFFILIATIONS,
  ...ZZZ_AFFILIATIONS,
  ...PLACEHOLDER_AFFILIATIONS,
];

export const AFFILIATION_MAP = new Map(
  ALL_AFFILIATIONS.map(a => [a.id, a])
);

/** 从角色解析到归属。目前只处理原神/绝区零，星铁/崩坏3 回落到游戏通用主题。 */
export function resolveAffiliation(character: Character): Affiliation {
  const { game, region } = character;
  let id: string;

  switch (game) {
    case 'genshin':
      id = resolveGenshinAffiliation(region);
      break;
    case 'zzz':
      id = resolveZzzAffiliation(region);
      break;
    case 'hsr':
      // TODO: 星铁星球映射完成后改为 resolveHsrAffiliation(character.id)
      id = 'hsr-other';  // 占位，暂无定义
      break;
    case 'honkai3':
      // TODO: 崩坏3 阵营映射完成后改为 resolveHonkai3Affiliation(region)
      id = 'honkai3-other';  // 占位
      break;
    default:
      id = 'genshin-other';  // 极端兜底
  }

  const affiliation = AFFILIATION_MAP.get(id);
  if (!affiliation) {
    console.warn(`归属 ${id} 未定义，回落到游戏通用主题`);
    // 最终兜底：用该游戏的 -other，若无则用原神通用
    const fallback =
      AFFILIATION_MAP.get(`${game}-other`) ||
      AFFILIATION_MAP.get('genshin-other')!;
    return fallback;
  }
  return affiliation;
}

/** 获取归属 ID（简化版，供 CSS data-affiliation 使用） */
export function getAffiliationId(character: Character): string {
  return resolveAffiliation(character).id;
}

/** 按游戏分组归属，用于生成报告 */
export function groupAffiliationsByGame() {
  const groups = new Map<string, Affiliation[]>();
  for (const aff of ALL_AFFILIATIONS) {
    const arr = groups.get(aff.game) || [];
    arr.push(aff);
    groups.set(aff.game, arr);
  }
  return groups;
}
