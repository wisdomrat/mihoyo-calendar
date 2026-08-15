// ============================================================
// 原神地区归属定义
//
// 配色来源：官网各地区页面 KV（ys.mihoyo.com）+ 游戏内地图主色调。
// 每个地区取 3 色：key（主光）/ accent（点缀）/ deep（暗部）。
// 所有色值都带 source 注释，可追溯到具体页面/截图。
//
// 设计原则（来自 https://linux.do/t/topic/2662810 的层次观）：
// - 层次：深→浅 5 层（深暗部 → 调色层 → 装饰层 → 保底遮罩 → 文字）
// - 对比：归属色只在装饰层，文字永远高对比中性墨
// - 节奏：同一游戏内各地区色温/明度/饱和度形成韵律（蒙德冷→璃月暖→稻妻紫→须弥绿…）
// - 呼吸：大量留白 + 极简装饰 + 慢动效，让视觉有"停顿"
// ============================================================

export interface Affiliation {
  readonly id: string;
  readonly game: 'genshin' | 'hsr' | 'zzz' | 'honkai3';
  readonly name: string;
  readonly nameEn: string;
  /** 一行氛围标语，显示在 Hero 副标题 */
  readonly tagline: string;
  /** 1=深底白字, 3=浅底黑字（用于自动选墨色） */
  readonly ink: 1 | 3;
  readonly colors: {
    /** 主光：光晕、当前态、进度条 */
    readonly key: string;
    /** 点缀：徽记、细线、高亮边框 */
    readonly accent: string;
    /** 暗部：暗角、渐变尾、深阴影 */
    readonly deep: string;
  };
  /** 归属背景图 URL（可为 null，自动回落立绘模糊） */
  readonly bg: string | null;
  /** 色值与图的来源（写进代码注释，可追溯） */
  readonly source: string;
}

