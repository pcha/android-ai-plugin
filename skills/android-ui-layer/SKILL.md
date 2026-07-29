---
name: android-ui-layer
description: "Use this skill when building Android UI with Jetpack Compose, collecting StateFlows in composables, handling lifecycle effects, managing UI state across configuration changes, or implementing screen navigation. Also use when the user asks about collectAsStateWithLifecycle, LifecycleStartEffect, LifecycleResumeEffect, adaptive layouts, or any Jetpack Compose best practices."
---

# Android UI Layer Best Practices

## Architecture
- Follow **Unidirectional Data Flow (UDF)**: ViewModel exposes state, UI sends actions via method calls
- Use **single-activity architecture** — implement screens as Jetpack Compose destinations
- Use **Navigation 3** for multi-screen apps and deep linking

## Jetpack Compose (Strongly Recommended)
- Build all new UI with Jetpack Compose
- Covers phones, tablets, foldables, and Wear OS
- Use adaptive layout components: `NavigationSuiteScaffold`, canonical layouts
- Use `currentWindowAdaptiveInfo()` for window size class-aware state

## State Collection
Always collect UI state with `collectAsStateWithLifecycle()` — not `collectAsState()`:
```kotlin
@Composable
fun MyScreen(
    viewModel: MyViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
}
```
This automatically pauses collection when the UI is not visible, saving resources.

## Lifecycle Effects
Do NOT override `onResume()`, `onPause()`, etc. Use Compose lifecycle-aware effects instead:

| Effect | When to use |
|---|---|
| `LifecycleStartEffect` | Synchronous work tied to start/stop |
| `LifecycleResumeEffect` | Synchronous work tied to resume/pause |
| `repeatOnLifecycle` | Asynchronous work on lifecycle events |
| `collectAsStateWithLifecycle` | Collecting Flows |

```kotlin
LifecycleStartEffect(locationManager) {
    val listener = LocationListener { location -> onLocationChanged(location) }
    locationManager.requestLocationUpdates(GPS_PROVIDER, 1000L, 1f, listener)
    onStopOrDispose {
        locationManager.removeUpdates(listener)
    }
}
```

## UI State
- Preserve UI state across configuration changes (rotation, folding, window resize)
- Save state in ViewModel (survives config changes)
- Use Saved State module for process death survival
- Design reusable composables with hoistable state — don't embed ViewModel inside reusable components

## Anti-patterns
- Accessing data sources (DB, GPS, network, camera, ML Kit/on-device ML, sensors) directly from composables or Activities
- Collecting flows without lifecycle awareness (`collectAsState()`)
- Sending one-shot events from ViewModel to UI as `SharedFlow` — model them as state instead
- Overriding Activity lifecycle methods in Compose apps
