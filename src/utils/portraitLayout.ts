export interface PortraitDimensions {
  width: number;
  height: number;
}

export type PortraitDisplayMode = 'detail' | 'artwork';

export interface PortraitModalLayout {
  className: string;
  style: Record<string, string>;
}

function isValidDimensions(dimensions: PortraitDimensions | null | undefined): dimensions is PortraitDimensions {
  return Boolean(
    dimensions
    && Number.isFinite(dimensions.width)
    && Number.isFinite(dimensions.height)
    && dimensions.width > 0
    && dimensions.height > 0,
  );
}

function imageRatio(dimensions: PortraitDimensions): string {
  return `${dimensions.width} / ${dimensions.height}`;
}

function getArtworkOnlyLayout(dimensions: PortraitDimensions, className: string): PortraitModalLayout {
  const ratio = dimensions.width / dimensions.height;
  const modalWidth = ratio >= 1.15
    ? 'min(820px, 96vw)'
    : ratio >= 0.9
      ? 'min(680px, 94vw)'
      : 'min(520px, 94vw)';

  return {
    className,
    style: {
      '--portrait-modal-width': modalWidth,
      '--portrait-size': 'contain',
      '--portrait-position': 'center center',
      '--portrait-aspect-ratio': imageRatio(dimensions),
    },
  };
}

export function getPortraitModalLayout(
  dimensions: PortraitDimensions | null | undefined,
  mode: PortraitDisplayMode = 'detail',
  gameId?: string,
): PortraitModalLayout {
  if (!isValidDimensions(dimensions)) {
    return { className: 'portrait-layout-pending', style: {} };
  }

  const ratio = dimensions.width / dimensions.height;

  if (ratio >= 1.15) {
    if (mode === 'artwork') {
      if (gameId === 'genshin') {
        return {
          className: 'portrait-layout-landscape portrait-layout-genshin-artwork',
          style: {
            '--portrait-modal-width': 'min(620px, 94vw)',
            '--portrait-size': 'auto 96%',
            '--portrait-position': 'center center',
            '--portrait-aspect-ratio': '4 / 5',
          },
        };
      }

      return getArtworkOnlyLayout(dimensions, 'portrait-layout-landscape');
    }

    return {
      className: 'portrait-layout-landscape',
      style: {
        '--portrait-modal-width': 'min(440px, 94vw)',
        '--portrait-size': 'cover',
        '--portrait-position': 'center center',
      },
    };
  }

  if (ratio >= 0.9) {
    if (mode === 'artwork') {
      return getArtworkOnlyLayout(dimensions, 'portrait-layout-square');
    }

    return {
      className: 'portrait-layout-square',
      style: {
        '--portrait-modal-width': 'min(440px, 94vw)',
        '--portrait-size': 'cover',
        '--portrait-position': 'center center',
      },
    };
  }

  if (mode === 'artwork') {
    return getArtworkOnlyLayout(dimensions, 'portrait-layout-vertical');
  }

  return {
    className: 'portrait-layout-vertical',
    style: {
      '--portrait-modal-width': '400px',
      '--portrait-size': 'auto 94%',
      '--portrait-position': 'right bottom',
    },
  };
}