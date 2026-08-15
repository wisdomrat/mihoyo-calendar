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
  releaseDate?: string; // YYYY-MM-DD format, first playable release
  avatar?: string;
  portrait?: string;
  // 可选的动态立绘资源（绝区零 Spine）。stem 用于拼出 skel/atlas 地址。
  motion?: { type: 'spine'; stem: string };
  rarity?: number;
  element?: string;
  weapon?: string;
  region?: string;
  source: string;
  updatedAt: string;
}

export type ViewMode = 'month' | 'week';

// birthday = 角色生日; release = 首次实装/上线日期（星穹铁道无官方生日，恒用实装）
export type DateMode = 'birthday' | 'release';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  characters: Character[];
}
