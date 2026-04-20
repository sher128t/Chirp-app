# Chirp Mobile App

Flutter mobile app for the Chirp self-care companion.

## Tech Stack

- **Framework**: Flutter 3.16+
- **State Management**: Riverpod
- **Navigation**: go_router
- **HTTP Client**: Dio
- **Storage**: flutter_secure_storage

## Getting Started

### Prerequisites

- Flutter SDK 3.16+
- iOS: Xcode 15+ (for iOS development)
- Android: Android Studio with SDK 34+

### Installation

```bash
# Get dependencies
flutter pub get

# Run the app
flutter run
```

### Running on Different Platforms

```bash
# iOS Simulator
flutter run -d ios

# Android Emulator
flutter run -d android

# Chrome (web - for testing)
flutter run -d chrome
```

## Project Structure

```
lib/
├── main.dart              # App entry point
├── core/
│   ├── api/               # API client & interceptors
│   ├── router/            # Navigation
│   ├── theme/             # App theme
│   └── widgets/           # Shared widgets
└── features/
    ├── auth/              # Authentication
    ├── pet/               # Pet & home screen
    ├── moods/             # Mood tracking
    ├── goals/             # Goals & habits
    ├── journal/           # Journaling
    ├── quests/            # Quests & rewards
    ├── shop/              # Item shop
    └── profile/           # User profile
```

## Features

### Authentication
- Email/password login
- Registration with pet name
- Secure token storage
- Auto-refresh tokens

### Pet System
- View pet with stats (level, XP, energy, happiness)
- Visual customization based on equipped items
- XP/energy/happiness updates from activities

### Mood Tracking
- 5-level mood scale with emojis
- Predefined + custom tags
- Notes
- 7-day stats and trends

### Goals
- Daily habit tracking
- Multiple self-care areas
- Completion tracking
- Progress summary

### Journal
- Create/edit/delete entries
- Tags support
- Search functionality

### Quests
- Daily quests
- Progress tracking
- Reward claiming
- Streak tracking

### Shop
- Browse items
- Purchase with coins/gems
- Rarity system

### Profile
- User info
- Premium upgrade (mock)
- Settings
- Sign out

## API Configuration

The app automatically detects the platform and uses the appropriate API URL:

| Platform | API URL |
|----------|---------|
| iOS Simulator | `http://localhost:3000/api` |
| Android Emulator | `http://10.0.2.2:3000/api` |

For production, update the URL in `lib/core/api/api_client.dart`.

## Testing

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage

# Run specific test
flutter test test/widget_test.dart
```

## Building

```bash
# Android APK
flutter build apk

# Android App Bundle
flutter build appbundle

# iOS (requires macOS)
flutter build ios
```

## Code Generation

If using freezed or json_serializable:

```bash
flutter pub run build_runner build
```

## Linting

```bash
flutter analyze
flutter format lib/
```
