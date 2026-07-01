export interface GameInfo {
  id: string;
  name: string;
  nameEn: string;
  color: string;
}

export interface Character {
  id: string;
  name: string;
  nameEn: string;
  game: string;
  birthday: string; // MM-DD format
  avatar?: string;
  portrait?: string;
  rarity?: number;
  element?: string;
  weapon?: string;
  region?: string;
  source: string;
  updatedAt: string;
}

export type ViewMode = 'month' | 'week';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  characters: Character[];
}
