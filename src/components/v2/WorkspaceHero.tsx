import { useEffect, useRef } from 'react';
import type { Affiliation } from '../../data/affiliations';
import type { Character, DateMode } from '../../types';
import { displayDate, effectiveDateMode, getGameShortName } from '../../utils/calendar';
import CharacterImage from './CharacterImage';

interface Props {
  character: Character;
  affiliation: Affiliation | null;
  dateMode: DateMode;
  onClose: () => void;
}

export default function WorkspaceHero({ character, affiliation, dateMode, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `v2-hero-title-${character.id}`;
  const modeLabel = effectiveDateMode(character.game, dateMode) === 'release' ? '实装纪念' : '生日记忆';
  const previousOverflow = useRef('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    previousOverflow.current = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();

    return () => {
      if (dialog.open) dialog.close();
      document.documentElement.style.overflow = previousOverflow.current;
      previousFocus?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={`v2-hero-dialog game-${character.game}`}
      aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="v2-hero-media" aria-hidden="true">
        <CharacterImage character={character} kind="portrait" className="v2-hero-backdrop" />
        <CharacterImage character={character} kind="portrait" className="v2-hero-art" />
      </div>
      <div className="v2-hero-shade" aria-hidden="true" />
      <div className="v2-hero-grid" aria-hidden="true" />

      <div className="v2-hero-topline">
        <span>HERO / CHARACTER MEMORY</span>
        <span>{getGameShortName(character.game)} / {affiliation?.name || '角色档案'}</span>
      </div>

      <button className="v2-hero-close" type="button" onClick={onClose} aria-label="关闭角色主页" autoFocus>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="v2-hero-copy">
        <span className="v2-hero-kicker">{modeLabel}</span>
        <h2 id={titleId}>{character.name}</h2>
        <p>{character.nameEn || character.name}</p>
        <div className="v2-hero-meta">
          <span>{displayDate(character, dateMode)}</span>
          <span>{[character.element, character.weapon, character.rarity ? `${character.rarity}星` : null].filter(Boolean).join(' · ')}</span>
          {affiliation?.tagline && <span>{affiliation.tagline}</span>}
        </div>
      </div>

      <div className="v2-hero-footer">
        <span>角色日历 / 沉浸档案</span>
        <button type="button" onClick={onClose}>返回日历</button>
      </div>
    </dialog>
  );
}
