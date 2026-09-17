import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import type { Character, DateMode, ViewMode } from '../../types';
import type { DisplayMode, WeekStart } from '../../hooks/useCharacters';
import { calendarDateKey, effectiveDateMode, getGameColor, getGameShortName } from '../../utils/calendar';
import CharacterImage from './CharacterImage';
import WorkspaceDialog from './WorkspaceDialog';

interface Props {
  characters: Character[];
  currentDate: Date;
  view: ViewMode;
  dateMode: DateMode;
  weekStart: WeekStart;
  displayMode: DisplayMode;
  summary: string;
  onDateChange: (date: Date) => void;
  onViewChange: (view: ViewMode) => void;
  onDateModeChange: (mode: DateMode) => void;
  onCharacterClick: (character: Character) => void;
  onFilters: () => void;
}

function getCharactersByDate(characters: Character[], date: Date, dateMode: DateMode): Character[] {
  const key = format(date, 'MM-dd');
  return characters.filter(c => {
    const charKey = calendarDateKey(c, dateMode);
    return charKey === key;
  });
}

function DayCell({
  date,
  currentDate,
  characters,
  selected,
  displayMode,
  dateMode,
  onSelect,
  onCharacterClick,
}: {
  date: Date;
  currentDate: Date;
  characters: Character[];
  selected: boolean;
  displayMode: DisplayMode;
  dateMode: DateMode;
  onSelect: () => void;
  onCharacterClick: (character: Character) => void;
}) {
  const lane = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(24);
  const count = characters.length;
  const visibleCount = count === 0 ? 0 : count <= 3 ? count : window.innerWidth <= 600 ? 2 : 3;
  const overflow = count > visibleCount ? count - visibleCount : 0;

  useLayoutEffect(() => {
    const el = lane.current;
    if (!el || count === 0) return;

    const measure = () => {
      const mobile = window.innerWidth <= 600;

      const idealSize = count === 1
        ? (mobile ? 36 : 40)
        : count <= 3
        ? (mobile ? 32 : 36)
        : (mobile ? 28 : 36);

      const computed = displayMode === 'compact' ? 24 : idealSize;
      setSize(computed);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [count, visibleCount, overflow, displayMode]);

  const modes = [...new Set(characters.map(c => effectiveDateMode(c.game, dateMode)))];
  const isOutside = !isSameMonth(date, currentDate);
  const isToday = isSameDay(date, new Date());

  return (
    <div
      className="v2-day"
      data-outside={isOutside || undefined}
      data-today={isToday || undefined}
      data-selected={selected || undefined}
    >
      <button
        className="v2-day-hit"
        aria-label={`${format(date, 'M月d日')}，${count ? `${count}位角色` : '暂无纪念日'}`}
        onClick={onSelect}
      />
      <span className="v2-day-number">{date.getDate()}</span>
      {modes.length > 0 && (
        <span className="v2-event-marks">
          {modes.map(mode => (
            <i key={mode} className={`v2-event-${mode}`} />
          ))}
        </span>
      )}
      <div
        className="v2-portrait-lane"
        ref={lane}
        style={{ '--v2-avatar-size': `${size}px`, '--v2-overlap': `${-Math.floor(size * 0.3)}px` } as CSSProperties}
      >
        {characters.slice(0, visibleCount).map(c => (
          <button
            key={c.id}
            className="v2-avatar-button"
            onClick={e => {
              e.stopPropagation();
              onCharacterClick(c);
            }}
            title={`${c.name} · ${getGameShortName(c.game)}`}
            aria-label={`查看${c.name}详情`}
            style={{ '--v2-ring': getGameColor(c.game) } as CSSProperties}
          >
            <CharacterImage character={c} />
          </button>
        ))}
        {overflow > 0 && (
          <button
            className="v2-overflow"
            aria-label={`查看全部${count}位角色`}
            onClick={e => {
              e.stopPropagation();
              onSelect();
            }}
          >
            +{overflow}
          </button>
        )}
      </div>
      {displayMode === 'card' && count > 0 && (
        <span className="v2-day-caption">
          {count === 1 ? characters[0].name : `${count}位角色`}
        </span>
      )}
    </div>
  );
}

export default function WorkspaceCalendar(props: Props) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [rosterDay, setRosterDay] = useState<Date | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const start = startOfWeek(
    props.view === 'month' ? startOfMonth(props.currentDate) : props.currentDate,
    { weekStartsOn: props.weekStart }
  );
  const end = endOfWeek(
    props.view === 'month' ? endOfMonth(props.currentDate) : props.currentDate,
    { weekStartsOn: props.weekStart }
  );
  const days = eachDayOfInterval({ start, end });

  const monthCharacters = props.characters.filter(c => {
    const key = calendarDateKey(c, props.dateMode);
    return key && key.startsWith(format(props.currentDate, 'MM-'));
  });

  const move = (direction: number) => {
    const next = props.view === 'month'
      ? addMonths(props.currentDate, direction)
      : addWeeks(props.currentDate, direction);
    props.onDateChange(next);
  };

  const selectedCharacters = selectedDay ? getCharactersByDate(props.characters, selectedDay, props.dateMode) : [];
  const roster = rosterDay ? getCharactersByDate(props.characters, rosterDay, props.dateMode) : [];

  return (
    <section className="v2-calendar" aria-label="角色日历">
      <div className="v2-calendar-heading">
        <div>
          <p className="v2-eyebrow">
            {props.view === 'month'
              ? `${props.currentDate.getMonth() + 1}月 · ${monthCharacters.length}位角色`
              : `${format(start, 'M月d日')}至${format(end, 'M月d日')}`}
          </p>
          <button
            className="v2-month-title"
            onClick={() => setShowMonthPicker(true)}
            aria-label="选择年月"
          >
            <span>{format(props.currentDate, 'M')}月</span>
            <span>{format(props.currentDate, 'yyyy')}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>

        <div className="v2-month-nav">
          <button
            className="v2-icon-button"
            aria-label={props.view === 'month' ? '上个月' : '上一周'}
            onClick={() => move(-1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="v2-pill" onClick={() => props.onDateChange(new Date())}>
            今天
          </button>
          <button
            className="v2-icon-button"
            aria-label={props.view === 'month' ? '下个月' : '下一周'}
            onClick={() => move(1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="v2-toolbar">
        <div className="v2-view-switch">
          {(['month', 'week'] as const).map(view => (
            <button
              key={view}
              aria-pressed={props.view === view}
              onClick={() => props.onViewChange(view)}
            >
              {view === 'month' ? '月' : '周'}
            </button>
          ))}
        </div>

        <span className="v2-divider" />

        <div className="v2-mode-switch">
          {(['birthday', 'release'] as const).map(mode => (
            <button
              key={mode}
              aria-pressed={props.dateMode === mode}
              onClick={() => props.onDateModeChange(mode)}
            >
              {mode === 'birthday' ? '生日' : '实装'}
            </button>
          ))}
        </div>

        <button className="v2-filter-summary" onClick={props.onFilters} title={props.summary}>
          <span>{props.summary}</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {props.view === 'month' ? (
        <>
          <div className="v2-weekdays">
            {days.slice(0, 7).map(day => {
              const dayOfWeek = day.getDay();
              return (
                <span key={dayOfWeek} data-weekend={[0, 6].includes(dayOfWeek) || undefined}>
                  {['日', '一', '二', '三', '四', '五', '六'][dayOfWeek]}
                </span>
              );
            })}
          </div>

          <div className="v2-month-grid" style={{ '--v2-rows': days.length / 7 } as CSSProperties}>
            {days.map(day => {
              const dayCharacters = getCharactersByDate(props.characters, day, props.dateMode);
              return (
                <DayCell
                  key={format(day, 'yyyy-MM-dd')}
                  date={day}
                  currentDate={props.currentDate}
                  characters={dayCharacters}
                  selected={Boolean(selectedDay && isSameDay(day, selectedDay))}
                  displayMode={props.displayMode}
                  dateMode={props.dateMode}
                  onSelect={() => {
                    setSelectedDay(day);
                    if (dayCharacters.length > 0) {
                      setRosterDay(day);
                    }
                  }}
                  onCharacterClick={props.onCharacterClick}
                />
              );
            })}
          </div>
        </>
      ) : (
        <div className="v2-week-list">
          {days.map(day => {
            const dayCharacters = getCharactersByDate(props.characters, day, props.dateMode);
            return (
              <div key={format(day, 'yyyy-MM-dd')} className="v2-week-row">
                <button
                  className="v2-week-date"
                  onClick={() => {
                    setSelectedDay(day);
                    if (dayCharacters.length > 0) {
                      setRosterDay(day);
                    }
                  }}
                >
                  {day.getDate()}
                  <small>周{['日', '一', '二', '三', '四', '五', '六'][day.getDay()]}</small>
                </button>
                <div className="v2-week-people">
                  {dayCharacters.length > 0 ? (
                    dayCharacters.map(c => (
                      <button key={c.id} onClick={() => props.onCharacterClick(c)} className="v2-week-person">
                        <CharacterImage character={c} />
                        <span>
                          {c.name}
                          <small>{getGameShortName(c.game)}</small>
                        </span>
                      </button>
                    ))
                  ) : (
                    <small className="v2-eyebrow">暂无纪念日</small>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="v2-calendar-bottom">
        {selectedDay && selectedCharacters.length > 0 && (
          <div className="v2-selection-pill">
            <span className="v2-selection-date">{format(selectedDay, 'M月d日')}</span>
            <span className="v2-selection-sep">·</span>
            <span className="v2-selection-count">{selectedCharacters.length}位角色</span>
            <span className="v2-selection-sep">·</span>
            <span className="v2-selection-names">
              {selectedCharacters.map(c => c.name).join('、')}
            </span>
          </div>
        )}

        <div className="v2-legend">
          <span>
            <i className="v2-event-birthday" />
            生日
          </span>
          <span>
            <i className="v2-event-release" />
            实装
          </span>
        </div>
      </div>

      {showMonthPicker && (
        <WorkspaceDialog title="选择年月" onClose={() => setShowMonthPicker(false)} className="v2-month-dialog">
          <form
            onSubmit={e => {
              e.preventDefault();
              const input = e.currentTarget.monthInput as HTMLInputElement;
              const [year, month] = input.value.split('-').map(Number);
              if (year > 0 && month >= 1 && month <= 12) {
                props.onDateChange(new Date(year, month - 1, 1));
                setShowMonthPicker(false);
              }
            }}
          >
            <label>
              跳转到
              <input
                type="month"
                name="monthInput"
                defaultValue={format(props.currentDate, 'yyyy-MM')}
                required
              />
            </label>
            <div className="v2-dialog-actions">
              <button type="button" onClick={() => setShowMonthPicker(false)}>
                取消
              </button>
              <button type="submit" className="v2-pill">
                确定
              </button>
            </div>
          </form>
        </WorkspaceDialog>
      )}

      {rosterDay && (
        <WorkspaceDialog
          title={`${format(rosterDay, 'M月d日')} · ${roster.length}位角色`}
          onClose={() => setRosterDay(null)}
        >
          <div className="v2-roster">
            {roster.length > 0 ? (
              roster.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setRosterDay(null);
                    props.onCharacterClick(c);
                  }}
                  className="v2-roster-item"
                >
                  <CharacterImage character={c} />
                  <span>
                    {c.name}
                    <small>
                      {getGameShortName(c.game)} · {calendarDateKey(c, props.dateMode) || '日期待补充'}
                    </small>
                  </span>
                </button>
              ))
            ) : (
              <p className="v2-empty">这一天暂无角色纪念日。</p>
            )}
          </div>
        </WorkspaceDialog>
      )}
    </section>
  );
}
