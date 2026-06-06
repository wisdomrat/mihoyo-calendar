import { useState, useRef } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Character, ViewMode } from '../../types';
import type { DisplayMode } from '../../hooks/useCharacters';
import MonthView from './MonthView';
import WeekView from './WeekView';

interface CalendarProps {
  characters: Character[];
  view: ViewMode;
  currentDate: Date;
  displayMode: DisplayMode;
  onDateChange: (date: Date) => void;
  onViewChange: (view: ViewMode) => void;
  onCharacterClick: (character: Character) => void;
}

const Calendar = ({
  characters,
  view,
  currentDate,
  displayMode,
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
    // Focus the input after a short delay to allow rendering
    setTimeout(() => {
      monthInputRef.current?.focus();
      monthInputRef.current?.showPicker?.();
    }, 10);
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // Format: "2024-01"
    if (value) {
      const [year, month] = value.split('-').map(Number);
      onDateChange(new Date(year, month - 1, 1));
    }
    setShowDatePicker(false);
  };

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
            {format(currentDate, 'yyyy年 M月', { locale: zhCN })}
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
          onCharacterClick={onCharacterClick}
        />
      ) : (
        <WeekView 
          currentDate={currentDate}
          characters={characters}
          displayMode={displayMode}
          onCharacterClick={onCharacterClick}
        />
      )}
    </div>
  );
};

export default Calendar;
