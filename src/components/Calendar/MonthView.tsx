import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import type { Character } from '../../types';
import type { DisplayMode, WeekStart } from '../../hooks/useCharacters';
import DayCell from './DayCell';

interface MonthViewProps {
  currentDate: Date;
  characters: Character[];
  displayMode: DisplayMode;
  weekStart: WeekStart;
  weekdayLabels: string[];
  onCharacterClick: (character: Character) => void;
}

const MonthView = ({ currentDate, characters, displayMode, weekStart, weekdayLabels, onCharacterClick }: MonthViewProps) => {
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
          const dayCharacters = characters.filter(c => {
            const [month, dayNum] = c.birthday.split('-');
            return parseInt(month) === day.getMonth() + 1 && parseInt(dayNum) === day.getDate();
          });
          
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
