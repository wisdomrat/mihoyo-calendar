# V2 Quick Start Guide

## 1. Access V2 Interface

Dev server is already running. Open browser:

**V2 Interface**: http://localhost:5173/mihoyo-calendar/?ui=v2

**V1 Interface** (default): http://localhost:5173/mihoyo-calendar/

---

## 2. Visual Overview

### Desktop Layout (>1024px)
```
┌─────────────────────────────────────────────────────┐
│ Header: Brand | Nav | Search | Filters              │
├──────────────┬──────────────────────────────────────┤
│              │  Calendar                            │
│   Stage      │  ┌─────────────────────────────────┐ │
│  (Portrait)  │  │ Month Navigation                │ │
│              │  ├─────────────────────────────────┤ │
│   Character  │  │ View Toggle: Month | Week       │ │
│   Metadata   │  ├─────────────────────────────────┤ │
│              │  │                                 │ │
│              │  │  S  M  T  W  T  F  S            │ │
│              │  │ ┌───┬───┬───┬───┬───┬───┬───┐   │ │
│              │  │ │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │   │ │
│              │  │ │👤│👤│   │👤│   │👤│   │       │ │
│              │  │ └───┴───┴───┴───┴───┴───┴───┘   │ │
│              │  │  (day cells with avatars)       │ │
│              │  │                                 │ │
└──────────────┴──────────────────────────────────────┘
```

### Mobile Layout (<1024px)
```
┌─────────────────────────┐
│ Header (compact)        │
├─────────────────────────┤
│                         │
│   Stage (stacked)       │
│   Portrait + Metadata   │
│                         │
├─────────────────────────┤
│                         │
│   Calendar (full-width) │
│   Grid below stage      │
│                         │
└─────────────────────────┘
```

---

## 3. Key Interactions

### Navigation
- **Prev/Next Month**: Arrow buttons in calendar header
- **Today**: "今天" button jumps to current date
- **Month/Week Toggle**: "月" / "周" buttons switch view
- **Search**: 🔍 icon in header → search dialog

### Character Actions
- **Click Stage**: Open character detail modal
- **Click Day (1 char)**: Open detail modal
- **Click Day (3+ chars)**: Open roster dialog
- **Click Avatar**: Direct to character detail
- **Click Search Result**: Navigate to month + open detail

### Modals
- **Detail Modal**: Portrait, metadata, favorite/edit/export buttons
- **Roster Dialog**: List all characters for a day
- **Search Dialog**: Find character by name
- **Filters Dialog**: Game selection + element/rarity/weapon/region filters

---

## 4. Theme Profiles

V2 automatically switches themes based on character affiliation:

| Profile | Color | When Applied |
|---------|-------|--------------|
| **Neutral** | Purple-blue | Default (no character) |
| **Sumeru** | Cyan-green | Sumeru characters (e.g., Nahida, Alhaitham) |
| **Fontaine** | Blue hydro | Fontaine characters (e.g., Furina, Neuvillette) |
| **Genshin** | Teal | Other Genshin characters |
| **HSR** | Purple | Star Rail characters |
| **ZZZ** | Pink | Zenless Zone Zero characters |
| **Honkai3** | Magenta | Honkai Impact 3rd characters |

---

## 5. Testing Checklist

### Basic Flow
- [ ] Open V2 URL
- [ ] Stage displays character portrait
- [ ] Calendar grid renders (7 columns × 5-6 rows)
- [ ] Click next/prev month (navigation works)
- [ ] Click a day with characters (modal/roster opens)
- [ ] Click stage (detail modal opens)
- [ ] Search for a character (navigates to month)
- [ ] Open filters (dialog displays)
- [ ] Toggle favorites (header badge updates)

### Visual Verification
- [ ] Theme colors apply (gradient background)
- [ ] Stage portrait displays clearly
- [ ] Avatars render in day cells
- [ ] Event markers visible (birthday/release dots)
- [ ] Dialogs have rounded corners (26px desktop, 22px mobile)
- [ ] Text is readable (high contrast on dark background)

