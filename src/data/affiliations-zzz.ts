// ============================================================
// 绝区零阵营归属定义
//
// 配色来源：各阵营角色立绘主色调 + 官网/PV 视觉印象。
// 绝区零的美术风格是「硬朗街头 + 信号色 + 高饱和」，
// 每个阵营都有明确的组织配色（狡兔屋荧光绿、维多利亚紫金、白祇工业黄…）。
//
// 17 个阵营各自配色，不合并。原因：
// 1. 用户明确选择「17 阵营各自配色」
// 2. 绝区零本身就是「阵营辨识度」驱动的设计（每个势力有独特 logo/配色）
// 3. 数据里 56/56 全覆盖，无需兜底
// ============================================================

import type { Affiliation } from './affiliations-genshin';

// prettier-ignore
export const ZZZ_AFFILIATIONS: readonly Affiliation[] = [
  {
    id: 'zzz-cunning-hares',
    game: 'zzz',
    name: '狡兔屋',
    nameEn: 'Cunning Hares',
    tagline: '街头佣兵事务所',
    ink: 1,  // 深底（夜店 + 霓虹）
    colors: {
      key:    '#8dff3d',  // 荧光兔绿（logo 主色）
      accent: '#ffeb3b',  // 信号黄
      deep:   '#0d1a0f',  // 深夜街头
    },
    bg: null,
    source: '狡兔屋 logo 荧光绿 + 妮可/安比立绘主色',
  },
  {
    id: 'zzz-victoria-housekeeping',
    game: 'zzz',
    name: '维多利亚家政',
    nameEn: 'Victoria Housekeeping Co.',
    tagline: '奢华管家服务',
    ink: 1,
    colors: {
      key:    '#b794f6',  // 贵族紫
      accent: '#f4d03f',  // 华丽金
      deep:   '#1a0f28',
    },
    bg: null,
    source: '艾莲/莱卡恩立绘紫金配色 + 管家制服',
  },
  {
    id: 'zzz-belobog',
    game: 'zzz',
    name: '白祇重工',
    nameEn: 'Belobog Heavy Industries',
    tagline: '机械与建造',
    ink: 1,
    colors: {
      key:    '#ffa726',  // 工业橙
      accent: '#ffeb3b',  // 安全黄
      deep:   '#1c1410',
    },
    bg: null,
    source: '格莉丝/安东立绘工装色 + 工地安全色',
  },
  {
    id: 'zzz-sons-of-calydon',
    game: 'zzz',
    name: '卡吕冬之子',
    nameEn: 'Sons of Calydon',
    tagline: '荒野飞车帮',
    ink: 1,
    colors: {
      key:    '#ff5722',  // 烈焰红
      accent: '#ff9800',  // 引擎橙
      deep:   '#1a0d0a',
    },
    bg: null,
    source: '凯撒/柏妮思立绘红橙配色 + 外域荒漠主色',
  },
  {
    id: 'zzz-section-6',
    game: 'zzz',
    name: '对空六课',
    nameEn: 'Section 6',
    tagline: '空洞调查科',
    ink: 1,
    colors: {
      key:    '#42a5f5',  // 制服蓝
      accent: '#80deea',  // 空洞青
      deep:   '#0d1821',
    },
    bg: null,
    source: '苍角/柳制服蓝 + 空洞科技感',
  },
  {
    id: 'zzz-criminal-investigation',
    game: 'zzz',
    name: '治安局·刑侦特勤组',
    nameEn: 'Criminal Investigation Special Response Team',
    tagline: '精英刑警',
    ink: 1,
    colors: {
      key:    '#26a69a',  // 警徽青
      accent: '#ffd54f',  // 警示金
      deep:   '#0f1a18',
    },
    bg: null,
    source: '青衣/朱鸢制服色 + 治安局徽记',
  },
  {
    id: 'zzz-obol-squad',
    game: 'zzz',
    name: '防卫军·奥波勒斯小队',
    nameEn: 'Defense Force Obol Squad',
    tagline: '空洞前线',
    ink: 1,
    colors: {
      key:    '#7e57c2',  // 军装紫
      accent: '#ab47bc',  // 能量品红
      deep:   '#14101c',
    },
    bg: null,
    source: '11号/奥菲丝军装紫 + 空洞能量色',
  },
  {
    id: 'zzz-mountain-cloud',
    game: 'zzz',
    name: '云岿山',
    nameEn: 'Yun Kuishan',
    tagline: '古典武道',
    ink: 3,  // 浅底（山水墨意）
    colors: {
      key:    '#66bb6a',  // 松石青
      accent: '#d4a574',  // 竹简金
      deep:   '#2c3e2f',
    },
    bg: null,
    source: '叶瞬光/橘福福中式服饰 + 山水意境',
  },
  {
    id: 'zzz-hollow-special-operations',
    game: 'zzz',
    name: '怪啖屋',
    nameEn: 'Hollow Special Operations Section 6',
    tagline: '拉面 × 情报',
    ink: 1,
    colors: {
      key:    '#ff7043',  // 拉面红
      accent: '#ffb74d',  // 灯笼橙
      deep:   '#1a0f0a',
    },
    bg: null,
    source: '爱丽丝/真斗立绘暖色调 + 拉面店霓虹',
  },
  {
    id: 'zzz-obsidian',
    game: 'zzz',
    name: '坎卜斯黑枝',
    nameEn: 'Obsidian Division',
    tagline: '地下拳馆',
    ink: 1,
    colors: {
      key:    '#ef5350',  // 拳套红
      accent: '#ffa726',  // 擂台光
      deep:   '#1c0d0d',
    },
    bg: null,
    source: '琉音/般岳拳击主题配色',
  },
  {
    id: 'zzz-wildfire',
    game: 'zzz',
    name: '妄想天使',
    nameEn: 'Wildfire',
    tagline: '朋克乐队',
    ink: 1,
    colors: {
      key:    '#ec407a',  // 摇滚粉
      accent: '#ab47bc',  // 舞台紫
      deep:   '#1a0d14',
    },
    bg: null,
    source: '爱芮/千夏朋克立绘 + 舞台灯光',
  },
  {
    id: 'zzz-rosskelieff',
    game: 'zzz',
    name: '罗斯凯利法·外务筹策局',
    nameEn: 'Rosskelieff Foreign Affairs Bureau',
    tagline: '影子外交',
    ink: 1,
    colors: {
      key:    '#5c6bc0',  // 外交蓝
      accent: '#9575cd',  // 权谋紫
      deep:   '#0f1018',
    },
    bg: null,
    source: '诺姆/维琳娜正装配色',
  },
  {
    id: 'zzz-lyra',
    game: 'zzz',
    name: '天琴座',
    nameEn: 'Lyra',
    tagline: '星际与未知',
    ink: 1,
    colors: {
      key:    '#42a5f5',  // 星空蓝
      accent: '#ab47bc',  // 星云紫
      deep:   '#0a0e14',
    },
    bg: null,
    source: '耀嘉音/伊芙琳科幻主题',
  },
  {
    id: 'zzz-mockingbird',
    game: 'zzz',
    name: '反舌鸟',
    nameEn: 'Mockingbird',
    tagline: '地下情报',
    ink: 1,
    colors: {
      key:    '#78909c',  // 暗哨灰
      accent: '#ffb74d',  // 信号橙
      deep:   '#0d1012',
    },
    bg: null,
    source: '薇薇安/雨果情报员暗色调',
  },
  {
    id: 'zzz-academia',
    game: 'zzz',
    name: '达识结社',
    nameEn: 'Academia',
    tagline: '学者与真理',
    ink: 3,
    colors: {
      key:    '#5e81ac',  // 学院蓝
      accent: '#d4a574',  // 羊皮纸金
      deep:   '#2e3440',
    },
    bg: null,
    source: '蕾米埃尔学者装',
  },
  {
    id: 'zzz-pubsec-public-order',
    game: 'zzz',
    name: '治安局·都市秩序部',
    nameEn: 'Public Security Public Order Division',
    tagline: '街头巡警',
    ink: 1,
    colors: {
      key:    '#42a5f5',  // 警灯蓝
      accent: '#ffeb3b',  // 警戒黄
      deep:   '#0d1418',
    },
    bg: null,
    source: '希希芙巡警制服',
  },
  // 数据里唯一的 (none) 角色（希格莉德），归入绝区零通用
  {
    id: 'zzz-other',
    game: 'zzz',
    name: '新艾利都',
    nameEn: 'New Eridu',
    tagline: '最后的绿洲',
    ink: 1,
    colors: {
      key:    '#ff6b35',  // 信号橙（游戏主色）
      accent: '#f4e04d',  // 荧光黄
      deep:   '#0e0e11',  // 近黑街头
    },
    bg: null,
    source: '绝区零官网主视觉 + 城市霓虹配色（复用旧版 zzz 主题作兜底）',
  },
];

