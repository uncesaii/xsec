# Changelog

All notable changes to XSEC will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- 14 CI test failures across 8 files (nokasan fixture, codex refresh persistence, pov-gate domain, exploit-scan marker case, novelty-check exclusion, execution-evidence digest, dashboard control-token, c-cpp-profile timeout)
- Restored Codex refresh-token disk persistence (`persistChatGptCodexAuthFile`, `authFilePath` state) that was accidentally clobbered by the rebrand commit
- Added missing `desktop` and `desktop:package` scripts to root `package.json`
- Fixed `bin` field: `"0"` replaced with `"x"` (rebranded CLI entrypoint)
- Fixed `0sec desktop sidecar` error message in `sidecar.ts`
- Fixed `install-e2e.sh`: removed stale `0` command test, kept `x` + `xsec`
- Made GitHub repo public (fixes source/binary/container installation E2E)
- Added macOS desktop workflow documentation to README

### Changed
- `OWN_FROM_MARKERS` in novelty-check now includes `"xsec.dev"` for own-postings exclusion

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
