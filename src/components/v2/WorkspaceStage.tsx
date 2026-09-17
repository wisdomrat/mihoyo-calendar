import { useEffect, useRef } from 'react';
import type { Character, DateMode } from '../../types';
import type { Affiliation } from '../../data/affiliations';
import { displayDate, getGameShortName } from '../../utils/calendar';
import CharacterImage from './CharacterImage';

interface Props {
  character: Character;
  affiliation: Affiliation | null;
  dateMode: DateMode;
  onCharacterClick: () => void;
  onStagePosition?: (x: number, y: number) => void;
}

export default function WorkspaceStage({ character, affiliation, dateMode, onCharacterClick, onStagePosition }: Props) {
  const stageRef = useRef<HTMLElement>(null);
  const modeLabel = dateMode === 'release' ? '实装纪念' : '生日';
  const affilName = affiliation?.name || '归属待确定';
  const affilTag = affiliation?.tagline || '';

  // Measure stage position for halo origin
  useEffect(() => {
    if (!stageRef.current || !onStagePosition) return;
    
    const measure = () => {
      const rect = stageRef.current?.getBoundingClientRect();
      if (rect) {
        // Calculate halo origin at stage top-center
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height * 0.3; // Upper third of stage
        onStagePosition(x, y);
      }
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [onStagePosition, character]);

  return (
    <section ref={stageRef} className="v2-stage" aria-label={`当前角色：${character.name}`}>
      <CharacterImage character={character} kind="portrait" className="v2-stage-art" />
      <div className="v2-stage-shade" />

      <button
        className="v2-stage-hit"
        onClick={onCharacterClick}
        aria-label={`打开${character.name}沉浸式主页`}
      />

      <div className="v2-stage-heading">
        <span className="v2-stage-context">
          {getGameShortName(character.game)} / {affilName}
        </span>
        <span className="v2-stage-signal" aria-hidden="true" />
      </div>

      <div className="v2-stage-caption">
        <span className="v2-stage-kicker">{affilTag}</span>
        <h2>{character.name}</h2>
        <p className="v2-stage-english">{character.nameEn || character.name}</p>

        <div className="v2-stage-rule" aria-hidden="true" />

        <div className="v2-stage-identity">
          <strong>{displayDate(character, dateMode)}</strong>
          <span>· {modeLabel}</span>
        </div>

        <div className="v2-stage-bottom">
          <span>
            {[character.element, character.weapon, character.rarity ? `${character.rarity}星` : null]
              .filter(Boolean)
              .join(' · ') || '属性待补充'}
          </span>
        </div>
      </div>
    </section>
  );
}
