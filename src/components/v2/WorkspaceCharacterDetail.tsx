import { useEffect, useRef, useState } from 'react';
import type { Character, DateMode } from '../../types';
import { calendarDateKey, effectiveDateMode, getGameShortName } from '../../utils/calendar';
import { resolveAffiliation } from '../../data/affiliations';
import CharacterImage from './CharacterImage';
import { computeDetailLayout } from './detailLayout';

interface Props {
  character: Character;
  dateMode: DateMode;
  isFavorite: boolean;
  portraitBackgroundEnabled: boolean;
  motionEnabled: boolean;
  onClose: () => void;
  onEdit: (character: Character) => void;
  onToggleFavorite: () => void;
  onExportIcs: () => void;
}

function useViewport() {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === 'undefined' ? 1440 : window.innerWidth,
    height: typeof window === 'undefined' ? 900 : window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return viewport;
}

export default function WorkspaceCharacterDetail(props: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [portraitMeasurement, setPortraitMeasurement] = useState<{
    characterId: string;
    dimensions: { width: number; height: number };
  } | null>(null);
  const viewport = useViewport();

  const affiliation = resolveAffiliation(props.character);
  const modeLabel = effectiveDateMode(props.character.game, props.dateMode) === 'release' ? '实装纪念' : '生日';
  const dateValue = effectiveDateMode(props.character.game, props.dateMode) === 'release'
    ? props.character.releaseDate || '待补充'
    : calendarDateKey(props.character, props.dateMode) || '待补充';

  const portraitDimensions = portraitMeasurement?.characterId === props.character.id
    ? portraitMeasurement.dimensions
    : null;
  const layout = computeDetailLayout(portraitDimensions, viewport.width, viewport.height, props.character.game);

  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();

    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      const box = event.currentTarget.getBoundingClientRect();
      if (
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom
      ) {
        props.onClose();
      }
    }
  };

  const dialogStyle = {
    width: `${layout.dialogWidth}px`,
    '--detail-portrait-w': `${layout.portraitWidth}px`,
    '--detail-portrait-h': `${layout.portraitHeight}px`,
    '--detail-info-w': `${layout.infoWidth}px`,
  } as React.CSSProperties;

  return (
    <dialog
      ref={ref}
      className={`v2-dialog v2-detail-dialog game-${props.character.game} ${layout.stacked ? 'is-stacked' : ''}`}
      style={dialogStyle}
      onCancel={e => {
        e.preventDefault();
        props.onClose();
      }}
      onClick={handleBackdropClick}
    >
      <button
        className="v2-detail-close"
        onClick={props.onClose}
        aria-label="关闭"
        autoFocus
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <div className="v2-detail-layout">
        <div className="v2-detail-visual">
          <CharacterImage
            key={props.character.id}
            character={props.character}
            kind="portrait"
            onLoad={dimensions => setPortraitMeasurement({ characterId: props.character.id, dimensions })}
          />
        </div>

        <div className="v2-detail-text">
          <span className="v2-eyebrow">{affiliation.nameEn.toUpperCase()}</span>
          <h2>{props.character.name}</h2>
          <p className="v2-detail-english">{props.character.nameEn || props.character.name}</p>

          <dl className="v2-detail-meta">
            <dt>{modeLabel}</dt>
            <dd>{dateValue}</dd>

            <dt>所属游戏</dt>
            <dd>{getGameShortName(props.character.game)}</dd>

            <dt>地区 / 阵营</dt>
            <dd>{props.character.region || affiliation.name}</dd>

            <dt>属性 / 类型</dt>
            <dd>
              {[props.character.element, props.character.weapon].filter(Boolean).join(' · ') || '待补充'}
            </dd>
          </dl>

          <div className="v2-detail-actions">
            <button
              onClick={props.onToggleFavorite}
              aria-pressed={props.isFavorite}
              aria-label={props.isFavorite ? '取消收藏' : '添加收藏'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={props.isFavorite ? 'currentColor' : 'none'} stroke="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {props.isFavorite ? '已收藏' : '收藏'}
            </button>

            <button
              onClick={props.onExportIcs}
              aria-label="导出日历"
              title="导出角色日历事件"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>

            <button
              onClick={() => props.onEdit(props.character)}
              aria-label="编辑角色"
              title="编辑角色信息"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
