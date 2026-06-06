import { format } from 'date-fns';
import type { Character } from '../../types';
import type { DisplayMode } from '../../hooks/useCharacters';

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  characters: Character[];
  displayMode: DisplayMode;
  onCharacterClick: (character: Character) => void;
}

const DayCell = ({ 
  date, 
  isCurrentMonth, 
  isToday, 
  characters, 
  displayMode,
  onCharacterClick 
}: DayCellProps) => {
  const dayNumber = format(date, 'd');

  if (displayMode === 'compact') {
    return (
      <div 
        className={`day-cell compact ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
      >
        <div className="day-number">{dayNumber}</div>
        {characters.length > 0 && (
          <div className="day-characters compact">
            {characters.slice(0, 4).map(character => (
              <div
                key={character.id}
                className="day-character-dot"
                onClick={(e) => {
                  e.stopPropagation();
                  onCharacterClick(character);
                }}
                title={`${character.name} - ${getGameName(character.game)}`}
                style={{ backgroundColor: getGameColor(character.game) }}
              />
            ))}
            {characters.length > 4 && (
              <span className="more-dots">+{characters.length - 4}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  if (displayMode === 'card') {
    return (
      <div 
        className={`day-cell card-mode ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
      >
        <div className="day-number">{dayNumber}</div>
        <div className="day-characters card">
          {characters.map(character => (
            <div
              key={character.id}
              className="day-character-card"
              onClick={(e) => {
                e.stopPropagation();
                onCharacterClick(character);
              }}
              title={`${character.name} - ${getGameName(character.game)}`}
              style={{ borderColor: getGameColor(character.game) }}
            >
              <div className="card-avatar-wrapper">
                {character.avatar ? (
                  <img 
                    src={character.avatar} 
                    alt={character.name}
                    className="card-avatar"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.classList.add('avatar-fallback');
                      target.parentElement!.textContent = character.name[0];
                    }}
                  />
                ) : (
                  <span className="card-initial">{character.name[0]}</span>
                )}
              </div>
              <span className="card-name">{character.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default avatar mode
  return (
    <div 
      className={`day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${characters.length > 0 ? 'has-characters' : ''}`}
    >
      <div className="day-number">{dayNumber}</div>
      <div className="day-characters">
        {characters.slice(0, 3).map(character => (
          <div
            key={character.id}
            className="day-character"
            onClick={(e) => {
              e.stopPropagation();
              onCharacterClick(character);
            }}
            title={`${character.name} - ${getGameName(character.game)}`}
            style={{ borderColor: getGameColor(character.game) }}
          >
            {character.avatar ? (
              <img 
                src={character.avatar} 
                alt={character.name}
                className="day-character-avatar"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.textContent = character.name[0];
                  target.parentElement!.classList.add('avatar-fallback');
                }}
              />
            ) : (
              <span className="day-character-initial">{character.name[0]}</span>
            )}
          </div>
        ))}
        {characters.length > 3 && (
          <div className="more-characters">+{characters.length - 3}</div>
        )}
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

export default DayCell;
