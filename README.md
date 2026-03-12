# MMD Apple TV App

A [React Native](https://reactnative.dev) app for Apple TV (tvOS) and Android TV, bootstrapped with [`@react-native-community/cli`](https://github.com/react-native-community/cli) and built on the **react-native-tvos** fork.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [🍎 iOS / tvOS Commands](#-ios--tvos-commands)
  - [Run on Simulator or Device](#run-on-simulator-or-device)
  - [Clean Build](#clean-build)
  - [Production / Archive Build](#production--archive-build)
- [🤖 Android / Android TV Commands](#-android--android-tv-commands)
  - [Development](#development-1)
  - [Production Builds](#production-builds)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- macOS with Xcode installed (for tvOS builds)
- Node.js ≥ 18 and npm
- CocoaPods (`sudo gem install cocoapods`)
- Android Studio + ADB (for Android TV builds)

---

## Initial Setup

```bash
# Install JS dependencies
npm install --legacy-peer-deps

# Install native iOS/tvOS dependencies
cd ios && pod install && cd ..
```

---

## Development Workflow

Open **two terminal tabs** for development:

**Tab 1 — Metro bundler:**

```bash
npm start
```

> After a native dependency change (e.g. pod install), always clear the cache:
>
> ```bash
> npm start -- --reset-cache
> ```

**Tab 2 — Build & launch:**

```bash
# Apple TV simulator (quickest)
npm run appletv

# Android TV
npx react-native run-android --active-arch-only
```

---

## 🍎 iOS / tvOS Commands

The Xcode scheme for this project is **`MmdAppleTvApp`**.

### Run on Simulator or Device

```bash
# Run on the Apple TV simulator
npx react-native run-ios --scheme "MmdAppleTvApp" --simulator "Apple TV"

# Run on a specific physical device
# (get the device ID from Xcode → Window → Devices and Simulators)
npx react-native run-ios --scheme "MmdAppleTvApp" --device "Your_Device_Name"
```

### Clean Build

Run this whenever you update native dependencies, switch branches, or hit unexplained build errors.

```bash
# 1. Clear Xcode DerivedData for this project
rm -rf ~/Library/Developer/Xcode/DerivedData/MmdAppleTvApp-*

# 2. Wipe and reinstall CocoaPods
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..

# 3. Restart Metro with a clean cache
npm start -- --reset-cache
```

### Production / Archive Build

```bash
# Deep clean before archiving (prevents caching issues)
rm -rf ios/build
cd ios && pod install && cd ..

# Build a Release binary for performance testing
npx react-native run-ios --scheme "MmdAppleTvApp" --mode Release
```

> For App Store distribution, open `MmdAppleTvApp.xcworkspace` in Xcode and use **Product → Archive**.

---

## 🤖 Android / Android TV Commands

### Development

```bash
# Connect to an Android TV over the network first
adb connect <tv_ip_address>

# Start Metro (if not already running)
npx react-native start

# Build and install on the connected Android TV
npx react-native run-android --active-arch-only
```

### Production Builds

```bash
cd android

# Release APK — great for sideloading onto kiosk hardware
./gradlew assembleRelease

# Release AAB (Android App Bundle) — required for Google Play Store
./gradlew bundleRelease
```

> Signed release builds require a keystore configured in `android/gradle.properties`. See the Google Play signing guide for setup.

---

## Troubleshooting

### `NativeModule: AsyncStorage is null`

The simulator is running an old binary. Delete the app from the simulator, then rebuild:

```bash
# Wipe DerivedData, reinstall pods, and restart
rm -rf ~/Library/Developer/Xcode/DerivedData/MmdAppleTvApp-*
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..
npm start -- --reset-cache
# Then in a second tab:
npm run appletv
```

### Pod install fails / linker errors

```bash
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..
```

### Metro not picking up changes

```bash
npm start -- --reset-cache
```

### Android ADB device not found

```bash
adb kill-server && adb start-server
adb connect <tv_ip_address>
```

---

## Learn More

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [react-native-tvos Fork](https://github.com/react-native-tvos/react-native-tvos)
- [CocoaPods Getting Started](https://guides.cocoapods.org/using/getting-started.html)
