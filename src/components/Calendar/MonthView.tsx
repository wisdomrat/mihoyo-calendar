import React from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Character } from '../../types';
import { getCharactersByDate } from '../../utils/calendar';
import DayCell from './DayCell';

interface MonthViewProps {
  currentDate: Date;
  characters: Character[];
  onCharacterClick: (character: Character) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const MonthView: React.FC<MonthViewProps> = ({ currentDate, characters, onCharacterClick }) => {
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
          const dayCharacters = getCharactersByDate(characters, day);
          return (
            <DayCell
              key={day.toISOString()}
              date={day}
              isCurrentMonth={isSameMonth(day, currentDate)}
              isToday={isSameDay(day, today)}
              characters={dayCharacters}
              onCharacterClick={onCharacterClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
