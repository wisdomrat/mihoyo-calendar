import { useState } from 'react';
import type { Character } from '../../types';

const LOCAL_ARTWORK: Record<string, { avatar?: string; portrait?: string }> = {
  // Local cached assets can be added here
};

interface Props {
  character: Character;
  kind?: 'avatar' | 'portrait';
  className?: string;
  onLoad?: (dimensions: { width: number; height: number }) => void;
}

export default function CharacterImage({ character, kind = 'avatar', className = '', onLoad }: Props) {
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const local = LOCAL_ARTWORK[character.id];
  const primarySrc = kind === 'portrait'
    ? (local?.portrait || character.portrait)
    : (local?.avatar || character.avatar);

  const fallbackSrc = kind === 'portrait'
    ? character.avatar
    : undefined;

  if (!primarySrc || (failed && !fallbackSrc) || fallbackFailed) {
    return (
      <span className={`v2-image-fallback ${className}`} aria-label={character.name}>
        {character.name.charAt(0)}
      </span>
    );
  }

  const handleError = () => {
    if (!failed && fallbackSrc) {
      setFailed(true);
    } else {
      setFallbackFailed(true);
    }
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (onLoad) {
      const img = e.currentTarget;
      onLoad({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
  };

  return (
    <img
      src={failed ? fallbackSrc : primarySrc}
      alt={character.name}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
}
