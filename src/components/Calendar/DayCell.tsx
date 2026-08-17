import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { format, isLeapYear } from 'date-fns';
import type { Character } from '../../types';
import type { DisplayMode } from '../../hooks/useCharacters';
import { getGameColor, getGameShortName } from '../../utils/calendar';

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  characters: Character[];
  displayMode: DisplayMode;
  onCharacterClick: (character: Character) => void;
}

// How many avatar/dot slots actually fit inside the cell, measured from the
// real rendered size so it adapts to wide desktop cells and narrow mobile ones.
function useCellCapacity(itemSize: number, gap: number, reserveHeight: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [capacity, setCapacity] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width <= 0 || height <= 0) { setCapacity(0); return; }
      // 用实际渲染出来的头像宽度，而不是 JS 里照抄的 CSS 数值 ——
      // 响应式下 .day-character 会缩到 20px，写死 30 会算少格数、提前弹出 "+N"。
      // 必须用 offsetWidth 而不是 getBoundingClientRect()：后者含 transform，
      // 悬停时 scale(1.18) 会把量出来的宽度撑大 → 容量变小 → 头像被收走 →
      // 鼠标不再悬停 → 容量变大 → 头像回来，形成无限抖动。
      const first = el.firstElementChild as HTMLElement | null;
      const measured = first ? first.offsetWidth : 0;
      const size = measured > 0 ? measured : itemSize;
      const cols = Math.max(1, Math.floor((width + gap) / (size + gap)));
      const rows = Math.max(1, Math.floor((height + gap - reserveHeight) / (size + gap)));
      setCapacity(cols * rows);
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(el);
    return () => observer.disconnect();
  }, [itemSize, gap, reserveHeight]);

  return { containerRef, capacity };
}

