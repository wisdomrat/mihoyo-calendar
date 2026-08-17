import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns';
import type { Character } from '../../types';
import type { DisplayMode, WeekStart, DateMode } from '../../hooks/useCharacters';
import { calendarDateKey, getGameColor, getGameShortName } from '../../utils/calendar';

interface WeekViewProps {
  currentDate: Date;
  characters: Character[];
  displayMode: DisplayMode;
  weekStart: WeekStart;
  dateMode: DateMode;
  weekdayLabels: string[];
  onCharacterClick: (character: Character) => void;
}

const WeekView = ({ currentDate, characters, displayMode, weekStart, dateMode, weekdayLabels, onCharacterClick }: WeekViewProps) => {
  const weekStartDate = startOfWeek(currentDate, { weekStartsOn: weekStart });
  const weekEndDate = endOfWeek(currentDate, { weekStartsOn: weekStart });
  const days = eachDayOfInterval({ start: weekStartDate, end: weekEndDate });
  const today = new Date();

  return (
    <div className="week-view">
      <div className="week-view-header">
        {days.map(day => (
          <div 
            key={day.toISOString()} 
            className={`week-view-day-header ${isSameDay(day, today) ? 'today' : ''}`}
          >
            {/* weekdayLabels 的排列跟随 weekStart（周一起首 / 周日起首），
                所以下标必须减去 weekStart，不能写死周一起首。 */}
            <div className="week-view-weekday">周{weekdayLabels[(day.getDay() - weekStart + 7) % 7]}</div>
            <div className="week-view-date">{format(day, 'M/d')}</div>
          </div>
        ))}
      </div>
      <div className="week-view-grid">
        {days.map(day => {
          const monthKey = String(day.getMonth() + 1).padStart(2, '0');
          const dayKey = String(day.getDate()).padStart(2, '0');
          const dateStr = `${monthKey}-${dayKey}`;
          const dayCharacters = characters.filter(c => calendarDateKey(c, dateMode) === dateStr);
          
          return (
            <div 
              key={day.toISOString()} 
              className={`week-view-cell ${isSameDay(day, today) ? 'today' : ''}`}
            >
              <div className="week-view-cell-content">
                {dayCharacters.length > 0 ? (
                  <div className="week-characters">
                    {dayCharacters.map(character => (
                      <div
                        key={character.id}
                        className="week-character-card"
                        onClick={() => onCharacterClick(character)}
                        style={{ 
                          borderLeftColor: getGameColor(character.game),
                        }}
                      >
                        {displayMode !== 'compact' && character.avatar ? (
                          <img 
                            src={character.avatar} 
                            alt={character.name}
                            className="week-character-avatar"
                            loading="lazy"
                          />
                        ) : displayMode !== 'compact' ? (
                          <div className="week-character-avatar-placeholder">
                            {character.name[0]}
                          </div>
                        ) : null}
                        
                        <div className="week-character-info">
                          <div className="week-character-name">{character.name}</div>
                          <div className="week-character-game">{getGameShortName(character.game)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="week-no-characters">{dateMode === 'release' ? '无角色实装' : '无角色生日'}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
