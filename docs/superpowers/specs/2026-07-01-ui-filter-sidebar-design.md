# UI Filter Sidebar Design

## Context

The current header carries too many responsibilities: game selection, display mode, week start, portrait background toggle, add/export/sync actions, sync progress, and all advanced filters. On desktop this wraps into a dense multi-row header. On mobile the same content stacks vertically, which reduces calendar visibility and can cause filter options to feel incomplete or hard to scan.

The confirmed direction is option C from the visual companion: move filtering out of the top header.

## Goals

- Make the top area lighter and less crowded.
- Ensure filter options can be fully displayed and scanned.
- Keep game-scoped secondary filters, because different games use different fields.
- Preserve existing calendar behavior, display modes, week-start setting, portrait background setting, sync, export, and add/edit flows.
- Keep data-source fields hidden from visible UI.

## Non-Goals

- Redesign the calendar grid itself beyond the layout space needed for the new sidebar.
- Change character data semantics or sync behavior.
- Add new filter categories beyond the existing game, element, rarity, weapon, and region filters.
- Add a UI framework dependency.

## Desktop Layout

Desktop uses a two-column app layout below the header:

- Left filter sidebar, approximately 260-280px wide.
- Right calendar content, filling the remaining width.
- Sidebar can collapse to a narrow icon rail so users can recover horizontal space.
- Header remains full width, but only keeps global actions and view settings.

The sidebar contains:

- Game selector tabs or stacked game buttons.
- Filters scoped to the selected game: element, rarity, weapon, and region.
- A missing-info checkbox.
- Active filter summary.
- Clear filters action.

Only the currently selected game filter set is shown at one time. This avoids mixing Genshin regions, Star Rail paths, ZZZ specialties, and Honkai3 fields in one dense list.

## Mobile Layout

Mobile keeps the header compact:

- Title.
- Calendar view controls.
- Add/export/sync actions.
- A filter button with active filter count or summary.

Detailed filters open in a bottom sheet:

- Sheet can scroll independently.
- Game tabs appear at the top of the sheet.
- Current game's scoped filters appear below.
- Clear and apply/close actions sit at the bottom.

The bottom sheet avoids placing all filter tags above the calendar, so the calendar remains visible after page load.

## Component Structure

Refactor `Header` so it is no longer responsible for rendering all advanced filter controls.

Proposed components:

- `Header`: title, global controls, sync progress, and mobile filter entry button.
- `FilterSidebar`: desktop sidebar and collapsed state.
- `FilterBottomSheet`: mobile filter panel.
- `GameScopedFilters`: shared filter content used by sidebar and sheet.

`GameScopedFilters` receives existing `filters`, `filterOptionsByGame`, and `onFiltersChange` props. It should reuse current filter update behavior instead of creating a parallel filter state.

## State And Data Flow

Keep filter state in `useCharacters`.

New UI-only state can live in `App`:

- `isFilterSidebarCollapsed`
- `isMobileFilterOpen`
- `activeFilterGame`

`activeFilterGame` defaults to the first selected game. If that game is deselected, it moves to the next selected game.

The filtered character list continues to come from `useCharacters`; no new data derivation path is introduced.

## Responsive Behavior

- At desktop widths, show the sidebar and hide the mobile filter button/sheet.
- At mobile widths, hide the sidebar and show the filter button/sheet.
- Calendar layout should use the remaining available width without horizontal overflow.
- Text labels in controls must wrap or truncate safely; no clipped visible text inside buttons.

## Accessibility And Interaction

- Filter button opens the mobile sheet and has a clear accessible label.
- Bottom sheet can close via close button and overlay click.
- Collapsed sidebar button has a label/title.
- Active filters are indicated visually and through button state classes.

## Testing And Verification

Automated tests should cover:

- Shared scoped filter rendering does not mix options across games.
- Clear filters still resets all game filter groups.
- Active filter count/summary reflects selected scoped filters.

Manual/browser verification should cover:

- Desktop header no longer wraps into a crowded block.
- Desktop sidebar displays all options for the active game.
- Sidebar collapsed mode does not break calendar width.
- Mobile initial view keeps calendar visible.
- Mobile bottom sheet opens, scrolls, applies filters, clears filters, and closes.
- No visible source/debug fields appear in character details.