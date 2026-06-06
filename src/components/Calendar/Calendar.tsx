import { useState, useRef } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import type { Character, ViewMode } from '../../types';
import type { DisplayMode, WeekStart } from '../../hooks/useCharacters';
import MonthView from './MonthView';
import WeekView from './WeekView';

interface CalendarProps {
  characters: Character[];
  view: ViewMode;
  currentDate: Date;
  displayMode: DisplayMode;
  weekStart: WeekStart;
  onDateChange: (date: Date) => void;
  onViewChange: (view: ViewMode) => void;
  onCharacterClick: (character: Character) => void;
}

const Calendar = ({
  characters,
  view,
  currentDate,
  displayMode,
  weekStart,
  onDateChange,
  onViewChange,
  onCharacterClick,
}: CalendarProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const monthInputRef = useRef<HTMLInputElement>(null);

  const handlePrev = () => {
    if (view === 'month') {
      onDateChange(subMonths(currentDate, 1));
    } else {
      onDateChange(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      onDateChange(addMonths(currentDate, 1));
    } else {
      onDateChange(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleTitleClick = () => {
    setShowDatePicker(true);
    setTimeout(() => {
      monthInputRef.current?.focus();
      monthInputRef.current?.showPicker?.();
    }, 10);
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const [year, month] = value.split('-').map(Number);
      onDateChange(new Date(year, month - 1, 1));
    }
    setShowDatePicker(false);
  };

  const weekdayLabels = weekStart === 1
    ? ['一', '二', '三', '四', '五', '六', '日']
    : ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="nav-btn" onClick={handlePrev}>◀</button>
          <button className="nav-btn today-btn" onClick={handleToday}>今天</button>
          <button className="nav-btn" onClick={handleNext}>▶</button>
        </div>
        <div className="calendar-title-wrapper">
          <h2 
            className="calendar-title clickable" 
            onClick={handleTitleClick}
            title="点击选择年月"
          >
            {format(currentDate, 'yyyy年 M月')}
          </h2>
          {showDatePicker && (
            <div className="date-picker-popup">
              <input
                ref={monthInputRef}
                type="month"
                className="month-picker"
                value={format(currentDate, 'yyyy-MM')}
                onChange={handleDateSelect}
                onBlur={() => setShowDatePicker(false)}
              />
            </div>
          )}
        </div>
        <div className="view-switcher">
          <button 
            className={`view-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => onViewChange('month')}
          >
            月
          </button>
          <button 
            className={`view-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => onViewChange('week')}
          >
            周
          </button>
        </div>
      </div>

      {view === 'month' ? (
        <MonthView 
          currentDate={currentDate}
          characters={characters}
          displayMode={displayMode}
          weekStart={weekStart}
          weekdayLabels={weekdayLabels}
          onCharacterClick={onCharacterClick}
        />
      ) : (
        <WeekView 
          currentDate={currentDate}
          characters={characters}
          displayMode={displayMode}
          weekStart={weekStart}
          weekdayLabels={weekdayLabels}
          onCharacterClick={onCharacterClick}
        />
      )}
    </div>
  );
};

export default Calendar;
