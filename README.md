# Android Development Plugin for Claude Code, Codex, and OpenCode

A plugin for Claude Code, Codex, and OpenCode V2 with Android development skills and workflows following [Google's official architecture guidelines](https://developer.android.com/topic/architecture).

## Claude Code installation

### From the pcha-plugins Marketplace

```bash
# Add the marketplace
claude plugin marketplace add https://github.com/pcha/agent-plugins-marketplace.git

# Install the plugin
claude plugin install android-ai-plugin
```

### From Local Path

```bash
claude plugin install /path/to/android-ai-plugin
```

### From GitHub Repository

```bash
claude plugin install https://github.com/pcha/android-ai-plugin
```

## Codex installation

Codex installs plugins from a configured marketplace. For local development, add this repository to a local marketplace, install `android-ai-plugin` from that marketplace, and start a new thread so Codex discovers its skills.

The Codex manifest is located at `.codex-plugin/plugin.json`. The existing Claude Code manifest and commands remain available, so both clients can use the same repository.

## OpenCode V2 installation

Install the plugin globally from GitHub (no npm publication is required):

```bash
opencode plugin add github:pcha/android-ai-plugin
```

For a project-only installation, add the package to that project's `opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["github:pcha/android-ai-plugin"]
}
```

For local development, run `npm ci` in this repository and configure its absolute path in the consuming project's `plugins` array instead. Preserve any existing plugin entries.

The OpenCode adapter registers all eight skills and both commands from the shared `skills/` and `commands/` directories. Skills are available automatically when relevant or explicitly through `@skill-name`. Use `/new-android` and `/android-play-store-setup` to invoke the workflows directly. They retain OpenCode's permissions and the selected model; the Claude-only `model: sonnet` override is not applied.

Manage the installed package with `opencode plugin list`, `opencode plugin check`, and `opencode plugin update`. OpenCode does not read the Claude or Codex marketplace manifests; the [pcha marketplace](https://github.com/pcha/agent-plugins-marketplace) lists the corresponding Git installation command.

## Skills

Skills are selected by the client based on context. Claude also supports `/skill-name`; OpenCode V2 supports explicit `@skill-name` mentions.

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

In OpenCode V2, both workflows are available as skills and slash commands. The commands explicitly attach the matching shared skill, preserving its validation and secret-handling rules.

## Development

```bash
npm ci
npm run check
npm test
```

Tests verify registration, command context, shared workflow references, version consistency, and installation from the packed package. The OpenCode adapter targets the V2 plugin API and does not implement V1 hooks.

## Versioning

Releases follow [Conventional Commits](https://www.conventionalcommits.org/):

- `fix:` → patch bump
- `feat:` → minor bump
- `BREAKING CHANGE` → major bump

See [CHANGELOG.md](./CHANGELOG.md) for the full release history.

The release workflow synchronizes the Claude, Codex, and OpenCode package versions, including the npm lockfile.