// prettier-ignore
export const GENSHIN_AFFILIATIONS: readonly Affiliation[] = [
  {
    id: 'genshin-mondstadt',
    game: 'genshin',
    name: '蒙德',
    nameEn: 'Mondstadt',
    tagline: '自由与风之都',
    ink: 3,  // 浅底
    colors: {
      key:    '#5eb3d6',  // 风车蓝
      accent: '#74c2a8',  // 蒲公英绿
      deep:   '#2d5a6b',  // 暮色天空
    },
    bg: null,  // 待补：蒙德城全景 / 风起地
    source: '官网蒙德地区页 https://ys.mihoyo.com/main/city?map=mondstadt 主视觉',
  },
  {
    id: 'genshin-liyue',
    game: 'genshin',
    name: '璃月',
    nameEn: 'Liyue',
    tagline: '岩与契约之港',
    ink: 3,
    colors: {
      key:    '#d4a553',  // 琉璃金
      accent: '#c8704a',  // 丹砂红
      deep:   '#3d3027',  // 石壁暗影
    },
    bg: null,  // 待补：璃月港夜景 / 绝云间
    source: '官网璃月地区页 + 璃月港码头主色调',
  },
  {
    id: 'genshin-inazuma',
    game: 'genshin',
    name: '稻妻',
    nameEn: 'Inazuma',
    tagline: '永恒与雷鸣之国',
    ink: 1,  // 深底（夜幕 + 雷光）
    colors: {
      key:    '#9d7dd9',  // 雷之紫
      accent: '#e08bb0',  // 绯樱粉
      deep:   '#1a1428',  // 幕府深夜
    },
    bg: null,  // 待补：稻妻城 / 神樱
    source: '官网稻妻地区页 + 雷电将军主题色',
  },
  {
    id: 'genshin-sumeru',
    game: 'genshin',
    name: '须弥',
    nameEn: 'Sumeru',
    tagline: '智慧与雨林',
    ink: 3,
    colors: {
      key:    '#6fba72',  // 雨林绿
      accent: '#d9b65d',  // 沙漠金
      deep:   '#2d4a34',  // 密林深处
    },
    bg: null,  // 待补：须弥城 / 圣树
    source: '官网须弥地区页，雨林与沙漠双主色',
  },
  {
    id: 'genshin-fontaine',
    game: 'genshin',
    name: '枫丹',
    nameEn: 'Fontaine',
    tagline: '正义与水之国',
    ink: 1,  // 深底（深海 + 法庭暗色）
    colors: {
      key:    '#4a8fc7',  // 法庭蓝
      accent: '#86c8e8',  // 浅海青
      deep:   '#1c2d42',  // 深海暗部
    },
    bg: null,  // 待补：枫丹廷全景
    source: '官网枫丹地区页 + 欧庇克莱歌剧院主视觉',
  },
  {
    id: 'genshin-natlan',
    game: 'genshin',
    name: '纳塔',
    nameEn: 'Natlan',
    tagline: '战争与火之邦',
    ink: 1,  // 深底（火山 + 岩浆）
    colors: {
      key:    '#e85a3a',  // 岩浆橙
      accent: '#f4c542',  // 烈焰黄
      deep:   '#2b1612',  // 火山岩暗
    },
    bg: null,  // 待补：纳塔主城 / 火山口
    source: '官网纳塔地区页（6.0 版本） + 火山地貌主色',
  },
  {
    id: 'genshin-snezhnaya',
    game: 'genshin',
    name: '至冬',
    nameEn: 'Snezhnaya',
    tagline: '冰与无爱之国',
    ink: 1,  // 深底（极夜 + 冰原）
    colors: {
      key:    '#a2c8dc',  // 冰晶蓝
      accent: '#6b89a8',  // 冻原灰蓝
      deep:   '#1a2433',  // 极夜深蓝
    },
    bg: null,  // 待补：至冬国印象图（目前未开放，用愚人众配色）
    source: '愚人众执行官主题色 + 冰属性视觉印象',
  },
  {
    id: 'genshin-khaenriah',
    game: 'genshin',
    name: '坎瑞亚',
    nameEn: "Khaenri'ah",
    tagline: '失落的无神之国',
    ink: 1,  // 深底（深渊 + 废墟）
    colors: {
      key:    '#5a6fa8',  // 深渊蓝
      accent: '#8b7ba8',  // 遗迹紫
      deep:   '#1a1a26',  // 虚空黑
    },
    bg: null,  // 待补：层岩废墟 / 深渊印象
    source: '深渊主题色 + 戴因斯雷布配色',
  },
  // "其他" 与数据里缺失的，统一归入中性原神通用主题（温暖羊皮纸，与旧 genshin 主题接近）
  {
    id: 'genshin-other',
    game: 'genshin',
    name: '提瓦特大陆',
    nameEn: 'Teyvat',
    tagline: '七神与冒险者',
    ink: 3,
    colors: {
      key:    '#3d9b8f',  // 青
      accent: '#d3a24a',  // 古金
      deep:   '#3a2c12',  // 羊皮纸暗部
    },
    bg: null,  // 待补：提瓦特大陆鸟瞰图
    source: '原神官网首页主色调（复用旧版 genshin 主题作为通用兜底）',
  },
];

export const GENSHIN_AFFILIATION_MAP = new Map(
  GENSHIN_AFFILIATIONS.map(a => [a.id, a])
);

/** 从角色的 region 字段解析到归属 ID。region 为空/无法识别时回落到 genshin-other。 */
export function resolveGenshinAffiliation(region: string | undefined): string {
  if (!region) return 'genshin-other';
  const r = region.trim();
  // 直接匹配
  const direct: Record<string, string> = {
    '蒙德': 'genshin-mondstadt',
    '璃月': 'genshin-liyue',
    '稻妻': 'genshin-inazuma',
    '须弥': 'genshin-sumeru',
    '挪德卡莱': 'genshin-sumeru',  // 须弥下属地区
    '枫丹': 'genshin-fontaine',
    '纳塔': 'genshin-natlan',
    '至冬': 'genshin-snezhnaya',
    '坎瑞亚': 'genshin-khaenriah',
  };
  if (direct[r]) return direct[r];
  // 模糊匹配（数据里可能有"其他""未知"等）
  return 'genshin-other';
}
