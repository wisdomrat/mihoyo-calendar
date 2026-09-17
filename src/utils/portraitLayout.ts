import React from 'react';

export interface PortraitDimensions {
  width: number;
  height: number;
}

export type PortraitDisplayMode = 'detail' | 'artwork';

export interface PortraitModalLayout {
  className: string;
  style: React.CSSProperties;
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
  const modalWidth = ratio >= 1.5
    ? 'min(1400px, 96vw, 160vh)'
    : ratio >= 1.15
      ? 'min(1000px, 94vw, 92vh)'
      : ratio >= 0.9
        ? 'min(800px, 94vw, 92vh)'
        : ratio >= 0.5
          ? 'min(720px, 94vw, 92vh)'
          : 'min(520px, 90vw, 88vh)';

  return {
    className,
    style: {
      '--portrait-modal-width': modalWidth,
      '--portrait-size': 'contain',
      '--portrait-position': 'center center',
      '--portrait-aspect-ratio': imageRatio(dimensions),
    } as React.CSSProperties,
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

  // Ultra-wide landscape (Genshin 2.000)
  if (ratio >= 1.5) {
    if (mode === 'artwork') {
      return getArtworkOnlyLayout(dimensions, 'portrait-layout-ultra-wide');
    }

    return {
      className: 'portrait-layout-ultra-wide',
      style: {
        '--portrait-modal-width': 'min(560px, 94vw)',
        '--portrait-size': 'contain',
        '--portrait-position': 'center center',
        '--portrait-aspect-ratio': imageRatio(dimensions),
      } as React.CSSProperties,
    };
  }

  // Standard landscape (1.15-1.5)
  if (ratio >= 1.15) {
    if (mode === 'artwork') {
      return getArtworkOnlyLayout(dimensions, 'portrait-layout-landscape');
    }

    return {
      className: 'portrait-layout-landscape',
      style: {
        '--portrait-modal-width': 'min(480px, 94vw)',
        '--portrait-size': 'contain',
        '--portrait-position': 'center center',
        '--portrait-aspect-ratio': imageRatio(dimensions),
      } as React.CSSProperties,
    };
  }

  // Square (0.9-1.15)
  if (ratio >= 0.9) {
    if (mode === 'artwork') {
      return getArtworkOnlyLayout(dimensions, 'portrait-layout-square');
    }

    return {
      className: 'portrait-layout-square',
      style: {
        '--portrait-modal-width': 'min(440px, 94vw)',
        '--portrait-size': 'contain',
        '--portrait-position': 'center center',
        '--portrait-aspect-ratio': imageRatio(dimensions),
      } as React.CSSProperties,
    };
  }

  // Standard portrait (0.5-0.9)
  if (ratio >= 0.5) {
    if (mode === 'artwork') {
      return getArtworkOnlyLayout(dimensions, 'portrait-layout-vertical');
    }

    const verticalPosition = gameId === 'zzz' ? 'center bottom' : 'right bottom';

    return {
      className: 'portrait-layout-vertical',
      style: {
        '--portrait-modal-width': 'min(400px, 94vw)',
        '--portrait-size': 'contain',
        '--portrait-position': verticalPosition,
        '--portrait-aspect-ratio': imageRatio(dimensions),
      } as React.CSSProperties,
    };
  }

  // Narrow portrait (<0.5, ZZZ extreme)
  if (mode === 'artwork') {
    return getArtworkOnlyLayout(dimensions, 'portrait-layout-narrow');
  }

  return {
    className: 'portrait-layout-narrow',
    style: {
      '--portrait-modal-width': 'min(360px, 90vw)',
      '--portrait-size': 'contain',
      '--portrait-position': 'center bottom',
      '--portrait-aspect-ratio': imageRatio(dimensions),
    } as React.CSSProperties,
  };
}