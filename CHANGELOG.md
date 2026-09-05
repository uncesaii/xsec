# Changelog

All notable changes to XSEC will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.13.0] - 2026-09-06

### Added
- `/providers` Popular section: curated top 5 providers (Codex, OpenAI, Anthropic, Google, OpenRouter) with subtitles
- `/model` Recent section: last 5 used models at top, persisted to `~/.xsec/recent-models.json`
- All 213 models.dev providers in `/providers` with real-time model fetching and pricing
- Real-time model catalog sync from models.dev/api.json on `/model` open (background, cached)
- Provider labels resolved from models.dev registry — no more title-cased fallback IDs

### Changed
- `/model` now shows ALL models from ALL providers (unfiltered) instead of only configured providers
- Recent models tracked via file-based store (works in Node.js CLI, not localStorage)

### Fixed
- Recent models now persist across CLI sessions via `~/.xsec/recent-models.json`

## [0.12.0] - 2026-09-06

### Added
- OpenCode Zen provider — real-time model fetching, env var `ZEN_API_KEY`, endpoint override `ZEN_BASE_URL`

### Fixed
- Model selection not persisting across sessions — `showOpenTuiHome()` now loads saved model into initial route
- Chat screen `empty` check now ignores notices/errors so logo renders correctly on fresh launch

## [0.11.0] - 2026-09-06

### Fixed
- Remaining `0sec` references in desktop package: sidecar binary names, `OSEC_DESKTOP_ROOT` env var, window title, error box, test expectations
- `pnpm desktop` not working — missing scripts in root `package.json`
- Electron crashes on Windows — added `--no-sandbox` to desktop start script
- Upstream sync failing — configured `upstream` remote in CI, checks commits/tags/packages

### Changed
- License copyright updated to `xsec 2026`

## [0.10.0] - 2026-09-05

### Added
- Custom OpenAI-compatible endpoint provider (`custom-openai`)
- Dynamic model catalog fetching from provider APIs (Anthropic, OpenAI, Google, OpenRouter, Ollama)
- Model selection persistence across TUI sessions (`~/.xsec/last-model`)
- TUI opens to launcher/home screen by default
- Upstream sync automation (hourly check, auto-merge, version bump, release)
- Post-merge rebrand script for safe upstream merges
- Docker image publishing to `ghcr.io/uncesaii/xsec`

### Changed
- CLI command renamed from `0` to `x`
- Brand from `0sec` to `XSEC` across all user-facing strings, docs, and configs
- Env var prefix from `0SEC_*` to `XSEC_*`
- Install script symlink from `0` to `xsec`, with `x` alias
- Release workflow uses GitHub-hosted runners (ubuntu, macOS, Windows, ARM)
- CI workflows use GitHub-hosted runners

### Fixed
- `pnpm.overrides` moved from `package.json` to `pnpm-workspace.yaml` (pnpm 10+ compatibility)
- `cross-env` added for Windows-compatible `PORT=` env var syntax
- `__XSEC_COMPILED_TARGET__` in tree-sitter runtime (was `__0SEC_COMPILED_TARGET__`)

## [0.9.0] - 2026-09-04

### Added
- Initial XSEC fork from 0sec-labs/0sec
- Full rebrand: 0sec → xsec, 0sec Labs → XSEC Labs
- Custom SVG logos (X+SEC aperture designs)
- CI fixes: workflow names, doc site config, Astro `site` URL
- `.gitattributes` merge protection for rebranded files
- Upstream tracking remote and merge strategy

### Removed
- Sponsor logos and "Supported by" section from README
- Domain references
