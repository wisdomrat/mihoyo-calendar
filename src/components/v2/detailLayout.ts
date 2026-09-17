const MAX_UPSCALE = 1.5;
const STACK_MAX = 768;
const INFO_WIDTH = 320;
const GAP = 32;
const PAD = 64;

// Remielle's 2128 x 1324 artwork is the approved visual-size reference.
const GENSHIN_REFERENCE_RATIO = 2128 / 1324;

export interface DetailLayout {
  stacked: boolean;
  dialogWidth: number;
  portraitWidth: number;
  portraitHeight: number;
  infoWidth: number;
}

export function computeDetailLayout(
  dimensions: { width: number; height: number } | null,
  viewportWidth: number,
  viewportHeight: number,
  gameId?: string,
): DetailLayout {
  const sourceRatio = dimensions ? dimensions.width / dimensions.height : 0.7;
  const ratio = gameId === 'genshin' && sourceRatio > GENSHIN_REFERENCE_RATIO
    ? GENSHIN_REFERENCE_RATIO
    : sourceRatio;
  const naturalW = dimensions?.width ?? 4000;
  const naturalH = dimensions?.height ?? 4000;

  const fitBox = (maxW: number, maxH: number) => {
    let height = Math.min(maxH, naturalH * MAX_UPSCALE);
    let width = height * ratio;
    if (width > maxW) {
      width = maxW;
      height = width / ratio;
    }
    if (width > naturalW * MAX_UPSCALE) {
      width = naturalW * MAX_UPSCALE;
      height = width / ratio;
    }
    return { width: Math.round(width), height: Math.round(height) };
  };

  const stacked = viewportWidth < STACK_MAX;

  if (stacked) {
    const dialogWidth = Math.min(viewportWidth * 0.94, 460);
    const contentWidth = dialogWidth - PAD;
    const { width, height } = fitBox(contentWidth, viewportHeight * 0.5);
    return {
      stacked: true,
      dialogWidth: Math.round(dialogWidth),
      portraitWidth: width,
      portraitHeight: height,
      infoWidth: Math.round(contentWidth),
    };
  }

  const maxDialogWidth = Math.min(viewportWidth * 0.94, 1200);
  const maxPortraitWidth = maxDialogWidth - INFO_WIDTH - GAP - PAD;
  const maxPortraitHeight = Math.min(viewportHeight * 0.9 - PAD, 680);
  const { width, height } = fitBox(maxPortraitWidth, maxPortraitHeight);
  return {
    stacked: false,
    dialogWidth: Math.round(width + INFO_WIDTH + GAP + PAD),
    portraitWidth: width,
    portraitHeight: height,
    infoWidth: INFO_WIDTH,
  };
}
