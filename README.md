<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/xsec-aperture-white.svg">
    <img src="assets/xsec-aperture-ink.svg" alt="XSEC" width="176">
  </picture>
</p>

<p align="center">
  <strong>[RESEARCH PREVIEW] Your open & extensible AI cybersecurity team.</strong><br/>
  XSEC finds vulnerabilities, creates working exploits, and writes the fix.
  Multi-model, multi-agent, but most importantly: yours.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-3fb950" alt="license" />
  <img src="https://img.shields.io/github/v/release/uncesaii/xsec?color=2563eb" alt="release" />
  <img src="https://img.shields.io/badge/status-research%20preview-f0883e" alt="status: research preview" />
</p>

<p align="center">
  <sub>Note: This project is currently in active development; features change daily! See <a href="#honest-limitations">Current limitations</a>.</sub>
</p>

<p align="center">
  <img src="assets/demo-intro.gif" width="840">
</p>

## Install & Quick Start

```bash
curl -fsSL https://raw.githubusercontent.com/uncesaii/xsec/main/install.sh | bash
export PATH="$HOME/.xsec/bin:$PATH"
x --help
```
The verified binary is installed to `~/.xsec/bin` with no Node/Bun dependency.
Add the `export` line to your shell profile to make `x` available in future shells.

## What XSEC aims to cover

Most AI pentesting harnesses and tools stop at the web app layer to find and chain vulnerabilities. However research suggests that supply chain and other infrastructure level exploits are more common, and cheaper to exploit than ever before.

XSEC's core philosophy is to be a single, extensible and transparent tool to tackle all the remaining layers as security changes from point-in-time tests towards continuous security.

| Layer | Finds |
| --- | --- |
| Web apps | SQLi, IDOR, XSS, SSRF, auth bypass |
| APIs | tenant isolation, BOLA, business-logic abuse |
| AI & LLMs | prompt injection, jailbreaks, MCP tool abuse |
| Source code | injection, auth, deserialization, memory safety |
| Dependencies | supply chain, malicious packages, CVE replay |
| Network / identity | AD, cloud, federation (read-only, offline) |
| Runtime / OS / kernel | container escape, privesc, 0-day hunt |
| Compiled binaries | no source → [`xverse`](xverse/README.md) |

## Automation and research adapters

| Task | Commands |
| --- | --- |
| Pentest web / AI-LLM / MCP | `scan`, `eval`, `agent-assure` |
| Review source / packages / kernel | `review`, `file-review`, `audit` |
| Recon an attack surface | `recon`, `js-recon`, `npm-discovery`, `intel` |
| Hunt a bug class / kernel variants | `hunt`, `kernel`, `cve` |
| Work with evidence | `findings`, `history`, `resume`, `replay`, `verify`, `disclose` |
| Generate & re-test a fix | `fix` |
| Identity / AD (read-only) | `identity`, `adgraph`, `entragraph` |
| Integrate | `mcp-server`, `console`, `tui`, `dashboard` |

Run `x --help` for the rest.

### Primary workflow

Run `x` to open the primary OpenTUI chat. Type `/run` to open its engagement
control pane, then enter a URL, a local source path, a git URL, or an explicit
package target (`npm:`, `pypi:`, `cargo:`, `oci:`). The pane shows the resolved
engagement before it runs it; deep source engagements use the validated
finder-lens strategy. Specialized CLI commands remain available for automation
and research, but they are not separate primary TUI modes.

<p align="center">
  <img src="assets/demo-commands.gif" alt="XSEC console command palette" width="820"><br/>
  <sub>The interactive console — <code>/</code> opens the command palette.</sub>
</p>

## How it works

It proves the bug before it reports it.

- **Free-form agents, hard guardrails.** Models decide what to probe; turn budgets, loop detection, and scope-on-every-call keep them in line.
- **Reproduce before trust.** A blind agent re-exploits each finding from the PoC alone. What it can't reproduce is dropped.
- **Triage before verify.** Class oracles and a second scanner cut noise before the expensive step.
- **Bring your own model.** Anthropic, OpenAI, Azure, OpenRouter, or local Ollama — you hold the key.

Every run keeps its own evidence under `~/.xsec/runs/<id>/`, so you can `resume`, `replay`, or `disclose` it later.

<p align="center">
  <img src="assets/demo-verify.gif" alt="XSEC blind verification" width="820"><br/>
  <sub>Blind verification — every finding is re-exploited before it ships.</sub>
</p>

## Track record

XSEC has landed real, maintainer-reviewed fixes in the **mainline Linux kernel** and other open source. Benchmarks are secondary evidence — caveats in the [benchmark docs](docs/src/content/docs/benchmark.md).

## Honest limitations

- Kernel/IOKit findings stay hypotheses until a real oracle reproduces them (the `linux-kernel` profile is static).
- Verification depth varies: `verificationSpec` covers file/diff predicates. The replay runner isolates PoCs in fresh, unprivileged, read-only Docker containers (no network by default; scoped HTTP opts into a bridge/custom network via `verify --docker-network` + `--scope`) and offline QEMU initramfs guests (`--qemu-kernel` / `--qemu-busybox`, or `XSEC_REPLAY_QEMU_*`) — but a finding still has to ship executable `pocSteps` for any of it to run; without them the finding is `skipped`.
- The false-positive-moat layers are off by default and slice-dependent.
- Benchmarks are single-model/config/trial; the 10/10 AI-suite is self-authored, not independent.
- `fix` is narrow: source-only, single-file, ≤3 attempts.
- By design, never: network sweeps, credential spraying, persistence/C2, or stealth.

## Build from source

```bash
git clone https://github.com/uncesaii/xsec.git && cd xsec
corepack enable && pnpm install --frozen-lockfile && pnpm build && node packages/cli/dist/index.js --help
```

## Contributing & security

See [CONTRIBUTING.md](CONTRIBUTING.md) — synthetic or authorized targets only. Report vulnerabilities privately via [SECURITY.md](SECURITY.md), not public issues.

## License

Dual-licensed **MIT OR Apache-2.0** — see [LICENSE](LICENSE) / [LICENSE-MIT](LICENSE-MIT). © 2026 0sec Labs.
