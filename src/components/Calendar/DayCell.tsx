import { useLayoutEffect, useRef, useState } from 'react';
import { format, isLeapYear } from 'date-fns';
import type { Character } from '../../types';
import type { DisplayMode } from '../../hooks/useCharacters';

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
      const cols = Math.max(1, Math.floor((width + gap) / (itemSize + gap)));
      const rows = Math.max(1, Math.floor((height + gap - reserveHeight) / (itemSize + gap)));
      setCapacity(cols * rows);
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(el);
    return () => observer.disconnect();
  }, [itemSize, gap, reserveHeight]);

  return { containerRef, capacity };
}

// The clickable "+N" overflow badge that opens a list of all the day's characters.
function OverflowList({
  characters,
  overflowCount,
  dateLabel,
  compact,
  onCharacterClick,
}: {
  characters: Character[];
  overflowCount: number;
  dateLabel: string;
  compact?: boolean;
  onCharacterClick: (character: Character) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={compact ? 'more-dots more-dots-btn' : 'more-characters more-characters-btn'}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title={`查看全部 ${characters.length} 个角色`}
      >
        +{overflowCount}
      </button>
      {open && (
        <div className="day-overflow-overlay" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>
          <div className="day-overflow-panel" onClick={(e) => e.stopPropagation()}>
            <div className="day-overflow-header">
              <span>{dateLabel}</span>
              <button type="button" className="day-overflow-close" onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="day-overflow-list">
              {characters.map(character => (
                <button
                  key={character.id}
                  type="button"
                  className="day-overflow-item"
                  style={{ borderLeftColor: getGameColor(character.game) }}
                  onClick={() => { setOpen(false); onCharacterClick(character); }}
                >
                  {character.avatar ? (
                    <img src={character.avatar} alt="" className="day-overflow-avatar" loading="lazy" />
                  ) : (
                    <span className="day-overflow-initial">{character.name[0]}</span>
                  )}
                  <span className="day-overflow-name">{character.name}</span>
                  <span className="day-overflow-game">{getGameName(character.game)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
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

  if (displayMode === 'compact') {
    return <CompactDayCell {...{ date, isCurrentMonth, isToday, characters, isFakeFeb29, dayNumber, dateLabel, onCharacterClick }} />;
  }

  if (displayMode === 'card') {
    return (
      <div
        className={`day-cell card-mode ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isFakeFeb29 ? 'fake-feb29' : ''}`}
        title={isFakeFeb29 ? `${date.getFullYear()}年不是闰年，2月没有29日` : undefined}
      >
        <div className="day-number">{dayNumber}</div>
        {isFakeFeb29 && (
          <div className="feb29-notice">无29日</div>
        )}
        <div className="day-characters card">
          {characters.map(character => (
            <div
              key={character.id}
              className="day-character-card"
              onClick={(e) => {
                e.stopPropagation();
                onCharacterClick(character);
              }}
              title={`${character.name} - ${getGameName(character.game)}`}
              style={{ borderColor: getGameColor(character.game) }}
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
      </div>
    );
  }

  // Default avatar mode: measure how many 32px avatars fit, reserve one slot for +N.
  return <AvatarDayCell {...{ date, isCurrentMonth, isToday, characters, isFakeFeb29, dayNumber, dateLabel, onCharacterClick }} />;
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

function AvatarDayCell({ date, isCurrentMonth, isToday, characters, isFakeFeb29, dayNumber, dateLabel, onCharacterClick }: InnerCellProps) {
  // Reserve ~20px for the day number row.
  const { containerRef, capacity } = useCellCapacity(32, 4, 20);
  const overflow = capacity > 0 && characters.length > capacity;
  const visibleCount = overflow ? Math.max(1, capacity - 1) : characters.length;
  const visible = overflow ? characters.slice(0, visibleCount) : characters;
  const hidden = overflow ? characters.slice(visibleCount) : [];

  return (
    <div
      className={`day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${characters.length > 0 ? 'has-characters' : ''} ${isFakeFeb29 ? 'fake-feb29' : ''}`}
      title={isFakeFeb29 ? `${date.getFullYear()}年不是闰年，2月没有29日` : undefined}
    >
      <div className="day-number">{dayNumber}</div>
      {isFakeFeb29 && (
        <div className="feb29-notice">无</div>
      )}
      <div className="day-characters" ref={containerRef}>
        {visible.map(character => (
          <div
            key={character.id}
            className="day-character"
            onClick={(e) => {
              e.stopPropagation();
              onCharacterClick(character);
            }}
            title={`${character.name} - ${getGameName(character.game)}`}
            style={{ borderColor: getGameColor(character.game) }}
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
          <OverflowList characters={characters} overflowCount={hidden.length} dateLabel={dateLabel} onCharacterClick={onCharacterClick} />
        )}
      </div>
    </div>
  );
}

function CompactDayCell({ date, isCurrentMonth, isToday, characters, isFakeFeb29, dayNumber, dateLabel, onCharacterClick }: InnerCellProps) {
  const { containerRef, capacity } = useCellCapacity(8, 2, 16);
  const overflow = capacity > 0 && characters.length > capacity;
  const visibleCount = overflow ? Math.max(1, capacity - 1) : characters.length;
  const visible = overflow ? characters.slice(0, visibleCount) : characters;
  const hidden = overflow ? characters.slice(visibleCount) : [];

  return (
    <div
      className={`day-cell compact ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isFakeFeb29 ? 'fake-feb29' : ''}`}
      title={isFakeFeb29 ? `${date.getFullYear()}年不是闰年，2月没有29日` : undefined}
    >
      <div className="day-number">{dayNumber}</div>
      {characters.length > 0 && (
        <div className="day-characters compact" ref={containerRef}>
          {visible.map(character => (
            <div
              key={character.id}
              className="day-character-dot"
              onClick={(e) => {
                e.stopPropagation();
                onCharacterClick(character);
              }}
              title={`${character.name} - ${getGameName(character.game)}`}
              style={{ backgroundColor: getGameColor(character.game) }}
            />
          ))}
          {overflow && (
            <OverflowList characters={characters} overflowCount={hidden.length} dateLabel={dateLabel} compact onCharacterClick={onCharacterClick} />
          )}
        </div>
      )}
    </div>
  );
}

function getGameColor(gameId: string): string {
  const colors: Record<string, string> = {
    genshin: '#4a90e2',
    hsr: '#6b5ce7',
    zzz: '#ff6b6b',
    honkai3: '#ff8cc8',
  };
  return colors[gameId] || '#999';
}

function getGameName(gameId: string): string {
  const names: Record<string, string> = {
    genshin: '原神',
    hsr: '星穹铁道',
    zzz: '绝区零',
    honkai3: '崩坏3',
  };
  return names[gameId] || gameId;
}

export default DayCell;
