---
name: android-layers
description: "Use this skill when discussing the Android three-layer architecture (UI, Domain, Data), deciding where code belongs in an Android project, understanding layer dependencies, or planning how features should be structured across layers. Also use when the user asks about use cases, interactors, the optional domain layer, or how layers communicate via coroutines and Flow."
---

# Android Three-Layer Architecture

## Layer Stack

```
UI Layer          ← displays data, handles user interaction
    ↓ depends on
Domain Layer      ← optional; business logic & use cases
    ↓ depends on
Data Layer        ← repositories, data sources, persistence
```

Dependencies always point downward. Upper layers NEVER know about lower-layer implementation details.

## UI Layer
- Render data and react to user input
- Built with Jetpack Compose
- State holders: `ViewModel` (screen-level) or plain state holder classes (reusable components)
- Does NOT access databases, DataStore, SharedPreferences, Firebase, GPS, Bluetooth,
  on-device ML (ML Kit) or camera/sensor SDKs directly — always through a repository
- Adapts to form factors via `currentWindowAdaptiveInfo()` and adaptive layout components

## Domain Layer (optional — use in large apps)
- Use when business logic is reused across multiple ViewModels
- Use when ViewModel complexity needs simplification
- Contains **use cases / interactors** — each handles a single piece of functionality
  - `GetTimeZoneUseCase`, `GetMoviesUseCase`
- Depends only on Data Layer

## Data Layer
- One `Repository` per data type: `MoviesRepository`, `PaymentsRepository`
- One `DataSource` per system data source (network, Room, files, prefs, camera, on-device ML, sensors)
- Repository responsibilities:
  - Expose data to the rest of the app
  - Centralize and coordinate data changes
  - Resolve conflicts between multiple sources
  - Abstract data sources from upper layers
  - Contain business logic related to data
- Default pattern: **offline-first** — local database is the SSOT, network syncs to it

## Cross-layer communication
- Use **Kotlin coroutines and Flow** for all inter-layer communication (Strongly Recommended)
- Repositories expose `Flow<T>` for reactive streams
- Use cases call `suspend` functions or return `Flow<T>`
- ViewModels collect flows with `viewModelScope`