### Responsive
- [ ] Resize to mobile width (<768px): layout stacks
- [ ] Resize to tablet width (768-1024px): layout stacks
- [ ] Resize to desktop (>1024px): side-by-side layout

---

## 6. Compare with V1

Open both versions side-by-side:

**V1**: http://localhost:5173/mihoyo-calendar/
- Hero carousel + traditional calendar
- V1 header with sync button
- FilterSidebar on left (collapsible)
- Month grid in center

**V2**: http://localhost:5173/mihoyo-calendar/?ui=v2
- Stage spotlight + calendar grid
- V2 header with search/filters
- No sidebar (filters in dialog)
- Split-pane layout on desktop

---

## 7. Feature Parity

| Feature | V1 | V2 |
|---------|----|----|
| Character display | Hero carousel | Stage spotlight |
| Calendar views | Month | Month + Week toggle |
| Filters | Sidebar | Dialog |
| Search | Header slot | Dialog |
| Favorites | Toggle + counter | Toggle + counter |
| Character detail | Modal | Modal |
| Edit character | Modal form | Modal form |
| Export ICS | Header + detail | Detail only |
| Theme system | useTheme hook | Profile system |
| Responsive | Hero + sidebar | Stage + calendar stack |

---

## 8. Known Behaviors

### Image Fallback Chain
1. Try `character.portrait`
2. Fallback to `character.avatar`
3. Fallback to letter placeholder (first letter of name)

### Empty States
- **No character selected**: Stage shows neutral theme
- **Empty day**: No avatars, no event markers
- **No search results**: Empty list in dialog

### Overflow Handling
- Day cells show max 3 avatars
- 4+ characters show "+N" indicator
- Click "+N" opens roster dialog

---

## 9. Troubleshooting

**V2 not loading?**
- Check URL has `?ui=v2` parameter
- Verify dev server is running (`npm run dev`)
- Check browser console for errors

**Images not loading?**
- Check network tab for 404s
- Verify character has `portrait` or `avatar` field
- Fallback to letter placeholder is normal

**Theme not changing?**
- Click different characters to see profile switch
- Check browser console for CSS errors
- Verify `--v2-*` custom properties in DevTools

**Layout broken?**
- Check viewport width (desktop vs mobile breakpoint)
- Verify CSS loaded (check Network tab)
- Clear cache and hard reload (Ctrl+Shift+R)

---

## 10. Next Steps

### Manual Testing
1. Click through all interactions listed in section 3
2. Verify all 7 theme profiles (select characters from different games/regions)
3. Test on different screen sizes (desktop, tablet, mobile)
4. Check browser console for errors
5. Capture screenshots for documentation

### Code Review
1. Review `src/components/v2/CalendarWorkspaceV2.tsx` (main component)
2. Review `src/styles/v2/workspace.css` (visual styles)
3. Review `src/components/v2/profiles.ts` (theme system)
4. Compare V1 vs V2 implementations

### Verification
```bash
npm run build   # Should pass
npm run lint    # Should be clean
npm test        # Should show 57/57 passing
```

### Deployment (pending approval)
1. Review git status: `git status`
2. Create commit (user decision)
3. Push to remote (blocked per security constraint)

---

## Support

**Documentation**:
- Full details: `docs/calendar-redesign/delivery-v2/README.md`
- Technical specs: `docs/calendar-redesign/delivery-v2/IMPLEMENTATION.md`
- Test results: `docs/calendar-redesign/delivery-v2/VERIFICATION.md`
- Summary: `docs/calendar-redesign/delivery-v2/SUMMARY.md`

**Commands**:
```bash
npm run dev     # Start dev server
npm run build   # Build production bundle
npm run lint    # Check code quality
npm test        # Run test suite
```

**URLs**:
- V2: http://localhost:5173/mihoyo-calendar/?ui=v2
- V1: http://localhost:5173/mihoyo-calendar/
