---
name: android-di-testing
description: "Use this skill when setting up dependency injection with Hilt in Android, writing unit tests for ViewModels or repositories, creating fake implementations for testing, or testing StateFlows and coroutines. Also use when the user asks about constructor injection, Hilt modules, @Binds, @Singleton scoping, fakes vs mocks, or how to test with runTest and WhileSubscribed."
---

# Android Dependency Injection & Testing

## Dependency Injection (Strongly Recommended)

### Prefer constructor injection
- Classes declare dependencies; the DI framework provides them at runtime
- Avoid constructing dependencies inside classes
- Makes dependencies explicit and swappable for tests

### Use Hilt (Recommended for non-trivial apps)
Use Hilt if the project includes any of:
- Multiple screens with ViewModels
- WorkManager usage
- ViewModels scoped to the navigation back stack

For very simple apps, manual DI (passing dependencies through constructors) is acceptable.

### Scope dependencies when necessary (Strongly Recommended)
Scope a dependency to a container when:
- The type holds **mutable shared data** that must be the same instance across users
- The type is **expensive to initialize** and used in multiple places

Do not scope everything — unnecessary scoping wastes memory.

### Setup pattern with Hilt
```kotlin
@HiltViewModel
class MyViewModel @Inject constructor(
    private val repository: MyRepository
) : ViewModel()

@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds
    @Singleton
    abstract fun bindMyRepository(
        impl: OfflineFirstMyRepository
    ): MyRepository
}
```

---

## Testing

### Minimum test coverage (Strongly Recommended)
- **ViewModel unit tests** — including Flow emissions
- **Data layer unit tests** — repositories and data sources
- **UI navigation tests** — run in CI as regression tests

### Prefer fakes over mocks (Strongly Recommended)
- Fakes implement the real interface with simplified in-memory logic
- Mocks use generated stubs that often miss real behavior
- Fake naming convention: `FakeAuthorsRepository`, `FakeNewsDataSource`

```kotlin
class FakeNewsRepository : NewsRepository {
    private val news = MutableStateFlow<List<NewsResource>>(emptyList())

    fun emit(items: List<NewsResource>) { news.value = items }

    override fun getNewsResourcesStream() = news.asStateFlow()
}
```

### Testing StateFlows (Strongly Recommended)
- Assert on the `value` property when possible — avoids complexity of turbine or manual collection
- Use `WhileSubscribed(5000)` in `stateIn()` — ensures the flow activates during tests

```kotlin
@Test
fun `loading state is emitted first`() = runTest {
    val viewModel = MyViewModel(FakeRepository())
    assertEquals(MyUiState.Loading, viewModel.uiState.value)
}
```

### Testing data layer
- Test repositories by injecting fake data sources
- Test data sources by using in-memory databases (Room provides `inMemoryDatabaseBuilder`)
- Don't test infrastructure (network serialization, Room SQL) with unit tests — use integration tests
