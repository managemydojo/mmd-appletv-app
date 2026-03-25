# Dojo Cast Settings Screen — Design Spec

## Overview

Add a settings screen to the Dojo Cast flow, accessible from the gear icon on `DojoCastSetupScreen`. The settings control slideshow playback behavior, offline caching, screen rotation, and display app info. Settings persist via AsyncStorage until manually cleared.

## Architecture

**Approach:** Single settings screen with sidebar tab navigation. Each section is a separate component file for future API extensibility.

### File Structure

```
src/
  store/useDojoSettingsStore.ts          # Zustand + persist (AsyncStorage)
  screens/dojo/
    DojoCastSettingsScreen.tsx            # Main: header + sidebar + content panel
    settings/
      PlaybackSection.tsx                 # Auto-advance toggle + slide duration picker
      OfflineCacheSection.tsx             # Offline toggle + storage bar + clear cache
      RotationSection.tsx                 # 4 rotation buttons (90L, 90R, 180, Reset)
      AboutSection.tsx                    # Read-only info rows
```

### Files Modified

- `src/navigation/index.tsx` — Add `Settings` to `DojoStackParamList`, add screen to `DojoNavigator`
- `src/screens/dojo/DojoCastSetupScreen.tsx` — Wire `handleSettings` to `navigation.navigate('Settings')`
- `src/screens/dojo/DojoCastSlideshowScreen.tsx` — Read settings store for autoAdvance, slideDuration, rotation

## Settings Store

```typescript
// useDojoSettingsStore.ts — persisted via zustand/middleware persist + AsyncStorage
interface DojoSettingsState {
  // Playback
  autoAdvance: boolean; // default: true
  slideDuration: 10 | 20 | 30; // default: 10 (seconds)

  // Offline & Cache
  offlineMode: boolean; // default: true
  storageUsedMB: number; // default: 120 (hardcoded for now)

  // Rotation
  rotation: 0 | 90 | 180 | 270; // default: 0 (degrees clockwise)

  // Actions
  toggleAutoAdvance: () => void;
  setSlideDuration: (d: 10 | 20 | 30) => void;
  toggleOfflineMode: () => void;
  setRotation: (r: 0 | 90 | 180 | 270) => void;
  clearCache: () => void; // resets storageUsedMB to 0, sets offlineMode false
}
```

Persisted via `zustand/middleware` persist with `AsyncStorage` as storage engine. All state fields are persisted. The `clearCache` action is UI-only for now (resets display values) — real cache clearing can be wired to an API later.

## Navigation

1. Add `Settings: undefined` to `DojoStackParamList`
2. Add `<DojoStack.Screen name="Settings" component={DojoCastSettingsScreen} />` to `DojoNavigator`
3. In `DojoCastSetupScreen.handleSettings`: `navigation.navigate('Settings')`
4. Settings screen back arrow: `navigation.goBack()`

## Screen Layout — DojoCastSettingsScreen

### Header Bar

- Full-width, dark background
- Left: "Dojo Cast Setting" text (bold, white, ~h3 size)
- Right: Back arrow button (← icon) in a rounded dark square, uses `FocusableCard`
- Bottom: thin horizontal divider line (`rgba(255,255,255,0.1)`)

### Body — Two-Column Split

- **Left sidebar (~33%):** Pure black background (`#000000`)

  - 4 tab buttons stacked vertically, centered horizontally
  - Active tab: solid blue fill (`#4A90E2`), rounded corners (`rs(12)`), white bold text
  - Active tab when focused: additional blue border outline
  - Inactive tabs: no background, white text, no border
  - Vertical spacing between tabs: ~`rs(32)`
  - Tab labels: "Playback", "Offline & Cache", "Rotation", "About"

- **Right content (~67%):** Background image (martial arts photo from DUMMY_SLIDES) with semi-transparent dark overlay
  - Content rendered on top of the overlay
  - Section-specific content based on selected tab

### Tab Switching

- Local state: `activeTab` (string, default: `'Playback'`)
- Selecting a tab updates `activeTab`, which conditionally renders the matching section component
- `FocusableCard` used for each tab button

