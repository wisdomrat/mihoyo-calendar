import { format, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Character, ViewMode } from '../../types';
import MonthView from './MonthView';
import WeekView from './WeekView';

interface CalendarProps {
  characters: Character[];
  view: ViewMode;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onViewChange: (view: ViewMode) => void;
  onCharacterClick: (character: Character) => void;
}

const Calendar = ({
  characters,
  view,
  currentDate,
  onDateChange,
  onViewChange,
  onCharacterClick,
}: CalendarProps) => {

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

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="nav-btn" onClick={handlePrev}>◀</button>
          <button className="nav-btn today-btn" onClick={handleToday}>今天</button>
          <button className="nav-btn" onClick={handleNext}>▶</button>
        </div>
        <h2 className="calendar-title">
          {format(currentDate, 'yyyy年 M月', { locale: zhCN })}
        </h2>
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
          onCharacterClick={onCharacterClick}
        />
      ) : (
        <WeekView 
          currentDate={currentDate}
          characters={characters}
          onCharacterClick={onCharacterClick}
        />
      )}
    </div>
  );
};

export default Calendar;
