import React from 'react';
import { format } from 'date-fns';
import type { Character } from '../../types';
import { getGameColor } from '../../utils/calendar';

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  characters: Character[];
  onCharacterClick: (character: Character) => void;
}

const DayCell: React.FC<DayCellProps> = ({ 
  date, 
  isCurrentMonth, 
  isToday, 
  characters, 
  onCharacterClick 
}) => {
  const dayNumber = format(date, 'd');

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
