import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns';
import type { Character } from '../../types';
import type { DisplayMode, WeekStart } from '../../hooks/useCharacters';

interface WeekViewProps {
  currentDate: Date;
  characters: Character[];
  displayMode: DisplayMode;
  weekStart: WeekStart;
  weekdayLabels: string[];
  onCharacterClick: (character: Character) => void;
}

const WeekView = ({ currentDate, characters, displayMode, weekStart, weekdayLabels, onCharacterClick }: WeekViewProps) => {
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
            <div className="week-view-weekday">{weekdayLabels[day.getDay() === 0 ? 6 : day.getDay() - 1]}日</div>
            <div className="week-view-date">{format(day, 'M/d')}</div>
          </div>
        ))}
      </div>
      <div className="week-view-grid">
        {days.map(day => {
          const dayCharacters = characters.filter(c => {
            const [month, dayNum] = c.birthday.split('-');
            return parseInt(month) === day.getMonth() + 1 && parseInt(dayNum) === day.getDate();
          });
          
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
                          <div className="week-character-game">{getGameName(character.game)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="week-no-characters">无角色生日</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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

export default WeekView;