// 某一天的全部角色面板。原来它归 "+N" 按钮私有，所以只有溢出时才打开得了；
// 现在提到格子这一层，点格子空白处也能打开 —— .day-cell 一直声明着
// cursor:pointer 却没有任何 onClick，这条终于名副其实。
//
// 必须 portal 到 body：遮罩是 position:fixed，而 .day-cell:hover 带
// transform: translateY(-1px) —— 带 transform 的祖先会成为 fixed 后代的包含块，
// 于是遮罩被关进格子里变成一个小弹窗，鼠标移开又弹回视口尺寸，来回抖动。
function DayPanel({
  characters,
  dateLabel,
  onClose,
  onCharacterClick,
}: {
  characters: Character[];
  dateLabel: string;
  onClose: () => void;
  onCharacterClick: (character: Character) => void;
}) {
  return createPortal(
    <div className="day-overflow-overlay" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="day-overflow-panel" onClick={(e) => e.stopPropagation()}>
        <div className="day-overflow-header">
          <span>{dateLabel}</span>
          <button type="button" className="day-overflow-close" onClick={onClose}>×</button>
        </div>
        <div className="day-overflow-list">
          {characters.map(character => (
            <button
              key={character.id}
              type="button"
              className="day-overflow-item"
              style={{ borderLeftColor: getGameColor(character.game) }}
              onClick={() => { onClose(); onCharacterClick(character); }}
            >
              {character.avatar ? (
                <img src={character.avatar} alt="" className="day-overflow-avatar" loading="lazy" />
              ) : (
                <span className="day-overflow-initial">{character.name[0]}</span>
              )}
              <span className="day-overflow-name">{character.name}</span>
              <span className="day-overflow-game">{getGameShortName(character.game)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

const DayCell = ({
  date,
  isCurrentMonth,
  isToday,
  characters,
  displayMode,
  onCharacterClick
}: DayCellProps) => {
  const dayNumber = format(date, 'd');
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const isFeb29 = month === 2 && day === 29;
  const isFakeFeb29 = isFeb29 && !isLeapYear(date);
  const dateLabel = format(date, 'M月d日');

  const inner = { date, isCurrentMonth, isToday, characters, isFakeFeb29, dayNumber, dateLabel, onCharacterClick };

  if (displayMode === 'compact') return <CompactDayCell {...inner} />;
  if (displayMode === 'card') return <CardDayCell {...inner} />;
  return <AvatarDayCell {...inner} />;
};

interface InnerCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  characters: Character[];
  isFakeFeb29: boolean;
  dayNumber: string;
  dateLabel: string;
  onCharacterClick: (character: Character) => void;
}

// 三种模式共用的格子外壳：类名拼装、点击打开当日面板、假 2/29 提示。
// has-characters 以前只有头像模式发得出来，紧凑 / 卡片模式没有 —— 现在统一。
function useDayShell(characters: Character[], isCurrentMonth: boolean, isToday: boolean, isFakeFeb29: boolean, extra: string, date: Date) {
  const [panelOpen, setPanelOpen] = useState(false);
  const hasCharacters = characters.length > 0;

  const className = [
    'day-cell',
    extra,
    !isCurrentMonth && 'other-month',
    isToday && 'today',
    hasCharacters && 'has-characters',
    isFakeFeb29 && 'fake-feb29',
  ].filter(Boolean).join(' ');

  const shellProps = {
    className,
    title: isFakeFeb29 ? `${date.getFullYear()}年不是闰年，2月没有29日` : undefined,
    onClick: hasCharacters ? () => setPanelOpen(true) : undefined,
  };

  return { panelOpen, setPanelOpen, hasCharacters, shellProps };
}

function AvatarDayCell({ date, isCurrentMonth, isToday, characters, isFakeFeb29, dayNumber, dateLabel, onCharacterClick }: InnerCellProps) {
  // Reserve ~20px for the day number row.
  const { containerRef, capacity } = useCellCapacity(30, 4, 20);
  const { panelOpen, setPanelOpen, shellProps } = useDayShell(characters, isCurrentMonth, isToday, isFakeFeb29, '', date);

  const overflow = capacity > 0 && characters.length > capacity;
  const visibleCount = overflow ? Math.max(1, capacity - 1) : characters.length;
  const visible = overflow ? characters.slice(0, visibleCount) : characters;
  const hidden = overflow ? characters.slice(visibleCount) : [];

  return (
    <div {...shellProps}>
      <div className="day-number">{dayNumber}</div>
      {isFakeFeb29 && <div className="feb29-notice">无</div>}
      <div className="day-characters" ref={containerRef}>
        {visible.map(character => (
          <div
            key={character.id}
            className="day-character"
            onClick={(e) => { e.stopPropagation(); onCharacterClick(character); }}
            title={`${character.name} - ${getGameShortName(character.game)}`}
            style={{ '--game-color': getGameColor(character.game) } as CSSProperties}
          >
            {character.avatar ? (
              <img
                src={character.avatar}
                alt={character.name}
                className="day-character-avatar"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.textContent = character.name[0];
                  target.parentElement!.classList.add('avatar-fallback');
                }}
              />
            ) : (
              <span className="day-character-initial">{character.name[0]}</span>
            )}
          </div>
        ))}
        {overflow && (
          <button
            type="button"
            className="more-characters more-characters-btn"
            onClick={(e) => { e.stopPropagation(); setPanelOpen(true); }}
            title={`查看全部 ${characters.length} 个角色`}
          >
            +{hidden.length}
          </button>
        )}
      </div>
      {panelOpen && (
        <DayPanel characters={characters} dateLabel={dateLabel} onClose={() => setPanelOpen(false)} onCharacterClick={onCharacterClick} />
      )}
    </div>
  );
}

function CompactDayCell({ date, isCurrentMonth, isToday, characters, isFakeFeb29, dayNumber, dateLabel, onCharacterClick }: InnerCellProps) {
  const { containerRef, capacity } = useCellCapacity(8, 2, 16);
  const { panelOpen, setPanelOpen, shellProps } = useDayShell(characters, isCurrentMonth, isToday, isFakeFeb29, 'compact', date);

  const overflow = capacity > 0 && characters.length > capacity;
  const visibleCount = overflow ? Math.max(1, capacity - 1) : characters.length;
  const visible = overflow ? characters.slice(0, visibleCount) : characters;
  const hidden = overflow ? characters.slice(visibleCount) : [];

  return (
    <div {...shellProps}>
      <div className="day-number">{dayNumber}</div>
      {characters.length > 0 && (
        <div className="day-characters compact" ref={containerRef}>
          {visible.map(character => (
            <div
              key={character.id}
              className="day-character-dot"
              onClick={(e) => { e.stopPropagation(); onCharacterClick(character); }}
              title={`${character.name} - ${getGameShortName(character.game)}`}
              style={{ backgroundColor: getGameColor(character.game) }}
            />
          ))}
          {overflow && (
            <button
              type="button"
              className="more-dots more-dots-btn"
              onClick={(e) => { e.stopPropagation(); setPanelOpen(true); }}
              title={`查看全部 ${characters.length} 个角色`}
            >
              +{hidden.length}
            </button>
          )}
        </div>
      )}
      {panelOpen && (
        <DayPanel characters={characters} dateLabel={dateLabel} onClose={() => setPanelOpen(false)} onCharacterClick={onCharacterClick} />
      )}
    </div>
  );
}

function CardDayCell({ date, isCurrentMonth, isToday, characters, isFakeFeb29, dayNumber, dateLabel, onCharacterClick }: InnerCellProps) {
  const { panelOpen, setPanelOpen, shellProps } = useDayShell(characters, isCurrentMonth, isToday, isFakeFeb29, 'card-mode', date);

  return (
    <div {...shellProps}>
      <div className="day-number">{dayNumber}</div>
      {isFakeFeb29 && <div className="feb29-notice">无29日</div>}
      <div className="day-characters card">
        {characters.map(character => (
          <div
            key={character.id}
            className="day-character-card"
            onClick={(e) => { e.stopPropagation(); onCharacterClick(character); }}
            title={`${character.name} - ${getGameShortName(character.game)}`}
            style={{ '--game-color': getGameColor(character.game) } as CSSProperties}
          >
            <div className="card-avatar-wrapper">
              {character.avatar ? (
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="card-avatar"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.classList.add('avatar-fallback');
                    target.parentElement!.textContent = character.name[0];
                  }}
                />
              ) : (
                <span className="card-initial">{character.name[0]}</span>
              )}
            </div>
            <span className="card-name" title={character.name}>{character.name}</span>
          </div>
        ))}
      </div>
      {panelOpen && (
        <DayPanel characters={characters} dateLabel={dateLabel} onClose={() => setPanelOpen(false)} onCharacterClick={onCharacterClick} />
      )}
    </div>
  );
}

export default DayCell;