export const ZZZ_AFFILIATION_MAP = new Map(
  ZZZ_AFFILIATIONS.map(a => [a.id, a])
);

/** 从角色的 region 字段解析到阵营 ID。绝区零数据质量高，56/56 全覆盖。 */
export function resolveZzzAffiliation(region: string | undefined): string {
  if (!region) return 'zzz-other';
  const r = region.trim();
  const map: Record<string, string> = {
    '狡兔屋': 'zzz-cunning-hares',
    '维多利亚家政': 'zzz-victoria-housekeeping',
    '白祇重工': 'zzz-belobog',
    '卡吕冬之子': 'zzz-sons-of-calydon',
    '对空六课': 'zzz-section-6',
    '治安局·刑侦特勤组': 'zzz-criminal-investigation',
    '防卫军·奥波勒斯小队': 'zzz-obol-squad',
    '云岿山': 'zzz-mountain-cloud',
    '怪啖屋': 'zzz-hollow-special-operations',
    '坎卜斯黑枝': 'zzz-obsidian',
    '妄想天使': 'zzz-wildfire',
    '罗斯凯利法·外务筹策局': 'zzz-rosskelieff',
    '天琴座': 'zzz-lyra',
    '反舌鸟': 'zzz-mockingbird',
    '达识结社': 'zzz-academia',
    '治安局·都市秩序部': 'zzz-pubsec-public-order',
  };
  return map[r] || 'zzz-other';
}
