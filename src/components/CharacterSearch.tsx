import { useId, useMemo, useState } from 'react';
import type { Character } from '../types';
import { formatBirthday, getGameName } from '../utils/calendar.ts';
import { searchCharacters } from '../utils/characterSearch.ts';

interface CharacterSearchProps {
  characters: Character[];
  favoriteCharacterIds: string[];
  onSelect: (character: Character) => void;
}

const TEXT = {
  label: '\u641c\u7d22',
  placeholder: '\u641c\u7d22\u89d2\u8272\u3001\u6e38\u620f\u3001\u751f\u65e5...',
  empty: '\u6ca1\u6709\u5339\u914d\u89d2\u8272',
  favoriteMark: '\u2605',
  separator: ' \u00b7 ',
};

const CharacterSearch = ({ characters, favoriteCharacterIds, onSelect }: CharacterSearchProps) => {
  const inputId = useId();
  const listboxId = `${inputId}-results`;
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => searchCharacters(query, characters), [query, characters]);
  const showPanel = isOpen && query.trim().length > 0;

  const selectCharacter = (character: Character) => {
    onSelect(character);
    setQuery('');
    setActiveIndex(0);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showPanel && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      setIsOpen(true);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(index => Math.min(index + 1, Math.max(results.length - 1, 0)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(index => Math.max(index - 1, 0));
      return;
    }

    if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault();
      selectCharacter(results[activeIndex].character);
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="character-search">
      <label className="character-search-label" htmlFor={inputId}>{TEXT.label}</label>
      <div className="character-search-box">
        <input
          id={inputId}
          className="character-search-input"
          type="search"
          value={query}
          placeholder={TEXT.placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-activedescendant={showPanel && results[activeIndex] ? `${listboxId}-${activeIndex}` : undefined}
          onChange={event => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />

        {showPanel && (
          <div className="character-search-results" id={listboxId} role="listbox">
            {results.length === 0 ? (
              <div className="character-search-empty">{TEXT.empty}</div>
            ) : results.map((result, index) => {
              const character = result.character;
              const isFavorite = favoriteCharacterIds.includes(character.id);

              return (
                <button
                  key={character.id}
                  id={`${listboxId}-${index}`}
                  className={`character-search-result ${index === activeIndex ? 'active' : ''}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectCharacter(character)}
                >
                  <span className="search-result-avatar">
                    {character.avatar ? (
                      <img src={character.avatar} alt="" loading="lazy" />
                    ) : (
                      <span>{character.name[0]}</span>
                    )}
                  </span>
                  <span className="search-result-main">
                    <span className="search-result-name">
                      {isFavorite && <span className="search-result-favorite">{TEXT.favoriteMark}</span>}
                      {character.name}
                      {character.nameEn && <span>{character.nameEn}</span>}
                    </span>
                    <span className="search-result-meta">
                      {getGameName(character.game)}{TEXT.separator}{formatBirthday(character.birthday)}
                    </span>
                    <span className="search-result-tags">
                      {[character.element, character.weapon, character.region].filter(Boolean).join(TEXT.separator)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterSearch;