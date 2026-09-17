# V2 Implementation Technical Details

## Profile Resolution

```typescript
const profiles = {
  neutral: ['#080b17', '#17182d', '#27213b', '125,117,208', '17,20,38', '158,160,194', '9,12,24', '#c3b7da'],
  sumeru: ['#07171a', '#102529', '#27213b', '81,232,202', '14,32,35', '131,243,215', '7,18,20', '#a2e7d0'],
  fontaine: ['#0c1420', '#172631', '#312538', '115,168,218', '17,28,41', '151,187,215', '9,17,30', '#b5d7e9'],
  genshin: ['#10141e', '#182229', '#2c2737', '121,171,180', '19,27,35', '161,196,199', '12,18,26', '#b0d7cc'],
  hsr: ['#101220', '#242132', '#2f2438', '154,131,203', '25,24,39', '182,162,216', '17,15,27', '#d0b7de'],
  zzz: ['#11191c', '#24272b', '#302437', '163,122,144', '27,29,34', '188,163,170', '18,20,26', '#e7c1bc'],
  honkai3: ['#19131c', '#29202b', '#292b38', '196,126,163', '32,23,33', '211,164,192', '23,14,24', '#ecc0d6'],
};
```

## CSS Token Mapping

Profile array maps to CSS custom properties:
- `[0]` → `--v2-start` (gradient start)
- `[1]` → `--v2-mid` (gradient middle)
- `[2]` → `--v2-end` (gradient end)
- `[3]` → `--v2-halo` (RGB triplet for glow)
- `[4]` → `--v2-surface` (RGB triplet for UI chrome)
- `[5]` → `--v2-edge` (RGB triplet for text/borders)
- `[6]` → `--v2-deep` (RGB triplet for stage depth)
- `[7]` → `--v2-accent` (hex color for highlights)

## Layout Dimensions

Desktop:
- Stage width: 470px
- Calendar width: 778px
- Gutter: 48px
- Max content width: 1344px (centered)

Mobile (<1024px):
- Stage height: min(60vh, 500px)
- Calendar: full width below stage
- Gutter: 24px

## Component Hierarchy

```
CalendarWorkspaceV2
├── v2-scene-field (radial gradient overlay)
├── v2-header
│   ├── v2-brand (title + subtitle)
│   ├── v2-primary-nav (calendar/favorites tabs)
│   └── v2-header-actions (search + filter buttons)
├── v2-body
│   ├── v2-stage
│   │   ├── v2-stage-art (portrait image)
│   │   ├── v2-stage-shade (darkening gradient)
│   │   ├── v2-stage-hit (click area)
│   │   ├── v2-stage-heading (context label)
│   │   └── v2-stage-caption (character metadata)
│   └── v2-calendar
│       ├── v2-calendar-heading (month title + nav)
│       ├── v2-toolbar (view switch + filter summary)
│       ├── v2-weekdays (day name headers)
│       ├── v2-month-grid
│       │   └── v2-day (multiple)
│       │       ├── v2-day-number
│       │       ├── v2-event-marks (birthday/release)
│       │       └── v2-portrait-lane (avatar grid)
│       └── v2-calendar-bottom (selection + legend)
└── Dialogs (conditional)
    ├── WorkspaceFilters
    ├── WorkspaceDialog (search)
    ├── WorkspaceDialog (detail)
    └── WorkspaceDialog (roster)
```

## State Management

All state shared from App.tsx via props:
- `characters` — filtered character list
- `allCharacters` — complete dataset
- `selectedGames` — active game filters
- `dateMode` — birthday vs release date
- `favoriteCharacterIds` — favorite character IDs
- `showFavoritesOnly` — favorites filter toggle
- `filters` — scoped filter state
- `filterOptionsByGame` — available filter options
- `currentDate` — calendar month/week
- `view` — month vs week view
- `selectedCharacter` — character for detail modal

Local state in CalendarWorkspaceV2:
- `stageCharacter` — currently spotlighted character
- `stageExpanded` — stage expansion state
- `showFilters` — filters dialog open
- `showDetail` — detail modal open
- `showRoster` — day roster dialog open
- `showSearch` — search dialog open
- `selectedDate` — clicked calendar date
- `activeFilterGame` — active game tab in filters

## Theme Profile Logic

```typescript
export function workspaceProfile(
  character: Character | undefined,
  theme: ThemeId,
  forced?: string | null
) {
  const affiliation = character ? resolveAffiliation(character) : null;
  let key = theme === 'neutral' 
    ? 'neutral' 
    : affiliation?.id === 'genshin-sumeru' 
    ? 'sumeru' 
    : affiliation?.id === 'genshin-fontaine' 
    ? 'fontaine' 
    : theme;
  
  if (forced && Object.hasOwn(profiles, forced)) key = forced;
  
  const values = profiles[key as keyof typeof profiles] || profiles.neutral;
  const names = ['start', 'mid', 'end', 'halo', 'surface', 'edge', 'deep', 'accent'];
  
  return {
    key,
    affiliation,
    style: Object.fromEntries(
      names.map((name, i) => [`--v2-${name}`, values[i]])
    ) as CSSProperties,
  };
}
```

## Character Image Fallback

Priority order for portraits:
1. `character.portrait` (if not ui-avatars.com)
2. `character.avatar` (fallback)
3. Letter placeholder (ui-avatars.com with name initial)

Priority order for avatars:
1. `character.avatar` (if not ui-avatars.com)
2. `character.portrait` (fallback)
3. Letter placeholder

## Calendar Grid Logic

Days array construction:
1. Previous month tail (pad to start on correct weekday)
2. Current month days (1 to daysInMonth)
3. Next month head (pad to 42 cells = 6 rows × 7 days)

Day cell data:
- `date: Date` — absolute date
- `isCurrentMonth: boolean` — styling flag
- Characters: resolved via `getCharactersByDate()`
- Event markers: check for birthday/release matches

## Dialog Management

Uses native `<dialog>` element:
- `showModal()` for modal behavior
- Click backdrop to close (event.target === dialog element)
- Focus trap and restoration handled by browser
- ESC key closes automatically
