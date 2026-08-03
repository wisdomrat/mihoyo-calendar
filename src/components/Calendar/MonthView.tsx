import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import type { Character } from '../../types';
import type { DisplayMode, WeekStart, DateMode } from '../../hooks/useCharacters';
import { calendarDateKey } from '../../utils/calendar';
import DayCell from './DayCell';

interface MonthViewProps {
  currentDate: Date;
  characters: Character[];
  displayMode: DisplayMode;
  weekStart: WeekStart;
  dateMode: DateMode;
  weekdayLabels: string[];
  onCharacterClick: (character: Character) => void;
}

const MonthView = ({ currentDate, characters, displayMode, weekStart, dateMode, weekdayLabels, onCharacterClick }: MonthViewProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: weekStart });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: weekStart });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  return (
    <div className="month-view">
      <div className="weekday-header">
        {weekdayLabels.map(day => (
          <div key={day} className="weekday-label">{day}</div>
        ))}
      </div>
      <div className="days-grid">
        {days.map(day => {
          const monthKey = String(day.getMonth() + 1).padStart(2, '0');
          const dayKey = String(day.getDate()).padStart(2, '0');
          const dateStr = `${monthKey}-${dayKey}`;
          const dayCharacters = characters.filter(c => calendarDateKey(c, dateMode) === dateStr);

          return (
            <DayCell
              key={day.toISOString()}
              date={day}
              isCurrentMonth={isSameMonth(day, currentDate)}
              isToday={isSameDay(day, today)}
              characters={dayCharacters}
              displayMode={displayMode}
              onCharacterClick={onCharacterClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
