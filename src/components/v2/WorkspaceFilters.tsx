import type { ScopedFilterState, FilterOptions } from '../../utils/characterData';
import WorkspaceDialog from './WorkspaceDialog';
import GameScopedFilters from '../GameScopedFilters';

interface Props {
  selectedGames: string[];
  activeGameId: string;
  filters: ScopedFilterState;
  filterOptionsByGame: Record<string, FilterOptions>;
  showFavoritesOnly: boolean;
  onClose: () => void;
  onToggleGame: (gameId: string) => void;
  onActiveGameChange: (gameId: string) => void;
  onFiltersChange: (filters: Partial<ScopedFilterState>) => void;
  onClearFilters: () => void;
  onShowFavoritesOnlyChange: (show: boolean) => void;
}

const GAME_NAMES: Record<string, string> = {
  genshin: '原神',
  hsr: '崩坏：星穹铁道',
  zzz: '绝区零',
  honkai3: '崩坏3',
};

export default function WorkspaceFilters(props: Props) {
  return (
    <WorkspaceDialog title="筛选与设置" onClose={props.onClose} className="v2-filters-dialog">
      <section className="v2-filter-section">
        <h3>游戏选择</h3>
        <div className="v2-game-chips">
          {Object.entries(GAME_NAMES).map(([id, name]) => (
            <button
              key={id}
              aria-pressed={props.selectedGames.includes(id)}
              onClick={() => props.onToggleGame(id)}
              className="v2-chip"
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      {props.selectedGames.length > 0 && (
        <section className="v2-filter-section">
          <h3>详细筛选</h3>
          <GameScopedFilters
            selectedGames={props.selectedGames}
            filters={props.filters}
            filterOptionsByGame={props.filterOptionsByGame}
            activeGameId={props.activeGameId}
            onToggleGame={props.onToggleGame}
            onActiveGameChange={props.onActiveGameChange}
            onFiltersChange={props.onFiltersChange}
            onClearFilters={props.onClearFilters}
          />
        </section>
      )}

      <section className="v2-filter-section">
        <label className="v2-checkbox-label">
          <input
            type="checkbox"
            checked={props.filters.showMissingInfo}
            onChange={e => props.onFiltersChange({ showMissingInfo: e.target.checked })}
          />
          显示信息不完整的角色
        </label>
      </section>

      <div className="v2-dialog-actions">
        <button
          onClick={() => {
            props.onClearFilters();
            props.onClose();
          }}
        >
          清除筛选
        </button>
        <button onClick={props.onClose} className="v2-pill">
          完成
        </button>
      </div>
    </WorkspaceDialog>
  );
}
