---
name: android-data-layer
description: "Use this skill when implementing the Android data layer: creating repositories, data sources, offline-first patterns, or handling data from Room, network, or DataStore. Also use when the user asks about repository patterns, data source abstractions, model mapping between layers, naming conventions for repositories, or how to structure data access in Android."
---

# Android Data Layer Best Practices

## Structure
- One `Repository` class per **data type** (not per screen or feature)
  - `MoviesRepository`, `PaymentsRepository`, `UserRepository`
- One `DataSource` class per **system data source**
  - Network REST API, Room database, DataStore, file system, GPS, Bluetooth
  - Also counts: camera, on-device ML (ML Kit: text/barcode/face), and other sensors —
    wrap them as data sources too, don't call their SDKs from the UI/ViewModel

## Repository responsibilities
- Expose application data to upper layers via `Flow<T>` or `suspend` functions
- Centralize all data changes for a given type
- Resolve conflicts when multiple data sources exist (e.g., cache vs. network)
- Abstract data sources so the rest of the app doesn't know where data comes from
- Contain business logic related to data manipulation

## Data source responsibilities
- Single responsibility: one data source = one external system
- Bridge between the app and the system for read/write operations
- Handle caching, retry logic, and persistence at this level

## Create repositories even for a single data source (Strongly Recommended)
Even if there's only one data source today, wrapping it in a repository:
- Keeps upper layers decoupled from the data source type
- Makes testing easy (swap with fake)
- Makes future additions (e.g., caching) transparent to callers

## UI components must NOT access data sources directly (Strongly Recommended)
Composables and ViewModels must never directly reference:
- Room DAOs or databases
- DataStore or SharedPreferences
- Firebase SDK
- GPS / LocationManager
- Bluetooth / connectivity APIs
- On-device ML (ML Kit `TextRecognition`, `BarcodeScanning`, …) and camera analysis / sensors

All access must go through a repository.

## Offline-first pattern
- Local database (Room) is the SSOT for app data
- Network is used to sync/refresh the local database
- Exposes local data immediately; network sync happens in the background
- App remains functional without network connectivity

### Reads
- Repository read APIs expose `Flow<T>` from Room (never from the network directly)
- Handle read errors with the LCE pattern (`Loading` / `Content` / `Error`): `.catch { }` on the
  Flow and surface an error state to the UI — don't swallow it silently

### Writes (pick per criticality)
- **Online-only**: write network first, update local on success (bank transfers). Block/disable UI offline
- **Queued (write-behind)**: enqueue locally, drain when online (analytics, non-critical)
- **Lazy (optimistic)**: write local SSOT first for instant UX, push to network after (todo lists,
  most user data). Requires conflict resolution on sync

### Sync strategy
- **Pull** (on-demand): fetch when navigating to a screen. Simple, low data, poor for relational data
- **Push** (proactive): baseline on startup + server notifies of changes (e.g. Firestore snapshot
  listener). Works offline indefinitely, handles relational data
- Schedule background sync with **WorkManager**: `NetworkType.CONNECTED` constraint + `Result.retry()`
  for automatic exponential backoff

### Conflict resolution — last-write-wins
- Stamp every write with an `updatedAt` timestamp (entity column + network field)
- On merge, apply the remote only if `remote.updatedAt >= local.updatedAt` — otherwise a newer
  un-synced local edit gets clobbered by a stale snapshot
- Set the timestamp from the **caller/repository**, never inside the entity (no `System.currentTimeMillis()`
  in the entity constructor)

### Leverage the data source's own offline support first
- Some SDKs already persist a durable write queue (e.g. Firestore offline persistence: disk-backed
  writes that survive app restart + cached reads). Enable it before hand-rolling a WorkManager write
  queue — hand-rolling duplicates what the SDK already does

## Models per layer (Recommended in complex apps)
Map models between layers instead of sharing one class everywhere:
- Network response → simplified domain model (in data source)
- Domain model → ViewModel UI state (in repository or use case)
- This keeps each layer independent and testable

### Never leak framework/SDK types above the data layer (Strongly Recommended)
The data layer's public models must be independent of any data-source type:
- Don't expose Room `@Entity` classes, `FirebaseUser`/Firestore documents, or network DTOs
  from repository interfaces — map them to plain domain models the repository owns
- A repository returning `Flow<FirebaseUser?>` or a `@Entity` couples every upper layer to the
  SDK: the UI can't be tested or re-sourced without it. Return a domain `User` instead.

## Naming conventions (Optional)
| Type | Convention | Example |
|---|---|---|
| Repository interface | Noun + Repository | `NewsRepository` |
| Offline-first impl | OfflineFirst prefix | `OfflineFirstNewsRepository` |
| In-memory impl | InMemory prefix | `InMemoryUserRepository` |
| Fake for tests | Fake prefix | `FakeAuthorsRepository` |
| Data streams | `get{Model}Stream()` | `getAuthorStream(): Flow<Author>` |
| Lists | Plural model | `getAuthorsStream(): Flow<List<Author>>` |
