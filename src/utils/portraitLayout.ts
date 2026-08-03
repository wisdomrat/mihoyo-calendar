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
  // Width caps are viewport-driven so desktop scales up while mobile keeps
  // hitting the vw term first (unchanged behaviour on small screens). The vh
  // term stops very tall images from overflowing the viewport height.
  const modalWidth = ratio >= 1.15
    ? 'min(1400px, 96vw, 160vh)'
    : ratio >= 0.9
      ? 'min(1000px, 94vw, 92vh)'
      : 'min(720px, 94vw, 92vh)';

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
        // Use the real aspect ratio instead of forcing 4/5, which used to crop
        // landscape artwork on wide desktop screens.
        return {
          className: 'portrait-layout-landscape portrait-layout-genshin-artwork',
          style: {
            '--portrait-modal-width': 'min(1400px, 96vw, 160vh)',
            '--portrait-size': 'contain',
            '--portrait-position': 'center center',
            '--portrait-aspect-ratio': imageRatio(dimensions),
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

  // ZZZ vertical portraits often have weapons/gear extending to one side, so a
  // hard right-bottom pin reads as off-centre once the modal clips that edge.
  // Centre them horizontally instead; other games keep the right-bottom lean.
  const verticalPosition = gameId === 'zzz' ? 'center bottom' : 'right bottom';

  return {
    className: 'portrait-layout-vertical',
    style: {
      '--portrait-modal-width': '400px',
      '--portrait-size': 'auto 94%',
      '--portrait-position': verticalPosition,
    },
  };
}