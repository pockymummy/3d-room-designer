# Room Designer Test Plan

## Application Overview

A single-page 3D room viewer (Three.js canvas) with a small panel of two in-page colour pickers (react-colorful), "Wall" and "Floor", each with a picker area, a hue bar and a hex box. Confirming a colour (end of a drag, Enter or blur in the hex box) recolours the walls or floor in the 3D scene. The camera can be orbited by dragging on the canvas, and the canvas fills the viewport. These scenarios pin today's behaviour before the architecture is refactored.

Notes for all scenarios:
- Colours are changed by typing in the hex box (`getByLabel('Wall hex').fill('#rrggbb')` then Enter) or by dragging the picker (`getByRole('group', { name: 'Wall color' })`, sliders "Color" and "Hue"). The earlier native `<input type="color">` popup could not be automated, which is why it was replaced.
- The scene is lit and shaded, so assertions count dominant-channel pixels with tolerance instead of exact colours.
- Pixel measurements exclude the left 320px, where the colour panel overlays the canvas.

## Test Scenarios

### 1. Page and rendering

**Seed:** `tests/seed.spec.ts`

#### 1.1. loads-without-console-errors

**File:** `tests/rendering/loads-without-console-errors.spec.ts`

**Steps:**
  1. Open the app (seed).
    - expect: a canvas element is attached to the page
    - expect: no console errors and no page errors (a missing `/favicon.ico` 404 is ignored)

#### 1.2. canvas-is-not-blank

**File:** `tests/rendering/canvas-is-not-blank.spec.ts`

**Steps:**
  1. Open the app (seed).
  2. Capture the canvas area to the right of the colour panel.
    - expect: the capture contains more than one distinct colour

#### 1.3. canvas-follows-viewport-size

**File:** `tests/rendering/canvas-follows-viewport-size.spec.ts`

**Steps:**
  1. Open the app (seed).
  2. Resize the viewport to 900x600.
    - expect: the canvas bounding box is 900x600

### 2. Colour inputs

**Seed:** `tests/seed.spec.ts`

#### 2.1. wall-color-input-recolors-walls

**File:** `tests/colors/wall-color-input-recolors-walls.spec.ts`

**Steps:**
  1. Open the app (seed) and count blue-dominant pixels in the canvas area.
  2. Fill the "Wall hex" input with `#0000ff` and press Enter.
    - expect: the "Wall hex" input has value `#0000ff`
    - expect: blue-dominant pixels increase by more than 5000

#### 2.2. floor-color-input-recolors-floor

**File:** `tests/colors/floor-color-input-recolors-floor.spec.ts`

**Steps:**
  1. Open the app (seed) and count green-dominant pixels in the canvas area.
  2. Fill the "Floor hex" input with `#00ff00` and press Enter.
    - expect: the "Floor hex" input has value `#00ff00`
    - expect: green-dominant pixels increase by more than 300

#### 2.3. wall-and-floor-colors-are-independent

**File:** `tests/colors/wall-and-floor-colors-are-independent.spec.ts`

**Steps:**
  1. Open the app (seed).
  2. Fill "Wall hex" with `#0000ff` and press Enter, then fill "Floor hex" with `#00ff00` and press Enter.
    - expect: blue-dominant pixels are still above 5000 (floor change did not undo the wall change)
    - expect: green-dominant pixels are above 300

#### 2.4. dragging-the-picker-recolors-walls

**File:** `tests/colors/dragging-the-picker-recolors-walls.spec.ts`

**Steps:**
  1. Open the app (seed) and count blue-dominant pixels in the canvas area.
  2. Drag in the Wall picker's Color square to its top-right corner.
  3. Drag along the Wall picker's Hue bar to two thirds across (blue).
    - expect: the "Wall hex" value changed
    - expect: blue-dominant pixels increase by more than 5000

### 3. Camera

**Seed:** `tests/seed.spec.ts`

#### 3.1. orbit-drag-changes-the-view

**File:** `tests/camera/orbit-drag-changes-the-view.spec.ts`

**Steps:**
  1. Open the app (seed) and capture the canvas area.
  2. Drag the mouse across the canvas from the centre.
    - expect: a new capture differs from the first

### 4. Undo and redo (not implemented yet; tests are `fixme` until the feature is wired)

**Seed:** `tests/seed.spec.ts`

#### 4.1. undo-restores-wall-color

**File:** `tests/undo/undo-restores-wall-color.spec.ts`

**Steps:**
  1. Open the app (seed) and count blue-dominant pixels in the canvas area.
  2. Fill the "Wall hex" input with `#0000ff` and press Enter.
    - expect: blue-dominant pixels increase by more than 5000
  3. Press Ctrl+Z.
    - expect: blue-dominant pixels return to within 500 of the original
