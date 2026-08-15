import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Character, DateMode } from '../types';
import { getGameColor, getGameName } from '../utils/calendar';
import { collectUpcoming, spotlightOffsetLabel } from '../utils/spotlight';

interface SpotlightProps {
  characters: Character[];
  dateMode: DateMode;
  onSelect: (character: Character) => void;
}

const ROTATE_MS = 6000;

const Spotlight = ({ characters, dateMode, onSelect }: SpotlightProps) => {
  const today = useMemo(() => new Date(), []);
  const slides = useMemo(
    () => collectUpcoming(characters, dateMode, today).filter(char => char.portrait || char.avatar),
    [characters, dateMode, today],
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  // 自动轮播；悬停/聚焦时暂停，尊重减少动态偏好。
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timerRef.current = window.setInterval(() => {
      setIndex(current => (current + 1) % slides.length);
    }, ROTATE_MS);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  // 数据变化导致下标越界时，渲染期直接夹回有效值（不在 effect 里 setState）。
  const activeIndex = Math.min(index, slides.length - 1);

  return (
    <section
      className="spotlight"
      aria-label="近期生日与实装"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="spotlight-stage">
        {slides.map((char, i) => (
          <button
            key={char.id}
            type="button"
            className={`spotlight-slide game-${char.game} ${i === activeIndex ? 'active' : ''}`}
            style={{ '--spot-accent': getGameColor(char.game) } as CSSProperties}
            onClick={() => onSelect(char)}
            aria-hidden={i !== activeIndex}
            tabIndex={i === activeIndex ? 0 : -1}
          >
            <span className="spotlight-portrait" aria-hidden="true">
              {(char.portrait || char.avatar) && (
                <img src={char.portrait || char.avatar} alt="" loading="lazy" />
              )}
            </span>
            <span className="spotlight-text">
              <span className="spotlight-eyebrow">
                {getGameName(char.game)} · {spotlightOffsetLabel(char, dateMode, today)}
              </span>
              <span className="spotlight-name">{char.name}</span>
              <span className="spotlight-name-en">{char.nameEn}</span>
            </span>
          </button>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="spotlight-dots" role="tablist" aria-label="切换角色">
          {slides.map((char, i) => (
            <button
              key={char.id}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              className={`spotlight-dot ${i === activeIndex ? 'active' : ''}`}
              style={i === activeIndex ? { background: getGameColor(char.game) } : undefined}
              onClick={() => setIndex(i)}
              aria-label={char.name}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Spotlight;
