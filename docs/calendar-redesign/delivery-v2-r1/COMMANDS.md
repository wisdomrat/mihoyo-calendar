# Repeatable Commands

All commands run from project root: `D:\work\coding\mihoyo-calendar`

## Build

```bash
npm run build
```

Outputs to `dist/` directory.

## Development Server

```bash
npm run dev
```

Access V2 workspace at: http://localhost:5173/mihoyo-calendar/?ui=v2

## Lint

```bash
npm run lint
```

## Test

```bash
npm test
```

## Verification

### Capture Screenshots and Geometry

```bash
node playwright-verify.js
```

Generates:
- `docs/calendar-redesign/delivery-v2-r1/screenshots/01-sumeru-desktop.png`
- `docs/calendar-redesign/delivery-v2-r1/screenshots/02-neutral-same-data.png`
- `docs/calendar-redesign/delivery-v2-r1/screenshots/06-mobile-furina.png`
- `docs/calendar-redesign/delivery-v2-r1/screenshots/15-compact-desktop.png`
- `docs/calendar-redesign/delivery-v2-r1/geometry.json`

### Compare Geometry

```bash
node compare-geometry.js
```

Compares actual geometry against frozen reference with ±3px tolerance reporting.

### Measure Desktop Geometry

```bash
node measure-geometry.js
```

Quick check of 1440×900 desktop layout only.

## Query Parameters

- `?ui=v2` - Enable V2 workspace (required)
- `?theme=sumeru` - Force specific theme for screenshot consistency
- `?date=2024-01-15` - Set calendar to specific date

Example: http://localhost:5173/mihoyo-calendar/?ui=v2&theme=sumeru&date=2024-01-15
