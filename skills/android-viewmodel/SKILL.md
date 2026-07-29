---
name: android-viewmodel
description: "Use this skill when creating or modifying Android ViewModels, exposing UI state as StateFlow, using stateIn() with WhileSubscribed, or deciding what should and shouldn't go in a ViewModel. Also use when the user asks about HiltViewModel, viewModelScope, how to handle one-time events in MVVM, or when to use MutableStateFlow vs stateIn."
---

# Android ViewModel Best Practices

## Rules (Strongly Recommended)

### Keep ViewModels lifecycle-independent
- Never hold references to `Activity`, `Fragment`, `Context`, or `Resources`
- Never reference any Android lifecycle type
- If you need `Application`, move the dependency to the UI or data layer instead
- Use `ViewModel`, not `AndroidViewModel`

### Use at screen level only
Use ViewModels in:
- Screen-level composables
- Activities / Fragments
- Navigation destinations or graphs

Do NOT use ViewModels in:
- Reusable UI components → use plain state holder classes instead

### Expose a single `uiState` as `StateFlow`
```kotlin
@HiltViewModel
class BookmarksViewModel @Inject constructor(
    newsRepository: NewsRepository
) : ViewModel() {

    val uiState: StateFlow<BookmarksUiState> =
        newsRepository
            .getNewsResourcesStream()
            .mapToUiState()
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5_000),
                initialValue = BookmarksUiState.Loading
            )
}
```
- Use `stateIn()` with `WhileSubscribed(5000)` for streamed data
- Use `MutableStateFlow` for simpler non-streamed state
- `uiState` can be a data class or a sealed class for mutually exclusive states

### Use coroutines and flows
- Receive data from lower layers with Kotlin flows
- Trigger actions with `suspend` functions launched in `viewModelScope`

## Anti-patterns to avoid
- Sending events from ViewModel to UI — process them immediately in the ViewModel and update state with the result
- Holding a `LiveData` that wraps a `Flow` unnecessarily — collect directly with `collectAsStateWithLifecycle()`
- Exposing mutable state (`MutableStateFlow`) publicly — always expose the immutable `StateFlow`
