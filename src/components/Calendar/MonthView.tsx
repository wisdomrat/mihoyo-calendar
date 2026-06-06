import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Character } from '../../types';
import type { DisplayMode } from '../../hooks/useCharacters';
import DayCell from './DayCell';

interface MonthViewProps {
  currentDate: Date;
  characters: Character[];
  displayMode: DisplayMode;
  onCharacterClick: (character: Character) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const MonthView = ({ currentDate, characters, displayMode, onCharacterClick }: MonthViewProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { locale: zhCN });
  const calendarEnd = endOfWeek(monthEnd, { locale: zhCN });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  return (
    <div className="month-view">
      <div className="weekday-header">
        {WEEKDAYS.map(day => (
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