## Section Components

### PlaybackSection

**Auto-advance toggle:**

- Rounded card with semi-transparent gray background (`rgba(255,255,255,0.1)`), rounded corners
- Inside: "Auto-advance slides" label (white) on left, React Native `Switch` on right (blue trackColor when ON)
- Below the card: helper text "Slides advance automatically during dojo display." in gray (`#9CA3AF`)

**Slide duration picker:**

- "Slide duration" heading (bold, white)
- Single rounded card/container (same gray semi-transparent background)
- 3 segments inside: "10 seconds", "20 seconds", "30 seconds"
- Selected segment: blue fill (`#4A90E2`), white text
- Unselected segments: transparent, white text
- Below the card: helper text "Slides advance automatically during dojo display." in gray
- Uses `FocusableCard` for each segment for tvOS focus navigation

### OfflineCacheSection

**Offline toggle card:**

- Taller rounded card (same gray semi-transparent style) containing 3 lines:
  - Row 1: "Offline Version" (white) + `Switch` (blue when ON)
  - Row 2: "Cache slideshow for offline use" (white, smaller font)
  - Row 3: "Slides will continue to play even without an internet connection" (gray, smaller)

**Storage indicator:**

- "Storage used: 120 MB" heading (bold, white)
- Progress bar: blue fill on gray track, full-width, rounded ends
  - Fill percentage: `storageUsedMB / 500` (assuming 500MB max, adjustable)

**Clear cache button:**

- Full-width, white outlined border, no fill, rounded corners
- "Clear cached slides" text (white, centered)
- Uses `FocusableCard` with focused style showing blue border
- Below: "Clearing cache removes offline access" helper in gray

### RotationSection

**Info card:**

- Rounded card (semi-transparent gray)
- "Rotate Slides" title (white, bold)
- "Adjust your slide orientation to match your screen mounting position" (gray)

**Rotation buttons — 2x2 grid:**

- Row 1: "Rotate 90° Left" | "Rotate 90° Right"
- Row 2: "Rotate 180°" | "Rotate 180° Reset"
- Each button: gray background (`rgba(255,255,255,0.15)`), rounded, white text
- Focused button: blue background (`#4A90E2`)
- Uses `FocusableCard` for each button
- Actions: sets rotation to 270 (90° Left), 90 (90° Right), 180 (180°), 0 (Reset)

### AboutSection

**Info rows — no card background, directly on content area:**

- 4 rows separated by thin horizontal dividers (`rgba(255,255,255,0.1)`)
- Each row: label on left (gray `#9CA3AF`), value on right (white)
- Rows:
  - "App Version" — "1.0.3"
  - "Build" — "2026.01.14"
  - "Google Account" — "mmd.dojocast@gmail.com"
  - "Device" — "Apple TV – Dojo Cast"
- All values are static/hardcoded for now

## Slideshow Integration

The `DojoCastSlideshowScreen` must read from `useDojoSettingsStore` to apply settings:

### autoAdvance

- Import `useDojoSettingsStore` and read `autoAdvance`
- When `autoAdvance === false`: do NOT start the auto-advance `setInterval` timer
- Manual prev/next buttons still work regardless

### slideDuration

- Replace hardcoded `SLIDE_INTERVAL = 8000` with `slideDuration * 1000` from the store
- The interval timer uses this dynamic value

### rotation

- Apply `transform: [{ rotate: '${rotation}deg' }]` to the main content wrapper (the `Animated.View` with `fadeAnim`)
- This rotates the slide image + overlay to match screen mounting position

### offlineMode

- No slideshow behavior change yet — UI toggle persists to store for future API integration

## tvOS Focus Considerations

- Sidebar tabs and content controls must support tvOS remote focus navigation
- `FocusableCard` handles focus states (scale, border highlight)
- `Switch` components are natively focusable on tvOS
- Tab navigation: pressing right from sidebar should move focus into the content panel
- Content panel: pressing left should return focus to the sidebar
