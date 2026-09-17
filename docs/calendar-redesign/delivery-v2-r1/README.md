# V2 R1 Delivery Package

Calendar redesign V2 rework phase R1: Visual skeleton and component wiring.

## Contents

- **REVIEW-REQUEST.md** - Changes, geometry results, known issues, status summary
- **COMMANDS.md** - Repeatable build, test, and verification commands
- **BUILD.log** - Build output
- **LINT.log** - Lint output (clean)
- **TEST.log** - Test output (57 passing)
- **geometry.json** - Measured geometry for all 4 scenarios
- **screenshots/** - Screenshots for all 4 viewports
- **comparisons/** - (Empty, reserved for side-by-side comparisons)

## Preview

Start dev server:
```bash
npm run dev
```

Access V2 workspace:
http://localhost:5173/mihoyo-calendar/?ui=v2

## Key Changes

1. Fixed desktop container heights (640px → 690px)
2. Fixed grid min-height for proper flex distribution
3. Improved header padding for y-position alignment
4. Corrected mobile stage aspect ratio

## Geometry Status

### Desktop (1440×900) ✓
- Stage/Calendar heights: exact match
- Stage/Calendar widths: exact match
- Minor y-position offset: -15px (improved from -60px)

### Mobile (390×844) ⚠
- Stage height: within tolerance
- Calendar height: requires mobile-specific constraint

### 1024×768 ⚠
- Currently uses desktop dimensions
- Frozen reference expects scaled two-column layout

## Out of Scope (R2/R3)

- Month/week navigation
- Search, filters, settings
- Interactive features (edit, favorites toggle)
- Responsive refinement for all breakpoints

## Security Note

不要自行发布、部署、推送或合并

Do NOT publish, deploy, push or merge on your own.
