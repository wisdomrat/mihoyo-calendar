# Geometry Analysis - R1 Delivery

## Critical Finding: Layout is Stacking on All Viewports

All three test scenarios show **vertical stacking** instead of the expected side-by-side layout on desktop. This indicates the mobile breakpoint is triggering at all viewport widths.

### Root Cause

The CSS breakpoint is set to `@media (max-width: 1000px)` which causes:
- **1440×900**: Below 1000px height, but this is a **width-based** media query, so it should NOT stack
- **1024×768**: Width 1024px > 1000px, should be side-by-side but IS stacking
- **390×844**: Width 390px < 1000px, should stack (correct)

The actual measurements show:
- Stage and calendar have **same x-coordinate** (522.5, 317.5, 25.8)
- Calendar y-position is **below** stage (683, 682, 558.7)
- Both elements have **equal width** (395, 389, 338.3)

This is the stacked layout pattern, not the side-by-side 470px + 778px pattern.

### Measurement Analysis

#### 01-sumeru-desktop (1440×900) - Should be Side-by-Side

| Element | Expected | Actual | Delta | Status |
|---------|----------|--------|-------|--------|
| Stage | (72, 146, 470, 690) | (522.5, 43, 395, 640) | Δx=+450, Δy=-103, Δw=-75, Δh=-50 | ❌ FAIL |
| Calendar | (590, 146, 778, 690) | (522.5, 683, 395, 640) | Δx=-68, Δy=+537, Δw=-383, Δh=-50 | ❌ FAIL |
| Grid | (620, 315, 718, 434) | (546.5, 888, 347, 334) | Δx=-74, Δy=+573, Δw=-371, Δh=-100 | ❌ FAIL |

**Issue**: Same x-coordinate (522.5) means vertical stack, not horizontal layout.

#### 06-mobile-furina (390×844) - Should Stack (Correct Behavior)

| Element | Expected | Actual | Delta | Status |
|---------|----------|--------|-------|--------|
| Stage | (14, 87, 362, 228) | (25.8, 98, 338.3, 460.7) | Δx=+12, Δy=+11, Δw=-24, Δh=+233 | ❌ FAIL |
| Calendar | (14, 328, 362, 488) | (25.8, 558.7, 338.3, 500) | Δx=+12, Δy=+231, Δw=-24, Δh=+12 | ❌ FAIL |
| Grid | (27, 463, 336, 284) | (49.8, 886.3, 290.3, 43.5) | Δx=+23, Δy=+423, Δw=-46, Δh=-241 | ❌ FAIL |

**Issue**: Stage height is 460.7px (should be 228px). Grid height is only 43.5px (should be 284px). The calendar internal layout is severely compressed.

#### 15-1024-desktop (1024×768) - Should be Side-by-Side

| Element | Expected | Actual | Delta | Status |
|---------|----------|--------|-------|--------|
| Stage | (40, 146, 319.89, 650) | (317.5, 42, 389, 640) | Δx=+278, Δy=-104, Δw=+69, Δh=-10 | ❌ FAIL |
| Calendar | (389.89, 146, 594.11, 650) | (317.5, 682, 389, 640) | Δx=-72, Δy=+536, Δw=-205, Δh=-10 | ❌ FAIL |
| Grid | (412.89, 312, 548.11, 400) | (341.5, 866, 341, 360) | Δx=-71, Δy=+554, Δw=-207, Δh=-40 | ❌ FAIL |

**Issue**: Same x-coordinate (317.5) means vertical stack. Width 1024px should trigger side-by-side layout.

## Diagnosis

### Problem 1: Desktop Viewports Stacking
The frozen reference shows 1440×900 and 1024×768 should have **side-by-side** layout. Current implementation is stacking them vertically.

**Likely cause**: The dev server or component is forcing mobile layout regardless of viewport width.

### Problem 2: Mobile Grid Height Collapsed
The 390×844 grid is only 43.5px tall (should be 284px). This is a **6-row calendar grid compressed to almost nothing**.

**Likely cause**: 
- Flex layout not giving grid the remaining space
- min-height not working
- Calendar internal spacing consuming too much vertical space

### Problem 3: Stage Height Wrong on Mobile
Mobile stage is 460.7px (should be 228px). Using aspect-ratio 470/640 at width 338.3px should give height ~460px, which matches actual. But reference says 228px.

**Likely cause**: Frozen reference may be using a different stage sizing strategy on mobile.

## Required Fixes

1. **Verify desktop layout triggers correctly** - Check if CSS Grid is being applied on 1440×900 and 1024×768
2. **Fix mobile calendar flex layout** - Grid must expand to fill available vertical space
3. **Re-examine mobile stage height** - Reconcile aspect-ratio vs fixed height expectations
4. **Check header height** - y-coordinates suggest header may be taller than expected

## Next Actions

1. Inspect actual DOM in browser at 1440×900 to see if `.v2-body` has `grid-template-columns: repeat(2, minmax(0, ...))`
2. Check if media query is being overridden or misread
3. Measure actual header height and compare to frozen reference
4. Fix calendar flex layout to properly allocate grid height on mobile
