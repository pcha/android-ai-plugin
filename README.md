# Android Development Plugin for Claude Code and Codex

A plugin for Claude Code and Codex with Android development skills and workflows following [Google's official architecture guidelines](https://developer.android.com/topic/architecture).

## Claude Code installation

### From the pcha-plugins Marketplace

```bash
# Add the marketplace
claude plugin marketplace add https://raw.githubusercontent.com/pcha/plugins-marketplace/main/marketplace.json

# Install the plugin
claude plugin install android-claude-plugin
```

### From Local Path

```bash
claude plugin install /path/to/android-claude-plugin
```

### From GitHub Repository

```bash
claude plugin install https://github.com/pcha/android-claude-plugin
```

## Codex installation

Codex installs plugins from a configured marketplace. For local development, add this repository to a local marketplace, install `android-claude-plugin` from that marketplace, and start a new thread so Codex discovers its skills.

The Codex manifest is located at `.codex-plugin/plugin.json`. The existing Claude Code manifest and commands remain available, so both clients can use the same repository.

## Skills

Skills are invoked automatically by Claude based on context, or manually with `/skill-name`.

| Skill | Triggers automatically when... |
|---|---|
| `android-architecture-principles` | Discussing architecture design, separation of concerns, UDF, or SSOT |
| `android-layers` | Deciding where code belongs across UI / Domain / Data layers |
| `android-ui-layer` | Building UI with Jetpack Compose, collecting StateFlow, handling lifecycle |
| `android-viewmodel` | Creating ViewModels, exposing state with StateFlow, using `stateIn()` |
| `android-data-layer` | Implementing repositories, data sources, Room, offline-first patterns |
| `android-di-testing` | Setting up Hilt DI, writing ViewModel/repository tests, fakes vs mocks |

## Commands

Commands are invoked explicitly with `/command-name`.

| Command | Description |
|---|---|
| `/new-android` | Scaffold a new Android project from the official [architecture-templates](https://github.com/android/architecture-templates), with optional GitHub repo and release workflow |
| `/android-play-store-setup` | Guided setup for Play Store publishing secrets (keystore + Google Play service account) |

In Codex these workflows are exposed as the `new-android` and `android-play-store-setup` skills. Codex can select them automatically from the request; they can also be named explicitly.

## Versioning

Releases follow [Conventional Commits](https://www.conventionalcommits.org/):

- `fix:` → patch bump
- `feat:` → minor bump
- `BREAKING CHANGE` → major bump

See [CHANGELOG.md](./CHANGELOG.md) for the full release history.
