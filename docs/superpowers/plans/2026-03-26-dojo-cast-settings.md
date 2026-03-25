# Dojo Cast Settings Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Dojo Cast Settings screen with 4 sections (Playback, Offline & Cache, Rotation, About), persistent settings via AsyncStorage, and wire the settings into the Slideshow screen.

**Architecture:** Option C — single `DojoCastSettingsScreen` as main shell (header + sidebar + content), with each section extracted to its own component in `src/screens/dojo/settings/`. Settings state lives in a new `useDojoSettingsStore` (Zustand + persist + AsyncStorage). The existing `DojoCastSlideshowScreen` reads from this store for autoAdvance, slideDuration, and rotation.

**Tech Stack:** React Native, TypeScript, Zustand 5 (`zustand/middleware` persist), `@react-native-async-storage/async-storage`, `FocusableCard` component (existing), `rs()` responsive scale utility (existing).

---

## File Map

| Status | File                                                | Responsibility                                                |
| ------ | --------------------------------------------------- | ------------------------------------------------------------- |
| Create | `src/store/useDojoSettingsStore.ts`                 | Persisted Zustand store for all settings                      |
| Create | `src/screens/dojo/DojoCastSettingsScreen.tsx`       | Main screen: header + sidebar tabs + content area             |
| Create | `src/screens/dojo/settings/PlaybackSection.tsx`     | Auto-advance toggle + slide duration picker                   |
| Create | `src/screens/dojo/settings/OfflineCacheSection.tsx` | Offline toggle + storage bar + clear cache                    |
| Create | `src/screens/dojo/settings/RotationSection.tsx`     | 4 rotation buttons in 2x2 grid                                |
| Create | `src/screens/dojo/settings/AboutSection.tsx`        | Read-only info rows                                           |
| Modify | `src/navigation/index.tsx`                          | Add `Settings` to DojoStackParamList + DojoNavigator          |
| Modify | `src/screens/dojo/DojoCastSetupScreen.tsx`          | Wire `handleSettings` → `navigation.navigate('Settings')`     |
| Modify | `src/screens/dojo/DojoCastSlideshowScreen.tsx`      | Read autoAdvance, slideDuration, rotation from settings store |

---

## Task 1: Create the Settings Store

**Files:**

- Create: `src/store/useDojoSettingsStore.ts`

This store holds all persisted settings. Use Zustand 5's `persist` middleware with AsyncStorage. In Zustand 5, `persist` is imported from `zustand/middleware` and the store is created with `create` from `zustand`. The storage key is `'dojo-settings'`.

- [ ] **Step 1: Create the store file**

```typescript
// src/store/useDojoSettingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DojoSettingsState {
  // Playback
  autoAdvance: boolean;
  slideDuration: 10 | 20 | 30;

  // Offline & Cache
  offlineMode: boolean;
  storageUsedMB: number;

  // Rotation
  rotation: 0 | 90 | 180 | 270;

  // Actions
  toggleAutoAdvance: () => void;
  setSlideDuration: (d: 10 | 20 | 30) => void;
  toggleOfflineMode: () => void;
  setRotation: (r: 0 | 90 | 180 | 270) => void;
  clearCache: () => void;
}

export const useDojoSettingsStore = create<DojoSettingsState>()(
  persist(
    set => ({
      autoAdvance: true,
      slideDuration: 10,
      offlineMode: true,
      storageUsedMB: 120,
      rotation: 0,

      toggleAutoAdvance: () => set(s => ({ autoAdvance: !s.autoAdvance })),
      setSlideDuration: (d: 10 | 20 | 30) => set({ slideDuration: d }),
      toggleOfflineMode: () => set(s => ({ offlineMode: !s.offlineMode })),
      setRotation: (r: 0 | 90 | 180 | 270) => set({ rotation: r }),
      clearCache: () => set({ storageUsedMB: 0, offlineMode: false }),
    }),
    {
      name: 'dojo-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/my-macbook/Downloads/mmd/mmd-appletv-app
npx tsc --noEmit
```

