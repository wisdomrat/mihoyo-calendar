// ============================================================
// APCA (Accessible Perceptual Contrast Algorithm) — WCAG 3 草案算法
//
// 为什么不用 WCAG 2 的对比度比：WCAG 2 的公式在深底浅字上系统性
// 高估对比度（同一组色反转前景/背景得到相同比值，但人眼感知差别很大）。
// 本项目大量使用深色影院底 + 浅色文字，必须用 APCA 才能反映真实可读性。
//
// APCA 返回 Lc（Lightness contrast），范围约 -108 ~ +106：
//   正值 = 深底浅字，负值 = 浅底深字，取绝对值判断。
//   |Lc| >= 90  ：可用于极细字体 / 大段正文的最佳区间
//   |Lc| >= 75  ：正文（本项目正文门槛）
//   |Lc| >= 60  ：辅助文字 / 大字号（本项目辅助门槛）
//   |Lc| >= 45  ::极大字号 / 非文字图形边界下限
//   |Lc| <  30  ：视为不可读
//
// 常量来自 APCA 0.1.9 (W3C silverwebaccessibilitygroup / Myndex)。
// 参考：https://github.com/Myndex/apca-w3
// ============================================================

// —— 感知亮度（Ys）指数与系数 ——
const MAIN_TRC = 2.4;
const S_RCO = 0.2126729;
const S_GCO = 0.7151522;
const S_BCO = 0.0721750;

// —— 深底浅字（normal polarity）——
const NORM_BG = 0.56;
const NORM_TXT = 0.57;
const REV_BG = 0.65;
const REV_TXT = 0.62;

// —— 低对比度区间的软裁剪与缩放 ——
const BLK_THRS = 0.022;
const BLK_CLMP = 1.414;
const SCALE_BOW = 1.14;
const LO_BOW_OFFSET = 0.027;
const SCALE_WOB = 1.14;
const LO_WOB_OFFSET = 0.027;
const DELTA_Y_MIN = 0.0005;
const LO_CLIP = 0.1;

export type Rgb = readonly [number, number, number];

/** '#rrggbb' | '#rgb' | 'rgb(r, g, b)' → [r,g,b] (0-255)。解析失败抛错，绝不静默返回黑色。 */
export function parseColor(input: string): Rgb {
  const s = input.trim();
  const hex = s.replace(/^#/, '');
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return [
      parseInt(hex[0] + hex[0], 16),
      parseInt(hex[1] + hex[1], 16),
      parseInt(hex[2] + hex[2], 16),
    ];
  }
  const m = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  throw new Error(`parseColor: 无法解析颜色 "${input}"`);
}

/** sRGB → APCA 感知亮度 Ys。注意这不是 WCAG 的相对亮度（没有线性化分段）。 */
export function apcaLuminance(rgb: Rgb): number {
  const [r, g, b] = rgb;
  return (
    S_RCO * Math.pow(r / 255, MAIN_TRC) +
    S_GCO * Math.pow(g / 255, MAIN_TRC) +
    S_BCO * Math.pow(b / 255, MAIN_TRC)
  );
}

/**
 * APCA 对比度 Lc。
 * @returns 正值 = 深底浅字；负值 = 浅底深字。取 Math.abs 判断门槛。
 */
export function apca(textColor: Rgb | string, bgColor: Rgb | string): number {
  const txt = typeof textColor === 'string' ? parseColor(textColor) : textColor;
  const bg = typeof bgColor === 'string' ? parseColor(bgColor) : bgColor;

  let yTxt = apcaLuminance(txt);
  let yBg = apcaLuminance(bg);

  // 极暗端软裁剪：避免近黑区域的数值爆炸
  yTxt = yTxt > BLK_THRS ? yTxt : yTxt + Math.pow(BLK_THRS - yTxt, BLK_CLMP);
  yBg = yBg > BLK_THRS ? yBg : yBg + Math.pow(BLK_THRS - yBg, BLK_CLMP);

  // 两色几乎相同，直接判为 0（而不是让浮点噪声决定符号）
  if (Math.abs(yBg - yTxt) < DELTA_Y_MIN) return 0;

  let outputContrast: number;
  if (yBg > yTxt) {
    // 浅底深字（black on white）
    const sapc = (Math.pow(yBg, NORM_BG) - Math.pow(yTxt, NORM_TXT)) * SCALE_BOW;
    outputContrast = sapc < LO_CLIP ? 0 : -(sapc - LO_BOW_OFFSET) * 100;
  } else {
    // 深底浅字（white on black）
    const sapc = (Math.pow(yBg, REV_BG) - Math.pow(yTxt, REV_TXT)) * SCALE_WOB;
    outputContrast = sapc > -LO_CLIP ? 0 : -(sapc + LO_WOB_OFFSET) * 100;
  }
  // 符号约定：深底浅字为正
  return -outputContrast;
}

/** 把半透明前景合成到不透明背景上，得到实际显示色。用于校验"文字底下真正是什么颜色"。 */
export function composite(fg: Rgb, alpha: number, bg: Rgb): Rgb {
  const a = Math.min(1, Math.max(0, alpha));
  return [
    Math.round(fg[0] * a + bg[0] * (1 - a)),
    Math.round(fg[1] * a + bg[1] * (1 - a)),
    Math.round(fg[2] * a + bg[2] * (1 - a)),
  ];
}

/** 依次把多层半透明色叠到底色上（数组顺序 = 从下往上）。 */
export function compositeStack(
  base: Rgb,
  layers: ReadonlyArray<{ color: Rgb | string; alpha: number }>,
): Rgb {
  return layers.reduce<Rgb>((acc, layer) => {
    const c = typeof layer.color === 'string' ? parseColor(layer.color) : layer.color;
    return composite(c, layer.alpha, acc);
  }, base);
}

export const APCA_THRESHOLD = {
  /** 正文 / 次要正文 */
  body: 75,
  /** 辅助文字、标签、大字号 */
  secondary: 60,
  /** 非文字图形边界、分隔线 */
  graphic: 45,
} as const;

export type ApcaLevel = 'best' | 'body' | 'secondary' | 'graphic' | 'fail';

export function apcaLevel(lc: number): ApcaLevel {
  const abs = Math.abs(lc);
  if (abs >= 90) return 'best';
  if (abs >= APCA_THRESHOLD.body) return 'body';
  if (abs >= APCA_THRESHOLD.secondary) return 'secondary';
  if (abs >= APCA_THRESHOLD.graphic) return 'graphic';
  return 'fail';
}