Expected: No errors related to `useDojoSettingsStore.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/store/useDojoSettingsStore.ts
git commit -m "feat: add useDojoSettingsStore with persist middleware"
```

---

## Task 2: Wire Navigation

**Files:**

- Modify: `src/navigation/index.tsx` (lines 41-47 for DojoStackParamList, lines 99-114 for DojoNavigator)

- [ ] **Step 1: Add `Settings` to DojoStackParamList**

In `src/navigation/index.tsx`, find:

```typescript
export type DojoStackParamList = {
  Home: undefined;
  Connect: undefined;
  Setup: undefined;
  Slideshow: undefined;
  Error: undefined;
};
```

Replace with:

```typescript
export type DojoStackParamList = {
  Home: undefined;
  Connect: undefined;
  Setup: undefined;
  Slideshow: undefined;
  Error: undefined;
  Settings: undefined;
};
```

- [ ] **Step 2: Add Settings screen import**

Add after the existing dojo screen imports (around line 23):

```typescript
import DojoCastSettingsScreen from '../screens/dojo/DojoCastSettingsScreen';
```

- [ ] **Step 3: Add Settings route to DojoNavigator**

In `DojoNavigator`, add after the Error screen:

```typescript
<DojoStack.Screen name="Settings" component={DojoCastSettingsScreen} />
```

- [ ] **Step 4: Wire handleSettings in DojoCastSetupScreen**

In `src/screens/dojo/DojoCastSetupScreen.tsx`, find:

```typescript
const handleSettings = () => {
  // Future: navigate to settings
};
```

Replace with:

```typescript
const handleSettings = () => {
  navigation.navigate('Settings');
};
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No new errors. (DojoCastSettingsScreen doesn't exist yet — this will cause an import error until Task 3 is done. You can skip this step and do it after Task 3.)

- [ ] **Step 6: Commit**

```bash
git add src/navigation/index.tsx src/screens/dojo/DojoCastSetupScreen.tsx
git commit -m "feat: add Settings route to DojoStack and wire handleSettings"
```

---

## Task 3: Create AboutSection

Start with the simplest section — no interactivity, no store access.

**Files:**

- Create: `src/screens/dojo/settings/AboutSection.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/screens/dojo/settings/AboutSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { rs } from '../../../theme/responsive';

const ABOUT_ROWS = [
  { label: 'App Version', value: '1.0.3' },
  { label: 'Build', value: '2026.01.14' },
  { label: 'Google Account', value: 'mmd.dojocast@gmail.com' },
  { label: 'Device', value: 'Apple TV \u2013 Dojo Cast' },
];

const AboutSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About</Text>
      {ABOUT_ROWS.map((row, index) => (
        <View key={row.label}>
          <View style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>{row.value}</Text>
          </View>
          {index < ABOUT_ROWS.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: rs(40),
  },
  title: {
    fontSize: rs(48),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: rs(40),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: rs(28),
  },
  label: {
    fontSize: rs(28),
    color: '#9CA3AF',
  },
  value: {
    fontSize: rs(28),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export default AboutSection;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors for this file.

---

## Task 4: Create PlaybackSection

**Files:**

- Create: `src/screens/dojo/settings/PlaybackSection.tsx`

The duration picker segments each use `FocusableCard`. The `Switch` from React Native renders blue when `trackColor={{ true: '#4A90E2', false: '#374151' }}`.

- [ ] **Step 1: Create the component**

```typescript
// src/screens/dojo/settings/PlaybackSection.tsx
import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { rs } from '../../../theme/responsive';
import { FocusableCard } from '../../../components/ui/FocusableCard';
import { useDojoSettingsStore } from '../../../store/useDojoSettingsStore';

const DURATIONS: Array<10 | 20 | 30> = [10, 20, 30];

const PlaybackSection = () => {
  const { autoAdvance, slideDuration, toggleAutoAdvance, setSlideDuration } =
    useDojoSettingsStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Playback</Text>

      {/* Auto-advance toggle */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Auto-advance slides</Text>
        <Switch
          value={autoAdvance}
          onValueChange={toggleAutoAdvance}
          trackColor={{ true: '#4A90E2', false: '#374151' }}
          thumbColor="#FFFFFF"
        />
      </View>
      <Text style={styles.helperText}>
        Slides advance automatically during dojo display.
      </Text>

      {/* Slide duration */}
      <Text style={styles.sectionTitle}>Slide duration</Text>
      <View style={styles.durationContainer}>
        {DURATIONS.map(d => (
          <FocusableCard
            key={d}
            onPress={() => setSlideDuration(d)}
            style={[
              styles.durationSegment,
              slideDuration === d && styles.durationSegmentActive,
            ]}
            focusedStyle={styles.durationSegmentFocused}
            scaleOnFocus={false}
          >
            {() => <Text style={styles.durationText}>{d} seconds</Text>}
          </FocusableCard>
        ))}
      </View>
      <Text style={styles.helperText}>
        Slides advance automatically during dojo display.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: rs(40),
  },
  title: {
    fontSize: rs(48),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: rs(32),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: rs(12),
    paddingHorizontal: rs(28),
    paddingVertical: rs(24),
  },
  cardLabel: {
    fontSize: rs(28),
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: rs(22),
    color: '#9CA3AF',
    marginTop: rs(12),
    marginBottom: rs(36),
  },
  sectionTitle: {
    fontSize: rs(40),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: rs(20),
  },
  durationContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: rs(12),
    overflow: 'hidden',
  },
  durationSegment: {
    flex: 1,
    paddingVertical: rs(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationSegmentActive: {
    backgroundColor: '#4A90E2',
    borderRadius: rs(12),
  },
  durationSegmentFocused: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: rs(12),
  },
  durationText: {
    fontSize: rs(28),
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default PlaybackSection;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors for this file.

---

## Task 5: Create OfflineCacheSection

**Files:**

- Create: `src/screens/dojo/settings/OfflineCacheSection.tsx`

The storage progress bar uses a plain `View` with width calculated as `(storageUsedMB / 500) * 100%`. The "Clear cached slides" button is a `FocusableCard` with white border.

- [ ] **Step 1: Create the component**

```typescript
// src/screens/dojo/settings/OfflineCacheSection.tsx
import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { rs } from '../../../theme/responsive';
import { FocusableCard } from '../../../components/ui/FocusableCard';
import { useDojoSettingsStore } from '../../../store/useDojoSettingsStore';

const MAX_STORAGE_MB = 500;

const OfflineCacheSection = () => {
  const { offlineMode, storageUsedMB, toggleOfflineMode, clearCache } =
    useDojoSettingsStore();

  const fillPercent = Math.min(storageUsedMB / MAX_STORAGE_MB, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offline & Cache</Text>

      {/* Offline toggle card */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <Text style={styles.cardLabel}>Offline Version</Text>
          <Switch
            value={offlineMode}
            onValueChange={toggleOfflineMode}
            trackColor={{ true: '#4A90E2', false: '#374151' }}
            thumbColor="#FFFFFF"
          />
        </View>
        <Text style={styles.cacheTitle}>Cache slideshow for offline use</Text>
        <Text style={styles.cacheSubtitle}>
          Slides will continue to play even without an internet connection
        </Text>
      </View>

      {/* Storage indicator */}
      <Text style={styles.storageHeading}>
        Storage used: {storageUsedMB} MB
      </Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { flex: fillPercent }]} />
        <View style={{ flex: 1 - fillPercent }} />
      </View>

      {/* Clear cache button */}
      <FocusableCard
        onPress={clearCache}
        style={styles.clearButton}
        focusedStyle={styles.clearButtonFocused}
        scaleOnFocus={false}
      >
        {() => <Text style={styles.clearButtonText}>Clear cached slides</Text>}
      </FocusableCard>
      <Text style={styles.helperText}>
        Clearing cache removes offline access
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: rs(40),
  },
  title: {
    fontSize: rs(48),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: rs(32),
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: rs(12),
    padding: rs(28),
    marginBottom: rs(36),
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rs(16),
  },
  cardLabel: {
    fontSize: rs(28),
    color: '#FFFFFF',
  },
  cacheTitle: {
    fontSize: rs(26),
    color: '#FFFFFF',
    marginBottom: rs(8),
  },
  cacheSubtitle: {
    fontSize: rs(22),
    color: '#9CA3AF',
  },
  storageHeading: {
    fontSize: rs(40),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: rs(20),
  },
  progressTrack: {
    flexDirection: 'row',
    height: rs(10),
    backgroundColor: '#374151',
    borderRadius: rs(5),
    overflow: 'hidden',
    marginBottom: rs(36),
  },
  progressFill: {
    backgroundColor: '#4A90E2',
    borderRadius: rs(5),
  },
  clearButton: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: rs(12),
    paddingVertical: rs(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rs(16),
  },
  clearButtonFocused: {
    borderColor: '#4A90E2',
  },
  clearButtonText: {
    fontSize: rs(30),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  helperText: {
    fontSize: rs(22),
    color: '#9CA3AF',
  },
});

export default OfflineCacheSection;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors for this file.

---

## Task 6: Create RotationSection

**Files:**

- Create: `src/screens/dojo/settings/RotationSection.tsx`

Rotation values: 270 = 90° Left, 90 = 90° Right, 180 = 180°, 0 = Reset.

- [ ] **Step 1: Create the component**

```typescript
// src/screens/dojo/settings/RotationSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { rs } from '../../../theme/responsive';
import { FocusableCard } from '../../../components/ui/FocusableCard';
import { useDojoSettingsStore } from '../../../store/useDojoSettingsStore';

type RotationValue = 0 | 90 | 180 | 270;

const ROTATION_BUTTONS: Array<{ label: string; value: RotationValue }> = [
  { label: 'Rotate 90\u00b0 Left', value: 270 },
  { label: 'Rotate 90\u00b0 Right', value: 90 },
  { label: 'Rotate 180\u00b0', value: 180 },
  { label: 'Reset', value: 0 },
];

const RotationSection = () => {
  const { rotation, setRotation } = useDojoSettingsStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rotation Section</Text>

      {/* Info card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Rotate Slides</Text>
        <Text style={styles.infoSubtitle}>
          Adjust your slide orientation to match your screen mounting position
        </Text>
      </View>

      {/* 2x2 grid */}
      <View style={styles.grid}>
        {ROTATION_BUTTONS.map(btn => (
          <FocusableCard
            key={btn.value}
            onPress={() => setRotation(btn.value)}
            style={[
              styles.rotateButton,
              rotation === btn.value && styles.rotateButtonActive,
            ]}
            focusedStyle={styles.rotateButtonFocused}
            scaleOnFocus={false}
          >
            {() => <Text style={styles.rotateButtonText}>{btn.label}</Text>}
          </FocusableCard>
        ))}
      </View>

      <Text style={styles.helperText}>
        Changes apply immediately to the slideshow display.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: rs(40),
  },
  title: {
    fontSize: rs(48),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: rs(32),
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: rs(12),
    padding: rs(28),
    marginBottom: rs(36),
  },
  infoTitle: {
    fontSize: rs(30),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: rs(10),
  },
  infoSubtitle: {
    fontSize: rs(24),
    color: '#9CA3AF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(16),
    marginBottom: rs(24),
  },
  rotateButton: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: rs(12),
    paddingVertical: rs(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotateButtonActive: {
    backgroundColor: '#4A90E2',
  },
  rotateButtonFocused: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: rs(12),
  },
  rotateButtonText: {
    fontSize: rs(28),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  helperText: {
    fontSize: rs(22),
    color: '#9CA3AF',
  },
});

export default RotationSection;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors for this file.

---

## Task 7: Create DojoCastSettingsScreen (Main Shell)

**Files:**

- Create: `src/screens/dojo/DojoCastSettingsScreen.tsx`

This is the main screen. It owns `activeTab` local state (default `'Playback'`). The left sidebar is ~33% width (pure black), the right content panel is ~67% (background image with overlay). The back button calls `navigation.goBack()`.

The background image for the content panel — use the same `KARATE_BG` constant (Unsplash URL) that `DojoCastSetupScreen` uses.

- [ ] **Step 1: Create the screen**

```typescript
// src/screens/dojo/DojoCastSettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { rs } from '../../theme/responsive';
import { FocusableCard } from '../../components/ui/FocusableCard';
import { DojoStackParamList } from '../../navigation';
import PlaybackSection from './settings/PlaybackSection';
import OfflineCacheSection from './settings/OfflineCacheSection';
import RotationSection from './settings/RotationSection';
import AboutSection from './settings/AboutSection';

type Nav = NativeStackNavigationProp<DojoStackParamList, 'Settings'>;

type TabId = 'Playback' | 'Offline & Cache' | 'Rotation' | 'About';

const TABS: TabId[] = ['Playback', 'Offline & Cache', 'Rotation', 'About'];

const KARATE_BG =
  'https://images.unsplash.com/photo-1514050566906-8d077bae7046?w=1920&q=80';

const DojoCastSettingsScreen = () => {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<TabId>('Playback');

  const renderContent = () => {
    switch (activeTab) {
      case 'Playback':
        return <PlaybackSection />;
      case 'Offline & Cache':
        return <OfflineCacheSection />;
      case 'Rotation':
        return <RotationSection />;
      case 'About':
        return <AboutSection />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dojo Cast Setting</Text>
        <FocusableCard
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          focusedStyle={styles.backButtonFocused}
          scaleOnFocus={false}
        >
          {() => <Icon name="arrow-back" size={rs(32)} color="#FFFFFF" />}
        </FocusableCard>
      </View>
      <View style={styles.headerDivider} />

      {/* Body */}
      <View style={styles.body}>
        {/* Left sidebar */}
        <View style={styles.sidebar}>
          {TABS.map(tab => (
            <FocusableCard
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive,
              ]}
              focusedStyle={styles.tabButtonFocused}
              scaleOnFocus={false}
            >
              {() => (
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              )}
            </FocusableCard>
          ))}
        </View>

        {/* Right content panel */}
        <View style={styles.contentPanel}>
          <ImageBackground
            source={{ uri: KARATE_BG }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={styles.contentOverlay} />
          <View style={styles.contentInner}>{renderContent()}</View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(48),
    paddingVertical: rs(28),
    backgroundColor: '#0C101E',
  },
  headerTitle: {
    fontSize: rs(42),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(12),
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonFocused: {
    backgroundColor: '#4A90E2',
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '33%',
    backgroundColor: '#000000',
    paddingVertical: rs(48),
    paddingHorizontal: rs(32),
    justifyContent: 'center',
    gap: rs(8),
  },
  tabButton: {
    paddingVertical: rs(22),
    paddingHorizontal: rs(24),
    borderRadius: rs(12),
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#4A90E2',
  },
  tabButtonFocused: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: rs(12),
  },
  tabText: {
    fontSize: rs(30),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: 'bold',
  },
  contentPanel: {
    flex: 1,
    position: 'relative',
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  contentInner: {
    flex: 1,
  },
});

export default DojoCastSettingsScreen;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors. Navigation type should be satisfied since `Settings` was added to `DojoStackParamList` in Task 2.

- [ ] **Step 3: Commit all settings screen files**

```bash
git add src/screens/dojo/DojoCastSettingsScreen.tsx \
        src/screens/dojo/settings/PlaybackSection.tsx \
        src/screens/dojo/settings/OfflineCacheSection.tsx \
        src/screens/dojo/settings/RotationSection.tsx \
        src/screens/dojo/settings/AboutSection.tsx
git commit -m "feat: add DojoCastSettingsScreen with 4 section components"
```

---

## Task 8: Integrate Settings into DojoCastSlideshowScreen

**Files:**

- Modify: `src/screens/dojo/DojoCastSlideshowScreen.tsx`

Three changes:

1. Import `useDojoSettingsStore` and read `autoAdvance`, `slideDuration`, `rotation`
2. Replace `SLIDE_INTERVAL = 8000` with `slideDuration * 1000`
3. Guard the auto-advance timer with `autoAdvance`
4. Apply `rotation` transform to the main `Animated.View`

- [ ] **Step 1: Add settings store import**

In `src/screens/dojo/DojoCastSlideshowScreen.tsx`, add after existing imports:

```typescript
import { useDojoSettingsStore } from '../../store/useDojoSettingsStore';
```

- [ ] **Step 2: Remove hardcoded SLIDE_INTERVAL constant**

Remove line 22:

```typescript
/** Auto-advance interval in ms */
const SLIDE_INTERVAL = 8000;
```

- [ ] **Step 3: Read settings in component body**

After the `useDojoCastStore` destructure (around line 33), add:

```typescript
const { autoAdvance, slideDuration, rotation } = useDojoSettingsStore();
```

- [ ] **Step 4: Update the auto-advance useEffect**

Find the auto-advance `useEffect` (around line 71). Replace `SLIDE_INTERVAL` with `slideDuration * 1000`, and guard the interval with `autoAdvance`:

```typescript
// Auto-advance slides
useEffect(() => {
  if (isPlaying && autoAdvance) {
    timerRef.current = setInterval(() => {
      animateTransition(() => nextSlide(slides.length));
    }, slideDuration * 1000);
  } else if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
}, [
  isPlaying,
  autoAdvance,
  slideDuration,
  nextSlide,
  slides.length,
  animateTransition,
]);
```

- [ ] **Step 5: Apply rotation transform**

Find the main `Animated.View` that wraps the slide content (the one with `style={{ opacity: fadeAnim }}`). Add a `transform` prop:

```typescript
style={[
  styles.slideContent,  // or whatever style name is on that Animated.View
  {
    opacity: fadeAnim,
    transform: [{ rotate: `${rotation}deg` }],
  },
]}
```

> **Note:** Look for the `Animated.View` that wraps `ImageBackground` + the slide overlay content. Add the rotation transform there.

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors. The `transform` array in React Native accepts string values for `rotate`.

- [ ] **Step 7: Commit**

```bash
git add src/screens/dojo/DojoCastSlideshowScreen.tsx
git commit -m "feat: wire settings (autoAdvance, slideDuration, rotation) into DojoCastSlideshowScreen"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: ESLint check**

```bash
npx eslint src/store/useDojoSettingsStore.ts \
           src/screens/dojo/DojoCastSettingsScreen.tsx \
           src/screens/dojo/settings/PlaybackSection.tsx \
           src/screens/dojo/settings/OfflineCacheSection.tsx \
           src/screens/dojo/settings/RotationSection.tsx \
           src/screens/dojo/settings/AboutSection.tsx \
           src/screens/dojo/DojoCastSlideshowScreen.tsx \
           src/navigation/index.tsx \
           src/screens/dojo/DojoCastSetupScreen.tsx
```

Expected: Errors only (not warnings). Fix any errors before committing.

- [ ] **Step 3: Manual flow verification checklist**

On device/simulator, verify:

1. From Setup screen, pressing the gear icon opens Settings screen
2. All 4 tabs are focusable and switch content correctly
3. Playback: toggle changes `autoAdvance`, duration picker selects correct segment
4. Offline & Cache: toggle works, Clear cache resets storage display to 0 MB
5. Rotation: each button sets rotation, selected button shows blue
6. About: 4 rows display correctly
7. Back button returns to Setup screen
8. Open Slideshow: `autoAdvance=false` stops auto-advance, manual prev/next still works
9. Change `slideDuration` to 20s, re-open slideshow: slides advance every 20s
10. Set rotation to 90°, slideshow content rotates accordingly

- [ ] **Step 4: Commit final verification**

```bash
git add -A
git commit -m "feat: dojo cast settings screen complete"
```
